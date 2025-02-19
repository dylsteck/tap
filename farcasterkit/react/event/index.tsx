/* eslint-disable @next/next/no-img-element */
import { CalendarIcon, MapPinIcon, UserIcon, UsersIcon } from "lucide-react";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { EventData } from "../../common/types/events";

function formatDate(
  startTimestamp: number,
  endTimestamp?: number,
  timeZoneAbbr?: string
) {
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  const startDate = new Intl.DateTimeFormat("en-US", dateOptions).format(
    new Date(startTimestamp)
  );
  const startTime = new Intl.DateTimeFormat("en-US", timeOptions).format(
    new Date(startTimestamp)
  );

  if (endTimestamp) {
    const endTime = new Intl.DateTimeFormat("en-US", timeOptions).format(
      new Date(endTimestamp)
    );
    return `${startDate}, ${startTime} - ${endTime}`;
  }
  return `${startDate} at ${startTime}`;
}

export function Event({ event }: { event: EventData }) {
  return (
    <div className="flex flex-col w-full h-auto rounded-lg shadow-md overflow-hidden cursor-pointer" onClick={() => window.open(`https://events.xyz/events/${event.id}`, '_blank')}>
      {event.image_url ? 
          <div className="w-full">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-auto max-h-[12vh] object-cover rounded-t-lg"
            />
          </div>
          : null}
      <div className="p-2 pl-2.5 flex flex-col justify-between">
        <h3 className="font-medium text-lg text-wrap">
            {event.title}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <UserIcon className="size-3.5 shrink-0 opacity-65" />
          {event.hosts.map((host) => (
            <a
              key={host.fid}
              href={`https://warpcast.com/${host.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-full py-1 transition-colors"
            >
              <Avatar className="size-4 shrink-0 bg-transparent">
                <AvatarImage src={host.pfp_url} alt={host.display_name} />
                <AvatarFallback>
                  {host.display_name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground py-1">
          <div className="flex items-center gap-1">
            <CalendarIcon className="size-3.5 shrink-0" />
            <span className="text-wrap text-xs">
              {formatDate(event.start_date, event.end_date, event.display_tz)}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-1">
              <MapPinIcon className="size-3.5 shrink-0" />
              <span className="truncate">{`${event.location.address.city}, ${event.location.address.state}`}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}