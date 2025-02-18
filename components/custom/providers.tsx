'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { base } from 'viem/chains';
import { WagmiProvider } from 'wagmi';

import { wagmiConfig } from '@/lib/wagmi';

import FrameProvider from './frame-provider';

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <FrameProvider>
          {children}
        </FrameProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
