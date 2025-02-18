"use client"

import { DollarSign, Wallet } from "lucide-react"
import * as React from "react"

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
import { Input } from "@/components/ui/input"

export default function TipDrawer() {
  const [percentage, setPercentage] = React.useState<number>(25)
  const [amount, setAmount] = React.useState<string>("0.125")

  const handlePercentageClick = (value: number) => {
    setPercentage(value)
    setAmount(((0.5 * value) / 100).toFixed(3))
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
    setPercentage(0) // Reset percentage when amount is manually changed
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
            <DrawerTitle className="text-3xl font-bold">Tip with ETH</DrawerTitle>
            <DrawerDescription className="text-lg text-muted-foreground">Choose amount to tip</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-full">
                  <Wallet className="size-5" />
                </div>
                <div>
                  <p className="text-xl">Amount</p>
                  <p className="text-muted-foreground">ETH Balance: 1.234</p>
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
              {[25, 50, 75, "Max"].map((value) => (
                <Button
                  key={value}
                  variant={percentage === value ? "default" : "outline"}
                  className="rounded-full py-4"
                  onClick={() => handlePercentageClick(value === "Max" ? 100 : (value as number))}
                >
                  {value}
                  {typeof value === "number" ? "%" : ""}
                </Button>
              ))}
            </div>
          </div>
          <DrawerFooter className="px-4">
            <Button className="w-full rounded-xl py-6 text-lg" size="lg">
              Confirm Payment
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full rounded-xl py-6 text-lg" size="lg">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}