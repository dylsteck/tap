/* eslint-disable @next/next/no-img-element */
"use client"

import { DollarSign, Wallet } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"
import { parseEther } from "viem"
import { useAccount, useBalance, useSendTransaction, useConnect, useSwitchChain } from "wagmi"
import { base, mainnet, optimism } from "wagmi/chains"
import { injected } from "wagmi/connectors"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

import FrameLink from "../../utils/frame-link"

const supportedChains = [mainnet, base, optimism]

interface TipDrawerProps {
  recipientAddress: `0x${string}`
  recipientUsername: string
  recipientPfp: string
}

export default function TipDrawer({ recipientAddress, recipientUsername, recipientPfp }: TipDrawerProps) {
  const { address: userAddress, isConnected, chain } = useAccount()
  const { connect } = useConnect()
  const { switchChainAsync } = useSwitchChain()
  const { data: balanceData } = useBalance({
    address: userAddress,
    chainId: chain?.id,
  })

  // Use sendTransactionAsync to get a Promise-based response
  const { sendTransactionAsync } = useSendTransaction()

  const [selectedChain, setSelectedChain] = React.useState<typeof base | typeof mainnet | typeof optimism>(base)
  const [percentage, setPercentage] = React.useState<number | null>(null)
  const [amount, setAmount] = React.useState<string>("0.000")

  React.useEffect(() => {
    if (!isConnected) {
      connect({ connector: injected() })
    }
  }, [isConnected, connect])

  React.useEffect(() => {
    const switchToChain = async () => {
      if (chain?.id !== selectedChain.id) {
        try {
          await switchChainAsync({ chainId: selectedChain.id })
        } catch (error) {
          console.error("Chain switch failed:", error)
        }
      }
    }
    switchToChain()
  }, [chain, selectedChain, switchChainAsync])

  React.useEffect(() => {
    if (balanceData && percentage !== null) {
      const calculatedAmount = ((Number(balanceData.formatted) * percentage) / 100).toFixed(3)
      setAmount(calculatedAmount)
    }
  }, [balanceData, percentage])

  const handlePercentageClick = (value: number) => {
    setPercentage(value)
    if (balanceData) {
      const calculatedAmount = ((Number(balanceData.formatted) * value) / 100).toFixed(3)
      setAmount(calculatedAmount)
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
    setPercentage(null)
  }

  const handleChainSelect = async (chain: typeof base | typeof mainnet | typeof optimism) => {
    setSelectedChain(chain)
    if (chain.id !== selectedChain.id) {
      try {
        await switchChainAsync({ chainId: chain.id })
      } catch (error) {
        console.error("Chain switch failed:", error)
      }
    }
  }

  const truncateAddress = (address: string) => {
    return address.slice(0, 6) + "..." + address.slice(-4)
  }

  const handleConfirmPayment = async () => {
    if (!userAddress) return
    try {
      const tx = await sendTransactionAsync({
        to: recipientAddress,
        value: parseEther(amount),
      })
      if (tx) {
        const explorerUrl = chain?.id === optimism.id 
          ? `https://optimistic.etherscan.io/tx/${tx}` 
          : chain?.id === mainnet.id 
          ? `https://etherscan.io/tx/${tx}` 
          : `https://basescan.org/tx/${tx}`;

        toast.success(
          <div>
            <p>Transaction Successful!</p>
            <FrameLink type="url" identifier={explorerUrl}>
              <span className="text-blue-500 underline cursor-pointer">
                View on Explorer
              </span>
            </FrameLink>
          </div>
        )
      }
    } catch (error) {
      console.error("Transaction failed:", error)
      toast.error(
        <div>
          <p>Transaction Failed</p>
          <p>Something went wrong, please try again.</p>
        </div>
      )
    }
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="size-10 rounded-full overflow-hidden bg-black/40 ring-2 ring-white flex items-center justify-center cursor-pointer">
          <DollarSign className="size-5" />
        </div>
      </DrawerTrigger>
      <DrawerContent className="max-w-sm mx-auto">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-3xl font-bold">Tip @{recipientUsername}</DrawerTitle>
            <DrawerDescription className="text-lg text-muted-foreground">Choose amount of <span className="font-semibold">ETH</span> to tip</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-full">
                  <Wallet className="size-5" />
                </div>
                <div>
                  <p className="text-xl">Amount</p>
                  <p className="text-muted-foreground">ETH Balance: {balanceData?.formatted || "0.000"}</p>
                </div>
              </div>
              <Input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="w-24 text-right text-xl font-medium bg-transparent border-none"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((value) => (
                <Button
                  key={value}
                  variant={percentage === value ? "default" : "outline"}
                  className="rounded-full py-4"
                  onClick={() => handlePercentageClick(value)}
                >
                  {value}%
                </Button>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-muted-foreground mb-2">Select Chain</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full cursor-pointer">
                    {selectedChain.name === "Ethereum" ? "Mainnet" : selectedChain.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {supportedChains.map((chain) => (
                    <DropdownMenuItem
                      key={chain.id}
                      onClick={() => handleChainSelect(chain)}
                      className="cursor-pointer"
                    >
                      {chain.name === "Ethereum" ? "Mainnet" : chain.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-4">
              <p className="text-muted-foreground mb-2">Recipient</p>
              <div className="flex items-center gap-2 rounded-xl border px-3 py-2">
                <img src={recipientPfp} alt="Recipient Profile Picture" className="size-8 rounded-full" />
                <span className="text-sm font-medium">{truncateAddress(recipientAddress)}</span>
              </div>
            </div>
          </div>
          <DrawerFooter className="px-4">
            <Button
              className="w-full rounded-xl py-6 text-lg"
              size="lg"
              onClick={handleConfirmPayment}
              disabled={!userAddress || !amount || parseFloat(amount) <= 0}
            >
              Confirm Tip
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full rounded-xl py-6 text-lg">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}