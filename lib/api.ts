import { BASE_URL, fetcher } from "./utils"

class TapSDK {
  private BASE_URL: string

  constructor() {
    this.BASE_URL = BASE_URL
  }

  async castSearch(query: string): Promise<any> {
    return await fetcher(`${this.BASE_URL}/api/farcaster/cast/search?q=${query}`)
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
    return await fetcher(url.toString())
  }

  async getBounties(status: string = "all", eventsSince: string = new Date(new Date(Date.now()).setDate(new Date(Date.now()).getDate() - 10)).toISOString()): Promise<any> {
    const url = new URL(`${this.BASE_URL}/api/farcaster/bounties`);
    url.searchParams.append("status", status);
    url.searchParams.append("eventsSince", eventsSince);
    return await fetcher(url.toString());
  }

  async getCast(type = 'hash', identifier: string): Promise<any> {
    if (!identifier || identifier.length === 0) {
      throw new Error("Cast identifier is required");
    }
    return await fetcher(`${this.BASE_URL}/api/farcaster/cast?type=${type}&identifier=${identifier}`);
  }

  async getCastConversation(hash: string): Promise<any> {
    if (!hash || hash.length === 0) {
      throw new Error("Cast hash is required");
    }
    return await fetcher(`${this.BASE_URL}/api/farcaster/cast/conversation?hash=${hash}`);
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

    return await fetcher(url.toString());
  }

  async getClankerByAddress(address: string): Promise<any>{
    return await fetcher(`${this.BASE_URL}/api/clanker/${address}`)
  }

  async getTrendingClankers(): Promise<any>{
    return await fetcher(`${this.BASE_URL}/api/clanker/trending`)
  }

  async getEnsName(ensName: string): Promise<any> {
    return await fetcher(`${this.BASE_URL}/api/ethereum/ens/${ensName}`)
  }

  async getEthAddressTimeline(address: string): Promise<any> {
    return await fetcher(`${this.BASE_URL}/api/ethereum/timeline?address=${address}`)
  }

  async getEthToken(address: string, network: string, timeFrame: string = 'DAY'): Promise<any> {
    return await fetcher(`${this.BASE_URL}/api/ethereum/token?address=${address}&network=${network}&timeFrame=${timeFrame}`)
  }

  async getEvents(): Promise<any> {
    return await fetcher(`${this.BASE_URL}/api/farcaster/events`)
  }

  async getFarcasterApp(name: string): Promise<any>{
    return await fetcher(`${this.BASE_URL}/api/farcaster/app/${name}`)
  }

  async getFarcasterApps(cursor: number = 0): Promise<any>{
    return await fetcher(`${this.BASE_URL}/api/farcaster/app/list?cursor=${cursor}`)
  }

  async getFarcasterToken(name: string): Promise<any>{
    return await fetcher(`${this.BASE_URL}/api/farcaster/tokens/${name}`)
  }

  async getFarcasterTokens(): Promise<any>{
    return await fetcher(`${this.BASE_URL}/api/farcaster/tokens`)
  }

  async getFarcasterUser(username: string): Promise<any> {
    const result = await fetcher(`${this.BASE_URL}/api/farcaster/user?username=${username}`)
    return result.result.user
  }

  async getFarcasterUserCasts(fid: number): Promise<any> {
    return await fetcher(`${this.BASE_URL}/api/farcaster/feed/user/casts?fid=${fid}`)
  }

  async getFarcasterUsersByLocation(latitude: number, longitude: number, viewer_fid?: number, limit: number = 25): Promise<any> {
    const url = new URL(`${this.BASE_URL}/api/user/by_location`);
    url.searchParams.append("latitude", latitude.toString());
    url.searchParams.append("longitude", longitude.toString());
    url.searchParams.append("limit", limit.toString());
  
    if (viewer_fid !== undefined) {
      url.searchParams.append("viewer_fid", viewer_fid.toString());
    }
  
    return await fetcher(url.toString())
  } 
  
  getIcebreakerCredentials(){
    return ['qBuilder', 'Human', 'bro', 'Chones', 'Skill: Product', 'Skill: Design', 'Skill: Engineering', 'Skill: Marketing', 'Skill: Legal', 'Skill: Finance', 'Skill: Operations', 'Skill: Sales', 'Skill: Support', 'Skill: Talent', 'Skill: Data'];
  }

  async getIcebreakerCredentialProfiles(credentialName: string, limit: number = 100, offset: number = 3): Promise<any> {
    if (!credentialName || credentialName.length === 0) {
      throw new Error("Credential name is required");
    }
    return await fetcher(`${this.BASE_URL}/api/icebreaker/credentials?credentialName=${credentialName}&limit=${limit}&offset=${offset}`)
  }

  async getIcebreakerEnsProfile(ensName: string): Promise<any> {
    if (!ensName || ensName.length === 0) {
      throw new Error("ENS name is required");
    }
    const json = await fetcher(`${this.BASE_URL}/api/icebreaker/ens?ensName=${ensName}`)
    return json.profiles[0];
  }

  async getIcebreakerEthAddressProfile(walletAddress: string): Promise<any> {
    if (!walletAddress || walletAddress.length === 0) {
      throw new Error("Wallet address is required");
    }
    return await fetcher(`${this.BASE_URL}/api/icebreaker/eth?walletAddress=${walletAddress}}`)
  }

  async getIcebreakerEthProfile(identifier: string): Promise<any> {
    const ensRegex = /^[a-zA-Z0-9]+\.eth$/;
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;

    if (ensRegex.test(identifier)) {
      return this.getIcebreakerEnsProfile(identifier);
    } else if (ethAddressRegex.test(identifier)) {
      return this.getIcebreakerEthAddressProfile(identifier);
    } else {
      throw new Error('Invalid ENS name or Ethereum address');
    }
  }

  async getIcebreakerFCUser(fname: string): Promise<any> {
    return await fetcher(`${this.BASE_URL}/api/icebreaker/fc?fname=${fname}`)
  }

  async getIcebreakerFidProfile(fid: number): Promise<any> {
    return await fetcher(`${this.BASE_URL}/api/icebreaker/fid?fid=${fid}`)
  }

  async getIcebreakerFnameProfile(fname: string): Promise<any> {
    return await fetcher(`${this.BASE_URL}/api/icebreaker/fname?fname=${fname}`)
  }

  async getIcebreakerProfile(fname?: string, fid?: string): Promise<any> {
    const url = new URL(`${this.BASE_URL}/api/icebreaker/profile`);
    if (fname) url.searchParams.append('fname', fname);
    if (fid) url.searchParams.append('fid', fid);
    return await fetcher(url.toString())
  }

  async getNounsBuilderProposals(contractAddress: string, first?: number, skip?: number): Promise<any> {
    const url = new URL(`${this.BASE_URL}/api/nouns-builder/proposals`);
    url.searchParams.append('contractAddress', contractAddress);
    if (first !== undefined) url.searchParams.append('first', first.toString());
    if (skip !== undefined) url.searchParams.append('skip', skip.toString());
    return await fetcher(url.toString())
  }

  async getTrendingCasts(): Promise<any> {
    return await fetcher(`${this.BASE_URL}/api/farcaster/feed/trending`)
  }
}

export default TapSDK