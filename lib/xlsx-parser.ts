import * as XLSX from 'xlsx'

export interface ParsedSheet {
  name: string
  csvContent: string
  rowCount: number
  columns: string[]
}

export interface ParsedWorkbook {
  sheets: ParsedSheet[]
  fileName: string
}

/**
 * Parse an XLSX file and convert each sheet to CSV format
 */
export function parseXLSX(buffer: ArrayBuffer, fileName: string): ParsedWorkbook {
  const workbook = XLSX.read(buffer, { type: 'array' })
  
  const sheets: ParsedSheet[] = []
  
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to CSV
    const csvContent = XLSX.utils.sheet_to_csv(worksheet)
    
    // Get row count (excluding header)
    const rows = csvContent.split('\n').filter(row => row.trim())
    const rowCount = Math.max(0, rows.length - 1)
    
    // Get columns from first row
    const columns = rows[0]?.split(',').map(col => col.trim()) || []
    
    // Only include sheets with data
    if (rowCount > 0 && columns.length > 0) {
      sheets.push({
        name: sheetName,
        csvContent,
        rowCount,
        columns
      })
    }
  }
  
  return {
    sheets,
    fileName
  }
}

/**
 * Detect the type of Zoho data in a sheet based on column names
 */
export function detectSheetType(columns: string[]): 'zoho_crm_deals' | 'zoho_crm_leads' | 'zoho_crm_contacts' | 'zoho_crm_accounts' | 'zoho_desk_tickets' | 'zoho_desk_accounts' | 'unknown' {
  const lowerColumns = columns.map(c => c.toLowerCase())
  
  // Zoho CRM Deals - expanded indicators
  const dealIndicators = ['deal name', 'deal owner', 'closing date', 'expected revenue', 'sales cycle duration', 'forecast type', 'amount', 'stage', 'pipeline', 'probability']
  const dealMatches = dealIndicators.filter(ind => lowerColumns.some(col => col.includes(ind)))
  if (dealMatches.length >= 2) return 'zoho_crm_deals'
  
  // Also check stage + amount for deals
  const hasStage = lowerColumns.some(c => c.includes('stage'))
  const hasAmount = lowerColumns.some(c => c.includes('amount'))
  if (hasStage && hasAmount) {
    return 'zoho_crm_deals'
  }
  
  // Zoho CRM Leads - check before contacts as they share some fields
  const leadIndicators = ['lead owner', 'lead status', 'lead source', 'is converted', 'converted deal', 'converted contact', 'converted account', 'company']
  const leadMatches = leadIndicators.filter(ind => lowerColumns.some(col => col.includes(ind)))
  if (leadMatches.length >= 2) return 'zoho_crm_leads'
  
  // Zoho Desk Tickets
  const ticketIndicators = ['ticket owner', 'sla violation', 'resolution time', 'first response time', 'is escalated', 'is first call resolution', 'channel', 'department', 'subject']
  const ticketMatches = ticketIndicators.filter(ind => lowerColumns.some(col => col.includes(ind)))
  if (ticketMatches.length >= 2) return 'zoho_desk_tickets'
  
  // Zoho CRM Contacts - more flexible matching
  const contactIndicators = ['contact owner', 'last name', 'first name', 'email', 'phone', 'mobile', 'lead source', 'full name']
  const contactMatches = contactIndicators.filter(ind => lowerColumns.some(col => col.includes(ind)))
  // Must have contact owner or (last name + email) to be contacts
  const hasContactOwner = lowerColumns.some(c => c.includes('contact owner'))
  const hasLastName = lowerColumns.some(c => c === 'last name' || c.includes('last name'))
  const hasEmail = lowerColumns.some(c => c === 'email')
  if (hasContactOwner || (contactMatches.length >= 3 && (hasLastName || hasEmail))) return 'zoho_crm_contacts'
  
  // Zoho CRM Accounts / Desk Accounts - more flexible
  const accountIndicators = ['account name', 'account owner', 'account type', 'industry', 'annual revenue', 'billing', 'website']
  const accountMatches = accountIndicators.filter(ind => lowerColumns.some(col => col.includes(ind)))
  if (accountMatches.length >= 2) {
    // Check if it's Desk accounts (has different fields)
    if (lowerColumns.some(c => c.includes('portal') || c.includes('ticket count'))) {
      return 'zoho_desk_accounts'
    }
    return 'zoho_crm_accounts'
  }
  
  return 'unknown'
}

/**
 * Get a friendly name for the sheet type
 */
export function getSheetTypeName(type: ReturnType<typeof detectSheetType>): string {
  const names: Record<string, string> = {
    'zoho_crm_deals': 'CRM Deals',
    'zoho_crm_leads': 'CRM Leads',
    'zoho_crm_contacts': 'CRM Contacts',
    'zoho_crm_accounts': 'CRM Accounts',
    'zoho_desk_tickets': 'Desk Tickets',
    'zoho_desk_accounts': 'Desk Accounts',
    'unknown': 'Unknown'
  }
  return names[type] || 'Unknown'
}

/**
 * Map sheet type to the analyzer type
 */
export function getAnalyzerType(sheetType: ReturnType<typeof detectSheetType>): 'zoho_crm' | 'zoho_desk' | null {
  if (sheetType.startsWith('zoho_crm')) return 'zoho_crm'
  if (sheetType.startsWith('zoho_desk')) return 'zoho_desk'
  return null
}
