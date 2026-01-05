import { http, createConfig, createStorage } from 'wagmi'
import { base, baseSepolia, mainnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// EIP-1193 injected provider detection
export const config = createConfig({
  chains: [base, baseSepolia, mainnet],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }),
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [mainnet.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

