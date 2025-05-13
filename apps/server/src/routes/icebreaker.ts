import { createElysia } from '../lib/utils'
import { redis, checkKey, setKey } from '../lib/redis'
import { t } from 'elysia'
import {
  IcebreakerEnsResponse,
  IcebreakerEthResponse,
  IcebreakerFidResponse,
  IcebreakerFnameResponse,
  IcebreakerCredentialsResponse
} from '@tap/common'

type EnsQuery = {
  address?: string;
  name?: string;
  limit?: string;
  cursor?: string;
}

type EthQuery = {
  address: string;
  limit?: string;
  cursor?: string;
}

type FidQuery = {
  fid: string;
  limit?: string;
  cursor?: string;
}

type FnameQuery = {
  name: string;
  limit?: string;
  cursor?: string;
}

type CredentialsQuery = {
  address: string;
  type?: string;
  limit?: string;
  cursor?: string;
}

export const icebreakerRoutes = createElysia({ prefix: '/icebreaker' })
  .get('/ens', async ({ query }: { query: EnsQuery }) => {
    const { address, name, limit = '25', cursor } = query
    
    if (!address && !name) {
      throw new Error('Either address or name parameter is required')
    }
    
    const cacheKey = `icebreaker_ens:${address || ''}:${name || ''}:${limit}:${cursor || ''}`
    const cacheEx = 3600
    const cachedData = await checkKey(cacheKey)
    
    if (cachedData) {
      return cachedData
    }
    
    try {
      // Replace with actual implementation
      const data = { results: [] } as IcebreakerEnsResponse
      
      await setKey(cacheKey, JSON.stringify(data), cacheEx)
      return data
    } catch (error) {
      throw new Error(`Failed to fetch ENS data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, {
    query: t.Object({
      address: t.Optional(t.String()),
      name: t.Optional(t.String()),
      limit: t.Optional(t.String({ default: '25' })),
      cursor: t.Optional(t.String())
    }),
    response: t.Any()
  })
  
  .get('/eth', async ({ query }: { query: EthQuery }) => {
    const { address, limit = '25', cursor } = query
    
    if (!address) {
      throw new Error('Address parameter is required')
    }
    
    const cacheKey = `icebreaker_eth:${address}:${limit}:${cursor || ''}`
    const cacheEx = 3600
    const cachedData = await checkKey(cacheKey)
    
    if (cachedData) {
      return cachedData
    }
    
    try {
      // Replace with actual implementation
      const data = { address, results: [] } as IcebreakerEthResponse
      
      await setKey(cacheKey, JSON.stringify(data), cacheEx)
      return data
    } catch (error) {
      throw new Error(`Failed to fetch ETH data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, {
    query: t.Object({
      address: t.String(),
      limit: t.Optional(t.String({ default: '25' })),
      cursor: t.Optional(t.String())
    }),
    response: t.Any()
  })
  
  .get('/fid', async ({ query }: { query: FidQuery }) => {
    const { fid, limit = '25', cursor } = query
    
    if (!fid) {
      throw new Error('FID parameter is required')
    }
    
    const cacheKey = `icebreaker_fid:${fid}:${limit}:${cursor || ''}`
    const cacheEx = 3600
    const cachedData = await checkKey(cacheKey)
    
    if (cachedData) {
      return cachedData
    }
    
    try {
      // Replace with actual implementation
      const data = { fid, results: [] } as IcebreakerFidResponse
      
      await setKey(cacheKey, JSON.stringify(data), cacheEx)
      return data
    } catch (error) {
      throw new Error(`Failed to fetch FID data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, {
    query: t.Object({
      fid: t.String(),
      limit: t.Optional(t.String({ default: '25' })),
      cursor: t.Optional(t.String())
    }),
    response: t.Any()
  })
  
  .get('/fname', async ({ query }: { query: FnameQuery }) => {
    const { name, limit = '25', cursor } = query
    
    if (!name) {
      throw new Error('Name parameter is required')
    }
    
    const cacheKey = `icebreaker_fname:${name}:${limit}:${cursor || ''}`
    const cacheEx = 3600
    const cachedData = await checkKey(cacheKey)
    
    if (cachedData) {
      return cachedData
    }
    
    try {
      // Replace with actual implementation
      const data = { name, results: [] } as IcebreakerFnameResponse
      
      await setKey(cacheKey, JSON.stringify(data), cacheEx)
      return data
    } catch (error) {
      throw new Error(`Failed to fetch fname data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, {
    query: t.Object({
      name: t.String(),
      limit: t.Optional(t.String({ default: '25' })),
      cursor: t.Optional(t.String())
    }),
    response: t.Any()
  })
  
  .get('/credentials', async ({ query }: { query: CredentialsQuery }) => {
    const { address, type, limit = '25', cursor } = query
    
    if (!address) {
      throw new Error('Address parameter is required')
    }
    
    const cacheKey = `icebreaker_credentials:${address}:${type || ''}:${limit}:${cursor || ''}`
    const cacheEx = 3600
    const cachedData = await checkKey(cacheKey)
    
    if (cachedData) {
      return cachedData
    }
    
    try {
      // Replace with actual implementation
      const data = { address, type, results: [] } as IcebreakerCredentialsResponse
      
      await setKey(cacheKey, JSON.stringify(data), cacheEx)
      return data
    } catch (error) {
      throw new Error(`Failed to fetch credentials data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, {
    query: t.Object({
      address: t.String(),
      type: t.Optional(t.String()),
      limit: t.Optional(t.String({ default: '25' })),
      cursor: t.Optional(t.String())
    }),
    response: t.Any()
  })
