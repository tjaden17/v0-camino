// Zoho Signal Discovery Service
// Analyzes uploaded Zoho CRM and Desk files to discover available signals

export interface DiscoveredSignal {
  id: string
  name: string
  description: string
  category: 'sales' | 'support' | 'customer' | 'operations'
  source: 'zoho_crm' | 'zoho_desk' | 'combined'
  dataFields: string[]
  calculation: string
  sampleValue?: number | string
  unit: string
  enabled: boolean
  confidence: 'high' | 'medium' | 'low'
}

export interface AnalysisResult {
  source: 'zoho_crm' | 'zoho_desk'
  fileName: string
  recordCount: number
  dateRange: { start: string; end: string } | null
  columns: string[]
  signals: DiscoveredSignal[]
  warnings: string[]
}

// Signal definitions for Zoho CRM Deals
const CRM_DEAL_SIGNALS: Omit<DiscoveredSignal, 'sampleValue' | 'enabled'>[] = [
  {
    id: 'sales_pipeline',
    name: '$ Sales Pipeline',
    description: 'Total value of all open deals in the pipeline',
    category: 'sales',
    source: 'zoho_crm',
    dataFields: ['Amount', 'Stage'],
    calculation: "SUM(Amount) WHERE Stage NOT IN ('Closed Won', 'Closed Lost')",
    unit: 'currency',
    confidence: 'high'
  },
  {
    id: 'sales_conversion_rate',
    name: '% Sales Conversion',
    description: 'Percentage of deals won vs total closed deals',
    category: 'sales',
    source: 'zoho_crm',
    dataFields: ['Stage'],
    calculation: "COUNT(Closed Won) / COUNT(Closed Won + Closed Lost) * 100",
    unit: 'percentage',
    confidence: 'high'
  },
  {
    id: 'avg_deal_size',
    name: 'Average Deal Size',
    description: 'Average value of closed won deals',
    category: 'sales',
    source: 'zoho_crm',
    dataFields: ['Amount', 'Stage'],
    calculation: "AVG(Amount) WHERE Stage = 'Closed Won'",
    unit: 'currency',
    confidence: 'high'
  },
  {
    id: 'win_rate',
    name: 'Win Rate',
    description: 'Percentage of deals won by count',
    category: 'sales',
    source: 'zoho_crm',
    dataFields: ['Stage'],
    calculation: "COUNT(Closed Won) / COUNT(All Closed) * 100",
    unit: 'percentage',
    confidence: 'high'
  },
  {
    id: 'sales_cycle_duration',
    name: 'Sales Cycle Duration',
    description: 'Average days from deal creation to close',
    category: 'sales',
    source: 'zoho_crm',
    dataFields: ['Sales Cycle Duration', 'Created Time', 'Closing Date'],
    calculation: "AVG(Sales Cycle Duration) or AVG(Closing Date - Created Time)",
    unit: 'days',
    confidence: 'high'
  },
  {
    id: 'pipeline_by_stage',
    name: 'Pipeline by Stage',
    description: 'Deal value breakdown by sales stage',
    category: 'sales',
    source: 'zoho_crm',
    dataFields: ['Amount', 'Stage'],
    calculation: "SUM(Amount) GROUP BY Stage",
    unit: 'currency',
    confidence: 'high'
  },
  {
    id: 'deal_velocity',
    name: 'Deal Velocity',
    description: 'Rate at which deals move through pipeline',
    category: 'sales',
    source: 'zoho_crm',
    dataFields: ['Created Time', 'Modified Time', 'Stage'],
    calculation: "AVG days between stage changes",
    unit: 'days',
    confidence: 'medium'
  },
  {
    id: 'forecast_accuracy',
    name: 'Forecast Accuracy',
    description: 'How accurate expected revenue predictions are',
    category: 'sales',
    source: 'zoho_crm',
    dataFields: ['Expected Revenue', 'Amount', 'Stage'],
    calculation: "Expected Revenue vs Actual Amount for closed deals",
    unit: 'percentage',
    confidence: 'medium'
  },
  {
    id: 'stale_deals',
    name: 'Stale Deal Count',
    description: 'Number of deals with no activity in 30+ days',
    category: 'sales',
    source: 'zoho_crm',
    dataFields: ['Age in Days', 'Modified Time', 'Stage'],
    calculation: "COUNT WHERE Age > 30 AND Stage is open",
    unit: 'count',
    confidence: 'high'
  },
  {
    id: 'monthly_closed_won',
    name: 'Monthly Revenue (Closed Won)',
    description: 'Total value of deals closed won per month',
    category: 'sales',
    source: 'zoho_crm',
    dataFields: ['Amount', 'Stage', 'Closing Date'],
    calculation: "SUM(Amount) WHERE Stage = 'Closed Won' GROUP BY Month",
    unit: 'currency',
    confidence: 'high'
  }
]

// Signal definitions for Zoho Desk Tickets
const DESK_TICKET_SIGNALS: Omit<DiscoveredSignal, 'sampleValue' | 'enabled'>[] = [
  {
    id: 'ticket_volume',
    name: 'Ticket Volume',
    description: 'Total number of support tickets',
    category: 'support',
    source: 'zoho_desk',
    dataFields: ['Ticket Id', 'Created Time'],
    calculation: "COUNT(Ticket Id)",
    unit: 'count',
    confidence: 'high'
  },
  {
    id: 'avg_resolution_time',
    name: 'Avg Resolution Time',
    description: 'Average time to resolve tickets',
    category: 'support',
    source: 'zoho_desk',
    dataFields: ['Resolution Time in Business Hours'],
    calculation: "AVG(Resolution Time in Business Hours)",
    unit: 'hours',
    confidence: 'high'
  },
  {
    id: 'avg_first_response_time',
    name: 'Avg First Response Time',
    description: 'Average time to first agent response',
    category: 'support',
    source: 'zoho_desk',
    dataFields: ['First Response Time in Business Hours'],
    calculation: "AVG(First Response Time in Business Hours)",
    unit: 'hours',
    confidence: 'high'
  },
  {
    id: 'sla_compliance_rate',
    name: 'SLA Compliance Rate',
    description: 'Percentage of tickets meeting SLA',
    category: 'support',
    source: 'zoho_desk',
    dataFields: ['SLA Violation Type'],
    calculation: "COUNT(Not Violated) / COUNT(All) * 100",
    unit: 'percentage',
    confidence: 'high'
  },
  {
    id: 'first_call_resolution',
    name: 'First Call Resolution Rate',
    description: 'Percentage of tickets resolved on first contact',
    category: 'support',
    source: 'zoho_desk',
    dataFields: ['Is First Call Resolution'],
    calculation: "COUNT(Yes) / COUNT(All) * 100",
    unit: 'percentage',
    confidence: 'high'
  },
  {
    id: 'escalation_rate',
    name: 'Escalation Rate',
    description: 'Percentage of tickets that get escalated',
    category: 'support',
    source: 'zoho_desk',
    dataFields: ['Is Escalated'],
    calculation: "COUNT(Escalated) / COUNT(All) * 100",
    unit: 'percentage',
    confidence: 'high'
  },
  {
    id: 'ticket_reopen_rate',
    name: 'Ticket Reopen Rate',
    description: 'Percentage of tickets that are reopened',
    category: 'support',
    source: 'zoho_desk',
    dataFields: ['Number of Reopen'],
    calculation: "COUNT(Reopen > 0) / COUNT(All) * 100",
    unit: 'percentage',
    confidence: 'high'
  },
  {
    id: 'customer_sentiment',
    name: 'Customer Sentiment Score',
    description: 'Overall sentiment from support interactions',
    category: 'customer',
    source: 'zoho_desk',
    dataFields: ['Sentiment'],
    calculation: "Weighted sentiment analysis",
    unit: 'score',
    confidence: 'medium'
  },
  {
    id: 'open_ticket_backlog',
    name: 'Open Ticket Backlog',
    description: 'Number of currently open/pending tickets',
    category: 'support',
    source: 'zoho_desk',
    dataFields: ['Status'],
    calculation: "COUNT WHERE Status IN (Open, On Hold, Pending)",
    unit: 'count',
    confidence: 'high'
  },
  {
    id: 'tickets_by_priority',
    name: 'Tickets by Priority',
    description: 'Ticket distribution by priority level',
    category: 'support',
    source: 'zoho_desk',
    dataFields: ['Priority'],
    calculation: "COUNT GROUP BY Priority",
    unit: 'count',
    confidence: 'high'
  },
  {
    id: 'bug_count',
    name: 'Bug Count',
    description: 'Number of tickets classified as bugs',
    category: 'support',
    source: 'zoho_desk',
    dataFields: ['Classifications', 'Category'],
    calculation: "COUNT WHERE Classification contains 'Bug'",
    unit: 'count',
    confidence: 'medium'
  },
  {
    id: 'bug_impact_score',
    name: 'Bug Impact Score',
    description: 'Weighted score of bug severity and impact',
    category: 'support',
    source: 'zoho_desk',
    dataFields: ['Priority', 'Is Escalated', 'SLA Violation Type', 'Sentiment'],
    calculation: "Weighted: Critical=10, High=7, Escalated+3, SLA Violation+2",
    unit: 'score',
    confidence: 'medium'
  },
  {
    id: 'agent_workload',
    name: 'Agent Workload Distribution',
    description: 'Tickets assigned per agent',
    category: 'operations',
    source: 'zoho_desk',
    dataFields: ['Ticket Owner'],
    calculation: "COUNT GROUP BY Ticket Owner",
    unit: 'count',
    confidence: 'high'
  }
]

// Signal definitions for Zoho CRM Leads
const CRM_LEAD_SIGNALS: Omit<DiscoveredSignal, 'sampleValue' | 'enabled'>[] = [
  {
    id: 'total_leads',
    name: 'Total Leads',
    description: 'Total number of leads in the system',
    category: 'sales',
    source: 'zoho_crm',
    dataFields: ['ID'],
    calculation: "COUNT(all leads)",
    unit: 'count',
    confidence: 'high'
  },
  {
    id: 'lead_conversion_rate',
    name: 'Lead Conversion Rate',
    description: 'Percentage of leads converted to contacts/deals',
    category: 'sales',
    source: 'zoho_crm',
    dataFields: ['Is Converted'],
    calculation: "COUNT(Converted) / COUNT(All) * 100",
    unit: 'percentage',
    confidence: 'high'
  },
  {
    id: 'leads_by_source',
    name: 'Leads by Source',
    description: 'Distribution of leads by acquisition source',
    category: 'sales',
    source: 'zoho_crm',
    dataFields: ['Lead Source'],
    calculation: "COUNT GROUP BY Lead Source",
    unit: 'count',
    confidence: 'high'
  },
  {
    id: 'leads_by_status',
    name: 'Leads by Status',
    description: 'Distribution of leads by current status',
    category: 'sales',
    source: 'zoho_crm',
    dataFields: ['Lead Status'],
    calculation: "COUNT GROUP BY Lead Status",
    unit: 'count',
    confidence: 'high'
  },
  {
    id: 'unconverted_leads',
    name: 'Unconverted Leads',
    description: 'Number of leads not yet converted',
    category: 'sales',
    source: 'zoho_crm',
    dataFields: ['Is Converted'],
    calculation: "COUNT WHERE Is Converted = false",
    unit: 'count',
    confidence: 'high'
  }
]

// Signal definitions for Zoho CRM Contacts
const CRM_CONTACT_SIGNALS: Omit<DiscoveredSignal, 'sampleValue' | 'enabled'>[] = [
  {
    id: 'total_contacts',
    name: 'Total Contacts',
    description: 'Total number of contacts in the CRM',
    category: 'customer',
    source: 'zoho_crm',
    dataFields: ['ID'],
    calculation: "COUNT(all contacts)",
    unit: 'count',
    confidence: 'high'
  },
  {
    id: 'contacts_by_source',
    name: 'Contacts by Source',
    description: 'Distribution of contacts by lead source',
    category: 'customer',
    source: 'zoho_crm',
    dataFields: ['Lead Source'],
    calculation: "COUNT GROUP BY Lead Source",
    unit: 'count',
    confidence: 'high'
  },
  {
    id: 'new_contacts_this_month',
    name: 'New Contacts This Month',
    description: 'Contacts created in the current month',
    category: 'customer',
    source: 'zoho_crm',
    dataFields: ['Created Time'],
    calculation: "COUNT WHERE Created Time in current month",
    unit: 'count',
    confidence: 'high'
  }
]

// Signal definitions for Zoho CRM Accounts
const CRM_ACCOUNT_SIGNALS: Omit<DiscoveredSignal, 'sampleValue' | 'enabled'>[] = [
  {
    id: 'total_accounts',
    name: 'Total Accounts',
    description: 'Total number of accounts/companies in the CRM',
    category: 'customer',
    source: 'zoho_crm',
    dataFields: ['ID', 'Account Name'],
    calculation: "COUNT(all accounts)",
    unit: 'count',
    confidence: 'high'
  },
  {
    id: 'accounts_by_type',
    name: 'Accounts by Type',
    description: 'Distribution of accounts by type',
    category: 'customer',
    source: 'zoho_crm',
    dataFields: ['Account Type'],
    calculation: "COUNT GROUP BY Account Type",
    unit: 'count',
    confidence: 'high'
  },
  {
    id: 'accounts_by_industry',
    name: 'Accounts by Industry',
    description: 'Distribution of accounts by industry',
    category: 'customer',
    source: 'zoho_crm',
    dataFields: ['Industry'],
    calculation: "COUNT GROUP BY Industry",
    unit: 'count',
    confidence: 'high'
  },
  {
    id: 'new_accounts_this_month',
    name: 'New Accounts This Month',
    description: 'Accounts created in the current month',
    category: 'customer',
    source: 'zoho_crm',
    dataFields: ['Created Time'],
    calculation: "COUNT WHERE Created Time in current month",
    unit: 'count',
    confidence: 'high'
  }
]

// Analyzer for Zoho CRM Leads
export function analyzeZohoLeads(csvContent: string, fileName: string): AnalysisResult {
  const lines = csvContent.split('\n').filter(line => line.trim())
  const headers = parseCSVLine(lines[0])
  const records = lines.slice(1).map(line => parseCSVLine(line))
  
  const warnings: string[] = []
  const signals: DiscoveredSignal[] = []
  
  const isConvertedIdx = headers.findIndex(h => h.toLowerCase().includes('is converted'))
  const leadSourceIdx = headers.findIndex(h => h.toLowerCase().includes('lead source'))
  const leadStatusIdx = headers.findIndex(h => h.toLowerCase().includes('lead status'))
  
  const totalLeads = records.length
  const convertedLeads = isConvertedIdx >= 0 
    ? records.filter(r => r[isConvertedIdx]?.toLowerCase() === 'true').length 
    : 0
  
  for (const signalDef of CRM_LEAD_SIGNALS) {
    let sampleValue: number | string | undefined
    
    switch (signalDef.id) {
      case 'total_leads':
        sampleValue = totalLeads
        break
      case 'lead_conversion_rate':
        sampleValue = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0
        break
      case 'unconverted_leads':
        sampleValue = totalLeads - convertedLeads
        break
      default:
        sampleValue = undefined
    }
    
    signals.push({
      ...signalDef,
      sampleValue,
      enabled: sampleValue !== undefined
    })
  }
  
  // Detect date range
  const createdTimeIdx = headers.findIndex(h => h.toLowerCase().includes('created time'))
  const dateRange = detectDateRange(records, createdTimeIdx)
  
  return {
    source: 'zoho_crm',
    fileName,
    recordCount: totalLeads,
    dateRange,
    columns: headers,
    signals,
    warnings
  }
}

// Analyzer for Zoho CRM Contacts
export function analyzeZohoContacts(csvContent: string, fileName: string): AnalysisResult {
  const lines = csvContent.split('\n').filter(line => line.trim())
  const headers = parseCSVLine(lines[0])
  const records = lines.slice(1).map(line => parseCSVLine(line))
  
  const warnings: string[] = []
  const signals: DiscoveredSignal[] = []
  
  const totalContacts = records.length
  const createdTimeIdx = headers.findIndex(h => h.toLowerCase().includes('created time'))
  
  // Count contacts created this month
  const now = new Date()
  const thisMonthContacts = createdTimeIdx >= 0 
    ? records.filter(r => {
        const date = new Date(r[createdTimeIdx])
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      }).length 
    : 0
  
  for (const signalDef of CRM_CONTACT_SIGNALS) {
    let sampleValue: number | string | undefined
    
    switch (signalDef.id) {
      case 'total_contacts':
        sampleValue = totalContacts
        break
      case 'new_contacts_this_month':
        sampleValue = thisMonthContacts
        break
      default:
        sampleValue = undefined
    }
    
    signals.push({
      ...signalDef,
      sampleValue,
      enabled: sampleValue !== undefined
    })
  }
  
  const dateRange = detectDateRange(records, createdTimeIdx)
  
  return {
    source: 'zoho_crm',
    fileName,
    recordCount: totalContacts,
    dateRange,
    columns: headers,
    signals,
    warnings
  }
}

// Analyzer for Zoho CRM Accounts
export function analyzeZohoAccounts(csvContent: string, fileName: string): AnalysisResult {
  const lines = csvContent.split('\n').filter(line => line.trim())
  const headers = parseCSVLine(lines[0])
  const records = lines.slice(1).map(line => parseCSVLine(line))
  
  const warnings: string[] = []
  const signals: DiscoveredSignal[] = []
  
  const totalAccounts = records.length
  const createdTimeIdx = headers.findIndex(h => h.toLowerCase().includes('created time') || h.toLowerCase().includes('created_time'))
  
  // Count accounts created this month
  const now = new Date()
  const thisMonthAccounts = createdTimeIdx >= 0 
    ? records.filter(r => {
        const date = new Date(r[createdTimeIdx])
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      }).length 
    : 0
  
  for (const signalDef of CRM_ACCOUNT_SIGNALS) {
    let sampleValue: number | string | undefined
    
    switch (signalDef.id) {
      case 'total_accounts':
        sampleValue = totalAccounts
        break
      case 'new_accounts_this_month':
        sampleValue = thisMonthAccounts
        break
      default:
        sampleValue = undefined
    }
    
    signals.push({
      ...signalDef,
      sampleValue,
      enabled: sampleValue !== undefined
    })
  }
  
  const dateRange = detectDateRange(records, createdTimeIdx)
  
  return {
    source: 'zoho_crm',
    fileName,
    recordCount: totalAccounts,
    dateRange,
    columns: headers,
    signals,
    warnings
  }
}

// Helper to detect date range from records
function detectDateRange(records: string[][], dateIdx: number): { start: string; end: string } | null {
  if (dateIdx < 0) return null
  
  const dates = records
    .map(r => new Date(r[dateIdx]))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())
  
  if (dates.length === 0) return null
  
  return {
    start: dates[0].toISOString(),
    end: dates[dates.length - 1].toISOString()
  }
}

export function analyzeZohoCRM(csvContent: string, fileName: string): AnalysisResult {
  const lines = csvContent.split('\n').filter(line => line.trim())
  const headers = parseCSVLine(lines[0])
  const records = lines.slice(1).map(line => parseCSVLine(line))
  
  const warnings: string[] = []
  const signals: DiscoveredSignal[] = []
  
  // Check which required fields exist
  const hasAmount = headers.includes('Amount')
  const hasStage = headers.includes('Stage')
  const hasCreatedTime = headers.includes('Created Time')
  const hasClosingDate = headers.includes('Closing Date')
  const hasSalesCycleDuration = headers.includes('Sales Cycle Duration')
  
  if (!hasAmount) warnings.push("'Amount' column not found - some sales signals may be unavailable")
  if (!hasStage) warnings.push("'Stage' column not found - conversion signals may be unavailable")
  
  // Calculate sample values and determine which signals are available
  const amountIdx = headers.indexOf('Amount')
  const stageIdx = headers.indexOf('Stage')
  
  // Parse deal data
  const deals = records.map(row => ({
    amount: parseFloat(row[amountIdx]?.replace(/[^0-9.-]/g, '') || '0'),
    stage: row[stageIdx] || '',
  }))
  
  const openDeals = deals.filter(d => !['Closed Won', 'Closed Lost', 'Closed-Won', 'Closed-Lost'].includes(d.stage))
  const closedWon = deals.filter(d => d.stage === 'Closed Won' || d.stage === 'Closed-Won')
  const closedLost = deals.filter(d => d.stage === 'Closed Lost' || d.stage === 'Closed-Lost')
  
  // Add signals with sample values
  for (const signalDef of CRM_DEAL_SIGNALS) {
    // Check if required fields exist
    const hasRequiredFields = signalDef.dataFields.some(field => headers.includes(field))
    
    if (!hasRequiredFields) {
      continue // Skip signals that can't be calculated
    }
    
    let sampleValue: number | string | undefined
    
    switch (signalDef.id) {
      case 'sales_pipeline':
        sampleValue = openDeals.reduce((sum, d) => sum + d.amount, 0)
        break
      case 'sales_conversion_rate':
        const totalClosed = closedWon.length + closedLost.length
        sampleValue = totalClosed > 0 ? Math.round((closedWon.length / totalClosed) * 100) : 0
        break
      case 'avg_deal_size':
        sampleValue = closedWon.length > 0 
          ? Math.round(closedWon.reduce((sum, d) => sum + d.amount, 0) / closedWon.length)
          : 0
        break
      case 'win_rate':
        const total = closedWon.length + closedLost.length
        sampleValue = total > 0 ? Math.round((closedWon.length / total) * 100) : 0
        break
      case 'stale_deals':
        sampleValue = openDeals.length // Simplified
        break
      case 'monthly_closed_won':
        sampleValue = closedWon.reduce((sum, d) => sum + d.amount, 0)
        break
      default:
        sampleValue = undefined
    }
    
    signals.push({
      ...signalDef,
      sampleValue,
      enabled: false
    })
  }
  
  // Determine date range
  let dateRange: { start: string; end: string } | null = null
  const createdTimeIdx = headers.indexOf('Created Time')
  if (createdTimeIdx >= 0) {
    const dates = records
      .map(row => new Date(row[createdTimeIdx]))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime())
    
    if (dates.length > 0) {
      dateRange = {
        start: dates[0].toISOString().split('T')[0],
        end: dates[dates.length - 1].toISOString().split('T')[0]
      }
    }
  }
  
  return {
    source: 'zoho_crm',
    fileName,
    recordCount: records.length,
    dateRange,
    columns: headers,
    signals,
    warnings
  }
}

export function analyzeZohoDesk(csvContent: string, fileName: string): AnalysisResult {
  const lines = csvContent.split('\n').filter(line => line.trim())
  const headers = parseCSVLine(lines[0])
  const records = lines.slice(1).map(line => parseCSVLine(line))
  
  const warnings: string[] = []
  const signals: DiscoveredSignal[] = []
  
  // Check for ticket-related columns (Zoho Desk uses "ID" not "Ticket Id")
  const hasTicketId = headers.includes('Ticket Id') || headers.includes('ID') || headers.some(h => h.toLowerCase() === 'id')
  const hasStatus = headers.includes('Status')
  const hasPriority = headers.includes('Priority')
  const hasResolutionTime = headers.includes('Resolution Time in Business Hours')
  const hasFirstResponseTime = headers.includes('First Response Time in Business Hours')
  const hasSLAViolation = headers.includes('SLA Violation Type')
  const hasEscalated = headers.includes('Is Escalated')
  const hasSentiment = headers.includes('Sentiment')
  const hasClassification = headers.includes('Classifications')
  const hasFCR = headers.includes('Is First Call Resolution')
  const hasReopen = headers.includes('Number of Reopen')
  
  // More flexible check - look for any desk-specific columns
  const deskColumns = ['Ticket Owner', 'SLA Violation Type', 'Resolution Time in Business Hours', 'Department', 'Channel']
  const hasDeskColumns = deskColumns.some(col => headers.includes(col))
  
  if (!hasTicketId && !hasDeskColumns) {
    warnings.push("This doesn't appear to be a Tickets export - ticket columns not found")
    return {
      source: 'zoho_desk',
      fileName,
      recordCount: records.length,
      dateRange: null,
      columns: headers,
      signals: [],
      warnings
    }
  }
  
  // Parse ticket data for sample calculations
  const statusIdx = headers.indexOf('Status')
  const priorityIdx = headers.indexOf('Priority')
  const resTimeIdx = headers.indexOf('Resolution Time in Business Hours')
  const slaIdx = headers.indexOf('SLA Violation Type')
  const escalatedIdx = headers.indexOf('Is Escalated')
  const fcrIdx = headers.indexOf('Is First Call Resolution')
  const reopenIdx = headers.indexOf('Number of Reopen')
  
  const tickets = records.map(row => ({
    status: row[statusIdx] || '',
    priority: row[priorityIdx] || '',
    resolutionTime: parseFloat(row[resTimeIdx] || '0'),
    slaViolation: row[slaIdx] || '',
    isEscalated: row[escalatedIdx] === 'true' || row[escalatedIdx] === 'Yes',
    isFCR: row[fcrIdx] === 'true' || row[fcrIdx] === 'Yes',
    reopenCount: parseInt(row[reopenIdx] || '0')
  }))
  
  const openTickets = tickets.filter(t => ['Open', 'On Hold', 'Pending', 'In Progress'].includes(t.status))
  const closedTickets = tickets.filter(t => t.status === 'Closed')
  const notViolated = tickets.filter(t => t.slaViolation === 'Not Violated')
  const escalated = tickets.filter(t => t.isEscalated)
  const fcrTickets = tickets.filter(t => t.isFCR)
  const reopenedTickets = tickets.filter(t => t.reopenCount > 0)
  
  // Add signals with sample values
  for (const signalDef of DESK_TICKET_SIGNALS) {
    const hasRequiredFields = signalDef.dataFields.some(field => headers.includes(field))
    
    if (!hasRequiredFields) {
      continue
    }
    
    let sampleValue: number | string | undefined
    
    switch (signalDef.id) {
      case 'ticket_volume':
        sampleValue = tickets.length
        break
      case 'avg_resolution_time':
        const validResTimes = tickets.filter(t => t.resolutionTime > 0)
        sampleValue = validResTimes.length > 0
          ? Math.round(validResTimes.reduce((sum, t) => sum + t.resolutionTime, 0) / validResTimes.length)
          : 0
        break
      case 'sla_compliance_rate':
        sampleValue = tickets.length > 0 
          ? Math.round((notViolated.length / tickets.length) * 100)
          : 0
        break
      case 'first_call_resolution':
        sampleValue = closedTickets.length > 0
          ? Math.round((fcrTickets.length / closedTickets.length) * 100)
          : 0
        break
      case 'escalation_rate':
        sampleValue = tickets.length > 0
          ? Math.round((escalated.length / tickets.length) * 100)
          : 0
        break
      case 'ticket_reopen_rate':
        sampleValue = closedTickets.length > 0
          ? Math.round((reopenedTickets.length / closedTickets.length) * 100)
          : 0
        break
      case 'open_ticket_backlog':
        sampleValue = openTickets.length
        break
      default:
        sampleValue = undefined
    }
    
    signals.push({
      ...signalDef,
      sampleValue,
      enabled: false
    })
  }
  
  // Determine date range
  let dateRange: { start: string; end: string } | null = null
  const createdTimeIdx = headers.indexOf('Created Time')
  if (createdTimeIdx >= 0) {
    const dates = records
      .map(row => new Date(row[createdTimeIdx]))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime())
    
    if (dates.length > 0) {
      dateRange = {
        start: dates[0].toISOString().split('T')[0],
        end: dates[dates.length - 1].toISOString().split('T')[0]
      }
    }
  }
  
  return {
    source: 'zoho_desk',
    fileName,
    recordCount: records.length,
    dateRange,
    columns: headers,
    signals,
    warnings
  }
}

export function detectZohoFileType(csvContent: string): 'zoho_crm' | 'zoho_desk' | 'unknown' {
  const firstLine = csvContent.split('\n')[0].toLowerCase()
  
  console.log('[v0] Detecting file type, first line:', firstLine.substring(0, 200))
  
  // CRM Deals indicators - check for deal-specific columns
  const crmIndicators = [
    'deal name', 
    'deal owner', 
    'closing date', 
    'expected revenue',
    'sales cycle duration',
    'forecast type',
    'amount',
    'stage',
    'pipeline',
    'probability'
  ]
  const crmMatches = crmIndicators.filter(indicator => firstLine.includes(indicator))
  console.log('[v0] CRM matches:', crmMatches)
  
  if (crmMatches.length >= 2) {
    return 'zoho_crm'
  }
  
  // Also check for stage + amount combination (common in CRM deals)
  if (firstLine.includes('stage') && firstLine.includes('amount')) {
    return 'zoho_crm'
  }
  
  // Desk Tickets indicators - check for ticket-specific columns
  const deskIndicators = [
    'ticket owner',
    'sla violation',
    'resolution time',
    'first response time',
    'ticket age',
    'happiness rating',
    'is escalated',
    'is first call resolution',
    'number of reopen',
    'department',
    'channel',
    'priority',
    'subject'
  ]
  const deskMatches = deskIndicators.filter(indicator => firstLine.includes(indicator))
  console.log('[v0] Desk matches:', deskMatches)
  
  if (deskMatches.length >= 2) {
    return 'zoho_desk'
  }
  
  // Check for ticket ID column (Zoho Desk uses "ID" as header for ticket exports)
  if (firstLine.startsWith('id,') && (firstLine.includes('status') || firstLine.includes('channel'))) {
    return 'zoho_desk'
  }
  
  console.log('[v0] Could not detect file type')
  return 'unknown'
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}
