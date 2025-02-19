"use client"

import { ZapperFungibleToken } from "../../../common/types/ethereum"

export function Token({ token }: { token: ZapperFungibleToken }) {
    return (
        <iframe 
            allow="clipboard-write"
            className="w-[400px] md:w-[550px] lg:w-[650px] h-[500px] overflow-x-scroll rounded-xl" 
            width="100%" height="100%" 
            src={`https://www.geckoterminal.com/base/pools/${token.address}?embed=1&info=0&swaps=0&grayscale=0&light_chart=0`} 
        />
    )
}