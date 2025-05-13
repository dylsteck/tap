import { MBDCast } from "@tap/common"

class MBDService {
    private readonly bearerToken: string
    private readonly baseUrl = 'https://api.mbd.xyz/v2'
    private static instance: MBDService

    private constructor(bearerToken: string) {
        this.bearerToken = bearerToken
    }

    static getInstance(): MBDService {
        if (!MBDService.instance) {
            const bearerToken = process.env.MBD_BEARER_TOKEN
            if (!bearerToken) {
                throw new Error('MBD_BEARER_TOKEN environment variable is not set')
            }
            MBDService.instance = new MBDService(bearerToken)
        }
        return MBDService.instance
    }

    private async fetcher<T>(url: string, options?: RequestInit): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
             Accept: 'application/json',
            'X-Title': 'Tap',
            'authorization': `Bearer ${this.bearerToken}`,
        }

        const response = await fetch(`${this.baseUrl}/${url}`, { headers, ...options })

        if (!response.ok) {
            console.error(await response.text())
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return response.json()
    }

    async getVideos() {
        const MBD_FEED_ID = process.env.MBD_FEED_ID ?? "";
        const requestBody = {
            user_id: "616",
            feed_id: MBD_FEED_ID
        };
        return this.fetcher<{ status_code: number, body: MBDCast[] }>(`farcaster/casts/feed/popular`, { method: 'POST', body: JSON.stringify(requestBody)})
    }
}

export const mbd = MBDService.getInstance()