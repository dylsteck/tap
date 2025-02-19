import { ClankerTrendingTokensResponse, MergedClanker } from "@/components/farcasterkit/common/types";
import { Clanker } from "@/components/farcasterkit/react/clanker";

import { ToolResponse } from "../tool-response";

export default function ClankerTrendingTool({ clankers }: { clankers: any }){
    const badgeTitle = `${Object.keys(clankers.tokens).length} tokens`;
    const images = [...new Set(Object.values(clankers.tokens).slice(0, 4).map((clanker: any) => clanker.img_url))] as string[];
    const renderItem = (item: any) => <Clanker clanker={item} />
    const keyExtractor = (item: any) => item.id;

    const tokenMap = Object.keys(clankers.tokens).reduce((acc, key) => {
        const lowerKey = key.toLowerCase();
        acc[lowerKey] = clankers.tokens[key];
        return acc;
      }, {} as Record<string, typeof clankers.tokens[string]>);
      
      const mergedClankers = clankers.trending.map((trendingItem: ClankerTrendingTokensResponse['trending'][0]) => {
        const contractAddress = trendingItem.attributes.address;
        const tokenData = tokenMap[contractAddress];
      
        if (!tokenData) {
          throw new Error(`Token data not found for address: ${contractAddress}`);
        }
      
        return {
          ...trendingItem,
          token: {
            id: tokenData.id,
            contract_address: tokenData.contract_address,
            name: tokenData.name,
            symbol: tokenData.symbol,
            img_url: tokenData.img_url,
          },
        };
      }) as MergedClanker[];

    return <ToolResponse badgeTitle={badgeTitle} bodyTitle="Tokens" images={images} items={mergedClankers} renderItem={renderItem} keyExtractor={keyExtractor} />
}