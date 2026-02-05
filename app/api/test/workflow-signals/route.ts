import { generateText } from 'ai'
import { sql } from '@/lib/db/neon'
import { NextResponse } from 'next/server'

// Mock organization for testing (in production, would be from auth)
const TEST_ORG_ID = 'test-org-workflow'

interface DataRow {
  [key: string]: string | number
}

interface Signal {
  name: string
  category: string
  value: number
  trend: 'up' | 'down' | 'stable'
  change_percent: number
  interpretation: string
  opportunities: string[]
  risks: string[]
}

interface ExistingDataInfo {
  columns_previously_uploaded: string[]
  last_upload_date: string | null
  recommendation: string
}

interface WorkflowSignalsResponse {
  signals: Signal[]
  existing_data: ExistingDataInfo
  ai_analysis_timestamp: string
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  try {
    const { data_rows, file_name } = await request.json() as {
      data_rows: DataRow[]
      file_name: string
    }

    if (!data_rows || data_rows.length === 0) {
      return NextResponse.json({ error: 'No data rows provided' }, { status: 400 })
    }

    console.log('[workflow-signals] Processing:', file_name, 'rows:', data_rows.length)

    // Step 1: Check staging data for existing uploads
    const existingData = await checkExistingStagedData(TEST_ORG_ID)
    console.log('[workflow-signals] Existing columns:', existingData.columns_previously_uploaded)

    // Step 2: Auto-detect numeric columns as signals
    const detectedSignals = detectSignalsFromData(data_rows)
    console.log('[workflow-signals] Detected signals:', detectedSignals.length)

    // Step 3: Enrich signals with AI analysis
    const enrichedSignals = await enrichSignalsWithAI(detectedSignals)

    // Step 4: Generate recommendation
    const recommendation = generateRecommendation(
      enrichedSignals.map((s) => s.name),
      existingData.columns_previously_uploaded,
    )

    const response: WorkflowSignalsResponse = {
      signals: enrichedSignals,
      existing_data: {
        columns_previously_uploaded: existingData.columns_previously_uploaded,
        last_upload_date: existingData.last_upload_date,
        recommendation,
      },
      ai_analysis_timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[workflow-signals] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Signal detection failed' },
      { status: 500 },
    )
  }
}

/**
 * Query staging tables to check what columns have been previously uploaded
 */
async function checkExistingStagedData(
  orgId: string,
): Promise<{ columns_previously_uploaded: string[]; last_upload_date: string | null }> {
  try {
    // Query staging_fields table for this organization
    const result = await sql`
      SELECT DISTINCT 
        normalized_field_name,
        MAX(created_at) as last_upload_date
      FROM staging_fields
      WHERE organization_id = ${orgId}
      GROUP BY normalized_field_name
      ORDER BY last_upload_date DESC
      LIMIT 100
    `

    if (!result || result.length === 0) {
      console.log('[workflow-signals] No existing staged data found')
      return { columns_previously_uploaded: [], last_upload_date: null }
    }

    const columns = result.map((row: any) => row.normalized_field_name as string)
    const lastUploadDate = result[0]?.last_upload_date
      ? new Date(result[0].last_upload_date).toISOString()
      : null

    console.log('[workflow-signals] Found', columns.length, 'previously uploaded columns')
    return { columns_previously_uploaded: columns, last_upload_date: lastUploadDate }
  } catch (err) {
    console.warn('[workflow-signals] Could not query staging data (table may not exist yet):', err instanceof Error ? err.message : String(err))
    // Return empty data if table doesn't exist - this is expected during early development
    return { columns_previously_uploaded: [], last_upload_date: null }
  }
}

/**
 * Detect numeric columns as signals
 */
function detectSignalsFromData(rows: DataRow[]): Signal[] {
  const signals: Signal[] = []

  if (rows.length === 0) return signals

  const firstRow = rows[0]

  for (const column in firstRow) {
    const values = rows.map((row) => {
      const val = row[column]
      return typeof val === 'number' ? val : parseFloat(String(val))
    }).filter((v) => !isNaN(v))

    // Need at least 70% numeric values
    if (values.length / rows.length < 0.7) continue

    const current = values[values.length - 1] || 0
    const previous = values[values.length - 2] || current
    const change = current - previous
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0

    const trend: 'up' | 'down' | 'stable' =
      changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable'

    signals.push({
      name: column,
      category: guessCategory(column),
      value: Number(current.toFixed(2)),
      trend,
      change_percent: Number(changePercent.toFixed(1)),
      interpretation: '', // Will be filled by AI
      opportunities: [],
      risks: [],
    })
  }

  return signals
}

/**
 * Call AI Gateway for real signal interpretation
 */
async function enrichSignalsWithAI(signals: Signal[]): Promise<Signal[]> {
  const enrichedSignals = [...signals]

  for (const signal of enrichedSignals) {
    try {
      const aiAnalysis = await generateAIInterpretation(signal)
      signal.interpretation = aiAnalysis.interpretation
      signal.opportunities = aiAnalysis.opportunities
      signal.risks = aiAnalysis.risks
      console.log(`[workflow-signals] AI analysis for ${signal.name}: OK`)
    } catch (err) {
      console.error(
        `[workflow-signals] AI analysis failed for ${signal.name}:`,
        err,
      )
      // Fallback to basic interpretation
      signal.interpretation = `${signal.name} is ${signal.trend}ing with ${Math.abs(signal.change_percent)}% change from previous period.`
      signal.opportunities = ['Monitor for trends', 'Compare with team benchmarks']
      signal.risks = ['Continue tracking', 'Watch for deterioration']
    }
  }

  return enrichedSignals
}

/**
 * Call AI SDK to generate signal interpretation
 */
async function generateAIInterpretation(
  signal: Signal,
): Promise<{
  interpretation: string
  opportunities: string[]
  risks: string[]
}> {
  const prompt = `You are a business analyst. Analyze this business metric signal and provide insights.

Signal Name: ${signal.name}
Current Value: ${signal.value}
Trend: ${signal.trend}
Change from Previous: ${signal.change_percent > 0 ? '+' : ''}${signal.change_percent}%
Category: ${signal.category}

Respond with ONLY a valid JSON object, no other text:
{
  "interpretation": "1-2 sentence interpretation of what this metric means",
  "opportunities": ["opportunity 1", "opportunity 2"],
  "risks": ["risk 1", "risk 2"]
}`

  const result = await generateText({
    model: 'openai/gpt-4o-mini',
    prompt,
    temperature: 0.7,
    maxTokens: 200,
  })

  try {
    const parsed = JSON.parse(result.text)
    return {
      interpretation:
        parsed.interpretation ||
        `${signal.name} is ${signal.trend}ing by ${signal.change_percent}%.`,
      opportunities: Array.isArray(parsed.opportunities)
        ? parsed.opportunities.slice(0, 2)
        : ['Monitor trends'],
      risks: Array.isArray(parsed.risks) ? parsed.risks.slice(0, 2) : ['Track performance'],
    }
  } catch (parseErr) {
    console.warn('[workflow-signals] JSON parse error, using fallback:', parseErr)
    return {
      interpretation: `${signal.name} is ${signal.trend}ing with a ${signal.change_percent}% change.`,
      opportunities: ['Investigate drivers', 'Share insights with team'],
      risks: ['Monitor closely', 'Track for patterns'],
    }
  }
}

/**
 * Categorize columns by name patterns
 */
function guessCategory(columnName: string): string {
  const lower = columnName.toLowerCase()

  if (lower.includes('revenue') || lower.includes('mrr') || lower.includes('arr')) {
    return 'Revenue'
  }
  if (lower.includes('churn') || lower.includes('retention')) {
    return 'Retention'
  }
  if (lower.includes('nps') || lower.includes('satisfaction') || lower.includes('csat')) {
    return 'Customer'
  }
  if (lower.includes('ticket') || lower.includes('support')) {
    return 'Support'
  }
  if (lower.includes('deal') || lower.includes('pipeline') || lower.includes('sales')) {
    return 'Sales'
  }

  return 'Metric'
}

/**
 * Generate data recommendation based on new vs existing columns
 */
function generateRecommendation(newColumns: string[], existingColumns: string[]): string {
  const newData = newColumns.filter((col) => !existingColumns.includes(col))
  const repeatedData = newColumns.filter((col) => existingColumns.includes(col))

  if (newData.length === 0 && existingColumns.length > 0) {
    return `You've re-uploaded the same ${repeatedData.length} columns. Consider adding new metrics to unlock signal relationships.`
  }
  if (newData.length > 0 && existingColumns.length > 0) {
    return `New columns: ${newData.join(', ')}. Combined with existing data, you can now detect more relationships.`
  }
  if (newData.length > 0) {
    return `First upload detected with ${newColumns.length} metrics. Upload additional data sources to find cross-signal patterns.`
  }

  return 'Ready for signal analysis.'
}
