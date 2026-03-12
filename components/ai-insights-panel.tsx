"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, RefreshCw, TrendingUp, Lightbulb, CheckCircle } from "lucide-react"
import type { AIAnalysisResult } from "@/lib/ai-analysis-service"

interface AIInsightsPanelProps {
  signalId: string
  signalName: string
}

export function AIInsightsPanel({ signalId, signalName }: AIInsightsPanelProps) {
  const [whyAnalysis, setWhyAnalysis] = useState<AIAnalysisResult | null>(null)
  const [trendAnalysis, setTrendAnalysis] = useState<AIAnalysisResult | null>(null)
  const [recommendations, setRecommendations] = useState<AIAnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadAnalysis = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/signals/ai-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalId }),
      })

      if (!response.ok) throw new Error("Failed to load analysis")

      const data = await response.json()

      setWhyAnalysis(data.whyAnalysis)
      setTrendAnalysis(data.trendAnalysis)
      setRecommendations(data.recommendations)
    } catch (error) {
      console.error("[AIInsightsPanel] Error loading analysis:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "text-muted-foreground"
    if (confidence >= 0.7) return "text-green-600"
    if (confidence >= 0.5) return "text-yellow-600"
    return "text-red-600"
  }

  if (!whyAnalysis && !trendAnalysis && !recommendations) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <CardTitle>AI Insights</CardTitle>
          </div>
          <CardDescription>Get AI-powered analysis and recommendations for {signalName}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLoadAnalysis} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI Insights
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {whyAnalysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Why is this changing?</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {whyAnalysis.cached && (
                  <Badge variant="outline" className="text-xs">
                    Cached
                  </Badge>
                )}
                <Badge variant="secondary" className={getConfidenceColor(whyAnalysis.result.confidence)}>
                  {whyAnalysis.result.confidence && whyAnalysis.result.confidence >= 0.7
                    ? "High"
                    : whyAnalysis.result.confidence && whyAnalysis.result.confidence >= 0.5
                      ? "Medium"
                      : "Low"}{" "}
                  Confidence
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{whyAnalysis.result.summary}</p>
            {whyAnalysis.result.keyInsights.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Key Insights:</p>
                <ul className="space-y-1">
                  {whyAnalysis.result.keyInsights.map((insight, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {trendAnalysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Trend Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{trendAnalysis.result.summary}</p>
            {trendAnalysis.result.keyInsights.length > 0 && (
              <ul className="space-y-1">
                {trendAnalysis.result.keyInsights.map((insight, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            )}
            {trendAnalysis.result.reasoning && (
              <p className="text-sm text-muted-foreground pt-2 border-t">{trendAnalysis.result.reasoning}</p>
            )}
          </CardContent>
        </Card>
      )}

      {recommendations && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg">Recommended Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm font-medium">{recommendations.result.summary}</p>
            {recommendations.result.recommendations && recommendations.result.recommendations.length > 0 && (
              <ul className="space-y-2">
                {recommendations.result.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                    <span className="font-bold text-amber-600">{i + 1}.</span>
                    {rec}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleLoadAnalysis}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="w-full bg-transparent"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh Analysis
      </Button>
    </div>
  )
}
