class ZapperService {
    private readonly baseUrl = 'https://public.zapper.xyz/graphql';
    private static instance: ZapperService;

    private constructor() {}

    static getInstance(): ZapperService {
        if (!ZapperService.instance) {
            ZapperService.instance = new ZapperService();
        }
        return ZapperService.instance;
    }

    private async fetcher<T>(query: string, variables: Record<string, any>): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(process.env.ZAPPER_API_KEY ?? '')}`
        };

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({ query, variables })
        });

        if (!response.ok) {
            console.error(await response.text());
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async getTimeline(address: string) {
        const query = `
            query ($addresses: [Address!], $realtimeInterpretation: Boolean, $isSigner: Boolean) {
                accountsTimeline (
                    addresses: $addresses,
                    realtimeInterpretation: $realtimeInterpretation,
                    isSigner: $isSigner
                ) {
                    edges {
                        node {
                            transaction {
                                hash
                                fromUser { address displayName { value } ensRecord { name } }
                                toUser { address displayName { value } ensRecord { name } }
                                network timestamp transactionPrice transactionFee value input gasPrice gas
                            }
                            interpretation { processedDescription }
                        }
                    }
                }
            }
        `;
        const variables = { addresses: [address], isSigner: true, realtimeInterpretation: true };
        return this.fetcher<{ data: any }>(query, variables);
    }

    async getTokenData(address: string, network: string, timeFrame: string = 'DAY') {
        const query = `
            query ($address: Address!, $network: Network!, $first: Float!, $currency: Currency!, $timeFrame: TimeFrame!) {
                fungibleToken(address: $address, network: $network) {
                    address decimals holders(first: $first) {
                        edges { node { holderAddress percentileShare value } }
                    }
                    imageUrl isVerified name onchainMarketData {
                        marketCap price priceChange1h priceChange24h priceChange5m totalGasTokenLiquidity totalLiquidity
                        priceTicks(currency: $currency, timeFrame: $timeFrame) { open close timestamp }
                    }
                    totalSupply credibility securityRisk { reason }
                }
            }
        `;
        const variables = { address, network, first: 3, currency: 'USD', timeFrame };
        return this.fetcher<{ data: any }>(query, variables);
    }
}

export const zapper = ZapperService.getInstance();