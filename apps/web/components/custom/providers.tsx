'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Session } from 'next-auth';
import { type ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';

import { wagmiConfig } from '@/lib/wagmi';

import FrameProvider from './frame-provider';

const queryClient = new QueryClient();

export default function Providers({ children, session }: { children: ReactNode, session?: Session | null }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <FrameProvider session={session}>
          {children}
        </FrameProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
