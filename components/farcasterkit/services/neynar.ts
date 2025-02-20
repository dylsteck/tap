class NeynarService {
    private readonly apiKey: string
    private readonly baseUrl = 'https://api.neynar.com/v2'
    private static instance: NeynarService
  
    private constructor(apiKey: string) {
      this.apiKey = apiKey
    }
  
    static getInstance(): NeynarService {
      if (!NeynarService.instance) {
        const apiKey = process.env.NEYNAR_API_KEY
        if (!apiKey) {
          throw new Error('NEYNAR_API_KEY environment variable is not set')
        }
        NeynarService.instance = new NeynarService(apiKey)
      }
      return NeynarService.instance
    }
  
    private async fetcher<T>(url: string, options?: RequestInit): Promise<T> {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-api-key': this.apiKey,
      }
    
      const response = await fetch(`${this.baseUrl}/${url}`, { headers, ...options })
    
      if (!response.ok) {
        console.error(await response.text())
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    
      return response.json()
    }
  
    async getTrendingCasts({
      limit = 10,
      cursor,
      viewer_fid,
      time_window = '24h',
      channel_id,
      provider,
    }: {
      limit?: number
      cursor?: string
      viewer_fid?: number
      time_window?: string
      channel_id?: string
      provider?: string
    } = {}) {
      let endpoint = `/farcaster/feed/trending?limit=${limit}&time_window=${time_window}`
      if (cursor) endpoint += `&cursor=${cursor}`
      if (viewer_fid) endpoint += `&viewer_fid=${viewer_fid}`
      if (channel_id) endpoint += `&channel_id=${channel_id}`
      if (provider) endpoint += `&provider=${provider}`
      return this.fetcher<{
        casts: Array<any>
        next?: { cursor: string | null }
      }>(endpoint)
    }
  
    async castSearch({
      q,
      author_fid,
      viewer_fid,
      parent_url,
      channel_id,
      priority_mode = false,
      limit = 25,
      cursor,
    }: {
      q: string
      author_fid?: number
      viewer_fid?: number
      parent_url?: string
      channel_id?: string
      priority_mode?: boolean
      limit?: number
      cursor?: string
    }) {
      let endpoint = `/farcaster/cast/search?q=${encodeURIComponent(q)}&limit=${limit}&priority_mode=${priority_mode}`
      if (author_fid) endpoint += `&author_fid=${author_fid}`
      if (viewer_fid) endpoint += `&viewer_fid=${viewer_fid}`
      if (parent_url) endpoint += `&parent_url=${encodeURIComponent(parent_url)}`
      if (channel_id) endpoint += `&channel_id=${channel_id}`
      if (cursor) endpoint += `&cursor=${cursor}`
      return this.fetcher<{
        result: {
            casts: Array<any>
            next?: { cursor: string | null }
        }
      }>(endpoint)
    }
}
  
export const neynar = NeynarService.getInstance()  