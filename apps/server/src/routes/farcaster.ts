import { createElysia } from '../lib/utils'
import { neynar } from '../services/neynar'
import { warpcast } from '../services/warpcast'
import { redis, checkKey, setKey } from '../lib/redis'
import { t } from 'elysia'
import { 
  NeynarCastV2, 
  NeynarFeedResponse, 
  WarpcastUser, 
  WarpcastUserResponse, 
  WarpcastCast, 
  WarpcastCastsResponse 
} from '@tap/common'

type UserQuery = {
  username?: string;
  fid?: string;
}

type UserCastsQuery = {
  fid: string;
  viewer_fid?: string;
  limit?: string;
  cursor?: string;
  include_replies?: string;
  parent_url?: string;
  channel_id?: string;
}

type SearchQuery = {
  q: string;
  author_fid?: string;
  limit?: string;
  cursor?: string;
}

type TrendingQuery = {
  limit?: string;
  cursor?: string;
  time_window?: '1h' | '6h' | '24h' | '7d';
  channel_id?: string;
}

type ChannelsQuery = {
  channel_ids: string;
  with_recasts?: string;
  viewer_fid?: string;
  with_replies?: string;
  members_only?: string;
  fids?: string;
  limit?: string;
  cursor?: string;
}

type UserFeedQuery = {
  fid: string;
  limit?: string;
  cursor?: string;
  include_replies?: string;
  parent_url?: string;
  channel_id?: string;
}

type CastQuery = {
  identifier: string;
  type?: 'hash' | 'url';
}

type LocationQuery = {
  latitude: string;
  longitude: string;
  viewer_fid?: string;
  limit?: string;
  cursor?: string;
}

export const farcasterRoutes = createElysia({ prefix: '/farcaster' })  
  .get('/user', async ({ query }: { query: UserQuery }) => {
    const { username, fid } = query

    const cacheKey = username ? `user:${username}` : fid ? `user:${fid}` : null
    
    if (!cacheKey) {
      throw new Error('Username or FID parameter is required')
    }
    
    let data = await redis.get(cacheKey)

    if (data === null) {
      try {
        if (username) {
          data = await warpcast.getUserByUsername(username);
        } else if (fid) {
          data = await warpcast.getUserByFid(fid);
        } else {
          throw new Error('Username or FID parameter is required');
        }
        
        if (data) {
          await redis.set(cacheKey, JSON.stringify(data), { ex: 60 * 60 })
        } else {
          throw new Error('User not found')
        }
      } catch (error) {
        throw new Error(`Failed to fetch user data: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } else if (typeof data === 'string') {
      try {
        data = JSON.parse(data)
      } catch (e) {
        throw new Error('Failed to parse cached data')
      }
    }

    if (data === null) {
      throw new Error('User not found or error fetching data')
    }

    return data
  }, {
    query: t.Object({
      username: t.Optional(t.String()),
      fid: t.Optional(t.String())
    }),
    response: t.Any()
  })
  
  .get('/user/casts', async ({ query }: { query: UserCastsQuery }) => {
    const { fid, viewer_fid, limit = '25', cursor, include_replies = 'true', parent_url, channel_id } = query
    
    if (!fid) {
      throw new Error('FID parameter is required')
    }
    
    const cacheKey = `user_casts:${fid}:${viewer_fid || ''}:${limit}:${cursor || ''}:${include_replies}:${parent_url || ''}:${channel_id || ''}`
    const cacheEx = 3600
    const cachedData = await checkKey(cacheKey)
    
    if (cachedData) {
      return cachedData
    }
    
    try {
      const data = await neynar.getUserCasts({
        fid: parseInt(fid as string),
        viewer_fid: viewer_fid ? parseInt(viewer_fid as string) : undefined,
        limit: parseInt(limit as string),
        cursor: cursor ? String(cursor) : undefined,
        include_replies: include_replies !== 'false',
        parent_url: parent_url ? String(parent_url) : undefined,
        channel_id: channel_id ? String(channel_id) : undefined
      })
      
      await setKey(cacheKey, JSON.stringify(data), cacheEx)
      return data
    } catch (error) {
      throw new Error(`Failed to fetch user casts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, {
    query: t.Object({
      fid: t.String(),
      viewer_fid: t.Optional(t.String()),
      limit: t.Optional(t.String({ default: '25' })),
      cursor: t.Optional(t.String()),
      include_replies: t.Optional(t.String({ default: 'true' })),
      parent_url: t.Optional(t.String()),
      channel_id: t.Optional(t.String())
    }),
    response: t.Any()
  })
  
  .get('/search', async ({ query }: { query: SearchQuery }) => {
    const { q, author_fid, limit, cursor } = query
    
    if (!q) {
      throw new Error('Search query (q) parameter is required')
    }
    
    const cacheKey = `search:${q}:${author_fid || ''}:${limit || ''}:${cursor || ''}`
    const cacheEx = 600
    const cachedData = await checkKey(cacheKey)
    
    if (cachedData) {
      return cachedData
    }
    
    try {
      const params: any = { q }
      
      if (author_fid) {
        params.author_fid = Number(author_fid)
      }
      
      if (limit) {
        params.limit = Number(limit)
      }
      
      if (cursor) {
        params.cursor = cursor
      }
      
      const data = await neynar.castSearch(params)
      await setKey(cacheKey, JSON.stringify(data), cacheEx)
      return data
    } catch (error) {
      throw new Error(`Failed to search casts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, {
    query: t.Object({
      q: t.String(),
      author_fid: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      cursor: t.Optional(t.String())
    }),
    response: t.Any()
  })
  
  .get('/feed/trending', async ({ query }: { query: TrendingQuery }) => {
    const { limit, cursor, time_window, channel_id } = query
    
    const cacheKey = `trending:${limit || ''}:${time_window || ''}:${channel_id || ''}:${cursor || ''}`
    const cacheEx = 1800
    const cachedData = await checkKey(cacheKey)
    
    if (cachedData) {
      return cachedData
    }
    
    try {
      const params: any = {}
      
      if (limit) {
        params.limit = Number(limit)
      }
      
      if (cursor) {
        params.cursor = cursor
      }
      
      if (time_window) {
        params.time_window = time_window
      }
      
      if (channel_id) {
        params.channel_id = channel_id
      }
      
      const data = await neynar.getTrendingCasts(params)
      await setKey(cacheKey, JSON.stringify(data), cacheEx)
      return data
    } catch (error) {
      throw new Error(`Failed to fetch trending casts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, {
    query: t.Object({
      limit: t.Optional(t.String()),
      cursor: t.Optional(t.String()),
      time_window: t.Optional(t.Union([
        t.Literal('1h'),
        t.Literal('6h'),
        t.Literal('24h'),
        t.Literal('7d')
      ])),
      channel_id: t.Optional(t.String())
    }),
    response: t.Any()
  })
  
  .get('/feed/channels', async ({ query }: { query: ChannelsQuery }) => {
    const { channel_ids, with_recasts, viewer_fid, with_replies, members_only, fids, limit, cursor } = query
    
    if (!channel_ids) {
      throw new Error('Channel IDs parameter is required')
    }
    
    const cacheKey = `channels:${channel_ids}:${with_recasts || ''}:${with_replies || ''}:${members_only || ''}:${fids || ''}:${limit || ''}:${cursor || ''}`
    const cacheEx = 1800
    const cachedData = await checkKey(cacheKey)
    
    if (cachedData) {
      return cachedData
    }
    
    try {
      const params: any = { 
        channel_ids: String(channel_ids)
      }
      
      if (with_recasts !== undefined) {
        params.with_recasts = with_recasts === 'true'
      }
      
      if (viewer_fid) {
        params.viewer_fid = Number(viewer_fid)
      }
      
      if (with_replies !== undefined) {
        params.with_replies = with_replies === 'true'
      }
      
      if (members_only !== undefined) {
        params.members_only = members_only === 'true'
      }
      
      if (fids) {
        params.fids = String(fids)
      }
      
      if (limit) {
        params.limit = Number(limit)
      }
      
      if (cursor) {
        params.cursor = cursor
      }
      
      const data = await neynar.getChannelsFeed(params)
      await setKey(cacheKey, JSON.stringify(data), cacheEx)
      return data
    } catch (error) {
      throw new Error(`Failed to fetch channel feed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, {
    query: t.Object({
      channel_ids: t.String(),
      with_recasts: t.Optional(t.String()),
      viewer_fid: t.Optional(t.String()),
      with_replies: t.Optional(t.String()),
      members_only: t.Optional(t.String()),
      fids: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      cursor: t.Optional(t.String())
    }),
    response: t.Any()
  })
  
  .get('/feed/user', async ({ query }: { query: UserFeedQuery }) => {
    const { fid, limit, cursor, include_replies, parent_url, channel_id } = query
    
    if (!fid) {
      throw new Error('FID parameter is required')
    }
    
    const numericFid = Number(fid)
    if (isNaN(numericFid)) {
      throw new Error('FID must be a number')
    }
    
    const cacheKey = `user_feed:${fid}:${include_replies || ''}:${parent_url || ''}:${channel_id || ''}:${limit || ''}:${cursor || ''}`
    const cacheEx = 1800
    const cachedData = await checkKey(cacheKey)
    
    if (cachedData) {
      return cachedData
    }
    
    try {
      const params: any = { fid: numericFid }
      
      if (include_replies !== undefined) {
        params.include_replies = include_replies === 'true'
      }
      
      if (parent_url) {
        params.parent_url = String(parent_url)
      }
      
      if (channel_id) {
        params.channel_id = String(channel_id)
      }
      
      if (limit) {
        params.limit = Number(limit)
      }
      
      if (cursor) {
        params.cursor = cursor
      }
      
      const data = await neynar.getUserCasts(params)
      await setKey(cacheKey, JSON.stringify(data), cacheEx)
      return data
    } catch (error) {
      throw new Error(`Failed to fetch user feed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, {
    query: t.Object({
      fid: t.String(),
      limit: t.Optional(t.String()),
      cursor: t.Optional(t.String()),
      include_replies: t.Optional(t.String()),
      parent_url: t.Optional(t.String()),
      channel_id: t.Optional(t.String())
    }),
    response: t.Any()
  })
  
  .get('/cast', async ({ query }: { query: CastQuery }) => {
    const { identifier, type = 'hash' } = query
    
    if (!identifier) {
      throw new Error('Cast identifier parameter is required')
    }
    
    if (type !== 'hash' && type !== 'url') {
      throw new Error('Type must be either "hash" or "url"')
    }
    
    const cacheKey = `cast:${identifier}:${type}`
    const cacheEx = 43200
    const cachedData = await checkKey(cacheKey)
    
    if (cachedData) {
      return cachedData
    }
    
    try {
      const data = await neynar.getCast({ 
        identifier: String(identifier), 
        type: type as 'hash' | 'url'
      })
      await setKey(cacheKey, JSON.stringify(data), cacheEx)
      return data
    } catch (error) {
      throw new Error(`Failed to fetch cast: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, {
    query: t.Object({
      identifier: t.String(),
      type: t.Optional(t.Union([
        t.Literal('hash'),
        t.Literal('url')
      ], { default: 'hash' }))
    }),
    response: t.Any()
  })
  
  .get('/user/by_location', async ({ query }: { query: LocationQuery }) => {
    const { latitude, longitude, viewer_fid, limit, cursor } = query
    
    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude parameters are required')
    }
    
    const numericLat = Number(latitude)
    const numericLong = Number(longitude)
    
    if (isNaN(numericLat) || isNaN(numericLong)) {
      throw new Error('Latitude and longitude must be numbers')
    }
    
    const cacheKey = `users_by_location:${latitude}:${longitude}:${limit || ''}:${cursor || ''}`
    const cacheEx = 3600
    const cachedData = await checkKey(cacheKey)
    
    if (cachedData) {
      return cachedData
    }
    
    try {
      const params: any = { 
        latitude: numericLat,
        longitude: numericLong
      }
      
      if (viewer_fid) {
        params.viewer_fid = Number(viewer_fid)
      }
      
      if (limit) {
        params.limit = Number(limit)
      }
      
      if (cursor) {
        params.cursor = cursor
      }
      
      const data = await neynar.getUserByLocation(params)
      await setKey(cacheKey, JSON.stringify(data), cacheEx)
      return data
    } catch (error) {
      throw new Error(`Failed to fetch users by location: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, {
    query: t.Object({
      latitude: t.String(),
      longitude: t.String(),
      viewer_fid: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      cursor: t.Optional(t.String())
    }),
    response: t.Any()
  })
