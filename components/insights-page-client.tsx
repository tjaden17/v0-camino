"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { AlertCircle, AlertTriangle, Database } from "lucide-react"
import type { DataQualityMetrics, SignalAlert } from "@/lib/data-foundations-service"
import Link from "next/link"

interface InsightsPageClientProps {
  qualityReport: DataQualityMetrics[]
  alerts: SignalAlert[]
}

export function InsightsPageClient({ qualityReport, alerts }: InsightsPageClientProps) {
  const getQualityColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getQualityBadge = (score: number) => {
    if (score >= 80)
      return (
        <Badge className="bg-green-100 text-green-700 border-green-300" variant="outline">
          Good
        </Badge>
      )
    if (score >= 60)
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300" variant="outline">
          Fair
        </Badge>
      )
    return (
      <Badge className="bg-red-100 text-red-700 border-red-300" variant="outline">
        Poor
      </Badge>
    )
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const unreadAlerts = alerts.filter((a) => !a.is_read)
  const criticalIssues = qualityReport.filter((q) => q.overall_score < 60)

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-20 bg-gradient-to-r from-primary to-accent border-b border-border shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-primary-foreground">Insights</h1>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Data Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {qualityReport.length > 0
                  ? Math.round(qualityReport.reduce((sum, q) => sum + q.overall_score, 0) / qualityReport.length)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground mt-1">Average across all signals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Critical Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{criticalIssues.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Signals need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unread Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{unreadAlerts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Notifications pending</p>
            </CardContent>
          </Card>
        </div>

        {unreadAlerts.length > 0 && (
          <Card className="border-2 border-yellow-300 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Recent Alerts ({unreadAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {unreadAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{alert.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{alert.signal_name}</div>
                      {alert.description && (
                        <div className="text-xs text-muted-foreground mt-1">{alert.description}</div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Data Quality Report
                </CardTitle>
                <CardDescription>Health metrics for all signals</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {qualityReport.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No signals to analyze</p>
                <Button asChild>
                  <Link href="/upload">Upload Data</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {qualityReport.map((metric) => (
                  <Link key={metric.signal_id} href={`/signals/${metric.signal_id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-semibold mb-2">{metric.signal_name}</div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground text-xs">Completeness</div>
                                <div className={`font-semibold ${getQualityColor(metric.completeness_score || 0)}`}>
                                  {metric.completeness_score || 0}%
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground text-xs">Timeliness</div>
                                <div className={`font-semibold ${getQualityColor(metric.timeliness_score || 0)}`}>
                                  {metric.timeliness_score || 0}%
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground text-xs">Accuracy</div>
                                <div className={`font-semibold ${getQualityColor(metric.accuracy_score || 0)}`}>
                                  {metric.accuracy_score || 0}%
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              {metric.data_point_count} data points · Last update:{" "}
                              {metric.last_update_date
                                ? new Date(metric.last_update_date).toLocaleDateString()
                                : "Never"}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className={`text-2xl font-bold ${getQualityColor(metric.overall_score)}`}>
                              {metric.overall_score}%
                            </div>
                            {getQualityBadge(metric.overall_score)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}
