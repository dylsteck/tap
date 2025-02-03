/* eslint-disable @next/next/no-img-element */
/* eslint-disable import/no-named-as-default-member */
"use client"
import React from "react"
import { Area, AreaChart, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

import { ZapperFungibleToken } from "../../../common/types/ethereum"

const timeRanges = [
  { label: "1D", value: "1D", seconds: 86400 },
  { label: "5D", value: "5D", seconds: 86400 * 5 },
  { label: "1M", value: "1M", seconds: 86400 * 30 },
//   { label: "6M", value: "6M", seconds: 86400 * 180 },
//   { label: "YTD", value: "YTD" },
//   { label: "MAX", value: "MAX", seconds: Infinity },
]

export function Token({ token }: { token: ZapperFungibleToken }) {
  const priceTicks = token.onchainMarketData.priceTicks
  const hasPriceTicks = priceTicks.length > 0

  const maxTimestamp = React.useMemo(() => {
    return hasPriceTicks ? Math.max(...priceTicks.map((t) => t.timestamp)) : 0
  }, [priceTicks, hasPriceTicks])

  const initialPrice = React.useMemo(() => {
    return hasPriceTicks ? priceTicks[0].close : token.onchainMarketData.price
  }, [priceTicks, hasPriceTicks, token.onchainMarketData.price])

  const currentPrice = token.onchainMarketData.price
  const rawChange = currentPrice - initialPrice
  const percentChange = initialPrice ? (rawChange / initialPrice) * 100 : 0

  const [selectedTimeframe, setSelectedTimeframe] = React.useState("1D")

  const chartData = React.useMemo(() => {
    if (!hasPriceTicks) return []
    let cutoff: number
    if (selectedTimeframe === "YTD") {
      cutoff = new Date(new Date().getFullYear(), 0, 1).getTime()
    } else {
      const tf = timeRanges.find((range) => range.value === selectedTimeframe)
      cutoff = tf && tf.seconds ? maxTimestamp - tf.seconds * 1000 : 0
    }
    return priceTicks
      .filter((tick) => tick.timestamp >= cutoff)
      .map((tick) => ({
        time: new Date(tick.timestamp).toLocaleTimeString(),
        price: tick.close,
      }))
  }, [selectedTimeframe, priceTicks, maxTimestamp, hasPriceTicks])

  function formatPrice(price: number) {
    return `$${price.toFixed(2)}`
  }

  const chartColor = rawChange >= 0 ? "rgb(34,197,94)" : "rgb(239,68,68)"

  return (
    <Card className="w-full bg-[#1C1C1C] border-zinc-800">
      <CardHeader className="space-y-1.5 pb-0">
        <div className="flex items-center gap-2">
          <img src={token.imageUrl} alt={token.name} className="size-5 rounded-full" />
          <div className="text-zinc-400 text-md">{token.name}</div>
        </div>
        <div className="flex items-baseline gap-3">
          <CardTitle className="text-5xl font-normal text-white">${currentPrice.toFixed(6)}</CardTitle>
          <span className={cn(rawChange >= 0 ? "text-green-500" : "text-red-500")}>
            {formatPrice(rawChange)} ({percentChange.toFixed(2)}%)
          </span>
          <span className="text-zinc-400">Today</span>
        </div>
        <div className="flex gap-2 pt-2">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedTimeframe(range.value)}
              className={cn(
                "px-3 py-1 rounded-md text-sm",
                selectedTimeframe === range.value ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/50"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ChartContainer
          config={{
            price: {
              label: "Price",
              color: chartColor,
            },
          }}
          className="h-[400px] [&_.recharts-cartesian-grid-horizontal_line]:stroke-zinc-800 [&_.recharts-cartesian-grid-vertical_line]:stroke-zinc-800"
        >
          <AreaChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717A" }}
              tickMargin={10}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717A" }}
              tickMargin={10}
              tickCount={6}
              width={45}
              tickFormatter={formatPrice}
            />
            <ChartTooltip content={<ChartTooltipContent formatter={(value) => [formatPrice(Number(value)), "Price"]} />} />
            <Area type="monotone" dataKey="price" stroke={chartColor} fill="url(#colorPrice)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}