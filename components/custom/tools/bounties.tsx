import { Bounty } from "@/farcasterkit/react/bounty";

import { ToolResponse } from "../tool-response";

export default function BountiesTool({ bounties }: { bounties: any }){
    const badgeTitle = `${bounties.length} bounties`;
    const images = [...new Set(bounties.slice(0, 4).map((bounty: any) => bounty.poster.profile_picture))] as string[];
    const renderItem = (item: any) => <Bounty bounty={item} />
    const keyExtractor = (item: any) => item.hash;
    return <ToolResponse badgeTitle={badgeTitle} bodyTitle="Bounties" images={images} items={bounties} renderItem={renderItem} keyExtractor={keyExtractor} />
}