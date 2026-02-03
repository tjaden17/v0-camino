"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, User } from "lucide-react"
import type { SignalWithData } from "@/lib/signals-service"
import Link from "next/link"
import { DataQualityBadge } from "./data-quality-badge"
import type { DataQualityScore } from "@/lib/user-context-service"

interface SignalCardProps {
  signal: SignalWithData & {
    dataQuality?: DataQualityScore
  }
}

export function SignalCard({ signal }: SignalCardProps) {
  const getTrendIcon = () => {
    if (signal.trend === "increasing") return <TrendingUp className="h-4 w-4 text-green-500" />
    if (signal.trend === "decreasing") return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getTrendColor = () => {
    if (signal.trend === "increasing") return "text-green-600"
    if (signal.trend === "decreasing") return "text-red-600"
    return "text-muted-foreground"
  }

  const isBelowBenchmark =
    signal.latest_value !== null && signal.benchmark_value !== null && signal.latest_value < signal.benchmark_value

  return (
    <Link href={`/signals/${signal.id}`}>
      <Card className="hover:shadow-lg transition-all cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{signal.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {signal.category && (
                  <Badge variant="outline" className="text-xs">
                    {signal.category}
                  </Badge>
                )}
                {signal.dataQuality && <DataQualityBadge quality={signal.dataQuality} showDetails={false} />}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {signal.latest_value !== null ? signal.latest_value.toLocaleString() : "—"}
              </span>
              {signal.change !== null && (
                <span className={`text-sm font-semibold ${getTrendColor()}`}>
                  {signal.change > 0 && "+"}
                  {signal.change_percent}%
                </span>
              )}
            </div>
            {signal.benchmark_value !== null && (
              <div className="mt-1 text-xs text-muted-foreground">
                Target: {signal.benchmark_value.toLocaleString()}
                {isBelowBenchmark && <span className="text-yellow-600 ml-1">(Below target)</span>}
              </div>
            )}
          </div>

          {signal.owner_name && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              {signal.owner_name}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
