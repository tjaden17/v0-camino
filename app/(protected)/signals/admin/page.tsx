"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  FileSpreadsheet,
  Database,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ExternalLink,
  Loader2,
  RefreshCw,
  Plug,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getSignalGuidance, type DataGuidance } from "@/lib/signal-context-service"

interface UploadRecord {
  id: string
  file_name: string
  file_type: string
  source_type: string
  row_count: number
  column_count: number
  status: string
  uploaded_at: string
  processed_at: string | null
  metadata: any
  field_count: number
}

interface IntegrationRecord {
  id: string
  provider: string
  provider_type: string
  status: string
  last_sync_at: string | null
  last_sync_status: string | null
  last_sync_error: string | null
  sync_frequency: string
  created_at: string
}

interface DataSourceRecord {
  id: string
  source_name: string
  source_type: string
  source_category: string
  connection_status: string
  record_count: number
  date_range_start: string | null
  date_range_end: string | null
  last_sync_at: string | null
  last_sync_status: string | null
  last_sync_records: number | null
  last_sync_error: string | null
  is_active: boolean
  created_at: string
}

interface SignalOpportunity {
  id: string
  signal_name: string
  signal_category: string
  status: string
  discovery_type: string
  is_calculable: boolean
  confidence_score: number
  required_fields: any
  available_fields: any
  missing_fields: any
  source_uploads: any
  created_at: string
}

interface Stats {
  totalUploads: number
  totalIntegrations: number
  totalDataSources: number
  totalSignals: number
  signalsWithTrends: number
  lastSignalUpdate: string | null
  totalPartialSignals: number
}

export default function SignalsAdminPage() {
  const [loading, setLoading] = useState(true)
  const [uploads, setUploads] = useState<UploadRecord[]>([])
  const [integrations, setIntegrations] = useState<IntegrationRecord[]>([])
  const [dataSources, setDataSources] = useState<DataSourceRecord[]>([])
  const [uploadSignalDetails, setUploadSignalDetails] = useState<SignalOpportunity[]>([])
  const [partialSignals, setPartialSignals] = useState<SignalOpportunity[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [expandedUploads, setExpandedUploads] = useState<Set<string>>(new Set())
  const [expandedPartials, setExpandedPartials] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<"history" | "partial">("history")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/signals/data-admin")
      if (!res.ok) throw new Error("Failed to load")
      const data = await res.json()
      setUploads(data.uploads || [])
      setIntegrations(data.integrations || [])
      setDataSources(data.dataSources || [])
      setUploadSignalDetails(data.uploadSignalDetails || [])
      setPartialSignals(data.partialSignals || [])
      setStats(data.stats || null)
    } catch (err) {
      console.error("Failed to load signals admin data:", err)
    } finally {
      setLoading(false)
    }
  }

  const toggleUpload = (id: string) => {
    const next = new Set(expandedUploads)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedUploads(next)
  }

  const togglePartial = (id: string) => {
    const next = new Set(expandedPartials)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedPartials(next)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never"
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const relativeTime = (dateStr: string | null) => {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateStr)
  }

  // Get signals associated with a specific upload
  const getSignalsForUpload = (uploadId: string) => {
    return uploadSignalDetails.filter((so) => {
      const sources = so.source_uploads
      if (!sources) return false
      if (Array.isArray(sources)) {
        return sources.some(
          (s: any) => s === uploadId || s?.upload_id === uploadId || s?.id === uploadId
        )
      }
      return false
    })
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "processed":
      case "active":
      case "connected":
      case "success":
        return "text-emerald-600 bg-emerald-500/10"
      case "pending":
      case "syncing":
        return "text-amber-600 bg-amber-500/10"
      case "error":
      case "failed":
      case "disconnected":
        return "text-red-600 bg-red-500/10"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  if (loading) {
    return (
      <main className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    )
  }

  return (
    <main className="container max-w-2xl mx-auto px-4 py-6 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/signals">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">Data Management</h1>
          <p className="text-sm text-muted-foreground">Upload history, data sources, and signal coverage</p>
        </div>
        <Button variant="outline" size="icon" onClick={loadData} className="shrink-0 bg-transparent">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold">{stats.totalSignals}</div>
            <div className="text-[10px] text-muted-foreground leading-tight">Active Signals</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold">{stats.totalUploads}</div>
            <div className="text-[10px] text-muted-foreground leading-tight">File Uploads</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.totalPartialSignals}</div>
            <div className="text-[10px] text-muted-foreground leading-tight">Incomplete</div>
          </Card>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 rounded-lg bg-muted mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors",
            activeTab === "history"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Data History
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("partial")}
          className={cn(
            "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors relative",
            activeTab === "partial"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Partial Signals
          {stats && stats.totalPartialSignals > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-[10px] font-bold text-white flex items-center justify-center">
              {stats.totalPartialSignals}
            </span>
          )}
        </button>
      </div>

      {/* ============================================ */}
      {/* DATA HISTORY TAB */}
      {/* ============================================ */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {/* File Uploads Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">File Uploads</h2>
              <Badge variant="secondary" className="text-[10px] ml-auto">
                {uploads.length} total
              </Badge>
            </div>

            {uploads.length === 0 ? (
              <Card className="p-6 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">No files uploaded yet</p>
                <Link href="/upload">
                  <Button size="sm">Upload Data</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-2">
                {uploads.map((upload) => {
                  const signals = getSignalsForUpload(upload.id)
                  const isExpanded = expandedUploads.has(upload.id)
                  const newCount = signals.filter((s) => s.discovery_type === "new" || s.status === "new").length
                  const changedCount = signals.filter((s) => s.discovery_type === "updated" || s.status === "updated").length
                  const partialCount = signals.filter((s) => !s.is_calculable).length

                  return (
                    <Card key={upload.id} className="overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleUpload(upload.id)}
                        className="w-full text-left p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileSpreadsheet className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">{upload.file_name}</span>
                              <Badge
                                variant="secondary"
                                className={cn("text-[10px] shrink-0", statusColor(upload.status))}
                              >
                                {upload.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>{upload.row_count?.toLocaleString()} rows</span>
                              <span>{upload.column_count} cols</span>
                              <span>{relativeTime(upload.uploaded_at)}</span>
                            </div>
                            {/* Signal badges */}
                            {signals.length > 0 && (
                              <div className="flex gap-1.5 mt-2">
                                {newCount > 0 && (
                                  <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700">
                                    {newCount} new
                                  </Badge>
                                )}
                                {changedCount > 0 && (
                                  <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-700">
                                    {changedCount} updated
                                  </Badge>
                                )}
                                {partialCount > 0 && (
                                  <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-700">
                                    {partialCount} partial
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0 border-t border-border">
                          <div className="pt-3">
                            {/* Upload metadata */}
                            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                              <div>
                                <span className="text-muted-foreground">File type:</span>{" "}
                                <span className="font-medium">{upload.file_type || "CSV"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Source:</span>{" "}
                                <span className="font-medium">{upload.source_type || "Manual"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Uploaded:</span>{" "}
                                <span className="font-medium">{formatDate(upload.uploaded_at)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Processed:</span>{" "}
                                <span className="font-medium">{formatDate(upload.processed_at)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Fields detected:</span>{" "}
                                <span className="font-medium">{upload.field_count}</span>
                              </div>
                            </div>

                            {/* Signals from this upload */}
                            {signals.length > 0 ? (
                              <div>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  Signals from this upload
                                </span>
                                <div className="mt-2 space-y-1.5">
                                  {signals.map((sig) => (
                                    <div
                                      key={sig.id}
                                      className="flex items-center gap-2 p-2 rounded bg-muted/50 text-xs"
                                    >
                                      {sig.is_calculable ? (
                                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                      ) : (
                                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                      )}
                                      <span className="font-medium flex-1 truncate">{sig.signal_name}</span>
                                      <Badge variant="outline" className="text-[10px]">
                                        {sig.signal_category}
                                      </Badge>
                                      <Badge
                                        variant="secondary"
                                        className={cn(
                                          "text-[10px]",
                                          sig.is_calculable
                                            ? "bg-emerald-500/10 text-emerald-700"
                                            : "bg-amber-500/10 text-amber-700"
                                        )}
                                      >
                                        {sig.is_calculable ? "complete" : "partial"}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">
                                No signal records linked to this upload
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </section>

          {/* Integrations / Data Sources Section */}
          {(integrations.length > 0 || dataSources.length > 0) && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Plug className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Connected Sources</h2>
              </div>

              <div className="space-y-2">
                {/* Integrations */}
                {integrations.map((integ) => (
                  <Card key={integ.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Database className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm capitalize">{integ.provider}</span>
                          <Badge
                            variant="secondary"
                            className={cn("text-[10px]", statusColor(integ.status))}
                          >
                            {integ.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="capitalize">{integ.provider_type}</span>
                          {integ.sync_frequency && <span>Sync: {integ.sync_frequency}</span>}
                          {integ.last_sync_at && (
                            <span>Last sync: {relativeTime(integ.last_sync_at)}</span>
                          )}
                        </div>
                        {integ.last_sync_error && (
                          <p className="text-xs text-red-600 mt-1 truncate">
                            {integ.last_sync_error}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}

                {/* Data Sources */}
                {dataSources.map((ds) => (
                  <Card key={ds.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Database className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{ds.source_name}</span>
                          <Badge
                            variant="secondary"
                            className={cn("text-[10px]", statusColor(ds.connection_status))}
                          >
                            {ds.connection_status}
                          </Badge>
                          {!ds.is_active && (
                            <Badge variant="secondary" className="text-[10px]">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="capitalize">{ds.source_category}</span>
                          {ds.record_count > 0 && (
                            <span>{ds.record_count.toLocaleString()} records</span>
                          )}
                          {ds.last_sync_at && <span>Synced {relativeTime(ds.last_sync_at)}</span>}
                        </div>
                        {ds.date_range_start && ds.date_range_end && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Data range: {new Date(ds.date_range_start).toLocaleDateString()} - {new Date(ds.date_range_end).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Empty state for no data at all */}
          {uploads.length === 0 && integrations.length === 0 && dataSources.length === 0 && (
            <Card className="p-8 text-center">
              <Database className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-1">No data sources yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a file or connect an integration to start generating signals
              </p>
              <Link href="/upload">
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Data
                </Button>
              </Link>
            </Card>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* PARTIAL SIGNALS TAB */}
      {/* ============================================ */}
      {activeTab === "partial" && (
        <div className="space-y-4">
          {partialSignals.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">All signals complete</h3>
              <p className="text-sm text-muted-foreground">
                Every discovered signal has the data it needs. Upload more data to discover additional signals.
              </p>
            </Card>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                These signals were detected but are missing data fields. Expand each one for tips on how to get the data.
              </p>

              {partialSignals.map((ps) => {
                const isExpanded = expandedPartials.has(ps.id)
                const missingFields = Array.isArray(ps.missing_fields) ? ps.missing_fields : []
                const availableFields = Array.isArray(ps.available_fields) ? ps.available_fields : []
                const requiredFields = Array.isArray(ps.required_fields) ? ps.required_fields : []
                const completeness = requiredFields.length > 0
                  ? Math.round((availableFields.length / requiredFields.length) * 100)
                  : 0

                // Try to get guidance from the context service
                const signalIdGuess = ps.signal_name
                  ?.toLowerCase()
                  .replace(/\s+/g, "_")
                  .replace(/[^a-z0-9_]/g, "")
                const guidance = getSignalGuidance(signalIdGuess)

                return (
                  <Card key={ps.id} className="overflow-hidden">
                    <button
                      type="button"
                      onClick={() => togglePartial(ps.id)}
                      className="w-full text-left p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{ps.signal_name}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {ps.signal_category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all"
                                style={{ width: `${completeness}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                              {completeness}% complete
                            </span>
                          </div>
                          <p className="text-xs text-amber-600 mt-1">
                            Missing: {missingFields.map((f: any) => typeof f === "string" ? f : f?.field || f?.name || "unknown").join(", ")}
                          </p>
                        </div>
                        <div className="shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded: field details + guidance */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border">
                        <div className="pt-3 space-y-3">
                          {/* Field status */}
                          <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Required Fields
                            </span>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {requiredFields.map((field: any, i: number) => {
                                const fieldName = typeof field === "string" ? field : field?.field || field?.name || `field_${i}`
                                const isAvailable = availableFields.some(
                                  (af: any) =>
                                    (typeof af === "string" ? af : af?.field || af?.name) === fieldName
                                )
                                return (
                                  <code
                                    key={fieldName}
                                    className={cn(
                                      "text-[10px] px-1.5 py-0.5 rounded font-mono",
                                      isAvailable
                                        ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30"
                                        : "bg-amber-500/10 text-amber-700 border border-amber-500/30"
                                    )}
                                  >
                                    {isAvailable ? "OK" : "Missing"}: {fieldName}
                                  </code>
                                )
                              })}
                            </div>
                          </div>

                          {/* Data Guidance */}
                          {guidance ? (
                            <GuidancePanel guidance={guidance} />
                          ) : (
                            <div className="rounded-lg bg-muted/50 p-3">
                              <div className="flex items-start gap-2">
                                <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-semibold">How to get this data</span>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    The missing fields ({missingFields.map((f: any) => typeof f === "string" ? f : f?.field || "").join(", ")}) typically come from your CRM, billing platform, or support tools. Try exporting a CSV from those systems that includes these columns, then upload it here.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Source uploads */}
                          {ps.source_uploads && Array.isArray(ps.source_uploads) && ps.source_uploads.length > 0 && (
                            <div>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Source Data
                              </span>
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {ps.source_uploads.map((src: any, i: number) => (
                                  <Badge key={i} variant="outline" className="text-[10px] gap-1">
                                    <FileSpreadsheet className="h-2.5 w-2.5" />
                                    {typeof src === "string" ? src : src?.file_name || src?.name || `upload ${i + 1}`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </>
          )}

          {/* Upload CTA at bottom */}
          {partialSignals.length > 0 && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">Have additional data?</span>
                  <p className="text-xs text-muted-foreground">
                    Upload files with the missing fields to complete these signals
                  </p>
                </div>
                <Link href="/upload">
                  <Button size="sm">
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      )}
    </main>
  )
}

// ============================================
// Guidance Panel Component
// ============================================

function GuidancePanel({ guidance }: { guidance: DataGuidance }) {
  const difficultyColors: Record<string, string> = {
    easy: "text-emerald-600 bg-emerald-500/10",
    moderate: "text-amber-600 bg-amber-500/10",
    advanced: "text-red-600 bg-red-500/10",
  }

  return (
    <div className="rounded-lg bg-background border border-border p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs font-semibold">How to get this data</span>
        </div>
        <Badge
          variant="secondary"
          className={cn("text-[10px]", difficultyColors[guidance.difficulty] || "")}
        >
          {guidance.difficulty}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground mb-3">{guidance.summary}</p>

      <div className="flex items-center gap-2 mb-3">
        <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="text-xs font-medium">{guidance.dataSource}</span>
      </div>

      {guidance.exportSteps.length > 0 && (
        <div className="mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Steps
          </span>
          <ol className="mt-1.5 space-y-1">
            {guidance.exportSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="shrink-0 w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {guidance.exampleColumns.length > 0 && (
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Expected columns
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {guidance.exampleColumns.map((col) => (
              <code key={col} className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-muted text-muted-foreground">
                {col}
              </code>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
