"use client"

import { useState } from "react"
import type { SubIssue } from "@/lib/issue-tree-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ArrowDown, ArrowUp, Minus, Share2, Bookmark, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface IssueCardProps {
  issue: SubIssue
  onSave?: () => void
  onShare?: () => void
  dateRange?: "7days" | "30days" | "quarter"
}

export function IssueCard({ issue, onSave, onShare, dateRange = "7days" }: IssueCardProps) {
  const [showCalculation, setShowCalculation] = useState(false)

  const getTrendIcon = () => {
    switch (issue.trend) {
      case "up":
        return <ArrowUp className="h-5 w-5" />
      case "down":
        return <ArrowDown className="h-5 w-5" />
      default:
        return <Minus className="h-5 w-5" />
    }
  }

  const getTrendColor = () => {
    switch (issue.trend) {
      case "up":
        return "text-success"
      case "down":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  const getCalculationExplanation = () => {
    if (issue.dataSource.length === 0) {
      return `This metric is not yet connected to a data source. To enable tracking and analysis, please connect the relevant data integration from the Profile screen. Once connected, the system will automatically calculate trends and provide insights.`
    }
    return `This metric is calculated by analyzing data from ${issue.dataSource.join(", ")}. The trend is determined by comparing current values against historical baselines over the selected time period. Anomaly detection algorithms flag significant deviations that may require attention.`
  }

  return (
    <>
      <Card className="p-6 bg-card border-2 border-border shadow-sm flex flex-col min-h-[60vh]">
        <div className="flex-[2] flex flex-col items-center justify-center border-b border-border pb-6">
          <div className="flex flex-wrap items-center justify-center gap-3 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-card-foreground break-words max-w-full px-2">
              {issue.name}
            </h3>
            <div className={cn("flex items-center gap-1.5 shrink-0", getTrendColor())}>
              {getTrendIcon()}
              <span className="text-2xl sm:text-3xl font-bold">{issue.trendValue}</span>
            </div>
            <span className="text-base sm:text-lg text-muted-foreground shrink-0">{issue.timeframe}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-4 border-b border-border px-2">
          {issue.dataSource.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Source:</span>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {issue.dataSource.map((source, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs sm:text-sm bg-accent/10 text-accent border border-accent/20"
                  >
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Source:</span>
              <Badge variant="outline" className="text-xs sm:text-sm border-yellow-500/50 text-yellow-600 bg-yellow-50">
                No data source connected
              </Badge>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Owner:</span>
            <Badge variant="outline" className="text-xs sm:text-sm border-primary/30 text-primary">
              {issue.owner}
            </Badge>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground italic mt-2 text-center px-2">
            Double-click for in-depth analysis
          </p>
        </div>

        <div className="flex-1 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <Button variant="ghost" size="lg" onClick={onSave} className="hover:bg-accent/10 text-accent">
            <Bookmark className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-base">Save</span>
          </Button>
          <Button variant="ghost" size="lg" onClick={onShare} className="hover:bg-primary/10 text-primary">
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-base">Share</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="lg" className="hover:bg-muted">
                <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-base">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowCalculation(true)}>How is this calculated?</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <Dialog open={showCalculation} onOpenChange={setShowCalculation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How is this calculated?</DialogTitle>
            <DialogDescription className="pt-4 text-foreground leading-relaxed">
              {getCalculationExplanation()}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
