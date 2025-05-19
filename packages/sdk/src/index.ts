import { ApplicationError, SERVER_BASE_URL, WarpcastCast, WarpcastTrendingTopicsResponse } from "@tap/common"

class TapSDK {
  private BASE_URL: string
  private static instance: TapSDK

  constructor(baseUrl?: string) {
    this.BASE_URL = baseUrl || SERVER_BASE_URL
  }

  static getInstance(): TapSDK {
    if (!TapSDK.instance) {
      TapSDK.instance = new TapSDK()
    }
    return TapSDK.instance
  }

  public async request(url: string, options?: RequestInit) {
    const res = await fetch(url, options);
    if (!res.ok) {
      const error = new Error(
        "An error occurred while fetching the data."
      ) as ApplicationError;
  
      error.info = await res.json();
      error.status = res.status;
  
      throw error;
    }
    const json = await res.json();
    return json;
  }

  async castSearch(query: string): Promise<any> {
    return await this.request(`${this.BASE_URL}/api/farcaster/cast/search?q=${query}`)
  }

  async clankerSearch(q?: string, type?: string, fids?: string, page?: number): Promise<any> {
    const url = new URL(`${this.BASE_URL}/api/clanker/search`)
    if (q) {
      url.searchParams.append("q", q)
    }
    url.searchParams.append("type", type ? type : "all")
    if (fids) {
      url.searchParams.append("fids", fids)
    }
    url.searchParams.append("page", page ? page.toString() : "1")
    return await this.request(url.toString())
  }

  async getBounties(status: string = "all", eventsSince: string = new Date(new Date(Date.now()).setDate(new Date(Date.now()).getDate() - 10)).toISOString()): Promise<any> {
    const url = new URL(`${this.BASE_URL}/api/farcaster/bounties`);
    url.searchParams.append("status", status);
    url.searchParams.append("eventsSince", eventsSince);
    return await this.request(url.toString());
  }

  async getCast(type = 'hash', identifier: string): Promise<any> {
    if (!identifier || identifier.length === 0) {
      throw new Error("Cast identifier is required");
    }
    return await this.request(`${this.BASE_URL}/api/farcaster/cast?type=${type}&identifier=${identifier}`);
  }

  async getCastConversation(hash: string): Promise<any> {
    if (!hash || hash.length === 0) {
      throw new Error("Cast hash is required");
    }
    return await this.request(`${this.BASE_URL}/api/farcaster/cast/conversation?hash=${hash}`);
  }

  async getChannelsCasts(params: {
    channel_ids: string,
    with_recasts?: boolean,
    viewer_fid?: number,
    with_replies?: boolean,
    members_only?: boolean,
    limit?: number,
    cursor?: string
  }): Promise<any> {
    const url = new URL(`${this.BASE_URL}/api/farcaster/feed/channels`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });

    return await this.request(url.toString());
  }

  async getClankerByAddress(address: string): Promise<any>{
    return await this.request(`${this.BASE_URL}/api/clanker/${address}`)
  }

  async getTrendingClankers(): Promise<any>{
    return await this.request(`${this.BASE_URL}/api/clanker/trending`)
  }

  async getEnsName(ensName: string): Promise<any> {
    return await this.request(`${this.BASE_URL}/api/ethereum/ens/${ensName}`);
  }
  
}