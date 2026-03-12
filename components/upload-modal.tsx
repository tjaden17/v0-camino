"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X, ArrowRight, Check, TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SIGNAL_FIELDS, type ColumnMapping } from "@/lib/csv-parser"
import { useToast } from "@/hooks/use-toast"
import { SignalDiscoveryPanel } from "@/components/signal-discovery-panel"
import type { SignalDiscoveryResult } from "@/lib/signal-discovery-service"

interface UploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete?: () => void
  isMasterAdmin?: boolean
  preselectedOrgId?: string
  availableOrgs?: Array<{ id: string; name: string }>
}

export function UploadModal({
  open,
  onOpenChange,
  onUploadComplete,
  isMasterAdmin = false,
  preselectedOrgId,
  availableOrgs = [],
}: UploadModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<"upload" | "discovery" | "mapping" | "preview" | "processing" | "complete">("upload")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any>(null)
  const [mappings, setMappings] = useState<ColumnMapping[]>([])
  const [result, setResult] = useState<any>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const [selectedOrgId, setSelectedOrgId] = useState<string | undefined>(preselectedOrgId)
  const [uploadMode, setUploadMode] = useState<"general" | "zoho-desk">("general")
  const [discoveryResult, setDiscoveryResult] = useState<SignalDiscoveryResult | null>(null)
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [signalPreview, setSignalPreview] = useState<Array<{
    id: string
    name: string
    value: number | null
    change: number | null
    trend: string | null
    isNew: boolean
  }>>([])
  const [isLoadingSignals, setIsLoadingSignals] = useState(false)
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState<number | null>(null)

  const fetchSignalPreview = async (createdIds: string[] = []) => {
    setIsLoadingSignals(true)
    try {
      const response = await fetch("/api/signals")
      if (response.ok) {
        const data = await response.json()
        const signals = data.signals || data || []
        
        // Sort to show newest/changed signals first
        const sortedSignals = signals
          .map((s: any) => {
            // Calculate change from data_points if available
            let changePercent = null
            if (s.data_points && s.data_points.length >= 2) {
              const sorted = [...s.data_points].sort((a: any, b: any) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              const latest = sorted[0]?.value
              const previous = sorted[1]?.value
              if (latest !== null && previous !== null && previous !== 0) {
                changePercent = ((latest - previous) / previous) * 100
              }
            }
            
            return {
              id: s.id,
              name: s.name,
              value: s.current_value || s.latest_value,
              change: changePercent,
              trend: s.trend,
              isNew: createdIds.includes(s.id) || (s.created_at && new Date(s.created_at) > new Date(Date.now() - 60000))
            }
          })
          .sort((a: any, b: any) => {
            // New signals first, then by absolute change
            if (a.isNew && !b.isNew) return -1
            if (!a.isNew && b.isNew) return 1
            return Math.abs(b.change || 0) - Math.abs(a.change || 0)
          })
          .slice(0, 6) // Show top 6
        setSignalPreview(sortedSignals)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch signal preview:", error)
    } finally {
      setIsLoadingSignals(false)
    }
  }

  const startAutoRedirect = () => {
    setAutoRedirectCountdown(5)
    const interval = setInterval(() => {
      setAutoRedirectCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          // Store timestamp in sessionStorage to highlight new signals
          sessionStorage.setItem("signalsUploadTimestamp", Date.now().toString())
          router.push("/signals")
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

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
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = async (selectedFile: File) => {
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith(".csv")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or Excel file",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    setErrors([])
    setWarnings([])

    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const apiEndpoint = uploadMode === "zoho-desk" ? "/api/upload/zoho-desk" : "/api/upload"
      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = "Failed to upload file"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If JSON parsing fails, use the response text
          const errorText = await response.text()
          errorMessage = errorText || errorMessage
        }
        console.error("[v0] Upload error:", errorMessage)
        setErrors([errorMessage])
        return
      }

      const data = await response.json()

      console.log("[v0] Upload response:", data)

      if (data.success && data.preview) {
        setPreview(data.preview)
        setMappings(data.preview.suggestedMappings)

        const rowsForDiscovery = data.preview.rows || data.preview.sampleRows
        if (rowsForDiscovery && rowsForDiscovery.length > 0) {
          await discoverSignalsFromData(rowsForDiscovery, selectedFile.name)
        } else {
          console.log("[v0] No rows available for signal discovery, skipping to mapping")
          setStep("mapping")
        }
      } else {
        setErrors(data.errors || ["Failed to parse file"])
      }
    } catch (error) {
      console.error("[v0] Upload preview error:", error)
      setErrors([`Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`])
    }
  }

  const discoverSignalsFromData = async (rows: any[], fileName: string) => {
    setIsDiscovering(true)
    console.log("[v0] Starting signal discovery for", fileName, "with", rows.length, "rows")

    try {
      const response = await fetch("/api/upload/discover-signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: rows,
          dataSourceName: fileName,
        }),
      })

      const discovery = await response.json()
      console.log("[v0] Signal discovery result:", discovery)

      if (discovery.detectedColumns && discovery.detectedColumns.length > 0) {
        setDiscoveryResult(discovery)
        setStep("discovery")

        toast({
          title: "Signal discovery complete",
          description: `Found ${discovery.availableSignals.length} available signals from your data`,
        })
      } else {
        console.log("[v0] No signals discovered, proceeding to mapping")
        setStep("mapping")
      }
    } catch (error) {
      console.error("[v0] Signal discovery error:", error)
      toast({
        title: "Discovery skipped",
        description: "Proceeding to manual mapping",
        variant: "default",
      })
      setStep("mapping")
    } finally {
      setIsDiscovering(false)
    }
  }

  const handleMappingChange = (csvColumn: string, signalField: string) => {
    setMappings((prev) =>
      prev.map((m) =>
        m.csvColumn === csvColumn ? { ...m, signalField: signalField as ColumnMapping["signalField"] } : m,
      ),
    )
  }

  const handlePreview = () => {
    const hasName = mappings.some((m) => m.signalField === "name")
    const hasValue = mappings.some((m) => m.signalField === "value")

    if (!hasName || !hasValue) {
      setErrors(['Required fields "Signal Name" and "Current Value" must be mapped'])
      return
    }

    setErrors([])
    setStep("preview")
  }

  const handleImport = async () => {
    if (!file) return

    if (isMasterAdmin && !selectedOrgId) {
      toast({
        title: "Organization required",
        description: "Please select an organization for this data upload",
        variant: "destructive",
      })
      return
    }

    setStep("processing")
    setErrors([])
    setWarnings([])

    const formData = new FormData()
    formData.append("file", file)
    formData.append("mappings", JSON.stringify(mappings))
    formData.append("useDualPath", selectedOrgId ? "true" : "false")
    if (selectedOrgId) {
      formData.append("organizationId", selectedOrgId)
    }

    try {
      const apiEndpoint = uploadMode === "zoho-desk" ? "/api/upload/zoho-desk" : "/api/upload"
      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (uploadMode === "zoho-desk" && data.success) {
        setResult(data)
        setStep("complete")

        toast({
          title: "Support tickets processed",
          description: `Processed ${data.ticketsProcessed} tickets, generated ${data.kpisGenerated} KPIs`,
        })

        onUploadComplete?.()
        await fetchSignalPreview()
        startAutoRedirect()
        return
      }

      if (data.batchMode && data.rows) {
        await processBatches(data.rows, mappings)
        return
      }

      if (data.success) {
        setResult(data)
        setWarnings(data.warnings || [])
        setStep("complete")

        if (data.dualPath) {
          toast({
            title: "Data uploaded successfully",
            description: `Created ${data.signalsCreated} signals with ${data.columnsPreserved?.length || 0} columns preserved for future analysis`,
          })
        } else {
          toast({
            title: "Import successful",
            description: `Created ${data.signalsCreated} signals, updated ${data.signalsUpdated} signals`,
          })
        }

        onUploadComplete?.()
        await fetchSignalPreview(data.createdSignalIds || [])
        startAutoRedirect()
      } else {
        setErrors(data.errors || ["Import failed"])
        setStep("mapping")
      }
    } catch (error) {
      console.error("[v0] Import error:", error)
      setErrors(["Import failed. Please try again."])
      setStep("mapping")
    }
  }

  const processBatches = async (rows: any[], mappings: ColumnMapping[]) => {
    const BATCH_SIZE = 50
    const totalBatches = Math.ceil(rows.length / BATCH_SIZE)

    let totalCreated = 0
    let totalUpdated = 0
    let totalDataPoints = 0
    const allErrors: string[] = []
    const allWarnings: string[] = []

    for (let i = 0; i < totalBatches; i++) {
      const start = i * BATCH_SIZE
      const end = Math.min((i + 1) * BATCH_SIZE, rows.length)
      const batch = rows.slice(start, end)

      try {
        const response = await fetch("/api/upload/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rows: batch,
            mappings,
            batchNumber: i + 1,
            totalBatches,
            organizationId: selectedOrgId,
          }),
        })

        const batchResult = await response.json()

        if (batchResult.success) {
          totalCreated += batchResult.signalsCreated || 0
          totalUpdated += batchResult.signalsUpdated || 0
          totalDataPoints += batchResult.dataPointsAdded || 0
          if (batchResult.errors) allErrors.push(...batchResult.errors)
          if (batchResult.warnings) allWarnings.push(...batchResult.warnings)
        } else {
          allErrors.push(`Batch ${i + 1} failed: ${batchResult.error}`)
        }
      } catch (error) {
        console.error(`[v0] Batch ${i + 1} error:`, error)
        allErrors.push(`Batch ${i + 1} failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    const finalResult = {
      signalsCreated: totalCreated,
      signalsUpdated: totalUpdated,
      dataPointsAdded: totalDataPoints,
    }

    setResult(finalResult)
    setErrors(allErrors)
    setWarnings(allWarnings)
    setStep("complete")

    toast({
      title: "Import complete",
      description: `Created ${totalCreated} signals, updated ${totalUpdated} signals`,
    })

    onUploadComplete?.()
    await fetchSignalPreview()
    startAutoRedirect()
  }

  const handleClose = () => {
    setStep("upload")
    setFile(null)
    setPreview(null)
    setMappings([])
    setResult(null)
    setErrors([])
    setWarnings([])
    setDiscoveryResult(null)
    setIsDiscovering(false)
    setSignalPreview([])
    setIsLoadingSignals(false)
    setAutoRedirectCountdown(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Data from CSV</DialogTitle>
          <DialogDescription>
            {uploadMode === "zoho-desk"
              ? "Upload Zoho Desk support tickets to generate customer support KPIs"
              : "Upload your Zoho CRM, Zoho Desk, or other business data to generate signals and insights"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={`flex items-center gap-2 ${step === "upload" ? "text-primary" : "text-muted-foreground"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === "upload" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              1
            </div>
            <span className="text-sm font-medium">Upload</span>
          </div>
          <div className="w-8 h-0.5 bg-border" />
          <div className={`flex items-center gap-2 ${step === "discovery" ? "text-primary" : "text-muted-foreground"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === "discovery" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              2
            </div>
            <span className="text-sm font-medium">Discover</span>
          </div>
          <div className="w-8 h-0.5 bg-border" />
          <div
            className={`flex items-center gap-2 ${step === "mapping" || step === "preview" ? "text-primary" : "text-muted-foreground"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === "mapping" || step === "preview" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              3
            </div>
            <span className="text-sm font-medium">Import</span>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3">Data Type</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUploadMode("general")}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                uploadMode === "general" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="font-medium">General Data</div>
              <div className="text-xs text-muted-foreground mt-1">CRM, sales, or custom metrics</div>
            </button>
            <button
              type="button"
              onClick={() => setUploadMode("zoho-desk")}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                uploadMode === "zoho-desk" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="font-medium">Support Tickets</div>
              <div className="text-xs text-muted-foreground mt-1">Zoho Desk tickets (auto-generate KPIs)</div>
            </button>
          </div>
        </div>

        {isMasterAdmin && availableOrgs.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Select Organization</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Choose which organization this data belongs to
            </p>
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
          </div>
        )}

        {step === "upload" && (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-border"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Drop your file here</h3>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={async (event) => {
                  const selectedFile = event.target.files?.[0]
                  if (!selectedFile) return

                  const validTypes = [
                    "text/csv",
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  ]

                  if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith(".csv")) {
                    toast({
                      title: "Invalid file type",
                      description: "Please upload a CSV or Excel file",
                      variant: "destructive",
                    })
                    return
                  }

                  setFile(selectedFile)
                  setErrors([])
                  setWarnings([])

                  const formData = new FormData()
                  formData.append("file", selectedFile)

                  try {
                    const apiEndpoint = uploadMode === "zoho-desk" ? "/api/upload/zoho-desk" : "/api/upload"
                    const response = await fetch(apiEndpoint, {
                      method: "POST",
                      body: formData,
                    })

                    if (!response.ok) {
                      let errorMessage = "Failed to upload file"
                      try {
                        const errorData = await response.json()
                        errorMessage = errorData.error || errorMessage
                      } catch {
                        // If JSON parsing fails, use the response text
                        const errorText = await response.text()
                        errorMessage = errorText || errorMessage
                      }
                      console.error("[v0] Upload error:", errorMessage)
                      setErrors([errorMessage])
                      return
                    }

                    const data = await response.json()

                    console.log("[v0] Upload response:", data)

                    if (data.success && data.preview) {
                      setPreview(data.preview)
                      setMappings(data.preview.suggestedMappings)

                      const rowsForDiscovery = data.preview.rows || data.preview.sampleRows
                      if (rowsForDiscovery && rowsForDiscovery.length > 0) {
                        await discoverSignalsFromData(rowsForDiscovery, selectedFile.name)
                      } else {
                        console.log("[v0] No rows available for signal discovery, skipping to mapping")
                        setStep("mapping")
                      }
                    } else {
                      setErrors(data.errors || ["Failed to parse file"])
                    }
                  } catch (error) {
                    console.error("[v0] Upload preview error:", error)
                    setErrors([`Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`])
                  }
                }}
              />
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <span className="text-sm flex-1">{file.name}</span>
                <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-sm">CSV Format Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                {uploadMode === "zoho-desk" ? (
                  <>
                    <li>Export tickets from Zoho Desk as CSV</li>
                    <li>Include columns: Status, Created Date, Closed Date</li>
                    <li>Optional: Priority, Assignee, Subject, Category</li>
                    <li>System will auto-generate support KPIs from your tickets</li>
                  </>
                ) : (
                  <>
                    <li>First row must contain column headers</li>
                    <li>Required: Signal Name and Current Value columns</li>
                    <li>Optional: Date, Benchmark, Owner, Category, Trend</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}

        {step === "discovery" && discoveryResult && (
          <div className="space-y-4">
            <SignalDiscoveryPanel
              discoveryResult={discoveryResult}
              onGenerateSignals={(signals) => {
                toast({
                  title: "Signals selected",
                  description: `Ready to generate ${signals.length} signals`,
                })
              }}
            />

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={() => setStep("mapping")} className="flex-1">
                Continue to Mapping →
              </Button>
            </div>
          </div>
        )}

        {step === "mapping" && preview && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  2
                </span>
                Map Your Columns
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Tell us which column contains which information. We've suggested mappings based on your column names.
              </p>
              <div className="flex items-center gap-2 text-sm">
                {["name", "value"].map((requiredField) => {
                  const isMapped = mappings.some((m) => m.signalField === requiredField)
                  const field = SIGNAL_FIELDS.find((f) => f.key === requiredField)
                  return (
                    <div
                      key={requiredField}
                      className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium ${
                        isMapped
                          ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300"
                          : "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {isMapped ? (
                        <Check className="h-4 w-4 inline mr-1" />
                      ) : (
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                      )}
                      {field?.label}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-3 bg-muted/30">
              {mappings.map((mapping) => {
                const field = SIGNAL_FIELDS.find((f) => f.key === mapping.signalField)
                const isRequired = field?.required
                const isMapped = mapping.signalField !== "skip"

                return (
                  <div key={mapping.csvColumn} className="bg-background rounded-lg p-3 border">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-2 h-2 rounded-full ${isRequired && !isMapped ? "bg-red-500" : isMapped ? "bg-green-500" : "bg-gray-300"}`}
                          ></div>
                          <span className="font-semibold text-sm">{mapping.csvColumn}</span>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                          Sample: {preview.sampleRows[0]?.[mapping.csvColumn] || "No data"}
                        </div>
                      </div>

                      <ArrowRight className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />

                      <Select
                        value={mapping.signalField}
                        onValueChange={(value) => handleMappingChange(mapping.csvColumn, value)}
                      >
                        <SelectTrigger className="flex-1 min-w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="skip">
                            <span className="text-muted-foreground">Skip this column</span>
                          </SelectItem>
                          {SIGNAL_FIELDS.map((field) => (
                            <SelectItem key={field.key} value={field.key}>
                              <div className="flex items-center justify-between w-full">
                                <span>{field.label}</span>
                                {field.required && (
                                  <span className="text-red-500 ml-2 text-xs font-semibold">REQUIRED</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )
              })}
            </div>

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
              <strong>Tip:</strong> You can skip columns you don't need by selecting "Skip this column" from the
              dropdown.
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={handlePreview} className="flex-1">
                Continue to Preview →
              </Button>
            </div>
          </div>
        )}

        {step === "preview" && preview && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Preview Import</h3>
              <p className="text-sm text-muted-foreground">
                Review before importing {preview.totalRows} data rows. These will be aggregated into signals based on
                unique metrics.
              </p>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {mappings
                        .filter((m) => m.signalField !== "skip")
                        .map((m) => (
                          <th key={m.csvColumn} className="px-3 py-2 text-left font-semibold">
                            {SIGNAL_FIELDS.find((f) => f.key === m.signalField)?.label}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.sampleRows.map((row: any, i: number) => (
                      <tr key={i} className="border-t">
                        {mappings
                          .filter((m) => m.signalField !== "skip")
                          .map((m) => (
                            <td key={m.csvColumn} className="px-3 py-2">
                              {row[m.csvColumn]}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Showing first 5 rows. System will analyze all {preview.totalRows} rows and create/update signals for
                unique metrics found in the data.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("mapping")}>
                Back
              </Button>
              <Button onClick={handleImport} className="flex-1">
                Import Data
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="py-12 text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Importing data...</h3>
            <p className="text-sm text-muted-foreground">Processing {preview?.totalRows || 0} rows in batches</p>
            <p className="text-xs text-muted-foreground mt-2">This may take a few moments for large datasets</p>
          </div>
        )}

        {step === "complete" && result && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <h3 className="text-xl font-semibold mb-1">
                {uploadMode === "zoho-desk" ? "Support Tickets Processed!" : "Import Complete!"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {result.signalsCreated || 0} created, {result.signalsUpdated || 0} updated
              </p>
            </div>

            {/* Signal Preview - The key feature */}
            {isLoadingSignals ? (
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading your signals...</p>
              </div>
            ) : signalPreview.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm">Here's what we found</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {signalPreview.map((signal) => (
                    <div 
                      key={signal.id} 
                      className={`bg-card border rounded-lg p-3 ${signal.isNew ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            {signal.isNew && (
                              <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">NEW</span>
                            )}
                            <p className="text-xs font-medium text-muted-foreground truncate">{signal.name}</p>
                          </div>
                          <p className="text-lg font-bold mt-0.5">
                            {signal.value !== null ? signal.value.toLocaleString() : '-'}
                          </p>
                        </div>
                        {signal.change !== null && signal.change !== 0 && (
                          <div className={`flex items-center gap-0.5 text-xs font-medium ${
                            signal.change > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {signal.change > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {Math.abs(signal.change).toFixed(1)}%
                          </div>
                        )}
                        {(signal.change === null || signal.change === 0) && signal.trend === 'stable' && (
                          <Minus className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Auto-redirect countdown */}
            {autoRedirectCountdown !== null && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
                <p className="text-sm">
                  Taking you to your signals in <span className="font-bold">{autoRedirectCountdown}</span>s...
                </p>
              </div>
            )}

            {warnings.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-1">Warnings</div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {warnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-1">Some signals failed to import</div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                Stay Here
              </Button>
              <Button 
                onClick={() => {
                  sessionStorage.setItem("signalsUploadTimestamp", Date.now().toString())
                  router.push("/signals")
                }} 
                className="flex-1"
              >
                Explore Signals
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
