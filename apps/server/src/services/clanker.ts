class ClankerService {
    private readonly apiKey: string
    private readonly baseUrl = 'https://www.clanker.world/api'
    private static instance: ClankerService

    private constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    static getInstance(): ClankerService {
        if (!ClankerService.instance) {
            const apiKey = process.env.CLANKER_API_KEY
            if (!apiKey) {
                throw new Error('CLANKER_API_KEY environment variable is not set')
            }
            ClankerService.instance = new ClankerService(apiKey)
        }
        return ClankerService.instance
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

    async getTokens({ sort = 'desc', page = 1, pair = 'all', partner = 'all' }: { sort?: string, page?: number, pair?: string, partner?: string }) {
        return this.fetcher<{ data: Array<any>, hasMore: boolean, total: number }>(`tokens?sort=${sort}&page=${page}&pair=${pair}&partner=${partner}`)
    }

    async searchTokens({ q, type = 'all', fids, page = 1 }: { q?: string, type?: string, fids?: string, page?: number }) {
        let endpoint = `tokens/search?type=${type}&page=${page}`
        if (q) endpoint += `&q=${encodeURIComponent(q)}`
        if (fids) endpoint += `&fids=${encodeURIComponent(fids)}`
        return this.fetcher<{ data: Array<any>, hasMore: boolean, total: number }>(endpoint)
    }

    async getClankerByAddress(address: string) {
        return this.fetcher<{ data: any }>(`get-clanker-by-address?address=${address}`)
    }

    async fetchDeployedByAddress(address: string, page = 1) {
        return this.fetcher<{ data: Array<any>, hasMore: boolean, total: number }>(`tokens/fetch-deployed-by-address?address=${address}&page=${page}`)
    }

    async getTrendingTokens() {
        return this.fetcher<any>(`tokens/trending`)
    }
}

export const clanker = ClankerService.getInstance()