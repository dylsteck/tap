'use client'

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi'
import { cn } from '@/lib/utils'

// Icons
const WalletIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </svg>
)

const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const DisconnectIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
)

interface ConnectWalletProps {
  className?: string
  variant?: 'default' | 'compact'
  onConnect?: (address: string) => void
}

export function ConnectWallet({ className, variant = 'default', onConnect }: ConnectWalletProps) {
  const { address, isConnected, isConnecting } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()
  const [showOptions, setShowOptions] = useState(false)

  // Find injected connector (MetaMask, Coinbase Wallet, etc.)
  const injectedConnector = connectors.find(c => c.id === 'injected')

  const handleConnect = async () => {
    if (!injectedConnector) {
      // No wallet detected
      window.open('https://metamask.io/download/', '_blank')
      return
    }

    try {
      connect(
        { connector: injectedConnector },
        {
          onSuccess: (data) => {
            const connectedAddress = data.accounts[0]
            if (connectedAddress && onConnect) {
              onConnect(connectedAddress)
            }
          },
        }
      )
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setShowOptions(false)
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className={cn(
            "flex items-center gap-2 rounded-xl font-medium transition-all",
            variant === 'default' 
              ? "px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
              : "px-3 py-2 bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700",
            className
          )}
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
            <CheckIcon size={12} />
          </div>
          <span className="text-sm">
            {ensName || formatAddress(address)}
          </span>
        </button>

        {showOptions && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setShowOptions(false)}
            />
            <div className="absolute top-full mt-2 right-0 z-50 w-48 py-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl animate-in slide-in-from-top-2 duration-200">
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
              >
                <DisconnectIcon size={16} />
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className={cn(
        "flex items-center gap-2 rounded-xl font-medium transition-all",
        variant === 'default'
          ? "px-4 py-2.5 bg-white text-black hover:bg-zinc-200"
          : "px-3 py-2 bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700",
        isConnecting && "opacity-60 cursor-wait",
        className
      )}
    >
      {isConnecting ? (
        <>
          <div className="w-4 h-4 rounded-full border-2 border-zinc-400 border-t-zinc-600 animate-spin" />
          <span className="text-sm">Connecting...</span>
        </>
      ) : (
        <>
          <WalletIcon size={18} />
          <span className="text-sm">Connect Wallet</span>
        </>
      )}
    </button>
  )
}

// Hook for wallet state
export function useWallet() {
  const { address, isConnected, isConnecting, chain } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()

  const injectedConnector = connectors.find(c => c.id === 'injected')

  const connectWallet = async () => {
    if (!injectedConnector) return false
    try {
      await connect({ connector: injectedConnector })
      return true
    } catch {
      return false
    }
  }

  return {
    address,
    ensName,
    isConnected,
    isConnecting,
    chain,
    hasWallet: !!injectedConnector,
    connectWallet,
    disconnect,
  }
}

