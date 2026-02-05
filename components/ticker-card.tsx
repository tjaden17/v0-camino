"use client"
import type { Insight } from "@/lib/types"
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react"

interface TickerCardProps {
  insight: Insight
  onClick: () => void
}

export function TickerCard({ insight, onClick }: TickerCardProps) {
  const getTrendIcon = () => {
    if (insight.trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />
    if (insight.trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getTrendColor = () => {
    if (insight.trend === "up") return "text-green-600"
    if (insight.trend === "down") return "text-red-600"
    return "text-gray-600"
  }

  return (
    <div
      onClick={onClick}
      className="w-full bg-card border border-border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {insight.isRAG && (
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" title="Personalized insight from your data" />
          )}
          <span className="font-semibold text-sm text-foreground truncate">{insight.header}</span>
        </div>

        <div className={`flex items-center gap-1 ${getTrendColor()} shrink-0`}>
          {getTrendIcon()}
          <span className="text-sm font-medium whitespace-nowrap">{insight.value}</span>
        </div>
      </div>
    </div>
  )
}
