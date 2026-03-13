/**
 * Import Module
 * 
 * Responsibility: Get data into the system
 * - File upload handling
 * - CSV/XLSX parsing
 * - Format detection
 * - Validation
 */

// Re-export parsers
export { parseXLSX, detectSheetType, getSheetTypeName } from '@/lib/xlsx-parser'

// Re-export signal discovery (detection parts)
export { 
  detectZohoFileType,
  analyzeZohoCRM,
  analyzeZohoDesk,
  analyzeZohoLeads,
  analyzeZohoContacts,
  analyzeZohoAccounts
} from '@/lib/zoho-signal-discovery'

// Types
export type { AnalysisResult, DiscoveredSignal } from '@/lib/zoho-signal-discovery'

// Helper to parse CSV content
export function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  values.push(current.trim())
  return values
}

export function parseCSVToRecords(csvContent: string): Record<string, string>[] {
  const lines = csvContent.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []
  
  const headers = parseCSVLine(lines[0])
  const records: Record<string, string>[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const record: Record<string, string> = {}
    headers.forEach((h, idx) => {
      record[h] = values[idx] || ''
    })
    records.push(record)
  }
  return records
}

// Validate import file
export function validateImportFile(file: File): { valid: boolean; error?: string } {
  const validExtensions = ['.csv', '.xlsx', '.xls']
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
  
  if (!validExtensions.includes(extension)) {
    return { valid: false, error: `Invalid file type. Supported: ${validExtensions.join(', ')}` }
  }
  
  // 50MB limit
  if (file.size > 50 * 1024 * 1024) {
    return { valid: false, error: 'File too large. Maximum size is 50MB.' }
  }
  
  return { valid: true }
}
