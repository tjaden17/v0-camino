"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, Minus, Tag, Flag, UserCircle, Database, RefreshCw, Layers, BarChart3, Bookmark, BookmarkCheck, AlertTriangle, Star, TrendingUp, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SignalWithData } from "@/lib/signals-service"
import type { SignalInterpretation } from "@/lib/interpretation-service"

interface SignalDetailCardProps {
  signal: SignalWithData
  currentLayer: "data" | "analysis" | "synthesis"
  dateRange: "7days" | "30days" | "quarter"
  isSaved?: boolean
  onToggleSave?: (signalId: string) => void
  isSaving?: boolean
  interpretation?: SignalInterpretation | null
  isLoadingInterpretation?: boolean
}

export function SignalDetailCard({ signal, currentLayer, dateRange, isSaved = false, onToggleSave, isSaving = false, interpretation, isLoadingInterpretation = false }: SignalDetailCardProps) {
  const [isFlagged, setIsFlagged] = useState(false)

  const getStatusBadge = () => {
    const status = signal.status
    if (status === 'needs_attention') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Needs Attention
        </Badge>
      )
    }
    if (status === 'opportunity') {
      return (
        <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30 flex items-center gap-1">
          <Star className="h-3 w-3" />
          Opportunity
        </Badge>
      )
    }
    if (status === 'improved') {
      return (
        <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Improved
        </Badge>
      )
    }
    if (status === 'new') {
      return <Badge variant="secondary">New</Badge>
    }
    return null
  }

  const getTrendIcon = () => {
    if (signal.trend === "increasing") return <ArrowUp className="h-5 w-5" />
    if (signal.trend === "decreasing") return <ArrowDown className="h-5 w-5" />
    return <Minus className="h-5 w-5" />
  }

  const getTrendColor = () => {
    if (signal.trend === "increasing") return "text-success"
    if (signal.trend === "decreasing") return "text-destructive"
    return "text-muted-foreground"
  }

  return (
    <Card className="p-6 bg-card border-2 border-border shadow-sm flex flex-col">
      <div className="flex gap-2 mb-6 border-b border-border pb-4">
        <div
          className={cn(
            "flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors cursor-pointer",
            currentLayer === "data" ? "bg-primary/20 border-2 border-primary" : "bg-muted/50 border border-border",
          )}
        >
          <Database className={cn("h-4 w-4", currentLayer === "data" ? "text-primary" : "text-muted-foreground")} />
          <span
            className={cn("text-xs font-medium", currentLayer === "data" ? "text-primary" : "text-muted-foreground")}
          >
            Data
          </span>
        </div>
        <div
          className={cn(
            "flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors cursor-pointer",
            currentLayer === "analysis" ? "bg-accent/20 border-2 border-accent" : "bg-muted/50 border border-border",
          )}
        >
          <BarChart3 className={cn("h-4 w-4", currentLayer === "analysis" ? "text-accent" : "text-muted-foreground")} />
          <span
            className={cn("text-xs font-medium", currentLayer === "analysis" ? "text-accent" : "text-muted-foreground")}
          >
            Analysis
          </span>
        </div>
        <div
          className={cn(
            "flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors cursor-pointer",
            currentLayer === "synthesis" ? "bg-primary/20 border-2 border-primary" : "bg-muted/50 border border-border",
          )}
        >
          <Layers className={cn("h-4 w-4", currentLayer === "synthesis" ? "text-primary" : "text-muted-foreground")} />
          <span
            className={cn(
              "text-xs font-medium",
              currentLayer === "synthesis" ? "text-primary" : "text-muted-foreground",
            )}
          >
            Synthesis
          </span>
        </div>
      </div>

      <div className="min-h-[50vh] mb-6">
        {/* Data Layer */}
        {currentLayer === "data" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Data Points
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Total Records</div>
                  <div className="text-lg font-bold text-foreground">{signal.data_points?.length || 0}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Date Range</div>
                  <div className="text-sm text-foreground">
                    {signal.data_points?.[signal.data_points.length - 1]?.date || "N/A"} to{" "}
                    {signal.data_points?.[0]?.date || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Last Updated
              </h3>
              <p className="text-sm text-foreground">
                {signal.updated_at ? new Date(signal.updated_at).toLocaleString() : "Never"}
              </p>
            </div>

            {signal.owner_name && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Owner</h3>
                <Badge variant="secondary">{signal.owner_name}</Badge>
              </div>
            )}
          </div>
        )}

        {/* Analysis Layer */}
        {currentLayer === "analysis" && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-center space-y-2">
                {getStatusBadge() && (
                  <div className="flex justify-center mb-2">
                    {getStatusBadge()}
                  </div>
                )}
                <div className="text-5xl font-bold text-primary">
                  {signal.latest_value !== null ? signal.latest_value.toLocaleString() : "N/A"}
                </div>
                <h3 className="text-xl font-semibold text-card-foreground">{signal.name}</h3>
              </div>

              {signal.change !== null && (
                <div className="flex flex-wrap items-center justify-center gap-3 text-center">
                  <div className={cn("flex items-center gap-1.5", getTrendColor())}>
                    {getTrendIcon()}
                    <span className="text-2xl font-bold">{signal.change_percent}%</span>
                  </div>
                  <span className="text-base text-muted-foreground">vs. previous period</span>
                </div>
              )}

              {signal.benchmark_value !== null && (
                <div className="mt-3 text-sm text-muted-foreground">
                  Benchmark: {signal.benchmark_value.toLocaleString()}
                </div>
              )}
            </div>

            {signal.category && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">Category:</span>
                <Badge variant="secondary" className="bg-accent/10 text-accent border border-accent/20">
                  {signal.category}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Synthesis Layer */}
        {currentLayer === "synthesis" && (
          <div className="space-y-6">
            {isLoadingInterpretation ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Generating AI interpretation...</p>
              </div>
            ) : interpretation ? (
              <>
                {/* What We Found */}
                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    What We Found
                  </h3>
                  <div className="space-y-2">
                    <p className="text-base font-medium text-foreground">
                      {interpretation.what_we_found.absolute_value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {interpretation.what_we_found.trend}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {interpretation.what_we_found.sample_size} samples
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {interpretation.what_we_found.time_period}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* What It Means */}
                <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
                  <h3 className="text-sm font-semibold text-accent mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    What It Means
                  </h3>
                  <div className="space-y-3">
                    <p className="text-sm text-card-foreground leading-relaxed">
                      {interpretation.what_it_means.why_change_happened}
                    </p>
                    {interpretation.what_it_means.benchmark && (
                      <p className="text-sm text-muted-foreground italic">
                        {interpretation.what_it_means.benchmark}
                      </p>
                    )}
                    {interpretation.what_it_means.scope_customers && (
                      <p className="text-xs text-muted-foreground">
                        {interpretation.what_it_means.scope_customers}
                      </p>
                    )}
                  </div>
                </div>

                {/* So What */}
                <div className={cn(
                  "p-4 rounded-lg border",
                  interpretation.so_what.direction === "positive" 
                    ? "bg-emerald-500/10 border-emerald-500/20" 
                    : interpretation.so_what.direction === "negative"
                    ? "bg-destructive/10 border-destructive/20"
                    : "bg-primary/10 border-primary/20"
                )}>
                  <h3 className={cn(
                    "text-sm font-semibold mb-3 flex items-center gap-2",
                    interpretation.so_what.direction === "positive" 
                      ? "text-emerald-700" 
                      : interpretation.so_what.direction === "negative"
                      ? "text-destructive"
                      : "text-primary"
                  )}>
                    <Layers className="h-4 w-4" />
                    So What
                  </h3>
                  <div className="space-y-3">
                    <p className="text-sm text-card-foreground leading-relaxed">
                      {interpretation.so_what.expected_vs_unexpected}
                    </p>
                    <div className="p-3 bg-background/50 rounded-md">
                      <p className="text-xs font-medium text-muted-foreground mb-1">KPI Impact</p>
                      <p className="text-sm text-card-foreground">
                        {interpretation.so_what.kpi_impact}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Fallback when no interpretation available
              <>
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-semibold text-primary mb-2">Executive Summary</h3>
                  <p className="text-sm text-card-foreground leading-relaxed">
                    {signal.name} is{" "}
                    {signal.trend === "increasing" ? "increasing" : signal.trend === "decreasing" ? "decreasing" : "stable"}{" "}
                    {signal.change_percent !== null && `by ${Math.abs(signal.change_percent)}%`}.
                    {signal.benchmark_value !== null &&
                    signal.latest_value !== null &&
                    signal.latest_value < signal.benchmark_value
                      ? " This is below the target benchmark."
                      : " Performance is on track."}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-5 w-5 text-accent" />
                    <h3 className="text-lg font-semibold text-card-foreground">Key Insights</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-md">
                      <Badge variant="outline" className="text-xs shrink-0 mt-0.5">
                        1
                      </Badge>
                      <p className="text-sm text-card-foreground">
                        Trend analysis shows{" "}
                        {signal.trend === "increasing"
                          ? "positive growth"
                          : signal.trend === "decreasing"
                            ? "declining performance"
                            : "stability"}{" "}
                        over the past {dateRange === "7days" ? "7 days" : dateRange === "30days" ? "30 days" : "quarter"}.
                      </p>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-md">
                      <Badge variant="outline" className="text-xs shrink-0 mt-0.5">
                        2
                      </Badge>
                      <p className="text-sm text-card-foreground">
                        {signal.data_points?.length || 0} data points collected for comprehensive analysis.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex gap-2">
          <Button
            variant={isSaved ? "default" : "outline"}
            size="sm"
            className={cn(
              "flex-1 h-auto py-2 px-3 flex flex-col items-center gap-1",
              isSaved ? "bg-primary text-primary-foreground" : "bg-transparent"
            )}
            onClick={() => onToggleSave?.(signal.id)}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSaved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4 text-primary" />
            )}
            <span className="text-xs font-medium">{isSaved ? 'Saved' : 'Save'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-auto py-2 px-3 flex flex-col items-center gap-1 bg-transparent"
            onClick={() => setIsFlagged(!isFlagged)}
          >
            <Flag className={cn("h-4 w-4", isFlagged ? "text-amber-600" : "text-muted-foreground")} />
            <span className="text-xs font-medium">Flag</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-auto py-2 px-3 flex flex-col items-center gap-1 bg-transparent"
          >
            <UserCircle className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">Assign</span>
          </Button>
        </div>
      </div>
    </Card>
  )
}
