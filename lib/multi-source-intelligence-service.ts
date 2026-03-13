/**
 * Multi-Source Intelligence Service
 * 
 * Combines data from multiple sources to:
 * - Detect data discrepancies
 * - Find cross-source correlations
 * - Identify data quality issues
 * - Generate unified insights
 * - Calculate data trustworthiness scores
 */

import { createAdminClient } from "./supabase/admin"

// Types
export interface DataSource {
  id: string
  organizationId: string
  sourceName: string
  sourceType: SourceType
  sourceCategory: SourceCategory
  connectionStatus: ConnectionStatus
  connectionConfig: Record<string, unknown>
  dataTypes: string[]
  recordCount: number
  dateRangeStart: Date | null
  dateRangeEnd: Date | null
  lastSyncAt: Date | null
  lastSyncStatus: 'success' | 'partial' | 'failed' | null
  lastSyncRecords: number | null
  lastSyncError: string | null
  syncFrequency: SyncFrequency
  isActive: boolean
}

export type SourceType = 
  | 'zoho_crm' | 'zoho_desk' | 'hubspot' | 'salesforce' 
  | 'csv_upload' | 'excel_upload' | 'api_integration' 
  | 'manual_entry' | 'google_sheets' | 'quickbooks' 
  | 'stripe' | 'intercom' | 'zendesk' | 'jira' | 'asana'

export type SourceCategory = 
  | 'crm' | 'support' | 'finance' | 'marketing' 
  | 'product' | 'hr' | 'operations'

export type ConnectionStatus = 
  | 'connected' | 'disconnected' | 'error' | 'pending' | 'expired'

export type SyncFrequency = 
  | 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual'

export interface SignalSourceMapping {
  signalId: string
  dataSourceId: string
  isPrimarySource: boolean
  contributionWeight: number
  fieldMappings: Record<string, string>
  dataQualityScore: number | null
  completenessScore: number | null
  freshnessScore: number | null
}

export interface CrossSourceInsight {
  id?: string
  organizationId: string
  insightType: CrossSourceInsightType
  title: string
  description: string
  sourceIds: string[]
  signalIds: string[]
  evidence: Record<string, unknown>
  confidenceScore: number
  impactLevel: 'low' | 'medium' | 'high' | 'critical'
  affectedMetrics: string[]
  recommendations: string[]
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'dismissed'
}

export type CrossSourceInsightType = 
  | 'data_discrepancy' 
  | 'correlation_found' 
  | 'anomaly_detected'
  | 'opportunity_identified' 
  | 'risk_detected' 
  | 'trend_confirmed'
  | 'data_quality_issue' 
  | 'missing_data_pattern'

export interface DataQualityReport {
  sourceId: string
  sourceName: string
  overallScore: number
  completenessScore: number
  accuracyScore: number
  consistencyScore: number
  freshnessScore: number
  issues: DataQualityIssue[]
}

export interface DataQualityIssue {
  type: 'missing_values' | 'outliers' | 'duplicates' | 'stale_data' | 'format_inconsistency'
  severity: 'low' | 'medium' | 'high'
  affectedField: string
  affectedRecords: number
  description: string
  suggestion: string
}

export interface UnifiedSignalView {
  signalId: string
  signalName: string
  sources: Array<{
    sourceId: string
    sourceName: string
    sourceType: SourceType
    value: number
    confidence: number
    lastUpdated: Date
  }>
  unifiedValue: number
  confidenceScore: number
  dataQuality: 'high' | 'medium' | 'low'
  discrepancies: Array<{
    sourceAId: string
    sourceBId: string
    difference: number
    percentDiff: number
  }>
}

// Source category mappings for signal relevance
const SOURCE_SIGNAL_RELEVANCE: Record<SourceCategory, string[]> = {
  crm: ['revenue', 'pipeline', 'deals', 'leads', 'win rate', 'sales', 'conversion', 'accounts', 'contacts'],
  support: ['tickets', 'resolution time', 'csat', 'nps', 'response time', 'backlog', 'satisfaction'],
  finance: ['revenue', 'mrr', 'arr', 'churn', 'cac', 'ltv', 'burn rate', 'runway', 'expenses'],
  marketing: ['leads', 'traffic', 'conversion', 'cac', 'campaign', 'email', 'content', 'spend'],
  product: ['dau', 'mau', 'retention', 'activation', 'feature adoption', 'engagement', 'usage'],
  hr: ['headcount', 'turnover', 'enps', 'hiring', 'attrition', 'satisfaction'],
  operations: ['efficiency', 'utilization', 'sla', 'capacity', 'throughput']
}

// Expected data overlaps between source categories
const EXPECTED_OVERLAPS: Array<{
  categoryA: SourceCategory
  categoryB: SourceCategory
  sharedMetrics: string[]
  expectedCorrelation: 'positive' | 'negative' | 'none'
}> = [
  {
    categoryA: 'crm',
    categoryB: 'finance',
    sharedMetrics: ['revenue', 'bookings', 'deals closed'],
    expectedCorrelation: 'positive'
  },
  {
    categoryA: 'marketing',
    categoryB: 'crm',
    sharedMetrics: ['leads', 'mqls', 'conversion'],
    expectedCorrelation: 'positive'
  },
  {
    categoryA: 'support',
    categoryB: 'product',
    sharedMetrics: ['customer health', 'satisfaction', 'engagement'],
    expectedCorrelation: 'positive'
  },
  {
    categoryA: 'crm',
    categoryB: 'support',
    sharedMetrics: ['customer count', 'accounts', 'revenue at risk'],
    expectedCorrelation: 'positive'
  }
]

/**
 * Main Multi-Source Intelligence Service
 */
export class MultiSourceIntelligenceService {
  private supabase = createAdminClient()

  /**
   * Register a new data source
   */
  async registerDataSource(source: Omit<DataSource, 'id'>): Promise<DataSource | null> {
    const { data, error } = await this.supabase
      .from('data_sources')
      .insert({
        organization_id: source.organizationId,
        source_name: source.sourceName,
        source_type: source.sourceType,
        source_category: source.sourceCategory,
        connection_status: source.connectionStatus,
        connection_config: source.connectionConfig,
        data_types: source.dataTypes,
        record_count: source.recordCount,
        date_range_start: source.dateRangeStart,
        date_range_end: source.dateRangeEnd,
        sync_frequency: source.syncFrequency,
        is_active: source.isActive
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Error registering data source:', error)
      return null
    }

    return this.mapDataSource(data)
  }

  /**
   * Get all data sources for an organization
   */
  async getDataSources(organizationId: string): Promise<DataSource[]> {
    const { data, error } = await this.supabase
      .from('data_sources')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error || !data) {
      console.error('[v0] Error fetching data sources:', error)
      return []
    }

    return data.map(this.mapDataSource)
  }

  /**
   * Map a signal to a data source
   */
  async mapSignalToSource(mapping: SignalSourceMapping): Promise<boolean> {
    const { error } = await this.supabase
      .from('signal_source_mapping')
      .upsert({
        signal_id: mapping.signalId,
        data_source_id: mapping.dataSourceId,
        is_primary_source: mapping.isPrimarySource,
        contribution_weight: mapping.contributionWeight,
        field_mappings: mapping.fieldMappings,
        data_quality_score: mapping.dataQualityScore,
        completeness_score: mapping.completenessScore,
        freshness_score: mapping.freshnessScore
      }, {
        onConflict: 'signal_id,data_source_id'
      })

    if (error) {
      console.error('[v0] Error mapping signal to source:', error)
      return false
    }

    return true
  }

  /**
   * Get unified view of a signal across all sources
   */
  async getUnifiedSignalView(signalId: string): Promise<UnifiedSignalView | null> {
    // Get signal details
    const { data: signal, error: signalError } = await this.supabase
      .from('signals')
      .select('id, name')
      .eq('id', signalId)
      .single()

    if (signalError || !signal) {
      console.error('[v0] Error fetching signal:', signalError)
      return null
    }

    // Get all source mappings for this signal
    const { data: mappings, error: mappingError } = await this.supabase
      .from('signal_source_mapping')
      .select(`
        *,
        data_source:data_sources(*)
      `)
      .eq('signal_id', signalId)

    if (mappingError || !mappings || mappings.length === 0) {
      return null
    }

    // Get latest data point for each source
    const sources: UnifiedSignalView['sources'] = []
    
    for (const mapping of mappings) {
      const { data: dataPoints } = await this.supabase
        .from('signal_data_points')
        .select('value, date')
        .eq('signal_id', signalId)
        .order('date', { ascending: false })
        .limit(1)

      if (dataPoints && dataPoints.length > 0) {
        sources.push({
          sourceId: mapping.data_source_id,
          sourceName: mapping.data_source?.source_name || 'Unknown',
          sourceType: mapping.data_source?.source_type || 'manual_entry',
          value: Number(dataPoints[0].value),
          confidence: mapping.data_quality_score || 0.8,
          lastUpdated: new Date(dataPoints[0].date)
        })
      }
    }

    // Calculate unified value (weighted average)
    const totalWeight = mappings.reduce((sum, m) => sum + (m.contribution_weight || 1), 0)
    const unifiedValue = sources.reduce((sum, s, i) => {
      const weight = mappings[i].contribution_weight || 1
      return sum + (s.value * weight)
    }, 0) / totalWeight

    // Calculate discrepancies
    const discrepancies: UnifiedSignalView['discrepancies'] = []
    for (let i = 0; i < sources.length; i++) {
      for (let j = i + 1; j < sources.length; j++) {
        const diff = Math.abs(sources[i].value - sources[j].value)
        const avgValue = (sources[i].value + sources[j].value) / 2
        const percentDiff = avgValue !== 0 ? (diff / avgValue) * 100 : 0

        if (percentDiff > 5) { // Only report significant discrepancies (>5%)
          discrepancies.push({
            sourceAId: sources[i].sourceId,
            sourceBId: sources[j].sourceId,
            difference: diff,
            percentDiff
          })
        }
      }
    }

    // Calculate overall confidence and quality
    const avgConfidence = sources.reduce((sum, s) => sum + s.confidence, 0) / sources.length
    const dataQuality = avgConfidence > 0.8 ? 'high' : avgConfidence > 0.5 ? 'medium' : 'low'

    return {
      signalId: signal.id,
      signalName: signal.name,
      sources,
      unifiedValue,
      confidenceScore: avgConfidence,
      dataQuality,
      discrepancies
    }
  }

  /**
   * Analyze data quality across all sources
   */
  async analyzeDataQuality(organizationId: string): Promise<DataQualityReport[]> {
    const sources = await this.getDataSources(organizationId)
    const reports: DataQualityReport[] = []

    for (const source of sources) {
      const report = await this.analyzeSourceQuality(source)
      reports.push(report)
    }

    return reports
  }

  /**
   * Analyze quality for a single source
   */
  private async analyzeSourceQuality(source: DataSource): Promise<DataQualityReport> {
    const issues: DataQualityIssue[] = []
    
    // Get signals from this source
    const { data: mappings } = await this.supabase
      .from('signal_source_mapping')
      .select('signal_id, completeness_score, data_quality_score, freshness_score')
      .eq('data_source_id', source.id)

    // Calculate average scores
    const avgCompleteness = mappings?.reduce((sum, m) => sum + (m.completeness_score || 0.7), 0) / (mappings?.length || 1)
    const avgQuality = mappings?.reduce((sum, m) => sum + (m.data_quality_score || 0.7), 0) / (mappings?.length || 1)
    const avgFreshness = mappings?.reduce((sum, m) => sum + (m.freshness_score || 0.7), 0) / (mappings?.length || 1)

    // Check for staleness
    if (source.lastSyncAt) {
      const daysSinceSync = (Date.now() - new Date(source.lastSyncAt).getTime()) / (1000 * 60 * 60 * 24)
      const expectedFrequency = {
        realtime: 0.04, // 1 hour
        hourly: 0.08, // 2 hours
        daily: 2,
        weekly: 10,
        manual: 30
      }[source.syncFrequency]

      if (daysSinceSync > expectedFrequency) {
        issues.push({
          type: 'stale_data',
          severity: daysSinceSync > expectedFrequency * 3 ? 'high' : 'medium',
          affectedField: 'all',
          affectedRecords: source.recordCount,
          description: `Data hasn't synced in ${Math.floor(daysSinceSync)} days`,
          suggestion: `Re-sync data from ${source.sourceName} to get fresh metrics`
        })
      }
    }

    // Check sync status
    if (source.lastSyncStatus === 'failed') {
      issues.push({
        type: 'stale_data',
        severity: 'high',
        affectedField: 'all',
        affectedRecords: source.recordCount,
        description: `Last sync failed: ${source.lastSyncError || 'Unknown error'}`,
        suggestion: 'Check connection settings and re-attempt sync'
      })
    }

    // Check for low completeness
    if (avgCompleteness < 0.5) {
      issues.push({
        type: 'missing_values',
        severity: avgCompleteness < 0.3 ? 'high' : 'medium',
        affectedField: 'multiple',
        affectedRecords: Math.floor(source.recordCount * (1 - avgCompleteness)),
        description: `${Math.floor((1 - avgCompleteness) * 100)}% of expected data is missing`,
        suggestion: 'Review field mappings and ensure all required fields are being captured'
      })
    }

    // Calculate overall score
    const overallScore = (avgCompleteness + avgQuality + avgFreshness + (issues.length === 0 ? 1 : 0.5)) / 4

    return {
      sourceId: source.id,
      sourceName: source.sourceName,
      overallScore,
      completenessScore: avgCompleteness,
      accuracyScore: avgQuality,
      consistencyScore: avgQuality,
      freshnessScore: avgFreshness,
      issues
    }
  }

  /**
   * Detect cross-source insights
   */
  async detectCrossSourceInsights(organizationId: string): Promise<CrossSourceInsight[]> {
    const sources = await this.getDataSources(organizationId)
    const insights: CrossSourceInsight[] = []

    if (sources.length < 2) {
      return insights
    }

    // Check for expected overlaps and discrepancies
    for (const overlap of EXPECTED_OVERLAPS) {
      const sourcesA = sources.filter(s => s.sourceCategory === overlap.categoryA)
      const sourcesB = sources.filter(s => s.sourceCategory === overlap.categoryB)

      if (sourcesA.length > 0 && sourcesB.length > 0) {
        // We have both source types - check for discrepancies
        const insight = await this.checkSourceOverlap(
          organizationId,
          sourcesA,
          sourcesB,
          overlap
        )
        if (insight) {
          insights.push(insight)
        }
      }
    }

    // Check for data quality patterns across sources
    const qualityReports = await this.analyzeDataQuality(organizationId)
    const lowQualitySources = qualityReports.filter(r => r.overallScore < 0.5)
    
    if (lowQualitySources.length > 0) {
      insights.push({
        organizationId,
        insightType: 'data_quality_issue',
        title: 'Multiple Sources Have Quality Issues',
        description: `${lowQualitySources.length} data source(s) have quality scores below 50%: ${lowQualitySources.map(s => s.sourceName).join(', ')}`,
        sourceIds: lowQualitySources.map(s => s.sourceId),
        signalIds: [],
        evidence: {
          qualityScores: lowQualitySources.map(s => ({
            source: s.sourceName,
            score: s.overallScore
          }))
        },
        confidenceScore: 0.9,
        impactLevel: 'high',
        affectedMetrics: ['data reliability', 'signal accuracy'],
        recommendations: [
          'Review and fix data source connections',
          'Verify field mappings are correct',
          'Consider re-syncing affected sources'
        ],
        status: 'new'
      })
    }

    // Check for missing source coverage
    const coveredCategories = new Set(sources.map(s => s.sourceCategory))
    const criticalCategories: SourceCategory[] = ['crm', 'finance', 'support']
    const missingCategories = criticalCategories.filter(c => !coveredCategories.has(c))

    if (missingCategories.length > 0) {
      insights.push({
        organizationId,
        insightType: 'missing_data_pattern',
        title: 'Missing Critical Data Sources',
        description: `No data sources connected for: ${missingCategories.join(', ')}. This limits the insights we can provide.`,
        sourceIds: [],
        signalIds: [],
        evidence: {
          missingCategories,
          connectedCategories: Array.from(coveredCategories)
        },
        confidenceScore: 1.0,
        impactLevel: 'medium',
        affectedMetrics: missingCategories.flatMap(c => SOURCE_SIGNAL_RELEVANCE[c] || []),
        recommendations: missingCategories.map(c => `Connect a ${c} data source to unlock ${c} metrics`),
        status: 'new'
      })
    }

    return insights
  }

  /**
   * Check for overlap issues between two source categories
   */
  private async checkSourceOverlap(
    organizationId: string,
    sourcesA: DataSource[],
    sourcesB: DataSource[],
    overlap: typeof EXPECTED_OVERLAPS[0]
  ): Promise<CrossSourceInsight | null> {
    // Get signals that should be shared
    const { data: signalsA } = await this.supabase
      .from('signals')
      .select('id, name, absolute_value')
      .eq('organization_id', organizationId)
      .in('name', overlap.sharedMetrics.map(m => `%${m}%`))

    const { data: signalsB } = await this.supabase
      .from('signals')
      .select('id, name, absolute_value')
      .eq('organization_id', organizationId)
      .in('name', overlap.sharedMetrics.map(m => `%${m}%`))

    if (!signalsA?.length || !signalsB?.length) {
      return null
    }

    // Check for significant discrepancies
    // This is a simplified check - in production you'd compare actual values
    const hasDiscrepancy = false // Would be calculated from actual data

    if (hasDiscrepancy) {
      return {
        organizationId,
        insightType: 'data_discrepancy',
        title: `Data Mismatch: ${overlap.categoryA} vs ${overlap.categoryB}`,
        description: `Shared metrics between ${overlap.categoryA} and ${overlap.categoryB} sources show significant discrepancies.`,
        sourceIds: [...sourcesA.map(s => s.id), ...sourcesB.map(s => s.id)],
        signalIds: [],
        evidence: {
          sharedMetrics: overlap.sharedMetrics,
          expectedCorrelation: overlap.expectedCorrelation
        },
        confidenceScore: 0.8,
        impactLevel: 'medium',
        affectedMetrics: overlap.sharedMetrics,
        recommendations: [
          'Verify data mappings in both sources',
          'Check if the same metrics are being measured identically',
          'Review date ranges to ensure comparison is valid'
        ],
        status: 'new'
      }
    }

    return null
  }

  /**
   * Save cross-source insights to database
   */
  async saveCrossSourceInsights(insights: CrossSourceInsight[]): Promise<void> {
    for (const insight of insights) {
      await this.supabase
        .from('cross_source_insights')
        .insert({
          organization_id: insight.organizationId,
          insight_type: insight.insightType,
          title: insight.title,
          description: insight.description,
          source_ids: insight.sourceIds,
          signal_ids: insight.signalIds,
          evidence: insight.evidence,
          confidence_score: insight.confidenceScore,
          impact_level: insight.impactLevel,
          affected_metrics: insight.affectedMetrics,
          recommendations: insight.recommendations,
          status: insight.status
        })
    }
  }

  /**
   * Get cross-source insights for an organization
   */
  async getCrossSourceInsights(organizationId: string): Promise<CrossSourceInsight[]> {
    const { data, error } = await this.supabase
      .from('cross_source_insights')
      .select('*')
      .eq('organization_id', organizationId)
      .neq('status', 'dismissed')
      .order('created_at', { ascending: false })

    if (error || !data) {
      console.error('[v0] Error fetching cross-source insights:', error)
      return []
    }

    return data.map(d => ({
      id: d.id,
      organizationId: d.organization_id,
      insightType: d.insight_type as CrossSourceInsightType,
      title: d.title,
      description: d.description,
      sourceIds: d.source_ids,
      signalIds: d.signal_ids,
      evidence: d.evidence,
      confidenceScore: Number(d.confidence_score),
      impactLevel: d.impact_level,
      affectedMetrics: d.affected_metrics,
      recommendations: d.recommendations,
      status: d.status
    }))
  }

  /**
   * Get source coverage summary
   */
  async getSourceCoverageSummary(organizationId: string): Promise<{
    totalSources: number
    byCategory: Record<SourceCategory, number>
    byType: Record<SourceType, number>
    overallHealth: 'healthy' | 'warning' | 'critical'
    recommendations: string[]
  }> {
    const sources = await this.getDataSources(organizationId)
    
    const byCategory: Record<string, number> = {}
    const byType: Record<string, number> = {}

    for (const source of sources) {
      byCategory[source.sourceCategory] = (byCategory[source.sourceCategory] || 0) + 1
      byType[source.sourceType] = (byType[source.sourceType] || 0) + 1
    }

    // Determine health
    const connectedSources = sources.filter(s => s.connectionStatus === 'connected')
    const errorSources = sources.filter(s => s.connectionStatus === 'error')
    
    let overallHealth: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (errorSources.length > sources.length * 0.3) {
      overallHealth = 'critical'
    } else if (errorSources.length > 0 || connectedSources.length < 2) {
      overallHealth = 'warning'
    }

    // Generate recommendations
    const recommendations: string[] = []
    
    if (!byCategory['crm']) {
      recommendations.push('Connect a CRM (Zoho, HubSpot, Salesforce) for sales metrics')
    }
    if (!byCategory['support']) {
      recommendations.push('Connect a support tool (Zoho Desk, Zendesk) for customer metrics')
    }
    if (!byCategory['finance']) {
      recommendations.push('Connect finance data (Stripe, QuickBooks) for revenue metrics')
    }
    if (sources.length < 3) {
      recommendations.push('Add more data sources for richer cross-source insights')
    }
    if (errorSources.length > 0) {
      recommendations.push(`Fix ${errorSources.length} disconnected source(s): ${errorSources.map(s => s.sourceName).join(', ')}`)
    }

    return {
      totalSources: sources.length,
      byCategory: byCategory as Record<SourceCategory, number>,
      byType: byType as Record<SourceType, number>,
      overallHealth,
      recommendations
    }
  }

  /**
   * Map database row to DataSource type
   */
  private mapDataSource(row: Record<string, unknown>): DataSource {
    return {
      id: row.id as string,
      organizationId: row.organization_id as string,
      sourceName: row.source_name as string,
      sourceType: row.source_type as SourceType,
      sourceCategory: row.source_category as SourceCategory,
      connectionStatus: row.connection_status as ConnectionStatus,
      connectionConfig: row.connection_config as Record<string, unknown>,
      dataTypes: row.data_types as string[],
      recordCount: row.record_count as number,
      dateRangeStart: row.date_range_start ? new Date(row.date_range_start as string) : null,
      dateRangeEnd: row.date_range_end ? new Date(row.date_range_end as string) : null,
      lastSyncAt: row.last_sync_at ? new Date(row.last_sync_at as string) : null,
      lastSyncStatus: row.last_sync_status as 'success' | 'partial' | 'failed' | null,
      lastSyncRecords: row.last_sync_records as number | null,
      lastSyncError: row.last_sync_error as string | null,
      syncFrequency: row.sync_frequency as SyncFrequency,
      isActive: row.is_active as boolean
    }
  }
}

// Export singleton instance
export const multiSourceIntelligence = new MultiSourceIntelligenceService()
