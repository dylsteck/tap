import { Cast } from "@/components/farcasterkit/react/cast";

import { ToolResponse } from "../tool-response";

export default function CastsTool({ casts }: { casts: any }){
    const badgeTitle = `${casts.length} casts`;
    const images = [...new Set(casts.slice(0, 4).map((cast: any) => cast.author.pfp_url))] as string[];
    const renderItem = (item: any) => <Cast cast={item} />
    const keyExtractor = (item: any) => item.hash;
    return <ToolResponse badgeTitle={badgeTitle} bodyTitle="Casts" images={images} items={casts} renderItem={renderItem} keyExtractor={keyExtractor} />
}