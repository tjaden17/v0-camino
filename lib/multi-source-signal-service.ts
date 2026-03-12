import { createClient } from '@/lib/supabase/server'

// Data types that can be imported
export type ZohoDataType = 'deals' | 'tickets' | 'accounts' | 'contacts'

// Signal definition from database
export interface SignalDefinition {
  id: string
  signal_key: string
  name: string
  description: string
  category: string
  required_sources: ZohoDataType[]
  calculation_type: 'single_source' | 'multi_source' | 'composite'
  unit: string
  format: string
  trend_direction: 'up_is_good' | 'down_is_good' | 'neutral'
  is_active: boolean
  is_premium: boolean
}

// Data source availability
export interface DataSourceStatus {
  data_type: ZohoDataType
  source_type: string
  is_available: boolean
  record_count: number
  latest_import_at: string | null
  date_range_start: string | null
  date_range_end: string | null
}

// Signal availability with data requirements
export interface SignalAvailability {
  definition: SignalDefinition
  is_calculable: boolean
  missing_sources: ZohoDataType[]
  available_sources: ZohoDataType[]
  data_freshness: 'fresh' | 'stale' | 'unavailable'
  last_calculated_at: string | null
  current_value: number | null
}

// Calculated signal value
export interface CalculatedSignal {
  signal_key: string
  value: number
  formatted_value: string
  trend: 'up' | 'down' | 'neutral'
  trend_percentage: number | null
  calculated_at: string
  data_sources_used: ZohoDataType[]
}

export class MultiSourceSignalService {
  
  /**
   * Get all available data sources for an organization
   */
  static async getDataSources(organizationId: string): Promise<DataSourceStatus[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('zoho_data_sources')
      .select('*')
      .eq('organization_id', organizationId)
    
    if (error) {
      console.error('Error fetching data sources:', error)
      return []
    }
    
    // Map to our interface
    const allDataTypes: ZohoDataType[] = ['deals', 'tickets', 'accounts', 'contacts']
    
    return allDataTypes.map(dataType => {
      const source = data?.find(d => d.data_type === dataType)
      return {
        data_type: dataType,
        source_type: source?.source_type || (dataType === 'tickets' ? 'zoho_desk' : 'zoho_crm'),
        is_available: !!source && source.record_count > 0,
        record_count: source?.record_count || 0,
        latest_import_at: source?.latest_import_at || null,
        date_range_start: source?.date_range_start || null,
        date_range_end: source?.date_range_end || null
      }
    })
  }
  
  /**
   * Get all signal definitions with their availability status
   */
  static async getSignalAvailability(organizationId: string): Promise<SignalAvailability[]> {
    const supabase = await createClient()
    
    // Get signal definitions
    const { data: definitions, error: defError } = await supabase
      .from('signal_definitions')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
    
    if (defError || !definitions) {
      console.error('Error fetching signal definitions:', defError)
      return []
    }
    
    // Get available data sources
    const dataSources = await this.getDataSources(organizationId)
    const availableTypes = new Set(
      dataSources.filter(ds => ds.is_available).map(ds => ds.data_type)
    )
    
    // Check each signal's availability
    return definitions.map(def => {
      const requiredSources = def.required_sources as ZohoDataType[]
      const availableSources = requiredSources.filter(s => availableTypes.has(s))
      const missingSources = requiredSources.filter(s => !availableTypes.has(s))
      const isCalculable = missingSources.length === 0
      
      // Determine data freshness
      let dataFreshness: 'fresh' | 'stale' | 'unavailable' = 'unavailable'
      if (isCalculable) {
        const relevantSources = dataSources.filter(ds => requiredSources.includes(ds.data_type))
        const oldestImport = relevantSources
          .map(ds => ds.latest_import_at ? new Date(ds.latest_import_at).getTime() : 0)
          .sort((a, b) => a - b)[0]
        
        if (oldestImport) {
          const daysSinceImport = (Date.now() - oldestImport) / (1000 * 60 * 60 * 24)
          dataFreshness = daysSinceImport < 7 ? 'fresh' : 'stale'
        }
      }
      
      return {
        definition: def as SignalDefinition,
        is_calculable: isCalculable,
        missing_sources: missingSources,
        available_sources: availableSources,
        data_freshness: dataFreshness,
        last_calculated_at: null, // Would fetch from calculated signals table
        current_value: null
      }
    })
  }
  
  /**
   * Calculate all available signals for an organization
   */
  static async calculateSignals(organizationId: string): Promise<CalculatedSignal[]> {
    const availability = await this.getSignalAvailability(organizationId)
    const calculableSignals = availability.filter(s => s.is_calculable)
    
    const results: CalculatedSignal[] = []
    
    for (const signal of calculableSignals) {
      try {
        const calculated = await this.calculateSingleSignal(
          organizationId, 
          signal.definition
        )
        if (calculated) {
          results.push(calculated)
        }
      } catch (error) {
        console.error(`Error calculating ${signal.definition.signal_key}:`, error)
      }
    }
    
    return results
  }
  
  /**
   * Calculate a single signal
   */
  static async calculateSingleSignal(
    organizationId: string, 
    definition: SignalDefinition
  ): Promise<CalculatedSignal | null> {
    const supabase = await createClient()
    
    let value: number | null = null
    
    // Route to appropriate calculator based on signal key
    switch (definition.signal_key) {
      // Single-source Sales Signals
      case 'sales_pipeline_value':
        value = await this.calcSalesPipeline(supabase, organizationId)
        break
      case 'sales_conversion_rate':
        value = await this.calcConversionRate(supabase, organizationId)
        break
      case 'average_deal_size':
        value = await this.calcAverageDealSize(supabase, organizationId)
        break
      case 'win_rate':
        value = await this.calcWinRate(supabase, organizationId)
        break
      case 'sales_cycle_duration':
        value = await this.calcSalesCycleDuration(supabase, organizationId)
        break
        
      // Single-source Support Signals
      case 'ticket_volume':
        value = await this.calcTicketVolume(supabase, organizationId)
        break
      case 'avg_resolution_time':
        value = await this.calcAvgResolutionTime(supabase, organizationId)
        break
      case 'first_response_time':
        value = await this.calcFirstResponseTime(supabase, organizationId)
        break
      case 'sla_compliance_rate':
        value = await this.calcSLAComplianceRate(supabase, organizationId)
        break
      case 'first_call_resolution':
        value = await this.calcFirstCallResolution(supabase, organizationId)
        break
      case 'escalation_rate':
        value = await this.calcEscalationRate(supabase, organizationId)
        break
        
      // Multi-source Signals
      case 'customer_health_score':
        value = await this.calcCustomerHealthScore(supabase, organizationId)
        break
      case 'revenue_at_risk':
        value = await this.calcRevenueAtRisk(supabase, organizationId)
        break
      case 'churn_risk_score':
        value = await this.calcChurnRiskScore(supabase, organizationId)
        break
      case 'high_value_at_risk':
        value = await this.calcHighValueAtRisk(supabase, organizationId)
        break
        
      default:
        console.warn(`No calculator for signal: ${definition.signal_key}`)
        return null
    }
    
    if (value === null) return null
    
    return {
      signal_key: definition.signal_key,
      value,
      formatted_value: this.formatValue(value, definition),
      trend: 'neutral', // Would compare to previous period
      trend_percentage: null,
      calculated_at: new Date().toISOString(),
      data_sources_used: definition.required_sources
    }
  }
  
  // =====================================================
  // SINGLE-SOURCE CALCULATORS (Sales - CRM)
  // =====================================================
  
  private static async calcSalesPipeline(supabase: any, orgId: string): Promise<number | null> {
    const { data } = await supabase
      .from('zoho_deals')
      .select('amount')
      .eq('organization_id', orgId)
      .not('stage', 'ilike', '%closed%')
    
    if (!data) return null
    return data.reduce((sum: number, d: any) => sum + (parseFloat(d.amount) || 0), 0)
  }
  
  private static async calcConversionRate(supabase: any, orgId: string): Promise<number | null> {
    const { data } = await supabase
      .from('zoho_deals')
      .select('stage')
      .eq('organization_id', orgId)
      .or('stage.ilike.%closed won%,stage.ilike.%closed lost%')
    
    if (!data || data.length === 0) return null
    const won = data.filter((d: any) => d.stage?.toLowerCase().includes('won')).length
    return (won / data.length) * 100
  }
  
  private static async calcAverageDealSize(supabase: any, orgId: string): Promise<number | null> {
    const { data } = await supabase
      .from('zoho_deals')
      .select('amount')
      .eq('organization_id', orgId)
      .ilike('stage', '%closed won%')
    
    if (!data || data.length === 0) return null
    const total = data.reduce((sum: number, d: any) => sum + (parseFloat(d.amount) || 0), 0)
    return total / data.length
  }
  
  private static async calcWinRate(supabase: any, orgId: string): Promise<number | null> {
    const { data } = await supabase
      .from('zoho_deals')
      .select('stage')
      .eq('organization_id', orgId)
      .or('stage.ilike.%closed won%,stage.ilike.%closed lost%')
    
    if (!data || data.length === 0) return null
    const won = data.filter((d: any) => d.stage?.toLowerCase().includes('won')).length
    return (won / data.length) * 100
  }
  
  private static async calcSalesCycleDuration(supabase: any, orgId: string): Promise<number | null> {
    const { data } = await supabase
      .from('zoho_deals')
      .select('sales_cycle_duration')
      .eq('organization_id', orgId)
      .ilike('stage', '%closed won%')
      .not('sales_cycle_duration', 'is', null)
    
    if (!data || data.length === 0) return null
    const total = data.reduce((sum: number, d: any) => sum + (d.sales_cycle_duration || 0), 0)
    return total / data.length
  }
  
  // =====================================================
  // SINGLE-SOURCE CALCULATORS (Support - Desk)
  // =====================================================
  
  private static async calcTicketVolume(supabase: any, orgId: string): Promise<number | null> {
    const { count } = await supabase
      .from('zoho_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
    
    return count
  }
  
  private static async calcAvgResolutionTime(supabase: any, orgId: string): Promise<number | null> {
    const { data } = await supabase
      .from('zoho_tickets')
      .select('resolution_time_hours')
      .eq('organization_id', orgId)
      .not('resolution_time_hours', 'is', null)
    
    if (!data || data.length === 0) return null
    const total = data.reduce((sum: number, t: any) => sum + (parseFloat(t.resolution_time_hours) || 0), 0)
    return total / data.length
  }
  
  private static async calcFirstResponseTime(supabase: any, orgId: string): Promise<number | null> {
    const { data } = await supabase
      .from('zoho_tickets')
      .select('first_response_time_hours')
      .eq('organization_id', orgId)
      .not('first_response_time_hours', 'is', null)
    
    if (!data || data.length === 0) return null
    const total = data.reduce((sum: number, t: any) => sum + (parseFloat(t.first_response_time_hours) || 0), 0)
    return total / data.length
  }
  
  private static async calcSLAComplianceRate(supabase: any, orgId: string): Promise<number | null> {
    const { data } = await supabase
      .from('zoho_tickets')
      .select('sla_violation_type')
      .eq('organization_id', orgId)
    
    if (!data || data.length === 0) return null
    const compliant = data.filter((t: any) => 
      !t.sla_violation_type || t.sla_violation_type.toLowerCase() === 'not violated'
    ).length
    return (compliant / data.length) * 100
  }
  
  private static async calcFirstCallResolution(supabase: any, orgId: string): Promise<number | null> {
    const { data } = await supabase
      .from('zoho_tickets')
      .select('is_first_call_resolution')
      .eq('organization_id', orgId)
    
    if (!data || data.length === 0) return null
    const fcr = data.filter((t: any) => t.is_first_call_resolution === true).length
    return (fcr / data.length) * 100
  }
  
  private static async calcEscalationRate(supabase: any, orgId: string): Promise<number | null> {
    const { data } = await supabase
      .from('zoho_tickets')
      .select('is_escalated')
      .eq('organization_id', orgId)
    
    if (!data || data.length === 0) return null
    const escalated = data.filter((t: any) => t.is_escalated === true).length
    return (escalated / data.length) * 100
  }
  
  // =====================================================
  // MULTI-SOURCE CALCULATORS (CRM + Desk combined)
  // =====================================================
  
  private static async calcCustomerHealthScore(supabase: any, orgId: string): Promise<number | null> {
    // Get accounts with their deal values and ticket counts
    const { data: deals } = await supabase
      .from('zoho_deals')
      .select('account_name, amount, stage')
      .eq('organization_id', orgId)
    
    const { data: tickets } = await supabase
      .from('zoho_tickets')
      .select('account_name, sentiment, is_escalated, sla_violation_type')
      .eq('organization_id', orgId)
    
    if (!deals || !tickets) return null
    
    // Group by account
    const accountHealth: Record<string, { dealValue: number; ticketCount: number; negativeTickets: number }> = {}
    
    deals.forEach((d: any) => {
      if (!d.account_name) return
      if (!accountHealth[d.account_name]) {
        accountHealth[d.account_name] = { dealValue: 0, ticketCount: 0, negativeTickets: 0 }
      }
      if (d.stage?.toLowerCase().includes('won')) {
        accountHealth[d.account_name].dealValue += parseFloat(d.amount) || 0
      }
    })
    
    tickets.forEach((t: any) => {
      if (!t.account_name) return
      if (!accountHealth[t.account_name]) {
        accountHealth[t.account_name] = { dealValue: 0, ticketCount: 0, negativeTickets: 0 }
      }
      accountHealth[t.account_name].ticketCount++
      if (t.is_escalated || t.sentiment?.toLowerCase() === 'negative' || 
          (t.sla_violation_type && !t.sla_violation_type.toLowerCase().includes('not violated'))) {
        accountHealth[t.account_name].negativeTickets++
      }
    })
    
    // Calculate average health score (0-100)
    const accounts = Object.values(accountHealth)
    if (accounts.length === 0) return null
    
    const scores = accounts.map(a => {
      // Higher deal value = good
      // More tickets = bad
      // More negative tickets = very bad
      const valueScore = Math.min(a.dealValue / 100000, 1) * 40 // Max 40 points for value
      const volumeScore = Math.max(0, 30 - a.ticketCount * 2) // Lose points for tickets
      const qualityScore = a.ticketCount > 0 
        ? (1 - a.negativeTickets / a.ticketCount) * 30 
        : 30
      return valueScore + volumeScore + qualityScore
    })
    
    return scores.reduce((a, b) => a + b, 0) / scores.length
  }
  
  private static async calcRevenueAtRisk(supabase: any, orgId: string): Promise<number | null> {
    // Find accounts with escalated tickets or negative sentiment
    const { data: tickets } = await supabase
      .from('zoho_tickets')
      .select('account_name')
      .eq('organization_id', orgId)
      .or('is_escalated.eq.true,sentiment.ilike.%negative%')
    
    if (!tickets) return null
    
    const atRiskAccounts = new Set(tickets.map((t: any) => t.account_name).filter(Boolean))
    
    if (atRiskAccounts.size === 0) return 0
    
    // Sum pipeline value for these accounts
    const { data: deals } = await supabase
      .from('zoho_deals')
      .select('account_name, amount')
      .eq('organization_id', orgId)
      .not('stage', 'ilike', '%closed%')
    
    if (!deals) return null
    
    return deals
      .filter((d: any) => atRiskAccounts.has(d.account_name))
      .reduce((sum: number, d: any) => sum + (parseFloat(d.amount) || 0), 0)
  }
  
  private static async calcChurnRiskScore(supabase: any, orgId: string): Promise<number | null> {
    // Calculate based on ticket patterns
    const { data: tickets } = await supabase
      .from('zoho_tickets')
      .select('account_name, is_escalated, sentiment, number_of_reopen, sla_violation_type')
      .eq('organization_id', orgId)
    
    if (!tickets || tickets.length === 0) return 0
    
    const { data: deals } = await supabase
      .from('zoho_deals')
      .select('account_name')
      .eq('organization_id', orgId)
      .ilike('stage', '%closed won%')
    
    const activeAccounts = new Set(deals?.map((d: any) => d.account_name).filter(Boolean) || [])
    if (activeAccounts.size === 0) return 0
    
    // Count risk indicators per account
    const accountRisks: Record<string, number> = {}
    
    tickets.forEach((t: any) => {
      if (!t.account_name || !activeAccounts.has(t.account_name)) return
      if (!accountRisks[t.account_name]) accountRisks[t.account_name] = 0
      
      if (t.is_escalated) accountRisks[t.account_name] += 3
      if (t.sentiment?.toLowerCase() === 'negative') accountRisks[t.account_name] += 2
      if (t.number_of_reopen > 0) accountRisks[t.account_name] += t.number_of_reopen
      if (t.sla_violation_type && !t.sla_violation_type.toLowerCase().includes('not violated')) {
        accountRisks[t.account_name] += 2
      }
    })
    
    // Calculate percentage of accounts at risk (risk score > 5)
    const atRiskCount = Object.values(accountRisks).filter(r => r > 5).length
    return (atRiskCount / activeAccounts.size) * 100
  }
  
  private static async calcHighValueAtRisk(supabase: any, orgId: string): Promise<number | null> {
    // Get high-value accounts (top 20% by deal value)
    const { data: deals } = await supabase
      .from('zoho_deals')
      .select('account_name, amount')
      .eq('organization_id', orgId)
      .ilike('stage', '%closed won%')
    
    if (!deals || deals.length === 0) return 0
    
    // Sum by account
    const accountValues: Record<string, number> = {}
    deals.forEach((d: any) => {
      if (!d.account_name) return
      accountValues[d.account_name] = (accountValues[d.account_name] || 0) + (parseFloat(d.amount) || 0)
    })
    
    // Find threshold for "high value" (top 20%)
    const values = Object.values(accountValues).sort((a, b) => b - a)
    const threshold = values[Math.floor(values.length * 0.2)] || values[values.length - 1]
    
    const highValueAccounts = new Set(
      Object.entries(accountValues)
        .filter(([_, v]) => v >= threshold)
        .map(([name]) => name)
    )
    
    // Check tickets for these accounts
    const { data: tickets } = await supabase
      .from('zoho_tickets')
      .select('account_name, is_escalated, sentiment')
      .eq('organization_id', orgId)
      .or('is_escalated.eq.true,sentiment.ilike.%negative%')
    
    if (!tickets) return 0
    
    const atRiskHighValue = new Set(
      tickets
        .map((t: any) => t.account_name)
        .filter((name: string) => highValueAccounts.has(name))
    )
    
    return atRiskHighValue.size
  }
  
  // =====================================================
  // HELPERS
  // =====================================================
  
  private static formatValue(value: number, definition: SignalDefinition): string {
    switch (definition.format) {
      case 'currency':
        return new Intl.NumberFormat('en-AU', { 
          style: 'currency', 
          currency: 'AUD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value)
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'decimal':
        return value.toFixed(1)
      case 'number':
      default:
        return Math.round(value).toLocaleString()
    }
  }
  
  /**
   * Store raw data from import into staging tables
   */
  static async stageData(
    organizationId: string,
    importId: string,
    dataType: ZohoDataType,
    records: Record<string, any>[]
  ): Promise<{ success: boolean; count: number; error?: string }> {
    const supabase = await createClient()
    
    const tableName = `zoho_${dataType}`
    const mappedRecords = records.map(r => this.mapRecordToTable(r, dataType, organizationId, importId))
    
    const { error } = await supabase
      .from(tableName)
      .upsert(mappedRecords, { onConflict: 'organization_id,import_id' })
    
    if (error) {
      console.error(`Error staging ${dataType} data:`, error)
      return { success: false, count: 0, error: error.message }
    }
    
    // Update data sources tracker
    await this.updateDataSourceTracker(organizationId, dataType, importId, records.length)
    
    return { success: true, count: records.length }
  }
  
  private static mapRecordToTable(
    record: Record<string, any>, 
    dataType: ZohoDataType,
    organizationId: string,
    importId: string
  ): Record<string, any> {
    const base = { organization_id: organizationId, import_id: importId }
    
    switch (dataType) {
      case 'deals':
        return {
          ...base,
          deal_name: record['Deal Name'],
          deal_owner: record['Deal Owner'],
          account_name: record['Account Name'],
          amount: parseFloat(record['Amount']?.replace(/[^0-9.-]/g, '')) || null,
          closing_date: record['Closing Date'] || null,
          stage: record['Stage'],
          probability: parseInt(record['Probability']) || null,
          expected_revenue: parseFloat(record['Expected Revenue']?.replace(/[^0-9.-]/g, '')) || null,
          lead_source: record['Lead Source'],
          sales_cycle_duration: parseInt(record['Sales Cycle Duration']) || null,
          created_time: record['Created Time'] || null,
          modified_time: record['Modified Time'] || null,
          raw_data: record
        }
      case 'tickets':
        return {
          ...base,
          ticket_id: record['ID'] || record['Ticket Id'],
          ticket_number: record['Ticket Number'],
          subject: record['Subject'],
          status: record['Status'],
          priority: record['Priority'],
          channel: record['Channel'],
          department: record['Department'],
          account_name: record['Account Name'],
          contact_name: record['Contact Name'],
          contact_email: record['Email'],
          ticket_owner: record['Ticket Owner'],
          classification: record['Classifications'],
          category: record['Category'],
          resolution_time_hours: parseFloat(record['Resolution Time in Business Hours']) || null,
          first_response_time_hours: parseFloat(record['First Response Time in Business Hours']) || null,
          sla_violation_type: record['SLA Violation Type'],
          is_escalated: record['Is Escalated']?.toLowerCase() === 'yes' || record['Is Escalated'] === true,
          is_first_call_resolution: record['Is First Call Resolution']?.toLowerCase() === 'yes' || record['Is First Call Resolution'] === true,
          happiness_rating: record['Happiness Rating'],
          sentiment: record['Sentiment'],
          number_of_threads: parseInt(record['Number of Threads']) || null,
          number_of_comments: parseInt(record['Number of Comments']) || null,
          number_of_reopen: parseInt(record['Number of Reopen']) || null,
          created_time: record['Created Time'] || null,
          closed_time: record['Closed Time'] || null,
          raw_data: record
        }
      case 'accounts':
        return {
          ...base,
          account_name: record['Account Name'],
          account_id: record['Account ID'] || record['ID'],
          account_owner: record['Account Owner'],
          industry: record['Industry'],
          account_type: record['Account Type'],
          annual_revenue: parseFloat(record['Annual Revenue']?.replace(/[^0-9.-]/g, '')) || null,
          employees: parseInt(record['Employees']) || null,
          phone: record['Phone'],
          email: record['Email'],
          website: record['Website'],
          billing_country: record['Billing Country'],
          created_time: record['Created Time'] || null,
          modified_time: record['Modified Time'] || null,
          raw_data: record
        }
      case 'contacts':
        return {
          ...base,
          contact_name: record['Contact Name'] || `${record['First Name'] || ''} ${record['Last Name'] || ''}`.trim(),
          first_name: record['First Name'],
          last_name: record['Last Name'],
          email: record['Email'],
          phone: record['Phone'],
          account_name: record['Account Name'],
          contact_owner: record['Contact Owner'],
          lead_source: record['Lead Source'],
          created_time: record['Created Time'] || null,
          modified_time: record['Modified Time'] || null,
          raw_data: record
        }
      default:
        return { ...base, raw_data: record }
    }
  }
  
  private static async updateDataSourceTracker(
    organizationId: string,
    dataType: ZohoDataType,
    importId: string,
    recordCount: number
  ) {
    const supabase = await createClient()
    const sourceType = dataType === 'tickets' ? 'zoho_desk' : 'zoho_crm'
    
    await supabase
      .from('zoho_data_sources')
      .upsert({
        organization_id: organizationId,
        source_type: sourceType,
        data_type: dataType,
        latest_import_id: importId,
        latest_import_at: new Date().toISOString(),
        record_count: recordCount,
        updated_at: new Date().toISOString()
      }, { onConflict: 'organization_id,source_type,data_type' })
  }
}
