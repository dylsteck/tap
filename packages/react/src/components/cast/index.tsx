/* eslint-disable @next/next/no-img-element */
import { Repeat } from 'lucide-react';
import React from 'react';

import { HeartIcon, MessageIcon } from '@/components/icons';

import { NeynarCastV2 } from '../../common/types/neynar';
import FrameLink from '../utils/frame-link';

export const Cast = ({ cast }: { cast: NeynarCastV2 }) => {
  return (
  <div className={`p-3 pb-1.5 rounded-lg w-full overflow-hidden cursor-pointer`}> 
    <FrameLink identifier={`${cast.author.fid}`} type='profile'>
      <div className="flex items-center mb-3 space-x-2">
        <img
          src={cast.author.pfp_url}
          alt={cast.author.username}
          className="size-9 rounded-full"
        />
        <div className="truncate">
          <p className={`font-semibold text-md truncate text-black dark:text-white`}>{cast.author.display_name}</p>
          <p className={`text-sm truncate text-black dark:text-white`}>
            @{cast.author.username}
          </p>
        </div>
      </div>
    </FrameLink>
    <FrameLink identifier={`https://warpcast.com/${cast.author.username ?? `~/conversations`}/${cast.hash}`} type='url'>
      <p className={`text-base break-words text-black dark:text-white`}> 
        {cast.text.length > 380 ? `${cast.text.slice(0, 380)}...` : cast.text}
      </p>
      {cast.replies.count > 0 || cast.reactions.likes_count > 0 || cast.reactions.recasts_count > 0 ?
      <div className="flex mt-3 space-x-6 items-center">
        {cast.replies.count > 0 ?
        <div className="flex items-center space-x-1.5">
          <div className="text-[#9FA3AF]">
            <MessageIcon size={14} />
          </div>
          <p className={`text-xs text-black dark:text-white`}>
            {cast.replies.count}
          </p>
        </div>
        : null}
        {cast.reactions.likes_count > 0 ?
        <div className="flex items-center space-x-1.5">
          <HeartIcon size={14} />
          <p className={`text-xs text-black dark:text-white`}>
            {cast.reactions.likes_count}
          </p>
        </div>
        : null}
        {cast.reactions.recasts_count > 0 ?
        <div className="flex items-center space-x-1.5">
          <Repeat className="size-4 text-[#9FA3AF]" />
          <p className={`text-xs text-black dark:text-white`}>
            {cast.reactions.recasts_count}
          </p>
        </div>
        : null }
      </div>
      : null}
    </FrameLink>
  </div>
  );
};