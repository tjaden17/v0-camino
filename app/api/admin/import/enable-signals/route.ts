import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { DiscoveredSignal } from '@/lib/zoho-signal-discovery'

// Parse CSV into records for staging
function parseCSVToRecords(csvContent: string): Record<string, string>[] {
  const lines = csvContent.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []
  
  // Parse header
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

function parseCSVLine(line: string): string[] {
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

// Detect data type from CSV content
function detectDataType(headers: string[]): 'deals' | 'tickets' | 'accounts' | 'contacts' | 'leads' | null {
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
    const { signals, source, csvContent, sheetName } = body as {
      signals: DiscoveredSignal[]
      source: 'zoho_crm' | 'zoho_desk'
      csvContent: string
      sheetName?: string
    }
    
    const enabledSignals = signals.filter(s => s.enabled)
    
    if (enabledSignals.length === 0) {
      return NextResponse.json({ error: 'No signals selected' }, { status: 400 })
    }
    
    // Create signals in the database
    const createdSignals = []
    
    for (const signal of enabledSignals) {
      // Check if signal already exists by name (signals table uses unique name constraint)
      const { data: existingSignals } = await supabase
        .from('signals')
        .select('id')
        .eq('name', signal.name)
      
      if (existingSignals && existingSignals.length > 0) {
        // Update existing signal
        createdSignals.push({ ...signal, id: existingSignals[0].id, status: 'updated' })
        continue
      }
      
      // Create new signal - using actual schema columns with valid benchmark_type
      const { data: newSignal, error: createError } = await supabase
        .from('signals')
        .insert({
          name: signal.name,
          category: signal.category,
          owner_id: user.id,
          created_by: user.id,
          benchmark_value: signal.sampleValue ?? null,
          benchmark_type: 'internal', // Valid values: 'internal', 'industry', 'user_defined'
          trend: 'stable'
        })
        .select()
        .single()
      
      if (createError) {
        console.error('[v0] Error creating signal:', createError)
        continue
      }
      
      // Add initial data point
      if (signal.sampleValue !== undefined && newSignal) {
        await supabase
          .from('data_points')
          .insert({
            signal_id: newSignal.id,
            value: typeof signal.sampleValue === 'number' ? signal.sampleValue : 0,
            date: new Date().toISOString().split('T')[0],
            created_by: user.id,
            notes: `Initial import from ${source}`
          })
      }
      
      createdSignals.push({ ...signal, id: newSignal?.id, status: 'created' })
    }
    
    // Store upload history
    const { error: uploadError } = await supabase
      .from('upload_history')
      .insert({
        file_name: `${source}_import_${new Date().toISOString()}.csv`,
        uploaded_by: user.id,
        signals_created: createdSignals.filter(s => s.status === 'created').length,
        signals_updated: createdSignals.filter(s => s.status === 'updated').length,
        data_points_added: createdSignals.filter(s => s.sampleValue !== undefined).length,
        status: 'success'
      })
    
    if (uploadError) {
      console.error('[v0] Error storing upload record:', uploadError)
    }

    // Stage raw data for multi-source signal calculations
    let stagingResult = { staged: 0, dataType: null as string | null }
    
    if (csvContent) {
      const records = parseCSVToRecords(csvContent)
      if (records.length > 0) {
        const headers = Object.keys(records[0])
        const dataType = detectDataType(headers)
        stagingResult.dataType = dataType
        
        if (dataType) {
          // Determine the staging table based on data type
          const stagingTable = dataType === 'deals' ? 'zoho_deals'
            : dataType === 'tickets' ? 'zoho_tickets'
            : dataType === 'accounts' ? 'zoho_accounts'
            : dataType === 'contacts' ? 'zoho_contacts'
            : null
          
          if (stagingTable) {
            // Create import batch record
            const importBatchId = crypto.randomUUID()
            
            // Map records to staging schema (matching actual table columns)
            const stagingRecords = records.map(record => {
              // Create a normalized version for staging
              const staged: Record<string, unknown> = {
                organization_id: profile.organization_id,
                import_id: importBatchId,
                raw_data: record,
                imported_at: new Date().toISOString()
              }
              
              // Add type-specific fields based on actual table schema
              if (dataType === 'deals') {
                staged.deal_name = record['Deal Name'] || record['deal_name'] || null
                staged.deal_owner = record['Deal Owner'] || record['deal_owner'] || null
                staged.account_name = record['Account Name'] || record['account_name'] || null
                staged.amount = parseFloat(record['Amount'] || record['amount'] || '0') || null
                staged.stage = record['Stage'] || record['stage'] || null
                staged.closing_date = record['Closing Date'] || record['closing_date'] || null
                staged.probability = parseInt(record['Probability (%)'] || record['probability'] || '0') || null
                staged.expected_revenue = parseFloat(record['Expected Revenue'] || '0') || null
                staged.lead_source = record['Lead Source'] || null
                staged.sales_cycle_duration = parseInt(record['Sales Cycle Duration'] || '0') || null
                staged.created_time = record['Created Time'] || null
                staged.modified_time = record['Modified Time'] || null
              } else if (dataType === 'tickets') {
                staged.ticket_id = record['ID'] || record['Ticket Id'] || null
                staged.subject = record['Subject'] || record['subject'] || null
                staged.status = record['Status'] || record['status'] || null
                staged.priority = record['Priority'] || record['priority'] || null
                staged.channel = record['Channel'] || null
                staged.department = record['Department'] || null
                staged.account_name = record['Account Name'] || null
                staged.contact_name = record['Contact Name'] || null
                staged.ticket_owner = record['Ticket Owner'] || null
                staged.classification = record['Classifications'] || null
                staged.sla_violation_type = record['SLA Violation Type'] || null
                staged.is_escalated = record['Is Escalated']?.toLowerCase() === 'true'
                staged.is_first_call_resolution = record['Is First Call Resolution']?.toLowerCase() === 'yes'
                staged.sentiment = record['Sentiment'] || null
                staged.resolution_time_hours = parseFloat(record['Resolution Time in Business Hours'] || '0') || null
                staged.first_response_time_hours = parseFloat(record['First Response Time in Business Hours'] || '0') || null
                staged.created_time = record['Created Time'] || null
              } else if (dataType === 'accounts') {
                staged.account_name = record['Account Name'] || record['account_name'] || ''
                staged.account_owner = record['Account Owner'] || null
                staged.industry = record['Industry'] || record['industry'] || null
                staged.account_type = record['Account Type'] || record['account_type'] || null
                staged.annual_revenue = parseFloat(record['Annual Revenue'] || '0') || null
                staged.phone = record['Phone'] || null
                staged.email = record['Email'] || null
                staged.website = record['Website'] || null
                staged.created_time = record['Created Time'] || null
              } else if (dataType === 'contacts') {
                staged.first_name = record['First Name'] || null
                staged.last_name = record['Last Name'] || null
                staged.full_name = `${record['First Name'] || ''} ${record['Last Name'] || ''}`.trim() || null
                staged.email = record['Email'] || record['email'] || null
                staged.phone = record['Phone'] || record['Mobile'] || null
                staged.account_name = record['Account Name'] || null
                staged.contact_owner = record['Contact Owner'] || null
                staged.lead_source = record['Lead Source'] || null
                staged.created_time = record['Created Time'] || null
              }
              
              return staged
            })
            
            // Insert in batches of 100
            const batchSize = 100
            for (let i = 0; i < stagingRecords.length; i += batchSize) {
              const batch = stagingRecords.slice(i, i + batchSize)
              const { error: stagingError } = await supabase
                .from(stagingTable)
                .insert(batch)
              
              if (stagingError) {
                console.error(`[v0] Error staging ${dataType} data:`, stagingError)
              } else {
                stagingResult.staged += batch.length
              }
            }
            
            // Update data source tracking
            await supabase
              .from('zoho_data_sources')
              .upsert({
                organization_id: profile.organization_id,
                data_type: dataType,
                source_system: source,
                last_import_at: new Date().toISOString(),
                record_count: stagingResult.staged,
                is_active: true
              }, {
                onConflict: 'organization_id,data_type'
              })
          }
        }
      }
    }
    
    return NextResponse.json({ 
      success: true,
      created: createdSignals.filter(s => s.status === 'created').length,
      updated: createdSignals.filter(s => s.status === 'updated').length,
      signals: createdSignals,
      staging: {
        dataType: stagingResult.dataType,
        recordsStaged: stagingResult.staged
      }
    })
    
  } catch (error) {
    console.error('[v0] Enable signals error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to enable signals' },
      { status: 500 }
    )
  }
}
