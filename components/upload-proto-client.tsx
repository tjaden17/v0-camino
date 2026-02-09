"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
  Table2,
  Hash,
  Calendar,
  BarChart3,
  Users,
  Ticket,
  ShoppingCart,
  Activity,
  HelpCircle,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import * as XLSX from "xlsx"

// ============================================
// Types
// ============================================

/** What each row in this tab represents */
type RowType = "deals" | "leads" | "tickets" | "customers" | "events" | "agents" | "other"

interface TabData {
  name: string
  columns: string[]
  sampleRows: Record<string, string>[]
  rowCount: number
  /** Detected column types */
  columnTypes: Record<string, "text" | "number" | "date" | "id">
}

interface TabAnswers {
  rowType: RowType | null
  metricColumn: string | null // "none" for count-only
  dateColumn: string | null
}

interface ParsedFile {
  fileName: string
  tabs: TabData[]
}

interface GeneratedSignal {
  name: string
  description: string
  operation: string
  valueColumn: string | null
  dateColumn: string | null
  tab: string
  preview: string | number
}

// ============================================
// Row type metadata
// ============================================

const ROW_TYPE_OPTIONS: { value: RowType; label: string; description: string; icon: typeof Users }[] = [
  { value: "leads", label: "Leads / Contacts", description: "People who have shown interest", icon: Users },
  { value: "deals", label: "Deals / Opportunities", description: "Sales pipeline items with a value", icon: ShoppingCart },
  { value: "tickets", label: "Support Tickets", description: "Customer support requests", icon: Ticket },
  { value: "customers", label: "Customers / Accounts", description: "Business entities or accounts", icon: Users },
  { value: "events", label: "Events / Activities", description: "Things that happen (shifts, sessions, tasks)", icon: Activity },
  { value: "agents", label: "Team / Agents", description: "People on your team", icon: Users },
  { value: "other", label: "Something else", description: "Custom data", icon: HelpCircle },
]

// ============================================
// Helpers
// ============================================

function detectColumnType(values: string[]): "text" | "number" | "date" | "id" {
  const sample = values.filter(v => v && v.trim() !== "").slice(0, 20)
  if (sample.length === 0) return "text"

  // Check if it looks like dates
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/,       // 2025-01-01
    /^\d{1,2}\/\d{1,2}\/\d{2,4}/, // 01/01/2025 or 1/1/25
    /^\d{1,2}-\d{1,2}-\d{2,4}/, // 01-01-2025
  ]
  const dateCount = sample.filter(v => datePatterns.some(p => p.test(v.trim()))).length
  if (dateCount > sample.length * 0.6) return "date"

  // Check if it looks like numbers
  const numCount = sample.filter(v => {
    const cleaned = v.replace(/[$,\s%]/g, "")
    return !isNaN(Number(cleaned)) && cleaned !== ""
  }).length
  if (numCount > sample.length * 0.7) {
    // Check if it's IDs (all integers, very large, unique-ish)
    const allInts = sample.every(v => {
      const n = Number(v.replace(/[$,\s%]/g, ""))
      return Number.isInteger(n)
    })
    const uniqueRatio = new Set(sample).size / sample.length
    if (allInts && uniqueRatio > 0.9 && Number(sample[0].replace(/[$,\s%]/g, "")) > 100000) {
      return "id"
    }
    return "number"
  }

  return "text"
}

function inferRowType(tab: TabData): RowType | null {
  const name = tab.name.toLowerCase()
  const cols = tab.columns.map(c => c.toLowerCase()).join(" ")

  if (name.includes("ticket") || cols.includes("ticket") || cols.includes("sla")) return "tickets"
  if (name.includes("lead") || cols.includes("lead source") || cols.includes("lead status") || cols.includes("is converted")) return "leads"
  if (name.includes("deal") || name.includes("opportunit") || cols.includes("deal") || cols.includes("pipeline")) return "deals"
  if (name.includes("agent") || (cols.includes("first name") && cols.includes("status") && tab.rowCount < 50)) return "agents"
  if (name.includes("account") || name.includes("customer") || name.includes("contact")) return "customers"
  if (name.includes("event") || name.includes("shift") || name.includes("activity") || name.includes("session")) return "events"

  return null
}

function inferDateColumn(tab: TabData): string | null {
  // Prefer "Created Time" / "Created Date" first
  const priorities = ["created time", "created date", "create date", "date", "created_at"]
  for (const p of priorities) {
    const match = tab.columns.find(c => c.toLowerCase().includes(p))
    if (match && tab.columnTypes[match] === "date") return match
  }
  // Fall back to first date column
  const firstDate = tab.columns.find(c => tab.columnTypes[c] === "date")
  return firstDate || null
}

function inferMetricColumn(tab: TabData, rowType: RowType | null): string | null {
  if (rowType === "tickets" || rowType === "leads" || rowType === "agents" || rowType === "customers" || rowType === "events") {
    return "none" // Count-based by default
  }
  if (rowType === "deals") {
    const match = tab.columns.find(c => {
      const cl = c.toLowerCase()
      return cl.includes("amount") || cl.includes("value") || cl.includes("revenue") || cl.includes("price")
    })
    if (match && tab.columnTypes[match] === "number") return match
  }
  // Default: first numeric column that isn't an ID
  const firstNum = tab.columns.find(c => tab.columnTypes[c] === "number")
  return firstNum || "none"
}

function generateSignals(tab: TabData, answers: TabAnswers): GeneratedSignal[] {
  const signals: GeneratedSignal[] = []
  const { rowType, metricColumn, dateColumn } = answers
  if (!rowType) return signals

  const label = ROW_TYPE_OPTIONS.find(o => o.value === rowType)?.label || rowType

  // 1. Total count
  signals.push({
    name: `Total ${label}`,
    description: `Total number of ${label.toLowerCase()} in this dataset`,
    operation: "count",
    valueColumn: null,
    dateColumn,
    tab: tab.name,
    preview: tab.rowCount,
  })

  // 2. Monthly rate (if we have dates)
  if (dateColumn) {
    const dates = tab.sampleRows
      .map(r => new Date(r[dateColumn]))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime())

    if (dates.length >= 2) {
      const oldest = dates[0]
      const newest = dates[dates.length - 1]
      const months = Math.max(1,
        (newest.getFullYear() - oldest.getFullYear()) * 12 +
        (newest.getMonth() - oldest.getMonth()) + 1
      )
      const rate = Math.round((tab.rowCount / months) * 10) / 10
      signals.push({
        name: `${label} per Month`,
        description: `Average monthly rate of new ${label.toLowerCase()}`,
        operation: "monthly_rate",
        valueColumn: null,
        dateColumn,
        tab: tab.name,
        preview: rate,
      })
    }
  }

  // 3. Sum/Average of metric column (if not count-only)
  if (metricColumn && metricColumn !== "none") {
    const values = tab.sampleRows
      .map(r => Number(r[metricColumn]?.replace(/[$,\s%]/g, "")))
      .filter(v => !isNaN(v))

    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0)
      const avg = sum / values.length

      signals.push({
        name: `Total ${metricColumn}`,
        description: `Sum of ${metricColumn} across all ${label.toLowerCase()}`,
        operation: "sum",
        valueColumn: metricColumn,
        dateColumn,
        tab: tab.name,
        preview: Math.round(sum * 100) / 100,
      })
      signals.push({
        name: `Average ${metricColumn}`,
        description: `Average ${metricColumn} per ${label.toLowerCase().replace(/s$/, "")}`,
        operation: "average",
        valueColumn: metricColumn,
        dateColumn,
        tab: tab.name,
        preview: Math.round(avg * 100) / 100,
      })
    }
  }

  // 4. Group-by signals for text columns with low cardinality
  const textCols = tab.columns.filter(c =>
    tab.columnTypes[c] === "text" && c.toLowerCase() !== "id" && c.toLowerCase() !== "email"
  )
  for (const col of textCols) {
    const values = tab.sampleRows.map(r => (r[col] || "").trim()).filter(Boolean)
    const uniques = new Set(values)
    // Good group-by: 2-20 distinct values, and represents a meaningful breakdown
    const colLower = col.toLowerCase()
    const isGroupable = (uniques.size >= 2 && uniques.size <= 20) &&
      (colLower.includes("status") || colLower.includes("owner") || colLower.includes("channel") ||
       colLower.includes("priority") || colLower.includes("source") || colLower.includes("type") ||
       colLower.includes("category") || colLower.includes("stage") || colLower.includes("department") ||
       colLower.includes("group") || colLower.includes("tier") || colLower.includes("shift") ||
       colLower.includes("classification") || colLower.includes("is converted") || colLower.includes("sentiment") ||
       colLower.includes("layout"))

    if (isGroupable) {
      signals.push({
        name: `${label} by ${col}`,
        description: `Breakdown of ${label.toLowerCase()} grouped by ${col}`,
        operation: "group_by",
        valueColumn: null,
        dateColumn,
        tab: tab.name,
        preview: `${uniques.size} groups`,
      })
    }
  }

  return signals
}

// ============================================
// Tab Questionnaire Component
// ============================================

function TabQuestionnaire({
  tab,
  answers,
  onUpdateAnswers,
  isActive,
  onToggle,
}: {
  tab: TabData
  answers: TabAnswers
  onUpdateAnswers: (answers: Partial<TabAnswers>) => void
  isActive: boolean
  onToggle: () => void
}) {
  const inferredType = inferRowType(tab)
  const currentType = answers.rowType
  const numericCols = tab.columns.filter(c => tab.columnTypes[c] === "number")
  const dateCols = tab.columns.filter(c => tab.columnTypes[c] === "date")
  const isComplete = answers.rowType !== null && answers.dateColumn !== null && answers.metricColumn !== null

  const signals = isComplete ? generateSignals(tab, answers) : []

  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      isActive ? "border-primary/40 shadow-sm" : "border-border",
    )}>
      {/* Tab Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center h-8 w-8 rounded-md",
            isComplete ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground",
          )}>
            {isComplete ? <CheckCircle className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}
          </div>
          <div>
            <span className="font-semibold text-sm text-foreground">{tab.name}</span>
            <span className="text-xs text-muted-foreground ml-2">
              {tab.rowCount.toLocaleString()} rows, {tab.columns.length} columns
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isComplete && (
            <Badge variant="secondary" className="text-[10px]">
              {signals.length} signals
            </Badge>
          )}
          {inferredType && !answers.rowType && (
            <Badge className="text-[10px] bg-primary/10 text-primary border-0">
              Looks like {ROW_TYPE_OPTIONS.find(o => o.value === inferredType)?.label}
            </Badge>
          )}
          {isActive ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isActive && (
        <CardContent className="px-4 pb-4 pt-0 border-t border-border">
          {/* Column Preview */}
          <div className="flex flex-wrap gap-1.5 py-3 mb-3 border-b border-border">
            {tab.columns.slice(0, 12).map(col => (
              <Badge key={col} variant="outline" className="text-[10px] font-mono gap-1">
                {tab.columnTypes[col] === "number" && <Hash className="h-2.5 w-2.5" />}
                {tab.columnTypes[col] === "date" && <Calendar className="h-2.5 w-2.5" />}
                {tab.columnTypes[col] === "id" && <Hash className="h-2.5 w-2.5 text-muted-foreground" />}
                {col}
              </Badge>
            ))}
            {tab.columns.length > 12 && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                +{tab.columns.length - 12} more
              </Badge>
            )}
          </div>

          {/* Question 1: What does each row represent? */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                What does each row represent?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROW_TYPE_OPTIONS.map(opt => {
                  const Icon = opt.icon
                  const isSelected = currentType === opt.value
                  const isInferred = inferredType === opt.value && !currentType
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => {
                        onUpdateAnswers({
                          rowType: opt.value,
                          metricColumn: inferMetricColumn(tab, opt.value),
                          dateColumn: answers.dateColumn || inferDateColumn(tab),
                        })
                      }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 text-foreground"
                          : isInferred
                          ? "border-primary/30 bg-primary/5 text-foreground"
                          : "border-border hover:border-foreground/20 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-xs">{opt.label}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Question 2: Main metric column */}
            {currentType && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Which column is the main metric?
                </label>
                <Select
                  value={answers.metricColumn || "none"}
                  onValueChange={(v) => onUpdateAnswers({ metricColumn: v })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="flex items-center gap-2">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        No metric - just count rows
                      </span>
                    </SelectItem>
                    {numericCols.map(col => (
                      <SelectItem key={col} value={col}>
                        <span className="flex items-center gap-2">
                          <BarChart3 className="h-3 w-3 text-primary" />
                          {col}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {numericCols.length === 0
                    ? "No numeric columns found - signals will count rows."
                    : `${numericCols.length} numeric column${numericCols.length > 1 ? "s" : ""} available.`}
                </p>
              </div>
            )}

            {/* Question 3: Date column */}
            {currentType && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Which column is the date?
                </label>
                <Select
                  value={answers.dateColumn || "none"}
                  onValueChange={(v) => onUpdateAnswers({ dateColumn: v === "none" ? null : v })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        No date column
                      </span>
                    </SelectItem>
                    {dateCols.map(col => (
                      <SelectItem key={col} value={col}>
                        <span className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-primary" />
                          {col}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Generated Signals Preview */}
            {isComplete && signals.length > 0 && (
              <div className="mt-2 pt-3 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Signals that will be generated:
                </p>
                <div className="space-y-1.5">
                  {signals.map((sig, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-muted/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <BarChart3 className="h-3 w-3 text-primary shrink-0" />
                        <span className="text-xs font-medium text-foreground truncate">{sig.name}</span>
                        <Badge variant="outline" className="text-[9px] shrink-0">{sig.operation}</Badge>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground shrink-0 ml-2">
                        {sig.preview}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// ============================================
// Main Upload Proto Component
// ============================================

export function UploadProtoClient() {
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null)
  const [tabAnswers, setTabAnswers] = useState<Record<string, TabAnswers>>({})
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Parse uploaded file
  const handleFile = useCallback(async (file: File) => {
    setIsParsing(true)
    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: "array" })

      const tabs: TabData[] = []
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { raw: false, defval: "" })
        if (json.length === 0) continue

        const columns = Object.keys(json[0])
        const columnTypes: Record<string, "text" | "number" | "date" | "id"> = {}
        for (const col of columns) {
          const values = json.slice(0, 30).map(r => String(r[col] || ""))
          columnTypes[col] = detectColumnType(values)
        }

        tabs.push({
          name: sheetName,
          columns,
          sampleRows: json, // Keep all rows for calculation
          rowCount: json.length,
          columnTypes,
        })
      }

      // If it's a CSV (single sheet named "Sheet1"), use the filename as tab name
      if (tabs.length === 1 && tabs[0].name === "Sheet1") {
        tabs[0].name = file.name.replace(/\.(csv|xlsx|xls)$/i, "").replace(/[-_]/g, " ")
      }

      setParsedFile({ fileName: file.name, tabs })

      // Auto-initialize answers with inferred values
      const initial: Record<string, TabAnswers> = {}
      for (const tab of tabs) {
        const inferred = inferRowType(tab)
        initial[tab.name] = {
          rowType: inferred,
          metricColumn: inferred ? inferMetricColumn(tab, inferred) : null,
          dateColumn: inferDateColumn(tab),
        }
      }
      setTabAnswers(initial)

      // Auto-expand first tab
      if (tabs.length > 0) {
        setActiveTab(tabs[0].name)
      }
    } catch (err) {
      console.error("Parse error:", err)
    } finally {
      setIsParsing(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const updateTabAnswers = (tabName: string, partial: Partial<TabAnswers>) => {
    setTabAnswers(prev => ({
      ...prev,
      [tabName]: { ...prev[tabName], ...partial },
    }))
  }

  const reset = () => {
    setParsedFile(null)
    setTabAnswers({})
    setActiveTab(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Summary
  const completedTabs = parsedFile?.tabs.filter(t => {
    const a = tabAnswers[t.name]
    return a?.rowType !== null && a?.dateColumn !== null && a?.metricColumn !== null
  }) || []

  const allSignals = completedTabs.flatMap(t => generateSignals(t, tabAnswers[t.name]))

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-primary to-accent border-b border-border shadow-sm">
        <div className="container max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-foreground">Upload Data</h1>
          {parsedFile && (
            <Button variant="ghost" size="sm" onClick={reset} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6">
        {/* Step 1: File Upload */}
        {!parsedFile ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Import your data</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a CSV or Excel file. For multi-tab spreadsheets, each tab will be classified separately.
              </p>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative flex flex-col items-center justify-center gap-3 py-16 rounded-xl border-2 border-dashed cursor-pointer transition-all",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-foreground/20 hover:bg-muted/30",
                isParsing && "pointer-events-none opacity-60",
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleInputChange}
                className="hidden"
              />
              {isParsing ? (
                <>
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Parsing file...</p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-primary/10">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Drop your file here, or tap to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      CSV, XLSX, or XLS
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Step 2: Per-tab Classification */
          <div className="space-y-4">
            {/* File summary */}
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{parsedFile.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {parsedFile.tabs.length} tab{parsedFile.tabs.length > 1 ? "s" : ""} detected
                  {completedTabs.length > 0 && (
                    <span className="text-emerald-600"> -- {completedTabs.length} classified</span>
                  )}
                </p>
              </div>
            </div>

            {/* Instruction */}
            <p className="text-sm text-muted-foreground">
              Classify each tab so we can generate the right signals. We have pre-filled our best guess -- adjust if needed.
            </p>

            {/* Tab Cards */}
            <div className="space-y-3">
              {parsedFile.tabs.map(tab => (
                <TabQuestionnaire
                  key={tab.name}
                  tab={tab}
                  answers={tabAnswers[tab.name] || { rowType: null, metricColumn: null, dateColumn: null }}
                  onUpdateAnswers={(partial) => updateTabAnswers(tab.name, partial)}
                  isActive={activeTab === tab.name}
                  onToggle={() => setActiveTab(activeTab === tab.name ? null : tab.name)}
                />
              ))}
            </div>

            {/* Summary + Generate Button */}
            {allSignals.length > 0 && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="px-4 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {allSignals.length} signals ready
                      </p>
                      <p className="text-xs text-muted-foreground">
                        From {completedTabs.length} classified tab{completedTabs.length > 1 ? "s" : ""}
                      </p>
                    </div>
                    <Button size="sm" className="gap-1.5">
                      Generate Signals
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {allSignals.slice(0, 8).map((sig, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">
                        {sig.name}
                      </Badge>
                    ))}
                    {allSignals.length > 8 && (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        +{allSignals.length - 8} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
