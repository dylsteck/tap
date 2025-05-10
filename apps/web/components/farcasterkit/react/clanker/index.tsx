/* eslint-disable @next/next/no-img-element */
import { Heart, Repeat } from 'lucide-react';
import React from 'react';

import { formatPrice } from '@/lib/utils';

import { MergedClanker } from '../../common/types/clanker';

export const Clanker = ({ clanker }: { 
  clanker: MergedClanker
}) => {
  return (
    <div className="p-2 rounded-lg w-full overflow-hidden text-black dark:text-white cursor-pointer" onClick={() => window.open(`https://clanker.world/clanker/${clanker.token.contract_address}`, '_blank')}> 
      <div className="flex flex-row gap-2 items-start">
        {clanker.token.img_url ? (
          <img
            src={clanker.token.img_url}
            alt={clanker.token.name}
            className="size-10 rounded-full border border-gray-600 mt-1"
          />
        ) : (
          <div className="flex items-center justify-center size-10 rounded-full bg-gray-400 text-white mt-1">
            <span className="font-medium">
              {clanker.token.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="flex flex-col">
          <p className={`font-semibold text-lg`}>{clanker.token.name}</p>
          <p className={`text-sm font-normal opacity-90`}>${clanker.token.symbol}</p>
        </div>
      </div>
      <div className="mt-3 space-y-2 space-x-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className={`text-xs font-medium`}>24h volume</p>
            <p className={`text-sm`}>
              {clanker.attributes.h24_volume_usd ? (`$${formatPrice(parseInt(clanker.attributes.h24_volume_usd))}`) : 'N/A'}
            </p>
          </div>
          <div>
            <p className={`text-xs font-medium`}>Market Cap</p>
            <p className={`text-sm`}>
              {clanker.attributes.market_cap_usd ? (`$${formatPrice(parseInt(clanker.attributes.market_cap_usd))}`) : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};