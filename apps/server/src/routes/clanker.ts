import { createElysia } from '../lib/utils'
import { redis } from '../lib/redis'
import { t } from 'elysia'
import { 
  ClankerSearchResponse, 
  ClankerTrendingResponse, 
  ClankerAddressResponse,
  ClankerSearchResult,
  ClankerAddressResult,
  MergedClanker,
  ClankerTrendingTokensResponse
} from '@tap/common'
import { clanker } from '../services/clanker'

type AddressQuery = {
  address: string;
  limit?: string;
  cursor?: string;
}

type SearchQuery = {
  q: string;
  limit?: string;
  cursor?: string;
}

type TrendingQuery = {
  limit?: string;
  cursor?: string;
  time_window?: '1h' | '6h' | '24h' | '7d';
}

export const clankerRoutes = createElysia({ prefix: '/clanker' })
  .get('/address', async ({ query }: { query: AddressQuery }) => {
    const { address, limit = '25', cursor } = query
    
    if (!address) {
      throw new Error('Address parameter is required')
    }
    
    const cacheKey = `clanker_address:${address}:${limit}:${cursor || ''}`
    let data = await redis.get(cacheKey)
    
    if (data === null) {
      try {
        const addressData = await clanker.getClankerByAddress(address)
        const page = cursor ? parseInt(cursor) : 1
        const deployedTokens = await clanker.fetchDeployedByAddress(address, page)
        
        const results: ClankerAddressResult[] = deployedTokens.data.map((token: any) => ({
          contract_address: token.contract_address,
          name: token.name,
          symbol: token.symbol,
          balance: token.balance || '0',
          value_usd: token.value_usd || '0'
        }))
        
        data = {
          address,
          results
        }
        
        await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 })
      } catch (error) {
        throw new Error(`Failed to fetch address data: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } else if (typeof data === 'string') {
      try {
        data = JSON.parse(data)
      } catch (e) {
        throw new Error('Failed to parse cached data')
      }
    }
    
    return data
  }, {
    query: t.Object({
      address: t.String(),
      limit: t.Optional(t.String({ default: '25' })),
      cursor: t.Optional(t.String())
    }),
    response: t.Any()
  })
  
  .get('/search', async ({ query }: { query: SearchQuery }) => {
    const { q, limit = '25', cursor } = query
    
    if (!q) {
      throw new Error('Search query (q) parameter is required')
    }
    
    const cacheKey = `clanker_search:${q}:${limit}:${cursor || ''}`
    let data = await redis.get(cacheKey)
    
    if (data === null) {
      try {
        const page = cursor ? parseInt(cursor) : 1
        const searchResult = await clanker.searchTokens({ q, page })
        
        const results: ClankerSearchResult[] = searchResult.data.map((token: any) => ({
          id: token.id || '',
          contract_address: token.contract_address,
          name: token.name,
          symbol: token.symbol,
          img_url: token.img_url
        }))
        
        data = {
          query: q,
          results
        }
        
        await redis.set(cacheKey, JSON.stringify(data), { ex: 600 })
      } catch (error) {
        throw new Error(`Failed to search: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } else if (typeof data === 'string') {
      try {
        data = JSON.parse(data)
      } catch (e) {
        throw new Error('Failed to parse cached data')
      }
    }
    
    return data
  }, {
    query: t.Object({
      q: t.String(),
      limit: t.Optional(t.String({ default: '25' })),
      cursor: t.Optional(t.String())
    }),
    response: t.Any()
  })
  
  .get('/trending', async ({ query }: { query: TrendingQuery }) => {
    const { limit = '25', cursor, time_window = '24h' } = query
    
    const cacheKey = `clanker_trending:${limit}:${time_window}:${cursor || ''}`
    let data = await redis.get(cacheKey)
    
    if (data === null) {
      try {
        const trendingResponse = await clanker.getTrendingTokens()
        
        if (!trendingResponse) {
          throw new Error('No trending data received from API')
        }
        
        if (trendingResponse.trending && trendingResponse.tokens) {
          data = trendingResponse
          await redis.set(cacheKey, JSON.stringify(data), { ex: 1800 })
          return data
        }
        
        const trendingItems = Array.isArray(trendingResponse.results) ? trendingResponse.results : []
        
        interface TrendingItem {
          id?: string;
          type?: string;
          attributes?: {
            pool_created_at?: string;
            name?: string;
          };
          relationships?: {
            base_token?: {
              data?: {
                id?: string;
                type?: string;
              }
            }
          }
        }
        
        interface TokensMap {
          [key: string]: {
            id: number;
            created_at: string;
            tx_hash: string;
            contract_address: string;
            requestor_fid: number | null;
            name: string;
            symbol: string;
            img_url: string | null;
            pool_address: string;
            cast_hash: string | null;
            type: string | null;
            pair: string | null;
            presale_id: string | null;
          }
        }
        
        const trending = trendingItems.map((item: TrendingItem) => ({
          id: item.id || '',
          type: item.type || '',
          attributes: item.attributes || {},
          relationships: item.relationships || {}
        }))
        
        const tokens: TokensMap = {}
        
        trending.forEach((item: TrendingItem) => {
          const poolAddress = item.id?.split('_')[1]
          if (poolAddress) {
            const tokenId = item.relationships?.base_token?.data?.id
            const tokenType = tokenId?.split('_')[0]
            const contractAddress = tokenId?.split('_')[1]
            
            if (contractAddress) {
              tokens[poolAddress] = {
                id: 0,
                created_at: item.attributes?.pool_created_at || new Date().toISOString(),
                tx_hash: '',
                contract_address: contractAddress,
                requestor_fid: null,
                name: item.attributes?.name?.split(' / ')[0] || '',
                symbol: '',
                img_url: null,
                pool_address: poolAddress,
                cast_hash: null,
                type: tokenType || null,
                pair: item.attributes?.name?.split(' / ')[1] || null,
                presale_id: null
              }
            }
          }
        })
        
        data = {
          trending,
          tokens
        }
        
        await redis.set(cacheKey, JSON.stringify(data), { ex: 1800 })
      } catch (error) {
        console.error('Trending error details:', error)
        throw new Error(`Failed to fetch trending data: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } else if (typeof data === 'string') {
      try {
        data = JSON.parse(data)
      } catch (e) {
        throw new Error('Failed to parse cached data')
      }
    }
    
    return data
  }, {
    query: t.Object({
      limit: t.Optional(t.String({ default: '25' })),
      cursor: t.Optional(t.String()),
      time_window: t.Optional(t.Union([
        t.Literal('1h'),
        t.Literal('6h'),
        t.Literal('24h'),
        t.Literal('7d')
      ], { default: '24h' }))
    }),
    response: t.Any()
  })
