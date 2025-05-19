import { WarpcastCastsResponse, WarpcastUserResponse, WarpcastTrendingTopicsResponse, WarpcastTopicCastsResponse, WarpcastCast } from "@tap/common"

class WarpcastService {
    private static instance: WarpcastService
    private readonly baseUrlV1 = 'https://client.warpcast.com/v1'
    private readonly baseUrlV2 = 'https://client.warpcast.com/v2'

    static getInstance(): WarpcastService {
        if (!WarpcastService.instance) {
            WarpcastService.instance = new WarpcastService()
        }
        return WarpcastService.instance
    }

    private async fetcher<T>(url: string, options?: RequestInit): Promise<T> {
        const headers: Record<string, string> = {
            'Accept': '*/*',
            'Content-Type': 'application/json'
        };

        const response = await fetch(url, {
            ...options,
            headers
        })

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`)
        }
        const responseBody = await response.text();
        if (!responseBody) {
            return {} as T;
        }
        try {
            return JSON.parse(responseBody) as T;
        } catch (e) {
            console.error("Failed to parse JSON response:", responseBody);
            throw new Error("Failed to parse JSON response from Warpcast API");
        }
    }

    async getTrendingTopics(): Promise<WarpcastTrendingTopicsResponse> {
        const url = `${this.baseUrlV1}/get-trending-topics`;
        return this.fetcher<WarpcastTrendingTopicsResponse>(url);
    }

    async getUserByUsername(username: string): Promise<WarpcastUserResponse> {
        const url = `${this.baseUrlV2}/user-by-username?username=${encodeURIComponent(username)}`;
        return this.fetcher<WarpcastUserResponse>(url);
    }

    async getUserByFid(fid: string): Promise<WarpcastUserResponse> {
        const url = `${this.baseUrlV2}/user-by-fid?fid=${encodeURIComponent(fid)}`;
        return this.fetcher<WarpcastUserResponse>(url);
    }

    async getThreadCasts(hash: string) {
        return this.fetcher<{ data: any }>(`v2/thread-casts?castHash=${encodeURIComponent(hash)}`);
    }
}

export const warpcast = WarpcastService.getInstance()