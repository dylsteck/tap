class BountycasterService {
    private readonly baseUrl = 'https://www.bountycaster.xyz/api/v1';
    private static instance: BountycasterService;

    private constructor() {}

    static getInstance(): BountycasterService {
        if (!BountycasterService.instance) {
            BountycasterService.instance = new BountycasterService();
        }
        return BountycasterService.instance;
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

    async getBounties(status: string, eventsSince: string, minUsdValue?: number) {
        const queryParams = new URLSearchParams({ status, eventsSince });
        if (minUsdValue) queryParams.append('minUsdValue', minUsdValue.toString());
        return this.fetcher<{ data: any }>(`bounties?${queryParams.toString()}`);
    }

    async getBountyById(id: string) {
        return this.fetcher<{ data: any }>(`bounty/${id}`);
    }
}

export const bountycaster = BountycasterService.getInstance();