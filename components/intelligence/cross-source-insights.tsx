"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  RefreshCw,
  ChevronRight,
  X,
  Eye,
  Search
} from "lucide-react"

interface CrossSourceInsight {
  id: string
  insightType: string
  title: string
  description: string
  sourceIds: string[]
  signalIds: string[]
  confidenceScore: number
  impactLevel: string
  affectedMetrics: string[]
  recommendations: string[]
  status: string
}

const INSIGHT_TYPE_CONFIG: Record<string, { icon: typeof Lightbulb; color: string; label: string }> = {
  data_discrepancy: { 
    icon: AlertTriangle, 
    color: "text-amber-600 bg-amber-500/10", 
    label: "Data Discrepancy" 
  },
  correlation_found: { 
    icon: TrendingUp, 
    color: "text-blue-600 bg-blue-500/10", 
    label: "Correlation Found" 
  },
  anomaly_detected: { 
    icon: AlertTriangle, 
    color: "text-red-600 bg-red-500/10", 
    label: "Anomaly Detected" 
  },
  opportunity_identified: { 
    icon: Lightbulb, 
    color: "text-emerald-600 bg-emerald-500/10", 
    label: "Opportunity" 
  },
  risk_detected: { 
    icon: AlertTriangle, 
    color: "text-red-600 bg-red-500/10", 
    label: "Risk Detected" 
  },
  trend_confirmed: { 
    icon: CheckCircle2, 
    color: "text-emerald-600 bg-emerald-500/10", 
    label: "Trend Confirmed" 
  },
  data_quality_issue: { 
    icon: AlertTriangle, 
    color: "text-amber-600 bg-amber-500/10", 
    label: "Data Quality Issue" 
  },
  missing_data_pattern: { 
    icon: Search, 
    color: "text-muted-foreground bg-muted", 
    label: "Missing Data" 
  }
}

const IMPACT_COLORS: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-500/20 text-amber-700 border-amber-500/30",
  high: "bg-red-500/20 text-red-700 border-red-500/30",
  critical: "bg-red-600 text-white"
}

export function CrossSourceInsights() {
  const [insights, setInsights] = useState<CrossSourceInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [detecting, setDetecting] = useState(false)
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const res = await fetch("/api/insights")
      if (res.ok) {
        const data = await res.json()
        setInsights(data.insights || [])
      }
    } catch (error) {
      console.error("Error fetching insights:", error)
    } finally {
      setLoading(false)
    }
  }

  const detectInsights = async () => {
    setDetecting(true)
    try {
      const res = await fetch("/api/insights", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setInsights(data.insights || [])
      }
    } catch (error) {
      console.error("Error detecting insights:", error)
    } finally {
      setDetecting(false)
    }
  }

  const dismissInsight = async (insightId: string) => {
    // In production, this would call an API to dismiss the insight
    setInsights(insights.filter(i => i.id !== insightId))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Cross-Source Insights
          </CardTitle>
          <CardDescription>
            Intelligence derived from combining multiple data sources
          </CardDescription>
        </div>
        <Button
          onClick={detectInsights}
          disabled={detecting}
          size="sm"
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${detecting ? "animate-spin" : ""}`} />
          {detecting ? "Analyzing..." : "Detect Insights"}
        </Button>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-base font-medium">No insights detected yet</p>
            <p className="text-sm mt-1">
              Connect multiple data sources to unlock cross-source intelligence
            </p>
            <Button onClick={detectInsights} className="mt-4" disabled={detecting}>
              <RefreshCw className={`h-4 w-4 mr-2 ${detecting ? "animate-spin" : ""}`} />
              Run Analysis
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map(insight => {
              const config = INSIGHT_TYPE_CONFIG[insight.insightType] || INSIGHT_TYPE_CONFIG.correlation_found
              const Icon = config.icon
              const isExpanded = expandedInsight === insight.id

              return (
                <div
                  key={insight.id}
                  className="rounded-lg border bg-card overflow-hidden"
                >
                  <div
                    className="flex items-start gap-4 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
                  >
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {insight.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline" className={IMPACT_COLORS[insight.impactLevel]}>
                            {insight.impactLevel}
                          </Badge>
                          <ChevronRight 
                            className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} 
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs">
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {(insight.confidenceScore * 100).toFixed(0)}% confidence
                        </span>
                        {insight.affectedMetrics.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            • {insight.affectedMetrics.length} affected metrics
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t bg-muted/30">
                      <div className="pt-4 space-y-4">
                        {/* Affected Metrics */}
                        {insight.affectedMetrics.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Affected Metrics</p>
                            <div className="flex flex-wrap gap-2">
                              {insight.affectedMetrics.map((metric, idx) => (
                                <Badge key={idx} variant="outline">
                                  {metric}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {insight.recommendations.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Recommendations</p>
                            <ul className="space-y-2">
                              {insight.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Investigate
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              dismissInsight(insight.id)
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
