/**
 * Staging Module
 * 
 * Responsibility: Store and manage normalized raw data
 * - Data normalization
 * - Batch management
 * - Data source tracking
 */

import { createClient } from '@/lib/supabase/server'

// Types
export interface StagedRecord {
  id: string
  organization_id: string
  import_id: string
  raw_data: Record<string, unknown>
  imported_at: string
}

export interface DataSource {
  organization_id: string
  data_type: 'deals' | 'tickets' | 'accounts' | 'contacts' | 'leads'
  source_system: string
  last_import_at: string
  record_count: number
  is_active: boolean
}

export interface ImportBatch {
  id: string
  organization_id: string
  file_name: string
  data_type: string
  record_count: number
  imported_at: string
  imported_by: string
}

// Detect data type from headers
export function detectDataType(headers: string[]): DataSource['data_type'] | null {
  const lowerHeaders = headers.map(h => h.toLowerCase())
  
  // Deals
  if (lowerHeaders.some(h => h.includes('deal name') || h.includes('deal owner')) ||
      (lowerHeaders.includes('stage') && lowerHeaders.includes('amount'))) {
    return 'deals'
  }
  
  // Leads
  if (lowerHeaders.some(h => h.includes('lead owner') || h.includes('lead status') || h.includes('is converted'))) {
    return 'leads'
  }
  
  // Tickets
  if (lowerHeaders.some(h => h.includes('ticket owner') || h.includes('sla violation') || h.includes('resolution time'))) {
    return 'tickets'
  }
  
  // Contacts
  if (lowerHeaders.some(h => h.includes('contact owner')) ||
      (lowerHeaders.includes('email') && lowerHeaders.some(h => h.includes('last name')))) {
    return 'contacts'
  }
  
  // Accounts
  if (lowerHeaders.some(h => h.includes('account name') || h.includes('account owner'))) {
    return 'accounts'
  }
  
  return null
}

// Get staging table name for data type
export function getStagingTable(dataType: DataSource['data_type']): string {
  const tables: Record<DataSource['data_type'], string> = {
    deals: 'zoho_deals',
    tickets: 'zoho_tickets',
    accounts: 'zoho_accounts',
    contacts: 'zoho_contacts',
    leads: 'zoho_leads'
  }
  return tables[dataType]
}

// Normalize record to staging schema
export function normalizeRecord(
  record: Record<string, string>,
  dataType: DataSource['data_type'],
  organizationId: string,
  importId: string
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    organization_id: organizationId,
    import_id: importId,
    raw_data: record,
    imported_at: new Date().toISOString()
  }
  
  switch (dataType) {
    case 'deals':
      return {
        ...base,
        deal_name: record['Deal Name'] || record['deal_name'] || null,
        deal_owner: record['Deal Owner'] || record['deal_owner'] || null,
        account_name: record['Account Name'] || record['account_name'] || null,
        amount: parseFloat(record['Amount'] || record['amount'] || '0') || null,
        stage: record['Stage'] || record['stage'] || null,
        closing_date: record['Closing Date'] || record['closing_date'] || null,
        probability: parseInt(record['Probability (%)'] || record['probability'] || '0') || null,
        expected_revenue: parseFloat(record['Expected Revenue'] || '0') || null,
        lead_source: record['Lead Source'] || null,
        created_time: record['Created Time'] || null,
        modified_time: record['Modified Time'] || null
      }
    
    case 'tickets':
      return {
        ...base,
        ticket_id: record['ID'] || record['Ticket Id'] || null,
        subject: record['Subject'] || record['subject'] || null,
        status: record['Status'] || record['status'] || null,
        priority: record['Priority'] || record['priority'] || null,
        channel: record['Channel'] || null,
        department: record['Department'] || null,
        account_name: record['Account Name'] || null,
        contact_name: record['Contact Name'] || null,
        ticket_owner: record['Ticket Owner'] || null,
        classification: record['Classifications'] || null,
        is_escalated: record['Is Escalated']?.toLowerCase() === 'true',
        sentiment: record['Sentiment'] || null,
        resolution_time_hours: parseFloat(record['Resolution Time in Business Hours'] || '0') || null,
        first_response_time_hours: parseFloat(record['First Response Time in Business Hours'] || '0') || null,
        created_time: record['Created Time'] || null
      }
    
    case 'accounts':
      return {
        ...base,
        account_name: record['Account Name'] || record['account_name'] || '',
        account_owner: record['Account Owner'] || null,
        industry: record['Industry'] || record['industry'] || null,
        account_type: record['Account Type'] || record['account_type'] || null,
        annual_revenue: parseFloat(record['Annual Revenue'] || '0') || null,
        phone: record['Phone'] || null,
        email: record['Email'] || null,
        website: record['Website'] || null,
        created_time: record['Created Time'] || null
      }
    
    case 'contacts':
      return {
        ...base,
        first_name: record['First Name'] || null,
        last_name: record['Last Name'] || null,
        full_name: `${record['First Name'] || ''} ${record['Last Name'] || ''}`.trim() || null,
        email: record['Email'] || record['email'] || null,
        phone: record['Phone'] || record['Mobile'] || null,
        account_name: record['Account Name'] || null,
        contact_owner: record['Contact Owner'] || null,
        lead_source: record['Lead Source'] || null,
        created_time: record['Created Time'] || null
      }
    
    case 'leads':
      return {
        ...base,
        lead_name: `${record['First Name'] || ''} ${record['Last Name'] || ''}`.trim() || null,
        lead_owner: record['Lead Owner'] || null,
        lead_status: record['Lead Status'] || null,
        lead_source: record['Lead Source'] || null,
        company: record['Company'] || null,
        email: record['Email'] || null,
        phone: record['Phone'] || null,
        is_converted: record['Is Converted']?.toLowerCase() === 'true',
        created_time: record['Created Time'] || null
      }
    
    default:
      return base
  }
}

// Stage records to database
export async function stageRecords(
  records: Record<string, string>[],
  dataType: DataSource['data_type'],
  organizationId: string,
  importId: string
): Promise<{ staged: number; errors: string[] }> {
  const supabase = await createClient()
  const table = getStagingTable(dataType)
  const errors: string[] = []
  let staged = 0
  
  // Normalize all records
  const normalizedRecords = records.map(r => normalizeRecord(r, dataType, organizationId, importId))
  
  // Insert in batches of 100
  const batchSize = 100
  for (let i = 0; i < normalizedRecords.length; i += batchSize) {
    const batch = normalizedRecords.slice(i, i + batchSize)
    const { error } = await supabase.from(table).insert(batch)
    
    if (error) {
      errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`)
    } else {
      staged += batch.length
    }
  }
  
  return { staged, errors }
}

// Track data source
export async function trackDataSource(
  organizationId: string,
  dataType: DataSource['data_type'],
  sourceSystem: string,
  recordCount: number
): Promise<void> {
  const supabase = await createClient()
  
  await supabase
    .from('zoho_data_sources')
    .upsert({
      organization_id: organizationId,
      data_type: dataType,
      source_system: sourceSystem,
      last_import_at: new Date().toISOString(),
      record_count: recordCount,
      is_active: true
    }, {
      onConflict: 'organization_id,data_type'
    })
}

// Get available data sources for an organization
export async function getDataSources(organizationId: string): Promise<DataSource[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('zoho_data_sources')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
  
  if (error) {
    console.error('Error fetching data sources:', error)
    return []
  }
  
  return data || []
}

// Get staged data for analysis
export async function getStagedData(
  organizationId: string,
  dataType: DataSource['data_type'],
  options?: { limit?: number; offset?: number }
): Promise<StagedRecord[]> {
  const supabase = await createClient()
  const table = getStagingTable(dataType)
  
  let query = supabase
    .from(table)
    .select('*')
    .eq('organization_id', organizationId)
    .order('imported_at', { ascending: false })
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 100) - 1)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching staged data:', error)
    return []
  }
  
  return data || []
}
