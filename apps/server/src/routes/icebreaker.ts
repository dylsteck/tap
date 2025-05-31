import { createElysia } from '../lib/utils'
import { redis } from '../lib/redis'
import { t } from 'elysia'
import {
  IcebreakerEnsResponse,
  IcebreakerEthResponse,
  IcebreakerFidResponse,
  IcebreakerFnameResponse,
  IcebreakerCredentialsResponse,
  IcebreakerSocialResponse
} from '@tap/common'
import { icebreaker } from '../services/icebreaker'

type EnsQuery = {
  name: string;
}

type EthQuery = {
  address: string;
}

type FidQuery = {
  fid: string;
}

type FnameQuery = {
  name: string;
}

type CredentialsQuery = {
  credentialName: string;
  limit?: string;
  offset?: string;
}

type SocialParams = {
  channelType: string;
  username: string;
}

export const icebreakerRoutes = createElysia({ prefix: '/icebreaker' })
  .get('/ens', async ({ query }: { query: EnsQuery }) => {
    const { name } = query
    
    if (!name) {
      throw new Error('Name parameter is required')
    }
    
    const cacheKey = `icebreaker:ens:${name}`
    let data = await redis.get(cacheKey)
    
    if (data === null) {
      try {
        const response = await icebreaker.getProfileByENS(name)
        data = response
        await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 })
      } catch (error) {
        throw new Error(`Failed to fetch ENS data: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      name: t.String()
    }),
    response: t.Any()
  })
  
  .get('/eth', async ({ query }: { query: EthQuery }) => {
    const { address } = query
    
    if (!address) {
      throw new Error('Address parameter is required')
    }
    
    const cacheKey = `icebreaker:eth:${address}`
    let data = await redis.get(cacheKey)
    
    if (data === null) {
      try {
        const response = await icebreaker.getProfileByWallet(address)
        data = response
        await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 })
      } catch (error) {
        throw new Error(`Failed to fetch ETH data: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      address: t.String()
    }),
    response: t.Any()
  })
  
  .get('/fid', async ({ query }: { query: FidQuery }) => {
    const { fid } = query
    
    if (!fid) {
      throw new Error('FID parameter is required')
    }
    
    const cacheKey = `icebreaker:fid:${fid}`
    let data = await redis.get(cacheKey)
    
    if (data === null) {
      try {
        const response = await icebreaker.getProfileByFID(fid)
        data = response
        await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 })
      } catch (error) {
        throw new Error(`Failed to fetch FID data: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      fid: t.String()
    }),
    response: t.Any()
  })
  
  .get('/fname', async ({ query }: { query: FnameQuery }) => {
    const { name } = query
    
    if (!name) {
      throw new Error('Name parameter is required')
    }
    
    const cacheKey = `icebreaker:fname:${name}`
    let data = await redis.get(cacheKey)
    
    if (data === null) {
      try {
        const response = await icebreaker.getProfileByFName(name)
        data = response
        await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 })
      } catch (error) {
        throw new Error(`Failed to fetch fname data: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      name: t.String()
    }),
    response: t.Any()
  })
  
  .get('/credentials', async ({ query }: { query: CredentialsQuery }) => {
    const { credentialName, limit = '100', offset = '0' } = query
    
    if (!credentialName) {
      throw new Error('Credential name parameter is required')
    }
    
    const cacheKey = `icebreaker:credentials:${credentialName}:${limit}:${offset}`
    let data = await redis.get(cacheKey)
    
    if (data === null) {
      try {
        const response = await icebreaker.getCredentialProfiles(credentialName, limit, offset)
        data = response
        await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 })
      } catch (error) {
        throw new Error(`Failed to fetch credentials data: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      credentialName: t.String(),
      limit: t.Optional(t.String({ default: '100' })),
      offset: t.Optional(t.String({ default: '0' }))
    }),
    response: t.Any()
  })

  .get('/socials/:channelType/:username', async ({ params }: { params: SocialParams }) => {
    const { channelType, username } = params
    
    if (!channelType || !username) {
      throw new Error('Channel type and username parameters are required')
    }
    
    const cacheKey = `icebreaker:socials:${channelType}:${username}`
    let data = await redis.get(cacheKey)
    
    if (data === null) {
      try {
        const response = await icebreaker.getProfileBySocial(channelType, username)
        data = response
        await redis.set(cacheKey, JSON.stringify(data), { ex: 3600 })
      } catch (error) {
        throw new Error(`Failed to fetch social data: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
    response: t.Any()
  })
