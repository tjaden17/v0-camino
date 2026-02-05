"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  X,
  Share2,
  Bookmark,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Lightbulb,
  ArrowRight,
  LinkIcon,
} from "lucide-react"
import type { Insight } from "@/lib/types"

interface ExpandedInsightCardProps {
  insight: Insight
  onClose: () => void
  isSaved: boolean
  onSave: () => void
  onShare: () => void
}

export function ExpandedInsightCard({ insight, onClose, isSaved, onSave, onShare }: ExpandedInsightCardProps) {
  const isPositive = insight.change.startsWith("+")
  const isNegative = insight.change.startsWith("-")

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {insight.category.toUpperCase()}
            </Badge>
            <h2 className="font-semibold text-lg">{insight.header}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4 pb-4">
          {/* Key Metric */}
          <div className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span
                className={`text-3xl font-bold ${
                  isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-foreground"
                }`}
              >
                {insight.change}
              </span>
              {isPositive && <TrendingUp className="w-5 h-5 text-green-500" />}
              {isNegative && <TrendingDown className="w-5 h-5 text-red-500" />}
            </div>
            <p className="text-sm text-muted-foreground">{insight.timeframe}</p>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Summary</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pl-6">{insight.summary}</p>
          </div>

          {/* Benchmark */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Benchmark</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pl-6">{insight.benchmark}</p>
          </div>

          {/* Analysis */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Analysis</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pl-6">{insight.analysis}</p>
          </div>

          {/* Implications */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Implications</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pl-6">{insight.implications}</p>
          </div>

          {/* Next Steps */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Next Steps</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pl-6">{insight.nextSteps}</p>
          </div>

          {insight.dataSources && insight.dataSources.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Data Sources</h3>
              </div>
              <div className="pl-6 space-y-2">
                {insight.dataSources.map((source, index) => (
                  <div key={index} className="space-y-1">
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        {source.name}
                        <LinkIcon className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-xs font-medium">{source.name}</p>
                    )}
                    {source.description && <p className="text-xs text-muted-foreground">{source.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Source (fallback to simple source) */}
          {(!insight.dataSources || insight.dataSources.length === 0) && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">Source: {insight.source}</p>
            </div>
          )}
        </CardContent>

        {/* Actions */}
        <div className="flex gap-2 p-4 pt-0 flex-shrink-0">
          <Button variant="outline" onClick={onShare} className="flex-1 flex items-center gap-2 bg-transparent">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button variant={isSaved ? "default" : "outline"} onClick={onSave} className="flex-1 flex items-center gap-2">
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
