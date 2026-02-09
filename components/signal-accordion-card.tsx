"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronDown, 
  ChevronUp,
  ArrowUp, 
  ArrowDown, 
  Bookmark, 
  BookmarkCheck,
  TrendingUp,
  TrendingDown,
  Activity,
  Lightbulb,
  BarChart3,
  Loader2,
  Zap,
  Share2,
  MoreHorizontal,
  Calculator,
  AlertTriangle,
  X
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { SignalWithData } from "@/lib/signals-service"
import type { SignalInterpretation } from "@/lib/interpretation-service"

interface SignalAccordionCardProps {
  signal: SignalWithData
  isSaved?: boolean
  onToggleSave?: (signalId: string) => void
  isSaving?: boolean
  interpretation?: SignalInterpretation | null
  isLoadingInterpretation?: boolean
  onRequestInterpretation?: () => void
}

export function SignalAccordionCard({ 
  signal, 
  isSaved = false, 
  onToggleSave, 
  isSaving = false,
  interpretation,
  isLoadingInterpretation = false,
  onRequestInterpretation
}: SignalAccordionCardProps) {
  const [expandedLevel, setExpandedLevel] = useState(0)
  const [showCalculation, setShowCalculation] = useState(false)

  // Parse calculation metadata from signal summary
  // Summary format: "Method: Formula. Based on N data points from "Column" column."
  const getCalculationExplanation = () => {
    const summary = signal.summary || ""
    
    // Parse method from summary (e.g., "Count/Sum:", "Average:", "Rate/Percentage:")
    const methodMatch = summary.match(/^([^:]+):/)
    const method = methodMatch?.[1]?.trim() || "Aggregation"
    
    // Parse formula (text between method: and "Based on")
    const formulaMatch = summary.match(/^[^:]+:\s*(.+?)\.\s*Based on/)
    const formula = formulaMatch?.[1]?.trim() || "Calculated from uploaded data"
    
    // Parse data points count
    const dataPointsMatch = summary.match(/Based on (\d+) data points/)
    const dataPoints = dataPointsMatch?.[1] || "N/A"
    
    // Parse column name used
    const columnMatch = summary.match(/from "([^"]+)" column/)
    const usedColumn = columnMatch?.[1] || null
    
    // Get description based on method
    const descriptions: Record<string, string> = {
      "Count/Sum": "This signal counts or sums values from your data.",
      "Sum (Monetary)": "This signal sums all monetary values.",
      "Average": "This signal calculates the arithmetic mean.",
      "Average Score": "This signal averages all score or rating values.",
      "Rate/Percentage": "This signal calculates the ratio of positive outcomes to total records.",
      "Latest Value": "This signal shows the most recent value.",
      "Aggregation": "This signal is calculated from your uploaded data."
    }
    
    const description = descriptions[method] || descriptions["Aggregation"]
    
    return {
      method,
      description,
      formula,
      dataPoints,
      usedColumn,
      source: signal.source_type || "upload"
    }
  }

  const getTrendIcon = () => {
    if (signal.trend === "increasing") return <TrendingUp className="h-4 w-4" />
    if (signal.trend === "decreasing") return <TrendingDown className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const getTrendColor = () => {
    if (signal.trend === "increasing") return "text-emerald-600"
    if (signal.trend === "decreasing") return "text-red-500"
    return "text-muted-foreground"
  }

  const getTrendBgColor = () => {
    if (signal.trend === "increasing") return "bg-emerald-500/10"
    if (signal.trend === "decreasing") return "bg-red-500/10"
    return "bg-muted/50"
  }

  const formatValue = (value: number | null) => {
    if (value === null) return "—"
    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toLocaleString()
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: signal.name,
        text: `${signal.name}: ${formatValue(signal.latest_value)} (${signal.change_percent !== null ? `${signal.change_percent > 0 ? '+' : ''}${signal.change_percent}%` : 'No change data'})`,
      })
    } else {
      navigator.clipboard.writeText(`${signal.name}: ${formatValue(signal.latest_value)}`)
    }
  }

  const toggleLevel = (level: 1 | 2) => {
    if (level === 1) {
      setExpandedLevel(expandedLevel >= 1 ? 0 : 1)
    } else {
      if (expandedLevel < 1) {
        setExpandedLevel(2)
      } else {
        setExpandedLevel(expandedLevel === 2 ? 1 : 2)
      }
      if (expandedLevel < 2 && !interpretation && onRequestInterpretation) {
        onRequestInterpretation()
      }
    }
  }

  return (
    <Card className="overflow-hidden border border-border bg-card hover:shadow-md transition-shadow">
      {/* L1: Compact Card - Header, Value, Description, Actions */}
      <div className="p-4">
        {/* Header Row: Badges left, Trend icon right */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {signal.category && (
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wide font-medium">
                {signal.category}
              </Badge>
            )}

          </div>
          <div className={cn("flex items-center", getTrendColor())}>
            {getTrendIcon()}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-foreground text-base leading-tight mb-2">{signal.name}</h3>

        {/* Value Row: Change value (hero) + timeframe */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className={cn(
            "text-xl font-bold tabular-nums",
            signal.change_percent !== null && signal.change_percent > 0 ? "text-emerald-600" :
            signal.change_percent !== null && signal.change_percent < 0 ? "text-red-600" :
            "text-foreground"
          )}>
            {signal.change_percent !== null
              ? `${signal.change_percent > 0 ? '+' : ''}${signal.change_percent}%`
              : formatValue(signal.latest_value)
            }
          </span>
          {signal.change_percent !== null && (
            <span className="text-sm text-muted-foreground">
              ({formatValue(signal.latest_value)})
            </span>
          )}
        </div>

        {/* Description */}
        {signal.summary && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
            {signal.summary}
          </p>
        )}

        {/* View Details Button */}
        <button
          onClick={() => toggleLevel(1)}
          className="w-full mt-1 py-2 border border-border rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-muted/30 transition-all"
        >
          <BarChart3 className="h-4 w-4" />
          <span>{expandedLevel >= 1 ? "Hide Details" : "View Details"}</span>
          {expandedLevel >= 1 ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {/* Action Row: Icon buttons left, Source right */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-0.5">
            {/* Share */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation()
                handleShare()
              }}
            >
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </Button>
            
            {/* Save / Bookmark */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 p-0",
                isSaved ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={(e) => {
                e.stopPropagation()
                onToggleSave?.(signal.id)
              }}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSaved ? (
                <BookmarkCheck className="h-4 w-4 fill-current" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              <span className="sr-only">{isSaved ? "Saved" : "Save"}</span>
            </Button>

            {/* More Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setShowCalculation(true)}>
                  <Calculator className="h-4 w-4 mr-2" />
                  How is this calculated?
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleLevel(2)}>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Get AI Insights
                </DropdownMenuItem>
                <DropdownMenuItem>
                  View History
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Set Alert
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Source label */}
          <span className="text-[10px] text-muted-foreground">
            {signal.source_type === "upload" ? "File Upload" : 
             signal.source_type === "api" ? "API" : 
             signal.source_type || "Manual"}
          </span>
        </div>
      </div>

      {/* L2: Data & Analysis (Expandable) */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          expandedLevel >= 1 ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4 bg-muted/20">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-background border border-border">
              <div className="text-xs text-muted-foreground mb-1">Current</div>
              <div className="font-semibold text-foreground">{formatValue(signal.latest_value)}</div>
            </div>
            <div className="p-3 rounded-lg bg-background border border-border">
              <div className="text-xs text-muted-foreground mb-1">Previous</div>
              <div className="font-semibold text-foreground">{formatValue(signal.previous_value)}</div>
            </div>
            <div className={cn("p-3 rounded-lg border border-border", getTrendBgColor())}>
              <div className="text-xs text-muted-foreground mb-1">Change</div>
              <div className={cn("font-semibold flex items-center gap-1", getTrendColor())}>
                {signal.change !== null ? (
                  <>
                    {signal.change > 0 ? <ArrowUp className="h-3 w-3" /> : signal.change < 0 ? <ArrowDown className="h-3 w-3" /> : null}
                    {signal.change_percent}%
                  </>
                ) : "—"}
              </div>
            </div>
          </div>

          {/* Trend Summary */}
          <div className="p-3 rounded-lg bg-background border border-border">
            <div className="flex items-start gap-3">
              <div className={cn("p-2 rounded-full shrink-0", getTrendBgColor())}>
                {getTrendIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground mb-1">
                  {signal.trend === "increasing" ? "Upward Trend" : 
                   signal.trend === "decreasing" ? "Downward Trend" : "Stable"}
                </div>
                <p className="text-sm text-muted-foreground">
                  {signal.summary || `${signal.name} has been ${signal.trend || "stable"} over the measured period.`}
                </p>
              </div>
            </div>
          </div>

          {/* Data Source Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Source: {signal.source_type || "Manual"}</span>
            <span>Updated: {signal.updated_at ? new Date(signal.updated_at).toLocaleDateString() : "—"}</span>
          </div>

          {/* Expand to L3 Button */}
          <button
            onClick={() => toggleLevel(2)}
            className="w-full py-2.5 border border-primary/30 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-primary hover:bg-primary/5 transition-all"
          >
            <Lightbulb className="h-4 w-4" />
            <span>{expandedLevel === 2 ? "Hide Insights" : "Get AI Insights"}</span>
            {expandedLevel === 2 ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* L3: AI Synthesis (Expandable) */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          expandedLevel === 2 ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4 bg-primary/5">
          {isLoadingInterpretation ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing signal...</p>
            </div>
          ) : interpretation ? (
            <>
              <div className="p-3 rounded-lg bg-background border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="font-medium text-sm text-foreground">What We Found</span>
                </div>
                <p className="text-sm text-foreground">{interpretation.what_we_found.absolute_value}</p>
                <p className="text-sm text-muted-foreground mt-1">{interpretation.what_we_found.trend}</p>
              </div>

              <div className="p-3 rounded-lg bg-background border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm text-foreground">What It Means</span>
                </div>
                <p className="text-sm text-foreground">{interpretation.what_it_means.why_change_happened}</p>
                {interpretation.what_it_means.benchmark && (
                  <p className="text-sm text-muted-foreground mt-2 italic">{interpretation.what_it_means.benchmark}</p>
                )}
              </div>

              <div className={cn(
                "p-3 rounded-lg border",
                interpretation.so_what.direction === "positive" 
                  ? "bg-emerald-500/10 border-emerald-500/30" 
                  : interpretation.so_what.direction === "negative"
                  ? "bg-red-500/10 border-red-500/30"
                  : "bg-background border-border"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className={cn(
                    "h-4 w-4",
                    interpretation.so_what.direction === "positive" ? "text-emerald-600" : 
                    interpretation.so_what.direction === "negative" ? "text-red-500" : "text-foreground"
                  )} />
                  <span className="font-medium text-sm text-foreground">So What</span>
                </div>
                <p className="text-sm text-foreground">{interpretation.so_what.expected_vs_unexpected}</p>
                <p className="text-sm font-medium mt-2 text-foreground">{interpretation.so_what.kpi_impact}</p>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                AI insights will appear here once generated.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 bg-transparent"
                onClick={onRequestInterpretation}
              >
                Generate Insights
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Calculation Explanation Dialog */}
      <Dialog open={showCalculation} onOpenChange={setShowCalculation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              How is this calculated?
            </DialogTitle>
            <DialogDescription>
              Calculation methodology for {signal.name}
            </DialogDescription>
          </DialogHeader>
          
          {(() => {
            const calc = getCalculationExplanation()
            return (
              <div className="space-y-4 pt-2">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Calculation Method</div>
                  <div className="font-semibold text-foreground">{calc.method}</div>
                  <p className="text-xs text-muted-foreground mt-1">{calc.description}</p>
                </div>
                
                <div className="p-3 rounded-lg bg-muted/50 border border-border font-mono text-sm">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Formula Applied</div>
                  <div className="text-foreground">{calc.formula}</div>
                </div>

                {calc.usedColumn && (
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="text-xs uppercase tracking-wide text-blue-600 mb-1">Field Used</div>
                    <div className="font-semibold text-foreground font-mono">{calc.usedColumn}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This column from your data was identified as the primary value source.
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Data Points</div>
                    <div className="font-semibold text-foreground">{calc.dataPoints}</div>
                    <p className="text-xs text-muted-foreground">rows processed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Data Source</div>
                    <div className="font-semibold text-foreground capitalize">{calc.source}</div>
                    <p className="text-xs text-muted-foreground">
                      {calc.source === "upload" ? "File upload" : calc.source === "api" ? "API integration" : "Connected source"}
                    </p>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="text-xs uppercase tracking-wide text-amber-600 mb-1">Raw Summary</div>
                  <p className="text-xs text-foreground font-mono">{signal.summary || "No calculation details available"}</p>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
