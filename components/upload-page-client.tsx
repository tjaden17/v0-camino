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
  const [files, setFiles] = useState<File[]>([])
  const [progress, setProgress] = useState(0)
  const [analyzeProgress, setAnalyzeProgress] = useState<{ current: number; total: number; fileName: string }>({ current: 0, total: 0, fileName: "" })
  const [error, setError] = useState<string | null>(null)
  const [discovery, setDiscovery] = useState<SignalDiscoveryResult | null>(null)
  const [signalContext, setSignalContext] = useState<SignalContextResult | null>(null)
  const [selectedSignals, setSelectedSignals] = useState<Set<string>>(new Set())
  const [result, setResult] = useState<{ signalsCreated: number } | null>(null)
  const [selectedOrgId, setSelectedOrgId] = useState<string | undefined>(userOrgId)
  const [expandedGuidance, setExpandedGuidance] = useState<Set<string>>(new Set())
  // Track which file each signal came from (signalId -> fileName[])
  const [signalFileSources, setSignalFileSources] = useState<Map<string, string[]>>(new Map())

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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      analyzeFiles(Array.from(e.dataTransfer.files))
    }
  }, [selectedOrgId])

  const validateFile = (f: File): boolean => {
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]
    return validTypes.includes(f.type) || 
      f.name.endsWith(".csv") || 
      f.name.endsWith(".xlsx") || 
      f.name.endsWith(".xls")
  }

  const analyzeFiles = async (selectedFiles: File[]) => {
    // Filter to valid files
    const validFiles = selectedFiles.filter(validateFile)
    const invalidCount = selectedFiles.length - validFiles.length

    if (invalidCount > 0) {
      toast({
        title: `${invalidCount} file${invalidCount > 1 ? "s" : ""} skipped`,
        description: "Only CSV and Excel files are supported",
        variant: "destructive",
      })
    }

    if (validFiles.length === 0) {
      toast({
        title: "No valid files",
        description: "Please upload CSV or Excel files",
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

    setFiles(validFiles)
    setError(null)
    setUploadState("analyzing")
    setProgress(0)

    try {
      // Analyze each file sequentially, merging discovery results
      let mergedAvailable: DiscoveredSignal[] = []
      let mergedPartial: DiscoveredSignal[] = []
      let totalRows = 0
      const allRecommendations: string[] = []
      const fileSources = new Map<string, string[]>()
      let latestSignalContext: SignalContextResult | null = null

      for (let i = 0; i < validFiles.length; i++) {
        const currentFile = validFiles[i]
        setAnalyzeProgress({ current: i + 1, total: validFiles.length, fileName: currentFile.name })
        setProgress(Math.round(((i) / validFiles.length) * 80))

        const formData = new FormData()
        formData.append("file", currentFile)

        const response = await fetch("/api/upload/discover", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Analysis failed" }))
          throw new Error(`${currentFile.name}: ${errorData.error || "Failed to analyze"}`)
        }

        const data = await response.json()

        if (data.discovery) {
          totalRows += data.discovery.totalRowsAnalyzed || 0

          // Merge available signals - keep best match score per signalId
          for (const sig of data.discovery.availableSignals) {
            const existing = mergedAvailable.find(s => s.signal.signalId === sig.signal.signalId)
            if (!existing || sig.matchScore > existing.matchScore) {
              mergedAvailable = mergedAvailable.filter(s => s.signal.signalId !== sig.signal.signalId)
              mergedAvailable.push(sig)
            }
            // Track file source
            const sources = fileSources.get(sig.signal.signalId) || []
            if (!sources.includes(currentFile.name)) sources.push(currentFile.name)
            fileSources.set(sig.signal.signalId, sources)
          }

          // Merge partial signals - promote to available if another file has the data
          for (const sig of (data.discovery.partialSignals || [])) {
            const alreadyAvailable = mergedAvailable.find(s => s.signal.signalId === sig.signal.signalId)
            if (alreadyAvailable) continue // Already fully available from another file
            
            const existingPartial = mergedPartial.find(s => s.signal.signalId === sig.signal.signalId)
            if (!existingPartial || sig.matchScore > existingPartial.matchScore) {
              mergedPartial = mergedPartial.filter(s => s.signal.signalId !== sig.signal.signalId)
              mergedPartial.push(sig)
            }
            const sources = fileSources.get(sig.signal.signalId) || []
            if (!sources.includes(currentFile.name)) sources.push(currentFile.name)
            fileSources.set(sig.signal.signalId, sources)
          }

          // Collect recommendations
          for (const rec of (data.discovery.recommendations || [])) {
            if (!allRecommendations.includes(rec)) allRecommendations.push(rec)
          }
        }

        // Use the latest signalContext (they all query same user profile, so last is fine)
        if (data.signalContext) {
          latestSignalContext = data.signalContext
        }
      }

      setProgress(100)
      setSignalFileSources(fileSources)

      // Build merged discovery object
      const mergedDiscovery: SignalDiscoveryResult = {
        dataSource: validFiles.map(f => f.name).join(", "),
        detectedColumns: [],
        availableSignals: mergedAvailable,
        partialSignals: mergedPartial,
        unavailableSignals: [],
        totalRowsAnalyzed: totalRows,
        recommendations: allRecommendations,
      }

      if (mergedAvailable.length === 0 && mergedPartial.length === 0 && !latestSignalContext) {
        throw new Error("No signals could be discovered from the uploaded files")
      }

      setDiscovery(mergedDiscovery)
      if (latestSignalContext) {
        setSignalContext(latestSignalContext)
      }
      
      // Auto-select all available signals + priority matches
      const availableIds = mergedAvailable.map((s) => s.signal.signalId)
      const priorityIds = (latestSignalContext?.priorityMatch || []).map((s) => s.signal.signalId)
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
    if (files.length === 0 || !discovery || selectedSignals.size === 0) return

    setUploadState("processing")
    setProgress(10)

    try {
      const signalsToProcess = [
        ...discovery.availableSignals.filter(s => selectedSignals.has(s.signal.signalId)),
        ...discovery.partialSignals.filter(s => selectedSignals.has(s.signal.signalId))
      ]

      let totalCreated = 0
      const allErrors: string[] = []

      // Process each file through calculate
      for (let i = 0; i < files.length; i++) {
        const currentFile = files[i]
        setProgress(Math.round(10 + ((i) / files.length) * 80))

        // Only send signals that came from this file
        const signalsForThisFile = signalsToProcess.filter(s => {
          const sources = signalFileSources.get(s.signal.signalId)
          return !sources || sources.includes(currentFile.name)
        })

        if (signalsForThisFile.length === 0) continue

        const formData = new FormData()
        formData.append("file", currentFile)
        formData.append("selectedSignals", JSON.stringify(signalsForThisFile))
        if (selectedOrgId) {
          formData.append("organizationId", selectedOrgId)
        }

        const response = await fetch("/api/upload/calculate", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          allErrors.push(`${currentFile.name}: ${data.error || "Failed to process"}`)
          continue
        }

        totalCreated += data.signalsCreated || 0
        if (data.errors) allErrors.push(...data.errors)
      }

      setResult({ signalsCreated: totalCreated })
      setProgress(100)
      setUploadState("complete")

      toast({
        title: "Signals created",
        description: `Successfully created ${totalCreated} signal${totalCreated !== 1 ? "s" : ""} from ${files.length} file${files.length !== 1 ? "s" : ""}${allErrors.length > 0 ? ` (${allErrors.length} warnings)` : ""}`,
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

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const addMoreFiles = (newFiles: File[]) => {
    const valid = newFiles.filter(validateFile)
    if (valid.length === 0) return
    // Reset to idle with accumulated files, user re-triggers analysis
    setFiles(prev => [...prev, ...valid])
  }

  const resetUpload = () => {
    setFiles([])
    setUploadState("idle")
    setProgress(0)
    setAnalyzeProgress({ current: 0, total: 0, fileName: "" })
    setError(null)
    setDiscovery(null)
    setSignalContext(null)
    setSelectedSignals(new Set())
    setExpandedGuidance(new Set())
    setSignalFileSources(new Map())
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
              <div>
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
                    Drop your data files here
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload one or multiple CSV/Excel files - we'll merge signals across all of them
                  </p>
                  <Button variant="outline" size="lg">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const selected = e.target.files
                      if (selected && selected.length > 0) {
                        analyzeFiles(Array.from(selected))
                      }
                      // Reset input so re-selecting the same files works
                      e.target.value = ""
                    }}
                  />
                </div>

                {/* Queued files (if user adds before analyzing) */}
                {files.length > 0 && (
                  <div className="p-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">{files.length} file{files.length !== 1 ? "s" : ""} ready</span>
                      <Button size="sm" onClick={() => analyzeFiles(files)}>
                        Analyze All
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {files.map((f, i) => (
                        <div key={`${f.name}-${i}`} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                          <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-xs truncate flex-1">{f.name}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                          <button type="button" onClick={() => removeFile(i)} className="shrink-0 p-0.5 rounded hover:bg-muted">
                            <X className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Analyzing State */}
            {uploadState === "analyzing" && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Analyzing {files.length > 1 ? `${files.length} files` : "your data"}...
                </h3>
                {analyzeProgress.total > 1 && (
                  <p className="text-sm font-medium text-primary mb-1">
                    File {analyzeProgress.current} of {analyzeProgress.total}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mb-4 truncate max-w-xs mx-auto">
                  {analyzeProgress.fileName || files[0]?.name}
                </p>
                <Progress value={progress} className="h-2 max-w-xs mx-auto" />
                <p className="text-xs text-muted-foreground mt-2">
                  Detecting columns and matching against signal library
                </p>
                {files.length > 1 && (
                  <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                    {files.map((f, i) => (
                      <Badge 
                        key={`${f.name}-${i}`}
                        variant={i < analyzeProgress.current ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {f.name.length > 20 ? `${f.name.slice(0, 17)}...` : f.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Discovery Results - Four Category View */}
            {uploadState === "discovered" && discovery && (
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Signal Analysis</h3>
                  <div className="ml-auto flex gap-1.5">
                    {files.length > 1 && (
                      <Badge variant="outline" className="text-xs">
                        {files.length} files
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      {discovery.totalRowsAnalyzed.toLocaleString()} rows
                    </Badge>
                  </div>
                </div>

                {/* File list summary for multi-file */}
                {files.length > 1 && (
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {files.map((f, i) => (
                      <Badge key={`${f.name}-${i}`} variant="outline" className="text-[10px] gap-1">
                        <FileSpreadsheet className="h-2.5 w-2.5" />
                        {f.name.length > 25 ? `${f.name.slice(0, 22)}...` : f.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Data Completeness Bar (if context available) */}
                {signalContext && (
                  <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Data Completeness</span>
                      <span className="text-sm font-bold">{signalContext.dataCompleteness}%</span>
                    </div>
                    <Progress value={signalContext.dataCompleteness} className="h-2 mb-3" />
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-emerald-600">{signalContext.priorityMatch.length}</div>
                        <div className="text-[10px] text-muted-foreground leading-tight">Relevant</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">{signalContext.available.length}</div>
                        <div className="text-[10px] text-muted-foreground leading-tight">Other</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-muted-foreground">{signalContext.requestedMissing.length}</div>
                        <div className="text-[10px] text-muted-foreground leading-tight">Missing Data</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* RELEVANT SIGNALS - User asked for it AND data supports it */}
                {signalContext && signalContext.priorityMatch.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium">Relevant Signals ({signalContext.priorityMatch.length})</span>
                      <span className="text-xs text-muted-foreground ml-auto">Matches your goals and data</span>
                    </div>
                    <div className="space-y-2">
                      {signalContext.priorityMatch.map((cs) => (
                        <div
                          key={cs.signal.signalId}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                            selectedSignals.has(cs.signal.signalId)
                              ? "bg-emerald-500/10 border border-emerald-500/30"
                              : "bg-muted/50 hover:bg-muted"
                          )}
                        >
                          <Checkbox
                            checked={selectedSignals.has(cs.signal.signalId)}
                            onCheckedChange={() => toggleSignal(cs.signal.signalId)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{cs.signal.signalName}</span>
                              <Badge variant="outline" className="text-[10px]">{cs.signal.category}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{cs.reason || cs.signal.description}</p>
                            <p className="text-xs text-emerald-600 mt-1">
                              {'Matched: ' + cs.matchedFields.join(", ")}
                            </p>
                          </div>
                          {(cs.dataGuidance || cs.missingFields.length > 0) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                toggleGuidance(cs.signal.signalId)
                              }}
                              className={cn(
                                "shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors",
                                expandedGuidance.has(cs.signal.signalId)
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
                              )}
                            >
                              <Lightbulb className="h-3 w-3" />
                              How
                              {expandedGuidance.has(cs.signal.signalId) ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* OTHER SIGNALS - Data supports it, user didn't explicitly ask */}
                {signalContext && signalContext.available.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Other Signals ({signalContext.available.length})</span>
                      <span className="text-xs text-muted-foreground ml-auto">Your data supports these</span>
                    </div>
                    <div className="space-y-2">
                      {signalContext.available.map((cs) => (
                        <div
                          key={cs.signal.signalId}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                            selectedSignals.has(cs.signal.signalId)
                              ? "bg-blue-500/10 border border-blue-500/30"
                              : "bg-muted/50 hover:bg-muted"
                          )}
                        >
                          <Checkbox
                            checked={selectedSignals.has(cs.signal.signalId)}
                            onCheckedChange={() => toggleSignal(cs.signal.signalId)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{cs.signal.signalName}</span>
                              <Badge variant="outline" className="text-[10px]">{cs.signal.category}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{cs.reason || cs.signal.description}</p>
                            <p className="text-xs text-emerald-600 mt-1">
                              {'Matched: ' + cs.matchedFields.join(", ")}
                            </p>
                          </div>
                          {(cs.dataGuidance || cs.missingFields.length > 0) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                toggleGuidance(cs.signal.signalId)
                              }}
                              className={cn(
                                "shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors",
                                expandedGuidance.has(cs.signal.signalId)
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
                              )}
                            >
                              <Lightbulb className="h-3 w-3" />
                              How
                              {expandedGuidance.has(cs.signal.signalId) ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </button>
                          )}
                        </div>
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
                        <div
                          key={cs.signal.signalId}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                            "bg-muted/50 hover:bg-muted"
                          )}
                        >
                          <Checkbox
                            checked={false}
                            disabled
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{cs.signal.signalName}</span>
                              <Badge variant="outline" className="text-[10px]">{cs.signal.category}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{cs.reason || cs.signal.description}</p>
                            <p className="text-xs text-amber-600 mt-1">
                              {'Missing: ' + cs.missingFields.join(", ")}
                            </p>
                          </div>
                          {(cs.dataGuidance || cs.missingFields.length > 0) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                toggleGuidance(cs.signal.signalId)
                              }}
                              className={cn(
                                "shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors",
                                expandedGuidance.has(cs.signal.signalId)
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
                              )}
                            >
                              <Lightbulb className="h-3 w-3" />
                              How
                              {expandedGuidance.has(cs.signal.signalId) ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </button>
                          )}
                        </div>
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
                        <div
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
                              <Badge variant="outline" className="text-[10px]">{ds.signal.category}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{ds.signal.description}</p>
                            <p className="text-xs text-emerald-600 mt-1">
                              {'Matched: ' + ds.matchedFields.join(", ")}
                            </p>
                          </div>
                          {(ds.dataGuidance || ds.missingFields.length > 0) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                toggleGuidance(ds.signal.signalId)
                              }}
                              className={cn(
                                "shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors",
                                expandedGuidance.has(ds.signal.signalId)
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
                              )}
                            >
                              <Lightbulb className="h-3 w-3" />
                              How
                              {expandedGuidance.has(ds.signal.signalId) ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </button>
                          )}
                        </div>
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
                  Calculating {selectedSignals.size} signal{selectedSignals.size !== 1 ? "s" : ""} from {files.length} file{files.length !== 1 ? "s" : ""}
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
                  {result.signalsCreated} signal{result.signalsCreated !== 1 ? "s" : ""} from {files.length} file{files.length !== 1 ? "s" : ""} ready to view
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

// ============================================
// DataGuidancePanel - Shows how to get missing data
// ============================================

function DataGuidancePanel({
  guidance,
  missingFields,
}: {
  guidance: DataGuidance
  missingFields: string[]
}) {
  const difficultyColors: Record<string, string> = {
    easy: "text-emerald-600 bg-emerald-500/10",
    moderate: "text-amber-600 bg-amber-500/10",
    advanced: "text-red-600 bg-red-500/10",
  }

  return (
    <div className="px-3 pb-3 pt-0">
      <div className="rounded-lg bg-background border border-border p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold">How to get this data</span>
          <Badge
            variant="secondary"
            className={cn("text-[10px]", difficultyColors[guidance.difficulty] || "")}
          >
            {guidance.difficulty}
          </Badge>
        </div>

        {/* Summary */}
        <p className="text-xs text-muted-foreground mb-3">{guidance.summary}</p>

        {/* Data Source */}
        <div className="flex items-center gap-2 mb-3">
          <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-xs font-medium">{guidance.dataSource}</span>
        </div>

        {/* Export Steps */}
        {guidance.exportSteps.length > 0 && (
          <div className="mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Steps</span>
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

        {/* Expected Columns */}
        {guidance.exampleColumns.length > 0 && (
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Expected columns</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {guidance.exampleColumns.map((col) => (
                <code
                  key={col}
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-mono",
                    missingFields.some((mf) => col.toLowerCase().includes(mf.toLowerCase()))
                      ? "bg-amber-500/10 text-amber-700 border border-amber-500/30"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {col}
                </code>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
