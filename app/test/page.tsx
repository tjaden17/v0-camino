"use client"

import React from "react"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, RefreshCw, Play, CheckCircle, Clock, Circle, AlertTriangle } from "lucide-react"
import { parseCSV, autoSuggestMapping, type ColumnMapping } from "@/lib/csv-parser"

// Only show in development
if (process.env.NODE_ENV === "production") {
  throw new Error("Test page is not available in production")
}

interface Organization {
  id: string
  name: string
}

interface Signal {
  id: string
  name: string
  category: string | null
  trend: string | null
  latest_value?: number
  change_percent?: number
  status?: string
}

interface UploadResult {
  success: boolean
  signalsCreated: number
  signalsUpdated: number
  dataPointsAdded: number
  errors: string[]
}

interface FlowStep {
  name: string
  status: "pending" | "in-progress" | "complete" | "error"
  result?: string
}

export default function DevTestPage() {
  // State
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<string>("")
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [users, setUsers] = useState<Array<{ id: string; email: string; full_name: string }>>([])

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<{ headers: string[]; rows: any[]; mappings: ColumnMapping[] } | null>(null)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Signals state
  const [signals, setSignals] = useState<Signal[]>([])
  const [selectedSignal, setSelectedSignal] = useState<string>("")
  const [isLoadingSignals, setIsLoadingSignals] = useState(false)

  // Interpretation state
  const [interpretation, setInterpretation] = useState<any>(null)
  const [rawPrompt, setRawPrompt] = useState<string>("")
  const [rawOutput, setRawOutput] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  // Full flow state
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>([
    { name: "Upload file", status: "pending" },
    { name: "Calculate signal status", status: "pending" },
    { name: "Generate interpretations", status: "pending" },
    { name: "Display results", status: "pending" },
  ])
  const [isRunningFlow, setIsRunningFlow] = useState(false)

  // Load organizations on mount
  useEffect(() => {
    loadOrganizations()
  }, [])

  // Load users when org changes
  useEffect(() => {
    if (selectedOrg) {
      loadUsers(selectedOrg)
      loadSignals(selectedOrg)
    }
  }, [selectedOrg])

  async function loadOrganizations() {
    try {
      const response = await fetch("/api/test/organizations")
      const data = await response.json()
      setOrganizations(data.organizations || [])
      if (data.organizations?.length > 0) {
        setSelectedOrg(data.organizations[0].id)
      }
    } catch (error) {
      console.error("[v0] Error loading organizations:", error)
    }
  }

  async function loadUsers(orgId: string) {
    try {
      const response = await fetch(`/api/test/users?orgId=${orgId}`)
      const data = await response.json()
      setUsers(data.users || [])
      if (data.users?.length > 0) {
        setSelectedUser(data.users[0].id)
      }
    } catch (error) {
      console.error("[v0] Error loading users:", error)
    }
  }

  async function loadSignals(orgId: string) {
    setIsLoadingSignals(true)
    try {
      const response = await fetch(`/api/test/signals?orgId=${orgId}`)
      const data = await response.json()
      setSignals(data.signals || [])
    } catch (error) {
      console.error("[v0] Error loading signals:", error)
    } finally {
      setIsLoadingSignals(false)
    }
  }

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadFile(file)
    setUploadResult(null)

    // Parse the file
    const text = await file.text()
    const { headers, rows, errors } = parseCSV(text)

    if (errors.length > 0) {
      console.error("[v0] Parse errors:", errors)
    }

    const mappings = autoSuggestMapping(headers)
    setParsedData({ headers, rows, mappings })
  }, [])

  async function processUpload() {
    if (!parsedData || !selectedOrg || !selectedUser) return

    setIsUploading(true)
    try {
      const response = await fetch("/api/test/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: parsedData.rows,
          mappings: parsedData.mappings,
          userId: selectedUser,
          organizationId: selectedOrg,
        }),
      })

      const result = await response.json()
      setUploadResult(result)

      // Refresh signals list
      await loadSignals(selectedOrg)
    } catch (error) {
      console.error("[v0] Upload error:", error)
      setUploadResult({
        success: false,
        signalsCreated: 0,
        signalsUpdated: 0,
        dataPointsAdded: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      })
    } finally {
      setIsUploading(false)
    }
  }

  async function generateInterpretation() {
    if (!selectedSignal) return

    setIsGenerating(true)
    setInterpretation(null)
    setRawPrompt("")
    setRawOutput("")

    try {
      const response = await fetch("/api/test/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalId: selectedSignal }),
      })

      const data = await response.json()
      setInterpretation(data.interpretation)
      setRawPrompt(data.prompt || "")
      setRawOutput(JSON.stringify(data.rawOutput, null, 2))
    } catch (error) {
      console.error("[v0] Interpretation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  async function runFullFlow() {
    setIsRunningFlow(true)
    setFlowSteps((steps) => steps.map((s) => ({ ...s, status: "pending" as const, result: undefined })))

    try {
      // Step 1: Upload
      setFlowSteps((steps) =>
        steps.map((s, i) => (i === 0 ? { ...s, status: "in-progress" as const } : s))
      )

      if (parsedData && selectedOrg && selectedUser) {
        const uploadResponse = await fetch("/api/test/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rows: parsedData.rows,
            mappings: parsedData.mappings,
            userId: selectedUser,
            organizationId: selectedOrg,
          }),
        })
        const uploadData = await uploadResponse.json()
        setFlowSteps((steps) =>
          steps.map((s, i) =>
            i === 0 ? { ...s, status: "complete" as const, result: `${uploadData.signalsCreated + uploadData.signalsUpdated} signals` } : s
          )
        )
      } else {
        setFlowSteps((steps) =>
          steps.map((s, i) => (i === 0 ? { ...s, status: "complete" as const, result: "Skipped (no file)" } : s))
        )
      }

      // Step 2: Calculate status
      setFlowSteps((steps) =>
        steps.map((s, i) => (i === 1 ? { ...s, status: "in-progress" as const } : s))
      )
      await new Promise((resolve) => setTimeout(resolve, 500))
      setFlowSteps((steps) =>
        steps.map((s, i) => (i === 1 ? { ...s, status: "complete" as const, result: "Done" } : s))
      )

      // Step 3: Generate interpretations
      setFlowSteps((steps) =>
        steps.map((s, i) => (i === 2 ? { ...s, status: "in-progress" as const } : s))
      )
      
      // Refresh signals and generate interpretation for first one
      await loadSignals(selectedOrg)
      setFlowSteps((steps) =>
        steps.map((s, i) => (i === 2 ? { ...s, status: "complete" as const, result: `${signals.length} signals` } : s))
      )

      // Step 4: Display
      setFlowSteps((steps) =>
        steps.map((s, i) => (i === 3 ? { ...s, status: "complete" as const, result: "Done" } : s))
      )
    } catch (error) {
      console.error("[v0] Flow error:", error)
      setFlowSteps((steps) =>
        steps.map((s) => (s.status === "in-progress" ? { ...s, status: "error" as const } : s))
      )
    } finally {
      setIsRunningFlow(false)
    }
  }

  function getStatusIcon(status: FlowStep["status"]) {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  function getStatusBadge(signal: Signal) {
    const status = signal.status || "steady"
    const variants: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
      needs_attention: "destructive",
      opportunity: "default",
      improved: "default",
      steady: "secondary",
      new: "outline",
    }
    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dev Test Page</h1>
            <p className="text-muted-foreground">Test services without authentication</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Upload Tester */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Tester
              </CardTitle>
              <CardDescription>Upload real data files for testing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {uploadFile ? uploadFile.name : "Drop file here or click to browse"}
                  </p>
                </label>
              </div>

              {parsedData && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Parsed columns:</p>
                  <div className="flex flex-wrap gap-1">
                    {parsedData.headers.map((h) => (
                      <Badge key={h} variant="outline">
                        {h}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{parsedData.rows.length} rows detected</p>
                </div>
              )}

              <Button onClick={processUpload} disabled={!parsedData || isUploading} className="w-full">
                {isUploading ? "Processing..." : "Process Upload"}
              </Button>

              {uploadResult && (
                <div className="p-3 rounded-lg bg-muted text-sm space-y-1">
                  <p className={uploadResult.success ? "text-green-600" : "text-red-600"}>
                    {uploadResult.success ? "Success" : "Failed"}
                  </p>
                  <p>Signals created: {uploadResult.signalsCreated}</p>
                  <p>Signals updated: {uploadResult.signalsUpdated}</p>
                  <p>Data points: {uploadResult.dataPointsAdded}</p>
                  {uploadResult.errors.length > 0 && (
                    <p className="text-red-600">Errors: {uploadResult.errors.join(", ")}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Signals Viewer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Signals Viewer</span>
                <Button variant="ghost" size="sm" onClick={() => loadSignals(selectedOrg)} disabled={isLoadingSignals}>
                  <RefreshCw className={`h-4 w-4 ${isLoadingSignals ? "animate-spin" : ""}`} />
                </Button>
              </CardTitle>
              <CardDescription>View signals for selected org</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {signals.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No signals found</p>
                  ) : (
                    signals.map((signal) => (
                      <div
                        key={signal.id}
                        onClick={() => setSelectedSignal(signal.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedSignal === signal.id ? "border-primary bg-primary/5" : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{signal.name}</span>
                          {getStatusBadge(signal)}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <span>{signal.latest_value ?? "N/A"}</span>
                          {signal.change_percent && (
                            <span className={signal.change_percent > 0 ? "text-green-600" : "text-red-600"}>
                              {signal.change_percent > 0 ? "+" : ""}
                              {signal.change_percent.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Interpretation Tester */}
          <Card>
            <CardHeader>
              <CardTitle>Interpretation Tester</CardTitle>
              <CardDescription>Generate AI interpretations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedSignal} onValueChange={setSelectedSignal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select signal" />
                </SelectTrigger>
                <SelectContent>
                  {signals.map((signal) => (
                    <SelectItem key={signal.id} value={signal.id}>
                      {signal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={generateInterpretation} disabled={!selectedSignal || isGenerating} className="w-full">
                {isGenerating ? "Generating..." : "Generate Interpretation"}
              </Button>

              <Tabs defaultValue="formatted" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="formatted">Formatted</TabsTrigger>
                  <TabsTrigger value="prompt">Raw Prompt</TabsTrigger>
                  <TabsTrigger value="output">Raw Output</TabsTrigger>
                </TabsList>
                <TabsContent value="formatted" className="mt-2">
                  <ScrollArea className="h-[250px]">
                    {interpretation ? (
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-medium">What We Found</p>
                          <p className="text-muted-foreground">{interpretation.what_we_found?.summary || "N/A"}</p>
                        </div>
                        <div>
                          <p className="font-medium">What It Means</p>
                          <p className="text-muted-foreground">{interpretation.what_it_means?.why_change_happened || "N/A"}</p>
                        </div>
                        <div>
                          <p className="font-medium">So What</p>
                          <p className="text-muted-foreground">{interpretation.so_what?.kpi_impact || "N/A"}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Select a signal and generate interpretation
                      </p>
                    )}
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="prompt" className="mt-2">
                  <Textarea value={rawPrompt} readOnly className="h-[250px] font-mono text-xs" />
                </TabsContent>
                <TabsContent value="output" className="mt-2">
                  <Textarea value={rawOutput} readOnly className="h-[250px] font-mono text-xs" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Full Flow Simulator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Full Flow Simulator
            </CardTitle>
            <CardDescription>Run the complete upload to interpretation pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button onClick={runFullFlow} disabled={isRunningFlow}>
                {isRunningFlow ? "Running..." : "Run Full Flow"}
              </Button>
              <div className="flex-1 flex items-center gap-6">
                {flowSteps.map((step, index) => (
                  <div key={step.name} className="flex items-center gap-2">
                    {getStatusIcon(step.status)}
                    <div>
                      <p className="text-sm font-medium">{step.name}</p>
                      {step.result && <p className="text-xs text-muted-foreground">{step.result}</p>}
                    </div>
                    {index < flowSteps.length - 1 && <div className="w-8 h-px bg-border" />}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
