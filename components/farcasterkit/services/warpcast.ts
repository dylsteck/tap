class WarpcastService {
    private readonly baseUrl = 'https://api.warpcast.com';
    private static instance: WarpcastService;

    private constructor() {}

    static getInstance(): WarpcastService {
        if (!WarpcastService.instance) {
            WarpcastService.instance = new WarpcastService();
        }
        return WarpcastService.instance;
    }

    private async fetcher<T>(url: string, options?: RequestInit): Promise<T> {
        const headers: Record<string, string> = {
            'Accept': 'application/json'
        };

        const response = await fetch(`${this.baseUrl}/${url}`, { headers, ...options });

        if (!response.ok) {
            console.error(await response.text());
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async getThreadCasts(hash: string) {
        return this.fetcher<{ data: any }>(`v2/thread-casts?castHash=${encodeURIComponent(hash)}`);
    }
}

export const warpcast = WarpcastService.getInstance();