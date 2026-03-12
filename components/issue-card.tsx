"use client"

import { useState } from "react"
import type { SubIssue } from "@/lib/issue-tree-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ArrowDown, ArrowUp, Minus, Tag, Eye, Flag, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAdjustedTrendValue } from "@/lib/date-range-utils"
import { DataLayerView } from "@/components/data-layer-view"
import { SynthesisView } from "@/components/synthesis-view"

interface IssueCardProps {
  issue: SubIssue
  onTag?: () => void
  onShare?: () => void
  onAnalysis?: () => void
  onSynthesis?: () => void
  dateRange?: "7days" | "30days" | "quarter"
  currentLayer?: "data" | "analysis" | "synthesis"
  onNavigateLeft?: () => void
  onNavigateRight?: () => void
}

export function IssueCard({ issue, onTag, onShare, dateRange = "7days" }: IssueCardProps) {
  const [showCalculation, setShowCalculation] = useState(false)
  const [showBenchmark, setShowBenchmark] = useState(true)
  const [activeLayer, setActiveLayer] = useState<"data" | "analysis" | "synthesis">("analysis")
  const [showOwnerDialog, setShowOwnerDialog] = useState(false)
  const [isFlagged, setIsFlagged] = useState(issue.highlighted || false)
  const [currentOwner, setCurrentOwner] = useState(issue.owner || "")

  const isHighlighted = issue.highlighted || false
  const isInvestigating = issue.investigating || false

  const absoluteValue = issue.absoluteValue || "N/A"

  const benchmarkValue = issue.benchmarkValue || "Industry avg: N/A"

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

  const getTimeframeText = () => {
    switch (dateRange) {
      case "7days":
        return "vs. last 7 days"
      case "30days":
        return "vs. last 30 days"
      case "quarter":
        return "vs. last quarter"
      default:
        return issue.timeframe
    }
  }

  const adjustedTrendValue = getAdjustedTrendValue(issue.trendValue, dateRange)

  const handleFlag = () => {
    setIsFlagged(!isFlagged)
    console.log("[v0] Signal flagged:", !isFlagged)
  }

  const handleOwnerSelect = (owner: string) => {
    setCurrentOwner(owner)
    setShowOwnerDialog(false)
    console.log("[v0] Owner assigned:", owner)
  }

  return (
    <>
      <Card className="p-6 bg-card border-2 border-border shadow-sm flex flex-col">
        {(isFlagged || isInvestigating) && (
          <div className="absolute top-4 right-4 flex gap-2">
            {isFlagged && (
              <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-950 border-2 border-amber-400 flex items-center justify-center">
                <Flag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            )}
            {isInvestigating && (
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950 border-2 border-blue-400 flex items-center justify-center">
                <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 mb-6 border-b border-border pb-4">
          <Button
            variant={activeLayer === "data" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveLayer("data")}
            className="flex-1"
          >
            Data
          </Button>
          <Button
            variant={activeLayer === "analysis" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveLayer("analysis")}
            className="flex-1"
          >
            Analysis
          </Button>
          <Button
            variant={activeLayer === "synthesis" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveLayer("synthesis")}
            className="flex-1"
          >
            Synthesis
          </Button>
        </div>

        <div className="min-h-[50vh] mb-6">
          {activeLayer === "data" && <DataLayerView issue={issue} onClose={() => setActiveLayer("analysis")} />}

          {activeLayer === "analysis" && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-5xl font-bold text-primary">{absoluteValue}</div>
                  <h3 className="text-xl font-semibold text-card-foreground">{issue.name}</h3>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 text-center">
                  <div className={cn("flex items-center gap-1.5", getTrendColor())}>
                    {getTrendIcon()}
                    <span className="text-2xl font-bold">{adjustedTrendValue}</span>
                  </div>
                  <span className="text-base text-muted-foreground">{getTimeframeText()}</span>
                </div>

                {showBenchmark && <div className="mt-3 text-sm text-muted-foreground">{benchmarkValue}</div>}
              </div>

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
                  <Badge
                    variant="outline"
                    className="text-xs sm:text-sm border-yellow-500/50 text-yellow-600 bg-yellow-50"
                  >
                    No data source connected
                  </Badge>
                </div>
              )}
            </div>
          )}

          {activeLayer === "synthesis" && <SynthesisView issue={issue} onClose={() => setActiveLayer("analysis")} />}
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-auto py-2 px-3 flex flex-col items-center gap-1 bg-transparent"
              onClick={onTag}
            >
              <Tag className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium">Tag</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-auto py-2 px-3 flex flex-col items-center gap-1 bg-transparent"
              onClick={handleFlag}
            >
              <Flag className={cn("h-4 w-4", isFlagged ? "text-amber-600" : "text-muted-foreground")} />
              <span className="text-xs font-medium">Flag</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-auto py-2 px-3 flex flex-col items-center gap-1 bg-transparent"
              onClick={() => setShowOwnerDialog(true)}
            >
              <UserCircle className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">{currentOwner ? "Owner" : "Assign"}</span>
            </Button>
          </div>
          {currentOwner && (
            <div className="mt-2 text-xs text-center text-muted-foreground">Owned by {currentOwner}</div>
          )}
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

      <Dialog open={showOwnerDialog} onOpenChange={setShowOwnerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Owner</DialogTitle>
            <DialogDescription>Choose who will own this signal</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => handleOwnerSelect("Me")}
            >
              <UserCircle className="h-4 w-4 mr-2" />
              Take Ownership
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => handleOwnerSelect("Sarah Chen (Head of Product)")}
            >
              <UserCircle className="h-4 w-4 mr-2" />
              Sarah Chen (Head of Product)
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => handleOwnerSelect("Mike Torres (Head of Sales)")}
            >
              <UserCircle className="h-4 w-4 mr-2" />
              Mike Torres (Head of Sales)
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => handleOwnerSelect("Alex Kim (Head of CS)")}
            >
              <UserCircle className="h-4 w-4 mr-2" />
              Alex Kim (Head of CS)
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => handleOwnerSelect("Jordan Martinez (CEO)")}
            >
              <UserCircle className="h-4 w-4 mr-2" />
              Jordan Martinez (CEO)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
