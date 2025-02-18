'use client';
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { useMemo } from 'react';
import { http, createConfig } from 'wagmi';
import { mainnet, base, optimism } from 'wagmi/chains';

export const wagmiConfig = createConfig({
  chains: [mainnet, base, optimism],
  // turn off injected provider discovery
  multiInjectedProviderDiscovery: false,
  connectors: [farcasterFrame()],
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [optimism.id]: http()
  },
});