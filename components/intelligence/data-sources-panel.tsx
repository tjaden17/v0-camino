"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { 
  Database, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock,
  Plus,
  RefreshCw,
  ExternalLink
} from "lucide-react"

interface DataSource {
  id: string
  sourceName: string
  sourceType: string
  sourceCategory: string
  connectionStatus: string
  recordCount: number
  lastSyncAt: string | null
  lastSyncStatus: string | null
  syncFrequency: string
}

interface Coverage {
  totalSources: number
  byCategory: Record<string, number>
  byType: Record<string, number>
  overallHealth: string
  recommendations: string[]
}

const SOURCE_TYPE_ICONS: Record<string, string> = {
  zoho_crm: "Zoho CRM",
  zoho_desk: "Zoho Desk",
  hubspot: "HubSpot",
  salesforce: "Salesforce",
  csv_upload: "CSV Upload",
  excel_upload: "Excel Upload",
  google_sheets: "Google Sheets",
  quickbooks: "QuickBooks",
  stripe: "Stripe",
  intercom: "Intercom",
  zendesk: "Zendesk",
  jira: "Jira",
  asana: "Asana",
  api_integration: "API",
  manual_entry: "Manual"
}

const CATEGORY_COLORS: Record<string, string> = {
  crm: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  support: "bg-purple-500/20 text-purple-700 border-purple-500/30",
  finance: "bg-emerald-500/20 text-emerald-700 border-emerald-500/30",
  marketing: "bg-amber-500/20 text-amber-700 border-amber-500/30",
  product: "bg-cyan-500/20 text-cyan-700 border-cyan-500/30",
  hr: "bg-pink-500/20 text-pink-700 border-pink-500/30",
  operations: "bg-orange-500/20 text-orange-700 border-orange-500/30"
}

export function DataSourcesPanel() {
  const [sources, setSources] = useState<DataSource[]>([])
  const [coverage, setCoverage] = useState<Coverage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDataSources()
  }, [])

  const fetchDataSources = async () => {
    try {
      const res = await fetch("/api/data-sources")
      if (res.ok) {
        const data = await res.json()
        setSources(data.sources || [])
        setCoverage(data.coverage || null)
      }
    } catch (error) {
      console.error("Error fetching data sources:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "text-emerald-600"
      case "warning":
        return "text-amber-600"
      case "critical":
        return "text-red-600"
      default:
        return "text-muted-foreground"
    }
  }

  const formatTimeSince = (dateStr: string | null) => {
    if (!dateStr) return "Never"
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
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
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Coverage Summary */}
      {coverage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Source Coverage
            </CardTitle>
            <CardDescription>
              Overview of your connected data sources and coverage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{coverage.totalSources}</p>
                <p className="text-sm text-muted-foreground">Total Sources</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{Object.keys(coverage.byCategory).length}</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className={`text-2xl font-bold capitalize ${getHealthColor(coverage.overallHealth)}`}>
                  {coverage.overallHealth}
                </p>
                <p className="text-sm text-muted-foreground">Health Status</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{coverage.recommendations.length}</p>
                <p className="text-sm text-muted-foreground">Recommendations</p>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(coverage.byCategory).map(([category, count]) => (
                <Badge key={category} variant="outline" className={CATEGORY_COLORS[category]}>
                  {category}: {count}
                </Badge>
              ))}
            </div>

            {/* Recommendations */}
            {coverage.recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Recommendations</p>
                {coverage.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Data Sources List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Connected Sources</CardTitle>
            <CardDescription>
              Your data integrations and their status
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-base font-medium">No data sources connected</p>
              <p className="text-sm mt-1">
                Connect your CRM, support tools, or upload CSV files
              </p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Connect Data Source
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sources.map(source => (
                <div
                  key={source.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(source.connectionStatus)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{source.sourceName}</span>
                        <Badge variant="outline" className={CATEGORY_COLORS[source.sourceCategory]}>
                          {source.sourceCategory}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {SOURCE_TYPE_ICONS[source.sourceType] || source.sourceType}
                        {source.recordCount > 0 && ` • ${source.recordCount.toLocaleString()} records`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {source.lastSyncStatus === "success" ? "Synced" : 
                         source.lastSyncStatus === "failed" ? "Failed" : "Pending"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeSince(source.lastSyncAt)}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
