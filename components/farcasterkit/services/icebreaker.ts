class IcebreakerService {
    private readonly baseUrl = 'https://app.icebreaker.xyz/api/v1';
    private static instance: IcebreakerService;

    private constructor() {}

    static getInstance(): IcebreakerService {
        if (!IcebreakerService.instance) {
            IcebreakerService.instance = new IcebreakerService();
        }
        return IcebreakerService.instance;
    }

    private async fetcher<T>(url: string, options?: RequestInit): Promise<T> {
        const headers: Record<string, string> = {
            'Accept': '*/*',
            'Content-Type': 'application/json'
        };

        const response = await fetch(`${this.baseUrl}/${url}`, { headers, ...options });

        if (!response.ok) {
            console.error(await response.text());
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async getCredentialProfiles(credentialName: string, limit: string = '100', offset: string = '3') {
        return this.fetcher<{ profiles: any[] }>(`credentials?credentialName=${encodeURIComponent(credentialName)}&limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`);
    }

    async getProfileByENS(ensName: string) {
        return this.fetcher<{ profile: { profiles: any[] } }>(`ens/${encodeURIComponent(ensName)}`);
    }

    async getProfileByWallet(walletAddress: string) {
        return this.fetcher<{ profile: { profiles: any[] } }>(`eth/${encodeURIComponent(walletAddress)}`);
    }

    async getProfileByFID(fid: string) {
        return this.fetcher<{ profile: { profiles: any[] } }>(`fid/${encodeURIComponent(fid)}`);
    }

    async getProfileByFName(fname: string) {
        return this.fetcher<{ profile: { profiles: any[] } }>(`fname/${encodeURIComponent(fname)}`);
    }
}

export const icebreaker = IcebreakerService.getInstance();