import { WarpcastCastsResponse, WarpcastUserResponse, WarpcastTrendingTopicsResponse } from "../common/types/warpcast";

class WarpcastService {
    private static instance: WarpcastService
    private readonly baseUrlV1 = 'https://client.warpcast.com/v1'
    private readonly baseUrlV2 = 'https://client.warpcast.com/v2'
    private readonly authToken: string

    private constructor() {
        const token = process.env.WARPCAST_AUTH_TOKEN
        if (!token) {
            throw new Error('WARPCAST_AUTH_TOKEN environment variable is not set')
        }
        this.authToken = token
    }

    static getInstance(): WarpcastService {
        if (!WarpcastService.instance) {
            WarpcastService.instance = new WarpcastService()
        }
        return WarpcastService.instance
    }

    private async fetcher<T>(url: string, options?: RequestInit): Promise<T> {
        const response = await fetch(url, {
            ...options,
            headers: {
                accept: '*/*',
                'accept-language': 'en-US,en;q=0.5',
                authorization: `Bearer ${this.authToken}`,
                'content-type': 'application/json; charset=utf-8',
                origin: 'https://warpcast.com',
                priority: 'u=1, i',
                referer: 'https://warpcast.com/',
                'sec-ch-ua': '"Brave";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'sec-gpc': '1'
            }
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
}

export const warpcast = WarpcastService.getInstance()