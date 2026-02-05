"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Share2, Bookmark, MoreHorizontal, TrendingUp, TrendingDown, Sparkles, Trash2 } from "lucide-react"
import type { Insight } from "@/lib/types"

interface InsightCardProps {
  insight: Insight
  isSaved: boolean
  onSave: () => void
  onShare: () => void
  onExpand: () => void
  onDelete?: () => void
  fullScreen?: boolean
}

export function InsightCard({
  insight,
  isSaved,
  onSave,
  onShare,
  onExpand,
  onDelete,
  fullScreen = false,
}: InsightCardProps) {
  const isPositive = insight.change.startsWith("+")
  const isNegative = insight.change.startsWith("-")
  const isBenchmark = insight.isBenchmark || insight.change === "N/A"

  return (
    <Card
      className={`w-full hover:shadow-md transition-shadow cursor-pointer ${fullScreen ? "min-h-[70vh]" : ""}`}
      onClick={onExpand}
    >
      <CardContent className={`${fullScreen ? "p-8 flex flex-col justify-center" : "p-4"}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {insight.category.toUpperCase()}
            </Badge>
            {insight.isRAG && (
              <div className="flex items-center gap-1 text-primary" title="Personalized insight from your data">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Personalized</span>
              </div>
            )}
            {!insight.isRAG && insight.id.startsWith("demo-") && (
              <Badge variant="outline" className="text-xs">
                Demo
              </Badge>
            )}
            {isBenchmark && (
              <Badge variant="outline" className="text-xs bg-primary/10">
                Benchmark
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!isBenchmark && isPositive && <TrendingUp className="w-5 h-5 text-green-500" />}
            {!isBenchmark && isNegative && <TrendingDown className="w-5 h-5 text-red-500" />}
          </div>
        </div>

        {/* Main Content */}
        <div className={`mb-6 ${fullScreen ? "text-center" : ""}`}>
          <h3 className={`font-bold text-foreground mb-2 ${fullScreen ? "text-2xl" : "text-lg"}`}>{insight.header}</h3>
          <div className="flex items-baseline gap-2 mb-3">
            <span
              className={`font-bold ${fullScreen ? "text-3xl" : "text-xl"} ${
                isBenchmark
                  ? "text-primary"
                  : isPositive
                    ? "text-green-600"
                    : isNegative
                      ? "text-red-600"
                      : "text-foreground"
              }`}
            >
              {isBenchmark ? insight.value : insight.change}
            </span>
            <span className="text-muted-foreground text-sm">{insight.timeframe}</span>
          </div>
          <p className={`text-muted-foreground leading-relaxed ${fullScreen ? "text-lg" : "text-sm"}`}>
            {insight.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                console.log("[v0] Share button onClick triggered")
                e.stopPropagation()
                onShare()
                console.log("[v0] onShare callback executed")
              }}
              className="h-8 w-8 p-0"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onSave()
              }}
              className={`h-8 w-8 p-0 ${isSaved ? "text-primary" : ""}`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="h-8 w-8 p-0 text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onExpand()
              }}
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">{insight.source}</span>
        </div>
      </CardContent>
    </Card>
  )
}
