import { Cast } from "@/components/farcasterkit/react/cast";
import { Event } from '@/components/farcasterkit/react/event';

import { ToolResponse } from "../tool-response";

export default function EventsTool({ events }: { events: any }){
    const images = [...new Set(events.slice(0, 4).map((event: any) => event.hosts[0].pfp_url || ''))].filter(Boolean) as string[];
    return (
        <ToolResponse 
            badgeTitle={`${events.length} events`} 
            bodyTitle="Events" 
            images={images} 
            items={events} 
            renderItem={(item: any) => <Event event={item} />} 
            keyExtractor={(item: any) => item.id} 
        />
    )
}   