"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, Target, ArrowRight } from "lucide-react"
import type { ImpactPrediction, KPIImpactMatrix } from "@/lib/impact-prediction-service"
import Link from "next/link"

interface ImpactPredictionViewProps {
  prediction?: ImpactPrediction
  kpiMatrices?: KPIImpactMatrix[]
}

export function ImpactPredictionView({ prediction, kpiMatrices = [] }: ImpactPredictionViewProps) {
  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "positive":
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case "negative":
        return <TrendingDown className="h-5 w-5 text-red-600" />
      default:
        return <Minus className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getHealthBadge = (health: string) => {
    switch (health) {
      case "good":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Healthy
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-600">
            <AlertCircle className="mr-1 h-3 w-3" />
            Watch
          </Badge>
        )
      case "critical":
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Critical
          </Badge>
        )
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      {prediction && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getImpactIcon(prediction.predictedImpact)}
                  <div>
                    <CardTitle>Impact Prediction</CardTitle>
                    <CardDescription>Predicted effects on your KPIs and related signals</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{prediction.impactScore.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Impact Score</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Confidence Level</span>
                  <span className="text-sm text-muted-foreground">{Math.round(prediction.confidence * 100)}%</span>
                </div>
                <Progress value={prediction.confidence * 100} className="h-2" />
              </div>

              {prediction.affectedKPIs.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Affected KPIs
                  </h4>
                  <div className="space-y-2">
                    {prediction.affectedKPIs.map((kpi, i) => (
                      <div key={i} className="p-3 border rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-1">
                          <Link href={`/signals/${kpi.kpiId}`} className="font-medium hover:text-primary">
                            {kpi.kpiName}
                          </Link>
                          <Badge variant={kpi.expectedChange > 0 ? "default" : "secondary"}>
                            {kpi.expectedChange > 0 && "+"}
                            {kpi.expectedChange}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{kpi.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {prediction.affectedSignals.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Related Signals</h4>
                  <div className="space-y-2">
                    {prediction.affectedSignals.map((signal, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <Link href={`/signals/${signal.signalId}`} className="font-medium hover:text-primary">
                            {signal.signalName}
                          </Link>
                          <Badge variant="outline" className="text-xs capitalize">
                            {signal.relationshipType.replace("_", " ")}
                          </Badge>
                          {signal.timeLag && (
                            <span className="text-xs text-muted-foreground">({signal.timeLag}d delay)</span>
                          )}
                        </div>
                        <Badge variant={signal.expectedChange > 0 ? "default" : "secondary"}>
                          {signal.expectedChange > 0 && "+"}
                          {signal.expectedChange}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {prediction.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {prediction.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {kpiMatrices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>KPI Impact Matrix</CardTitle>
            <CardDescription>How different signals impact your primary KPIs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {kpiMatrices.map((matrix, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Link href={`/signals/${matrix.kpiId}`} className="font-semibold text-lg hover:text-primary">
                        {matrix.kpiName}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        {getTrendIcon(matrix.predictedTrend)}
                        <span className="text-sm text-muted-foreground capitalize">{matrix.predictedTrend}</span>
                      </div>
                    </div>
                    {getHealthBadge(matrix.overallHealth)}
                  </div>

                  {matrix.impactingSignals.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground">Impacting Signals:</h5>
                      {matrix.impactingSignals.map((signal, j) => (
                        <div key={j} className="flex items-center gap-3 text-sm">
                          <Link
                            href={`/signals/${signal.signalId}`}
                            className="flex-1 hover:text-primary transition-colors"
                          >
                            {signal.signalName}
                          </Link>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <Badge
                            variant="outline"
                            className={signal.direction === "positive" ? "border-green-600" : "border-red-600"}
                          >
                            {signal.direction === "positive" ? "+" : "-"}
                            {signal.change}%
                          </Badge>
                          <div className="w-24">
                            <Progress
                              value={signal.impactWeight * 100}
                              className={`h-1.5 ${signal.direction === "positive" ? "bg-green-200" : "bg-red-200"}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
