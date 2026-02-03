import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MultiSourceSignalService, type ZohoDataType } from '@/lib/multi-source-signal-service'

// Parse CSV content into records
function parseCSV(csvContent: string): Record<string, any>[] {
  const lines = csvContent.split('\n')
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const records: Record<string, any>[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // Handle quoted CSV values properly
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
    
    const record: Record<string, any> = {}
    headers.forEach((header, idx) => {
      record[header] = values[idx] || ''
    })
    records.push(record)
  }
  
  return records
}

// Detect data type from headers
function detectDataType(headers: string[]): ZohoDataType | null {
  const headerSet = new Set(headers.map(h => h.toLowerCase()))
  
  // Deals indicators
  if (headerSet.has('deal name') || headerSet.has('deal owner') || 
      (headerSet.has('stage') && headerSet.has('amount') && headerSet.has('closing date'))) {
    return 'deals'
  }
  
  // Tickets indicators
  if (headerSet.has('ticket owner') || headerSet.has('sla violation type') || 
      headerSet.has('resolution time in business hours') || headerSet.has('first response time in business hours')) {
    return 'tickets'
  }
  
  // Accounts indicators
  if ((headerSet.has('account name') || headerSet.has('account owner')) && 
      (headerSet.has('industry') || headerSet.has('annual revenue') || headerSet.has('billing country'))) {
    return 'accounts'
  }
  
  // Contacts indicators
  if ((headerSet.has('first name') || headerSet.has('contact name')) && 
      headerSet.has('email') && !headerSet.has('deal name')) {
    return 'contacts'
  }
  
  return null
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()
    
    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }
    
    const body = await request.json()
    const { csvContent, fileName, source, forceDataType } = body as {
      csvContent: string
      fileName: string
      source: 'zoho_crm' | 'zoho_desk'
      forceDataType?: ZohoDataType
    }
    
    if (!csvContent) {
      return NextResponse.json({ error: 'No CSV content provided' }, { status: 400 })
    }
    
    // Parse CSV
    const records = parseCSV(csvContent)
    if (records.length === 0) {
      return NextResponse.json({ error: 'No records found in CSV' }, { status: 400 })
    }
    
    // Detect or use forced data type
    const headers = Object.keys(records[0])
    const dataType = forceDataType || detectDataType(headers)
    
    if (!dataType) {
      return NextResponse.json({ 
        error: 'Could not detect data type from CSV headers',
        headers: headers.slice(0, 20) // Return first 20 headers for debugging
      }, { status: 400 })
    }
    
    // Create import record
    const { data: importRecord, error: importError } = await supabase
      .from('zoho_imports')
      .insert({
        organization_id: profile.organization_id,
        imported_by: user.id,
        file_name: fileName,
        file_type: 'csv',
        source_type: source,
        data_type: dataType,
        record_count: records.length,
        status: 'processing'
      })
      .select()
      .single()
    
    if (importError || !importRecord) {
      console.error('Error creating import record:', importError)
      return NextResponse.json({ error: 'Failed to create import record' }, { status: 500 })
    }
    
    // Stage the data
    const result = await MultiSourceSignalService.stageData(
      profile.organization_id,
      importRecord.id,
      dataType,
      records
    )
    
    // Update import status
    await supabase
      .from('zoho_imports')
      .update({
        status: result.success ? 'completed' : 'failed',
        error_message: result.error,
        completed_at: new Date().toISOString()
      })
      .eq('id', importRecord.id)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    
    // Get updated data sources
    const dataSources = await MultiSourceSignalService.getDataSources(profile.organization_id)
    
    return NextResponse.json({
      success: true,
      importId: importRecord.id,
      dataType,
      recordCount: result.count,
      dataSources
    })
    
  } catch (error) {
    console.error('[v0] Stage data error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to stage data' },
      { status: 500 }
    )
  }
}
