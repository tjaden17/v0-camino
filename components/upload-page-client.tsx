"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Loader2,
  X,
  Sparkles,
  AlertTriangle,
  Info,
  Target,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { SignalDiscoveryResult, DiscoveredSignal } from "@/lib/signal-discovery-service"
import type { SignalContextResult, ContextualSignal, DataGuidance } from "@/lib/signal-context-service"
import { SignalRow } from "@/components/signal-row" // Import SignalRow component

interface UploadHistory {
  id: string
  file_name: string
  signals_created: number
  signals_updated: number
  data_points_added: number
  status: string
  created_at: string
}

interface UploadPageClientProps {
  uploadHistory: UploadHistory[]
  isMasterAdmin?: boolean
  userOrgId?: string
  availableOrgs?: Array<{ id: string; name: string }>
}

type UploadState = "idle" | "analyzing" | "discovered" | "processing" | "complete" | "error"

export function UploadPageClient({
  uploadHistory: initialHistory,
  isMasterAdmin = false,
  userOrgId,
  availableOrgs = [],
}: UploadPageClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [discovery, setDiscovery] = useState<SignalDiscoveryResult | null>(null)
  const [signalContext, setSignalContext] = useState<SignalContextResult | null>(null)
  const [selectedSignals, setSelectedSignals] = useState<Set<string>>(new Set())
  const [result, setResult] = useState<{ signalsCreated: number } | null>(null)
  const [selectedOrgId, setSelectedOrgId] = useState<string | undefined>(userOrgId)
  const [expandedGuidance, setExpandedGuidance] = useState<Set<string>>(new Set())

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      analyzeFile(e.dataTransfer.files[0])
    }
  }, [selectedOrgId])

  const analyzeFile = async (selectedFile: File) => {
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]

    const isValidType = validTypes.includes(selectedFile.type) || 
      selectedFile.name.endsWith(".csv") || 
      selectedFile.name.endsWith(".xlsx") || 
      selectedFile.name.endsWith(".xls")

    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or Excel file",
        variant: "destructive",
      })
      return
    }

    if (isMasterAdmin && !selectedOrgId) {
      toast({
        title: "Organization required",
        description: "Please select an organization first",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    setError(null)
    setUploadState("analyzing")
    setProgress(30)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/upload/discover", {
        method: "POST",
        body: formData,
      })

      setProgress(80)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Analysis failed" }))
        throw new Error(errorData.error || "Failed to analyze file")
      }

      const data = await response.json()
      setProgress(100)

      if (!data.discovery) {
        throw new Error("No signals could be discovered from this file")
      }

      setDiscovery(data.discovery)
      if (data.signalContext) {
        setSignalContext(data.signalContext)
      }
      
      // Auto-select all available signals + priority matches
      const availableIds = data.discovery.availableSignals.map((s: DiscoveredSignal) => s.signal.signalId)
      const priorityIds = (data.signalContext?.priorityMatch || []).map((s: ContextualSignal) => s.signal.signalId)
      setSelectedSignals(new Set([...availableIds, ...priorityIds]))
      
      setUploadState("discovered")

    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed")
      setUploadState("error")
      toast({
        title: "Analysis failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      })
    }
  }

  const processSelectedSignals = async () => {
    if (!file || !discovery || selectedSignals.size === 0) return

    setUploadState("processing")
    setProgress(20)

    try {
      const signalsToProcess = [
        ...discovery.availableSignals.filter(s => selectedSignals.has(s.signal.signalId)),
        ...discovery.partialSignals.filter(s => selectedSignals.has(s.signal.signalId))
      ]

      const formData = new FormData()
      formData.append("file", file)
      formData.append("selectedSignals", JSON.stringify(signalsToProcess))
      if (selectedOrgId) {
        formData.append("organizationId", selectedOrgId)
      }

      setProgress(50)

      const response = await fetch("/api/upload/calculate", {
        method: "POST",
        body: formData,
      })

      setProgress(90)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to process signals")
      }

      setResult({ signalsCreated: data.signalsCreated || 0 })
      setProgress(100)
      setUploadState("complete")

      toast({
        title: "Signals created",
        description: `Successfully created ${data.signalsCreated} signals`,
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed")
      setUploadState("error")
      toast({
        title: "Processing failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      })
    }
  }

  const toggleSignal = (signalId: string) => {
    const newSelected = new Set(selectedSignals)
    if (newSelected.has(signalId)) {
      newSelected.delete(signalId)
    } else {
      newSelected.add(signalId)
    }
    setSelectedSignals(newSelected)
  }

  const toggleGuidance = (signalId: string) => {
    const next = new Set(expandedGuidance)
    if (next.has(signalId)) {
      next.delete(signalId)
    } else {
      next.add(signalId)
    }
    setExpandedGuidance(next)
  }

  const resetUpload = () => {
    setFile(null)
    setUploadState("idle")
    setProgress(0)
    setError(null)
    setDiscovery(null)
    setSignalContext(null)
    setSelectedSignals(new Set())
    setExpandedGuidance(new Set())
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-20 bg-gradient-to-r from-primary to-accent border-b border-border shadow-sm">
        <div className="container max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-primary-foreground">Upload Data</h1>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Organization selector for admins */}
        {isMasterAdmin && availableOrgs.length > 0 && uploadState === "idle" && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <label className="text-sm font-medium mb-2 block">Upload data for organization:</label>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization..." />
                </SelectTrigger>
                <SelectContent>
                  {availableOrgs.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Main Upload Area */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Idle State - Dropzone */}
            {uploadState === "idle" && (
              <div
                className={cn(
                  "p-8 text-center transition-all cursor-pointer",
                  dragActive 
                    ? "bg-primary/10 border-2 border-dashed border-primary" 
                    : "bg-muted/30 hover:bg-muted/50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Drop your data file here
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We'll automatically discover what signals can be generated
                </p>
                <Button variant="outline" size="lg">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0]
                    if (selectedFile) analyzeFile(selectedFile)
                  }}
                />
              </div>
            )}

            {/* Analyzing State */}
            {uploadState === "analyzing" && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Analyzing your data...</h3>
                <p className="text-sm text-muted-foreground mb-4">{file?.name}</p>
                <Progress value={progress} className="h-2 max-w-xs mx-auto" />
                <p className="text-xs text-muted-foreground mt-2">
                  Detecting columns and matching against signal library
                </p>
              </div>
            )}

            {/* Discovery Results - Four Category View */}
            {uploadState === "discovered" && discovery && (
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Signal Analysis</h3>
                  <Badge variant="secondary" className="ml-auto">
                    {discovery.totalRowsAnalyzed} rows analyzed
                  </Badge>
                </div>

                {/* Data Completeness Bar (if context available) */}
                {signalContext && (
                  <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Data Completeness</span>
                      <span className="text-sm font-bold">{signalContext.dataCompleteness}%</span>
                    </div>
                    <Progress value={signalContext.dataCompleteness} className="h-2 mb-3" />
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-emerald-600">{signalContext.priorityMatch.length}</div>
                        <div className="text-[10px] text-muted-foreground leading-tight">Priority Match</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">{signalContext.available.length}</div>
                        <div className="text-[10px] text-muted-foreground leading-tight">Available</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-amber-600">{signalContext.recommended.length}</div>
                        <div className="text-[10px] text-muted-foreground leading-tight">Recommended</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-muted-foreground">{signalContext.requestedMissing.length}</div>
                        <div className="text-[10px] text-muted-foreground leading-tight">Missing Data</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PRIORITY MATCH - User asked for it AND data supports it */}
                {signalContext && signalContext.priorityMatch.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium">Priority Match ({signalContext.priorityMatch.length})</span>
                      <span className="text-xs text-muted-foreground ml-auto">Matches your goals and data</span>
                    </div>
                    <div className="space-y-2">
                      {signalContext.priorityMatch.map((cs) => (
                        <SignalRow
                          key={cs.signal.signalId}
                          cs={cs}
                          colorClass="emerald"
                          selected={selectedSignals.has(cs.signal.signalId)}
                          onToggle={() => toggleSignal(cs.signal.signalId)}
                          guidanceExpanded={expandedGuidance.has(cs.signal.signalId)}
                          onToggleGuidance={() => toggleGuidance(cs.signal.signalId)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* AVAILABLE - Data supports it, user didn't explicitly ask */}
                {signalContext && signalContext.available.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Available ({signalContext.available.length})</span>
                      <span className="text-xs text-muted-foreground ml-auto">Your data supports these</span>
                    </div>
                    <div className="space-y-2">
                      {signalContext.available.map((cs) => (
                        <SignalRow
                          key={cs.signal.signalId}
                          cs={cs}
                          colorClass="blue"
                          selected={selectedSignals.has(cs.signal.signalId)}
                          onToggle={() => toggleSignal(cs.signal.signalId)}
                          guidanceExpanded={expandedGuidance.has(cs.signal.signalId)}
                          onToggleGuidance={() => toggleGuidance(cs.signal.signalId)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* RECOMMENDED - Best practice for profile, data may be missing */}
                {signalContext && signalContext.recommended.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">Recommended ({signalContext.recommended.length})</span>
                      <span className="text-xs text-muted-foreground ml-auto">Best practice for your profile</span>
                    </div>
                    <div className="space-y-2">
                      {signalContext.recommended.map((cs) => (
                        <SignalRow
                          key={cs.signal.signalId}
                          cs={cs}
                          colorClass="amber"
                          selected={false}
                          disabled
                          onToggle={() => {}}
                          guidanceExpanded={expandedGuidance.has(cs.signal.signalId)}
                          onToggleGuidance={() => toggleGuidance(cs.signal.signalId)}
                          showGuidanceByDefault
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* REQUESTED BUT MISSING - User asked, data doesn't have it */}
                {signalContext && signalContext.requestedMissing.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Missing Data ({signalContext.requestedMissing.length})</span>
                      <span className="text-xs text-muted-foreground ml-auto">You asked for these - here's how to get the data</span>
                    </div>
                    <div className="space-y-2">
                      {signalContext.requestedMissing.map((cs) => (
                        <SignalRow
                          key={cs.signal.signalId}
                          cs={cs}
                          colorClass="gray"
                          selected={false}
                          disabled
                          onToggle={() => {}}
                          guidanceExpanded={expandedGuidance.has(cs.signal.signalId)}
                          onToggleGuidance={() => toggleGuidance(cs.signal.signalId)}
                          showGuidanceByDefault
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback: basic discovery when no signal context */}
                {!signalContext && discovery.availableSignals.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium">Available ({discovery.availableSignals.length})</span>
                    </div>
                    <div className="space-y-2">
                      {discovery.availableSignals.map((ds) => (
                        <label
                          key={ds.signal.signalId}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                            selectedSignals.has(ds.signal.signalId)
                              ? "bg-emerald-500/10 border border-emerald-500/30"
                              : "bg-muted/50 hover:bg-muted"
                          )}
                        >
                          <Checkbox
                            checked={selectedSignals.has(ds.signal.signalId)}
                            onCheckedChange={() => toggleSignal(ds.signal.signalId)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{ds.signal.signalName}</span>
                              <Badge variant="outline" className="text-xs">{ds.signal.category}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{ds.signal.description}</p>
                            <p className="text-xs text-emerald-600 mt-1">
                              {'Matched: ' + ds.matchedFields.join(", ")}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* No signals found */}
                {discovery.availableSignals.length === 0 && discovery.partialSignals.length === 0 && !signalContext && (
                  <div className="text-center py-6">
                    <Info className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No signals could be automatically discovered from this data.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Try uploading data with metrics like revenue, tickets, leads, or user activity.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={processSelectedSignals}
                    disabled={selectedSignals.size === 0}
                    className="flex-1"
                    size="lg"
                  >
                    Create {selectedSignals.size} Signal{selectedSignals.size !== 1 ? "s" : ""}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button onClick={resetUpload} variant="outline" size="lg">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Processing State */}
            {uploadState === "processing" && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Creating signals...</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Calculating values for {selectedSignals.size} signal{selectedSignals.size !== 1 ? "s" : ""}
                </p>
                <Progress value={progress} className="h-2 max-w-xs mx-auto" />
              </div>
            )}

            {/* Error State */}
            {uploadState === "error" && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-destructive">Something went wrong</h3>
                <p className="text-sm text-muted-foreground mb-4">{error || "Please try again"}</p>
                <Button onClick={resetUpload} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}

            {/* Complete State */}
            {uploadState === "complete" && result && (
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Signals Created</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {result.signalsCreated} signal{result.signalsCreated !== 1 ? "s" : ""} ready to view
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => router.push("/signals")} size="lg">
                    View Signals
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button onClick={resetUpload} variant="outline" size="lg">
                    Upload More
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Card */}
        {uploadState === "idle" && (
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm mb-3">What data can you upload?</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0">CRM</Badge>
                  <span className="text-muted-foreground text-xs">Leads, deals, opportunities</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0">Support</Badge>
                  <span className="text-muted-foreground text-xs">Tickets, CSAT scores</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0">Revenue</Badge>
                  <span className="text-muted-foreground text-xs">MRR, transactions</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0">Product</Badge>
                  <span className="text-muted-foreground text-xs">User activity, events</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
