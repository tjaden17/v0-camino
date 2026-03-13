// CSV parsing utilities for manual data upload

export interface ParsedCSVRow {
  [key: string]: string | number | null
}

export interface CSVParseResult {
  headers: string[]
  rows: ParsedCSVRow[]
  errors: string[]
}

export function parseCSV(csvText: string): CSVParseResult {
  const errors: string[] = []
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim())

  if (lines.length === 0) {
    errors.push("CSV file is empty")
    return { headers: [], rows: [], errors }
  }

  // Auto-detect delimiter by checking the first line
  const delimiter = detectDelimiter(lines[0])

  // Parse headers
  const headers = parseCSVLine(lines[0], delimiter)

  if (headers.length === 0) {
    errors.push("No headers found in CSV")
    return { headers: [], rows: [], errors }
  }

  // Parse data rows - be lenient with column mismatches
  const rows: ParsedCSVRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delimiter)

    // Be lenient: pad with empty values or truncate if columns don't match
    const row: ParsedCSVRow = {}
    headers.forEach((header, index) => {
      row[header] = index < values.length ? values[index] : ""
    })
    rows.push(row)
  }

  return { headers, rows, errors }
}

function detectDelimiter(line: string): string {
  // Count occurrences of common delimiters outside of quotes
  const delimiters = [',', ';', '\t', '|']
  const counts: Record<string, number> = {}
  
  let inQuotes = false
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (!inQuotes && delimiters.includes(char)) {
      counts[char] = (counts[char] || 0) + 1
    }
  }
  
  // Return the delimiter with the highest count, default to comma
  let maxCount = 0
  let bestDelimiter = ','
  
  for (const [delim, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count
      bestDelimiter = delim
    }
  }
  
  return bestDelimiter
}

function parseCSVLine(line: string, delimiter: string = ','): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

export interface ColumnMapping {
  csvColumn: string
  signalField:
    | "name"
    | "value"
    | "date"
    | "benchmark"
    | "owner"
    | "category"
    | "trend"
    | "ticketId"
    | "subject"
    | "status"
    | "priority"
    | "createdDate"
    | "closedDate"
    | "modifiedDate"
    | "assignee"
    | "skip"
}

export interface SignalFieldDefinition {
  key: string
  label: string
  required: boolean
  description: string
}

export const SIGNAL_FIELDS: SignalFieldDefinition[] = [
  { key: "name", label: "Signal Name", required: true, description: "Name of the metric/signal" },
  { key: "value", label: "Current Value", required: true, description: "Current metric value" },
  { key: "date", label: "Date", required: false, description: "Date of measurement" },
  { key: "benchmark", label: "Benchmark", required: false, description: "Target or benchmark value" },
  { key: "owner", label: "Owner", required: false, description: "Person responsible" },
  { key: "category", label: "Category", required: false, description: "Business category" },
  { key: "trend", label: "Trend", required: false, description: "up/down/stable" },
  { key: "ticketId", label: "Ticket ID", required: false, description: "Support ticket identifier" },
  { key: "subject", label: "Subject", required: false, description: "Ticket subject/title" },
  { key: "status", label: "Status", required: false, description: "Ticket status (open/closed/pending)" },
  { key: "priority", label: "Priority", required: false, description: "Ticket priority (low/medium/high/urgent)" },
  { key: "createdDate", label: "Created Date", required: false, description: "Ticket creation date" },
  { key: "closedDate", label: "Closed Date", required: false, description: "Ticket closure date" },
  { key: "modifiedDate", label: "Modified Date", required: false, description: "Last modified date" },
  { key: "assignee", label: "Assignee", required: false, description: "Person assigned to ticket" },
  { key: "skip", label: "Skip Column", required: false, description: "Do not import this column" },
]

export function autoSuggestMapping(headers: string[]): ColumnMapping[] {
  const mappings: ColumnMapping[] = []

  for (const header of headers) {
    const lower = header.toLowerCase()
    let suggested: ColumnMapping["signalField"] = "skip"

    // Auto-detect common column names
    if (
      lower.includes("name") ||
      lower.includes("signal") ||
      lower.includes("metric") ||
      // Zoho-specific: Deal/Account/Contact names
      lower.includes("deal name") ||
      lower.includes("account name") ||
      lower.includes("company name") ||
      lower.includes("contact name") ||
      lower.includes("opportunity name") ||
      lower.includes("subject") ||
      lower.includes("activity subject")
    ) {
      suggested = "name"
    } else if (
      lower.includes("value") ||
      lower.includes("current") ||
      lower.includes("actual") ||
      // Zoho-specific: Amount/Revenue columns
      lower.includes("amount") ||
      lower.includes("revenue") ||
      lower.includes("deal value") ||
      lower.includes("opportunity value") ||
      lower.includes("total") ||
      lower.includes("count")
    ) {
      suggested = "value"
    } else if (
      lower.includes("date") ||
      lower.includes("time") ||
      lower.includes("period") ||
      // Zoho-specific: Date columns
      lower.includes("created date") ||
      lower.includes("modified date") ||
      lower.includes("closing date") ||
      lower.includes("activity date") ||
      lower.includes("due date")
    ) {
      suggested = "date"
    } else if (
      lower.includes("benchmark") ||
      lower.includes("target") ||
      lower.includes("goal") ||
      lower.includes("quota")
    ) {
      suggested = "benchmark"
    } else if (
      lower.includes("owner") ||
      lower.includes("responsible") ||
      lower.includes("assignee") ||
      // Zoho-specific: Owner columns
      lower.includes("deal owner") ||
      lower.includes("account owner") ||
      lower.includes("assigned to")
    ) {
      suggested = "owner"
    } else if (
      lower.includes("category") ||
      lower.includes("type") ||
      lower.includes("department") ||
      // Zoho-specific: Stage/Status columns
      lower.includes("stage") ||
      lower.includes("status") ||
      lower.includes("pipeline") ||
      lower.includes("lead source") ||
      lower.includes("industry")
    ) {
      suggested = "category"
    } else if (lower.includes("trend") || lower.includes("direction")) {
      suggested = "trend"
    } else if (lower.includes("ticketid") || lower.includes("ticket identifier") || lower.includes("support ticket")) {
      suggested = "ticketId"
    } else if (lower.includes("ticket subject") || lower.includes("ticket title")) {
      suggested = "subject"
    } else if (
      lower.includes("ticket status") ||
      lower.includes("open") ||
      lower.includes("closed") ||
      lower.includes("pending")
    ) {
      suggested = "status"
    } else if (
      lower.includes("ticket priority") ||
      lower.includes("low") ||
      lower.includes("medium") ||
      lower.includes("high") ||
      lower.includes("urgent")
    ) {
      suggested = "priority"
    } else if (lower.includes("ticket created date") || lower.includes("ticket creation date")) {
      suggested = "createdDate"
    } else if (lower.includes("ticket closed date") || lower.includes("ticket closure date")) {
      suggested = "closedDate"
    } else if (lower.includes("ticket modified date") || lower.includes("ticket last modified date")) {
      suggested = "modifiedDate"
    } else if (
      lower.includes("ticket assignee") ||
      lower.includes("ticket owner") ||
      lower.includes("person assigned to ticket")
    ) {
      suggested = "assignee"
    }

    mappings.push({ csvColumn: header, signalField: suggested })
  }

  return mappings
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  validRowCount: number
  skippedRowCount: number
}

/**
 * Parse a formatted number string (handles commas, K/M/B suffixes, percentages)
 */
export function parseFormattedNumber(value: string | number | null): number | null {
  if (value === null || value === undefined || value === "") return null
  
  const str = String(value).trim()
  if (!str) return null
  
  // Remove currency symbols, spaces, and common formatting
  let cleaned = str.replace(/[$£€¥\s]/g, "")
  
  // Handle percentages
  const isPercent = cleaned.includes("%")
  cleaned = cleaned.replace(/%/g, "")
  
  // Handle K/M/B/T suffixes (case insensitive)
  const suffixMatch = cleaned.match(/^([\d,.-]+)\s*([KMBT])$/i)
  if (suffixMatch) {
    const num = parseFloat(suffixMatch[1].replace(/,/g, ""))
    const suffix = suffixMatch[2].toUpperCase()
    const multipliers: Record<string, number> = { K: 1000, M: 1000000, B: 1000000000, T: 1000000000000 }
    return isNaN(num) ? null : num * (multipliers[suffix] || 1)
  }
  
  // Remove commas and parse
  cleaned = cleaned.replace(/,/g, "")
  const num = parseFloat(cleaned)
  
  if (isNaN(num)) return null
  return isPercent ? num / 100 : num
}

export function validateMappedData(rows: ParsedCSVRow[], mappings: ColumnMapping[]): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  let validRowCount = 0
  let skippedRowCount = 0

  // Check if required fields are mapped
  const hasName = mappings.some((m) => m.signalField === "name")
  const hasValue = mappings.some((m) => m.signalField === "value")

  if (!hasName) {
    errors.push('Required field "Signal Name" is not mapped')
  }

  if (!hasValue) {
    errors.push('Required field "Current Value" is not mapped')
  }

  // Get the mapped columns
  const nameMapping = mappings.find(m => m.signalField === "name")
  const valueMapping = mappings.find(m => m.signalField === "value")

  // Validate each row - be lenient, skip incomplete rows instead of erroring
  rows.forEach((row, index) => {
    const nameValue = nameMapping ? row[nameMapping.csvColumn] : null
    const valueValue = valueMapping ? row[valueMapping.csvColumn] : null

    // Skip rows where name is empty (section headers, blank rows, etc.)
    if (!nameValue || String(nameValue).trim() === "") {
      skippedRowCount++
      return
    }

    // Skip rows where value is empty or not parseable
    const parsedValue = parseFormattedNumber(valueValue)
    if (parsedValue === null) {
      skippedRowCount++
      return
    }

    // This is a valid row
    validRowCount++

    // Check trend values (warning only)
    mappings.forEach((mapping) => {
      const value = row[mapping.csvColumn]
      if (mapping.signalField === "trend" && value) {
        const validTrends = ["up", "down", "stable", "increasing", "decreasing"]
        if (!validTrends.includes(String(value).toLowerCase())) {
          warnings.push(`Row ${index + 2}: Trend value "${value}" will be normalized`)
        }
      }
    })
  })

  // Only error if NO valid rows found
  if (validRowCount === 0 && rows.length > 0) {
    errors.push("No valid data rows found. Please check that your file has signal names and numeric values.")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validRowCount,
    skippedRowCount,
  }
}
