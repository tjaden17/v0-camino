"use client"

import type { SubIssue } from "@/lib/issue-tree-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp, Minus, Share2, Bookmark, ExternalLink, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface IssueDetailCardProps {
  issue: SubIssue
  onBack: () => void
  onSave?: () => void
  onShare?: () => void
}

export function IssueDetailCard({ issue, onBack, onSave, onShare }: IssueDetailCardProps) {
  const getTrendIcon = () => {
    switch (issue.trend) {
      case "up":
        return <ArrowUp className="h-4 w-4" />
      case "down":
        return <ArrowDown className="h-4 w-4" />
      default:
        return <Minus className="h-4 w-4" />
    }
  }

  const getTrendColor = () => {
    switch (issue.trend) {
      case "up":
        return "text-chart-3"
      case "down":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  if (!issue.detail) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{issue.name}</h3>
          <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <p className="text-muted-foreground">No detailed analysis available for this issue.</p>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-card-foreground break-words pr-2">{issue.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <div className={cn("flex items-center gap-1", getTrendColor())}>
                {getTrendIcon()}
                <span className="text-base sm:text-lg font-semibold">{issue.trendValue}</span>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">in {issue.timeframe}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 shrink-0">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <div>
            <h3 className="text-base font-semibold text-card-foreground mb-3">Key Takeaway</h3>
            <div className="pl-4 border-l-2 border-primary/30">
              <p className="text-sm text-card-foreground text-balance leading-relaxed">
                {issue.detail.analysisKeyTakeaway}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-card-foreground mb-3">Root Cause</h3>
            <div className="pl-4 border-l-2 border-warning/30">
              <p className="text-sm text-card-foreground text-balance leading-relaxed">
                {issue.detail.rootCauseHypothesis}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-card-foreground mb-3">Implications</h3>
            <div className="pl-4 border-l-2 border-destructive/30">
              <p className="text-sm text-card-foreground text-balance leading-relaxed">{issue.detail.implications}</p>
            </div>
          </div>
          {/* </CHANGE> */}

          {/* Data Source */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Data Source</p>
            <a
              href={issue.detail.dataSourceUrl}
              className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
            >
              <span>{issue.detail.dataSource}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-border flex items-center justify-center gap-6">
          <Button variant="ghost" onClick={onSave} className="flex flex-col items-center gap-1 h-auto py-2">
            <Bookmark className="h-5 w-5" />
            <span className="text-xs">Save</span>
          </Button>
          <Button variant="ghost" onClick={onShare} className="flex flex-col items-center gap-1 h-auto py-2">
            <Share2 className="h-5 w-5" />
            <span className="text-xs">Share</span>
          </Button>
        </div>
      </div>
    </Card>
  )
}
