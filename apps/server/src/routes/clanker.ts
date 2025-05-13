import { createElysia } from '../lib/utils'
import { redis, checkKey, setKey } from '../lib/redis'
import { t } from 'elysia'
import { 
  ClankerSearchResponse, 
  ClankerTrendingResponse, 
  ClankerAddressResponse 
} from '@tap/common'

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
    const cacheEx = 3600
    const cachedData = await checkKey(cacheKey)
    
    if (cachedData) {
      return cachedData
    }
    
    try {
      // Replace with actual implementation to fetch address data
      const data = { address, results: [] } as ClankerAddressResponse
      
      await setKey(cacheKey, JSON.stringify(data), cacheEx)
      return data
    } catch (error) {
      throw new Error(`Failed to fetch address data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
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
    const cacheEx = 600
    const cachedData = await checkKey(cacheKey)
    
    if (cachedData) {
      return cachedData
    }
    
    try {
      // Replace with actual implementation to fetch search results
      const data = { query: q, results: [] } as ClankerSearchResponse
      
      await setKey(cacheKey, JSON.stringify(data), cacheEx)
      return data
    } catch (error) {
      throw new Error(`Failed to search: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
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
    const cacheEx = 1800
    const cachedData = await checkKey(cacheKey)
    
    if (cachedData) {
      return cachedData
    }
    
    try {
      // Replace with actual implementation to fetch trending data
      const data = { time_window, results: [] } as ClankerTrendingResponse
      
      await setKey(cacheKey, JSON.stringify(data), cacheEx)
      return data
    } catch (error) {
      throw new Error(`Failed to fetch trending data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
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
