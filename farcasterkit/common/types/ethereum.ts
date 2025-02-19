export type ZapperFungibleTokenResponse = {
    data: {
      fungibleToken: ZapperFungibleToken;
    };
};
  
export type ZapperFungibleToken = {
    address: string;
    decimals: number;
    holders: {
        edges: {
        node: {
            holderAddress: string;
            percentileShare: number;
            value: string;
        };
        }[];
    };
    imageUrl: string;
    isVerified: boolean;
    name: string;
    onchainMarketData: {
        marketCap: number;
        price: number;
        priceChange1h: number;
        priceChange24h: number;
        priceChange5m: number;
        totalGasTokenLiquidity: number;
        totalLiquidity: number;
        priceTicks: {
        open: number;
        close: number;
        timestamp: number;
        }[];
    };
    totalSupply: string;
    credibility: any;
    securityRisk: any;
};  