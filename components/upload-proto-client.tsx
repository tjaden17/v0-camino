"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
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
  Plus,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import * as XLSX from "xlsx"

// ============================================
// Types
// ============================================

type RowType = "deals" | "leads" | "tickets" | "customers" | "events" | "agents" | "other"

export interface TabData {
  /** Unique key: fileName::tabName */
  key: string
  name: string
  fileName: string
  columns: string[]
  sampleRows: Record<string, string>[]
  rowCount: number
  columnTypes: Record<string, "text" | "number" | "date" | "id">
}

export interface TabAnswers {
  rowType: RowType | null
  metricColumn: string | null
  dateColumn: string | null
}

interface ParsedFile {
  fileName: string
  tabs: TabData[]
}

export interface GeneratedSignal {
  name: string
  description: string
  operation: string
  valueColumn: string | null
  dateColumn: string | null
  groupByColumn?: string | null
  tabKey: string
  tabName: string
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

/** Column names that typically hold a numeric value to sum/average (deal amount, revenue, etc.) */
const VALUE_LIKE_COLUMN_PATTERN = /amount|value|revenue|deal|price|total|sum|quantity|mrr|arr|acv|tcv/i

function detectColumnType(values: string[], columnName?: string): "text" | "number" | "date" | "id" {
  const sample = values.filter(v => v && v.trim() !== "").slice(0, 30)
  if (sample.length === 0) return "text"

  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/,
    /^\d{1,2}\/\d{1,2}\/\d{2,4}/,
    /^\d{1,2}-\d{1,2}-\d{2,4}/,
  ]
  const dateCount = sample.filter(v => datePatterns.some(p => p.test(v.trim()))).length
  if (dateCount > sample.length * 0.6) return "date"

  const numCount = sample.filter(v => {
    // Remove currency codes (AUD, USD, EUR, GBP, etc.) and symbols ($, €, £, ¥)
    // Also remove commas, spaces, %, and trim
    const cleaned = v
      .replace(/^[A-Z]{3}\s*/i, "") // Remove 3-letter currency codes at start (AUD, USD, etc.)
      .replace(/[$€£¥,\s%]/g, "")    // Remove currency symbols, commas, spaces, percent
      .trim()
    // Also handle parentheses for negative numbers: (123) -> -123
    const withNegative = cleaned.replace(/^\((.+)\)$/, "-$1")
    return withNegative !== "" && !isNaN(Number(withNegative))
  }).length
  const numericRatio = numCount / sample.length
  
  console.log("[v0] Column type detection:", { columnName, sample: sample.slice(0, 5), numCount, numericRatio })
  
  // Use lower threshold (50%) for columns named like amount/value/revenue so we don't miss them
  const numberThreshold = columnName && VALUE_LIKE_COLUMN_PATTERN.test(columnName) ? 0.5 : 0.7
  if (numericRatio >= numberThreshold) {
    const allInts = sample.every(v => {
      const cleaned = v
        .replace(/^[A-Z]{3}\s*/i, "")
        .replace(/[$€£¥,\s%]/g, "")
        .replace(/^\((.+)\)$/, "-$1")
      const n = Number(cleaned)
      return Number.isInteger(n)
    })
    const uniqueRatio = new Set(sample).size / sample.length
    const firstNum = Number(
      sample[0]
        .replace(/^[A-Z]{3}\s*/i, "")
        .replace(/[$€£¥,\s%]/g, "")
        .replace(/^\((.+)\)$/, "-$1")
    )
    if (allInts && uniqueRatio > 0.9 && firstNum > 100000) {
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
  const priorities = ["created time", "created date", "create date", "date", "created_at"]
  for (const p of priorities) {
    const match = tab.columns.find(c => c.toLowerCase().includes(p))
    if (match && tab.columnTypes[match] === "date") return match
  }
  const firstDate = tab.columns.find(c => tab.columnTypes[c] === "date")
  return firstDate || null
}

function inferMetricColumn(tab: TabData, rowType: RowType | null): string | null {
  if (rowType === "tickets" || rowType === "leads" || rowType === "agents" || rowType === "customers" || rowType === "events") {
    return "none"
  }
  if (rowType === "deals") {
    const match = tab.columns.find(c => {
      const cl = c.toLowerCase()
      return cl.includes("amount") || cl.includes("value") || cl.includes("revenue") || cl.includes("price")
    })
    if (match && tab.columnTypes[match] === "number") return match
  }
  const firstNum = tab.columns.find(c => tab.columnTypes[c] === "number")
  return firstNum || "none"
}

export function generateSignals(tab: TabData, answers: TabAnswers): GeneratedSignal[] {
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
    tabKey: tab.key,
    tabName: tab.name,
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
        tabKey: tab.key,
        tabName: tab.name,
        preview: rate,
      })
    }
  }

  // 3. Sum/Average of metric column (if not count-only)
  if (metricColumn && metricColumn !== "none") {
    const values = tab.sampleRows
      .map(r => {
        const cleaned = (r[metricColumn] || "")
          .replace(/^[A-Z]{3}\s*/i, "") // Remove currency codes (AUD, USD, etc.)
          .replace(/[$€£¥,\s%]/g, "")    // Remove symbols and commas
        return Number(cleaned)
      })
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
        tabKey: tab.key,
        tabName: tab.name,
        preview: Math.round(sum * 100) / 100,
      })
      signals.push({
        name: `Average ${metricColumn}`,
        description: `Average ${metricColumn} per ${label.toLowerCase().replace(/s$/, "")}`,
        operation: "average",
        valueColumn: metricColumn,
        dateColumn,
        tabKey: tab.key,
        tabName: tab.name,
        preview: Math.round(avg * 100) / 100,
      })
    }
  }

  // 4. Win Rate (for deals only, if stage column exists)
  if (rowType === "deals" || rowType === "opportunities") {
    const stageColumn = tab.columns.find(c => 
      c.toLowerCase() === "stage" || 
      c.toLowerCase() === "status" || 
      c.toLowerCase() === "deal_stage" ||
      c.toLowerCase() === "opportunity_stage"
    )
    
    if (stageColumn) {
      signals.push({
        name: "Win Rate",
        description: "Percentage of deals won vs total closed deals",
        operation: "rate",
        valueColumn: null,
        dateColumn,
        groupByColumn: null,
        tabKey: tab.key,
        tabName: tab.name,
        preview: null,
      })
    }
  }

  // 5. Group-by signals for meaningful text columns
  const textCols = tab.columns.filter(c =>
    tab.columnTypes[c] === "text" && c.toLowerCase() !== "id" && c.toLowerCase() !== "email"
  )
  for (const col of textCols) {
    const values = tab.sampleRows.map(r => (r[col] || "").trim()).filter(Boolean)
    const uniques = new Set(values)
    const colLower = col.toLowerCase()
    const isGroupable = (uniques.size >= 2 && uniques.size <= 20) &&
      (colLower.includes("status") || colLower.includes("owner") || colLower.includes("channel") ||
       colLower.includes("priority") || colLower.includes("source") || colLower.includes("type") ||
       colLower.includes("category") || colLower.includes("stage") || colLower.includes("department") ||
       colLower.includes("group") || colLower.includes("tier") || colLower.includes("shift") ||
       colLower.includes("classification") || colLower.includes("is converted") || colLower.includes("sentiment") ||
       colLower.includes("layout") || colLower.includes("language") || colLower.includes("country") ||
       colLower.includes("lead status") || colLower.includes("rating"))

    if (isGroupable) {
      signals.push({
        name: `${label} by ${col}`,
        description: `Breakdown of ${label.toLowerCase()} grouped by ${col}`,
        operation: "group_by",
        valueColumn: null,
        dateColumn,
        groupByColumn: col,
        tabKey: tab.key,
        tabName: tab.name,
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
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "flex items-center justify-center h-8 w-8 rounded-md shrink-0",
            isComplete ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground",
          )}>
            {isComplete ? <CheckCircle className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-sm text-foreground truncate block">{tab.name}</span>
            <span className="text-[10px] text-muted-foreground">
              {tab.fileName} - {tab.rowCount.toLocaleString()} rows, {tab.columns.length} cols
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isComplete && (
            <Badge variant="secondary" className="text-[10px]">
              {signals.length} signals
            </Badge>
          )}
          {inferredType && !answers.rowType && (
            <Badge className="text-[10px] bg-primary/10 text-primary border-0">
              {ROW_TYPE_OPTIONS.find(o => o.value === inferredType)?.label}
            </Badge>
          )}
          {isActive ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {isActive && (
        <CardContent className="px-4 pb-4 pt-0 border-t border-border">
          <div className="py-3 mb-3 border-b border-border">
            <div className="flex flex-wrap gap-1.5">
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
            <p className="text-[10px] text-muted-foreground mt-2">
              Columns: number = value to sum/average · date = for trends · text = for grouping (e.g. owner, stage).
            </p>
          </div>

          <div className="space-y-4">
            {/* Q1: Row type */}
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
                      <div className="font-medium text-xs">{opt.label}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Q2: Metric column */}
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
                          <span className="text-[10px] text-muted-foreground font-normal">(number)</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {numericCols.length === 0
                    ? "No numeric columns found - signals will count rows."
                    : "The value to sum or average (e.g. deal amount, revenue). Other columns (owner, stage, date) are used to group or filter."}
                </p>
              </div>
            )}

            {/* Q3: Date column */}
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

            {/* Signal Preview */}
            {isComplete && signals.length > 0 && (
              <div className="mt-2 pt-3 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Signals from this tab:
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
  const router = useRouter()
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([])
  const [tabAnswers, setTabAnswers] = useState<Record<string, TabAnswers>>({})
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateResult, setGenerateResult] = useState<{ success: boolean; count: number; errors?: string[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // All tabs across all files
  const allTabs = parsedFiles.flatMap(f => f.tabs)

  // Parse a single file and add to the collection
  const handleFile = useCallback(async (file: File) => {
    // Skip if same filename already uploaded
    if (parsedFiles.some(f => f.fileName === file.name)) return

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
          const values = json.slice(0, 30).map(r => String(r[col] ?? ""))
          columnTypes[col] = detectColumnType(values, col)
        }

        // Tab name: for CSVs with generic "Sheet1", use filename instead
        let tabDisplayName = sheetName
        if (workbook.SheetNames.length === 1 && sheetName === "Sheet1") {
          tabDisplayName = file.name.replace(/\.(csv|xlsx|xls)$/i, "").replace(/[-_]/g, " ")
        }

        const tabKey = `${file.name}::${tabDisplayName}`

        tabs.push({
          key: tabKey,
          name: tabDisplayName,
          fileName: file.name,
          columns,
          sampleRows: json,
          rowCount: json.length,
          columnTypes,
        })
      }

      setParsedFiles(prev => [...prev, { fileName: file.name, tabs }])

      // Auto-initialize answers
      const newAnswers: Record<string, TabAnswers> = {}
      for (const tab of tabs) {
        const inferred = inferRowType(tab)
        newAnswers[tab.key] = {
          rowType: inferred,
          metricColumn: inferred ? inferMetricColumn(tab, inferred) : null,
          dateColumn: inferDateColumn(tab),
        }
      }
      setTabAnswers(prev => ({ ...prev, ...newAnswers }))

      // Auto-expand first tab of newly added file
      if (tabs.length > 0) {
        setActiveTab(tabs[0].key)
      }
    } catch (err) {
      console.error("Parse error:", err)
    } finally {
      setIsParsing(false)
    }
  }, [parsedFiles])

  // Handle multiple files from input or drop
  const handleFiles = useCallback(async (files: FileList) => {
    for (const file of Array.from(files)) {
      await handleFile(file)
    }
  }, [handleFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [handleFiles])

  const updateTabAnswers = (tabKey: string, partial: Partial<TabAnswers>) => {
    setTabAnswers(prev => ({
      ...prev,
      [tabKey]: { ...prev[tabKey], ...partial },
    }))
  }

  const removeFile = (fileName: string) => {
    setParsedFiles(prev => prev.filter(f => f.fileName !== fileName))
    setTabAnswers(prev => {
      const next = { ...prev }
      for (const key of Object.keys(next)) {
        if (key.startsWith(`${fileName}::`)) delete next[key]
      }
      return next
    })
  }

  const reset = () => {
    setParsedFiles([])
    setTabAnswers({})
    setActiveTab(null)
    setGenerateResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Completed tabs + all signals
  const completedTabs = allTabs.filter(t => {
    const a = tabAnswers[t.key]
    return a?.rowType !== null && a?.dateColumn !== null && a?.metricColumn !== null
  })

  const allSignals = completedTabs.flatMap(t => generateSignals(t, tabAnswers[t.key]))

  // ── GENERATE SIGNALS ──
  const handleGenerate = async () => {
    if (allSignals.length === 0) return
    setIsGenerating(true)
    setGenerateResult(null)

    try {
      // Build payload: for each completed tab, send answers + the raw rows
      const tabPayloads = completedTabs.map(tab => ({
        tabKey: tab.key,
        tabName: tab.name,
        fileName: tab.fileName,
        rowCount: tab.rowCount,
        columns: tab.columns,
        columnTypes: tab.columnTypes,
        answers: tabAnswers[tab.key],
        // Send all rows for calculation (signals need the full dataset)
        rows: tab.sampleRows,
      }))

      const signals = allSignals.map(sig => ({
        name: sig.name,
        description: sig.description,
        operation: sig.operation,
        valueColumn: sig.valueColumn,
        dateColumn: sig.dateColumn,
        groupByColumn: sig.groupByColumn || null,
        tabKey: sig.tabKey,
        tabName: sig.tabName,
      }))

      const res = await fetch("/api/upload/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tabs: tabPayloads, signals }),
      })

      const data = await res.json()

      if (!res.ok) {
        setGenerateResult({ success: false, count: 0, errors: [data.error || "Failed to generate signals"] })
      } else {
        setGenerateResult({ success: true, count: data.signalsCreated || 0, errors: data.errors })
      }
    } catch (err) {
      setGenerateResult({ success: false, count: 0, errors: [err instanceof Error ? err.message : "Network error"] })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-primary to-accent border-b border-border shadow-sm">
        <div className="container max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-foreground">Upload Data</h1>
          {parsedFiles.length > 0 && (
            <Button variant="ghost" size="sm" onClick={reset} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6">
        {/* File Upload Area - always visible when no generate result */}
        {!generateResult && (
          <div className="space-y-4">
            {parsedFiles.length === 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground">Import your data</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload CSV or Excel files. Each file (or tab in an XLSX) will be classified separately.
                </p>
              </div>
            )}

            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all",
                parsedFiles.length === 0 ? "py-16" : "py-8",
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
                multiple
              />
              {isParsing ? (
                <>
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Parsing file...</p>
                </>
              ) : parsedFiles.length === 0 ? (
                <>
                  <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-primary/10">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Drop your files here, or tap to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      CSV, XLSX, or XLS -- upload multiple files
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Add another file</span>
                </div>
              )}
            </div>

            {/* Uploaded Files List */}
            {parsedFiles.length > 0 && (
              <div className="space-y-2">
                {parsedFiles.map(pf => (
                  <div key={pf.fileName} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
                    <FileSpreadsheet className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{pf.fileName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {pf.tabs.length} tab{pf.tabs.length > 1 ? "s" : ""} --{" "}
                        {pf.tabs.reduce((sum, t) => sum + t.rowCount, 0).toLocaleString()} total rows
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeFile(pf.fileName)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Tab Classification Section */}
            {allTabs.length > 0 && (
              <>
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">
                    Classify each tab so we generate the right signals. We pre-filled our best guess -- adjust if needed.
                  </p>
                </div>

                <div className="space-y-3">
                  {allTabs.map(tab => (
                    <TabQuestionnaire
                      key={tab.key}
                      tab={tab}
                      answers={tabAnswers[tab.key] || { rowType: null, metricColumn: null, dateColumn: null }}
                      onUpdateAnswers={(partial) => updateTabAnswers(tab.key, partial)}
                      isActive={activeTab === tab.key}
                      onToggle={() => setActiveTab(activeTab === tab.key ? null : tab.key)}
                    />
                  ))}
                </div>
              </>
            )}

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
                        From {completedTabs.length} tab{completedTabs.length > 1 ? "s" : ""} across {parsedFiles.length} file{parsedFiles.length > 1 ? "s" : ""}
                      </p>
                    </div>
                    <Button size="sm" className="gap-1.5" onClick={handleGenerate} disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          Generate Signals
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
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

        {/* Success / Error Result */}
        {generateResult && (
          <div className="space-y-4">
            <Card className={cn(
              "border",
              generateResult.success ? "border-emerald-200 bg-emerald-50" : "border-destructive/30 bg-destructive/5"
            )}>
              <CardContent className="px-4 py-6 text-center">
                {generateResult.success ? (
                  <>
                    <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-foreground">
                      {generateResult.count} signals created
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      From {parsedFiles.length} file{parsedFiles.length > 1 ? "s" : ""} with {completedTabs.length} tab{completedTabs.length > 1 ? "s" : ""}
                    </p>
                  </>
                ) : (
                  <>
                    <X className="h-10 w-10 text-destructive mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-foreground">Generation failed</h3>
                    {generateResult.errors?.map((err, i) => (
                      <p key={i} className="text-sm text-destructive mt-1">{err}</p>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>

            {generateResult.errors && generateResult.errors.length > 0 && generateResult.success && (
              <div className="px-3 py-2 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground mb-1">Some signals had issues:</p>
                {generateResult.errors.map((err, i) => (
                  <p key={i} className="text-xs text-muted-foreground">{err}</p>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={reset} className="flex-1 bg-transparent">
                Upload More Files
              </Button>
              <Button onClick={() => router.push("/signals")} className="flex-1 gap-1.5">
                View Signals
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
