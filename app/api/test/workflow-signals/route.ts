import { NextResponse } from 'next/server'

interface DataRow {
  [key: string]: string
}

interface SignalDefinition {
  name: string
  category: string
  latest_value: number
  previous_value: number
  trend: 'increasing' | 'decreasing' | 'stable'
  benchmark_value: number
  change_percentage: number
  interpretation: string
  opportunities: string[]
  risks: string[]
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

    console.log('[test-workflow] Detecting signals from', data_rows.length, 'rows')

    // Auto-detect numeric columns as potential signals
    const signals: SignalDefinition[] = []
    const firstRow = data_rows[0]
    
    for (const column in firstRow) {
      const values = data_rows
        .map(row => parseFloat(row[column]))
        .filter(v => !isNaN(v))

      // If column has mostly numeric values, create a signal
      if (values.length / data_rows.length > 0.7) {
        const latest = values[values.length - 1] || 0
        const previous = values[values.length - 2] || latest
        const change = latest - previous
        const changePercent = previous !== 0 ? (change / previous) * 100 : 0
        const benchmark = values.reduce((a, b) => a + b, 0) / values.length

        let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
        if (changePercent > 5) trend = 'increasing'
        if (changePercent < -5) trend = 'decreasing'

        // Generate AI-like analysis (mock)
        const interpretation = generateInterpretation(column, trend, changePercent)
        const opportunities = generateOpportunities(column, trend, changePercent)
        const risks = generateRisks(column, trend, changePercent)

        signals.push({
          name: column,
          category: guessCategory(column),
          latest_value: latest,
          previous_value: previous,
          trend,
          benchmark_value: benchmark,
          change_percentage: changePercent,
          interpretation,
          opportunities,
          risks,
        })
      }
    }

    console.log('[test-workflow] Detected', signals.length, 'signals')

    return NextResponse.json({
      success: true,
      file_name,
      signals_count: signals.length,
      signals,
    })
  } catch (error) {
    console.error('[test-workflow] Signal detection error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Signal detection failed' },
      { status: 500 }
    )
  }
}

function guessCategory(columnName: string): string {
  const lower = columnName.toLowerCase()
  if (lower.includes('revenue') || lower.includes('mrr') || lower.includes('arr')) return 'Revenue'
  if (lower.includes('churn') || lower.includes('retention')) return 'Retention'
  if (lower.includes('nps') || lower.includes('satisfaction')) return 'Customer'
  if (lower.includes('ticket') || lower.includes('support')) return 'Support'
  if (lower.includes('deal') || lower.includes('pipeline')) return 'Sales'
  return 'Metric'
}

function generateInterpretation(
  columnName: string,
  trend: string,
  changePercent: number
): string {
  const direction = trend === 'increasing' ? 'increased' : 'decreased'
  const magnitude = Math.abs(changePercent)
  
  if (magnitude > 20) {
    return `${columnName} has significantly ${direction} by ${magnitude.toFixed(1)}%. This represents a notable shift from the previous period.`
  } else if (magnitude > 5) {
    return `${columnName} has moderately ${direction} by ${magnitude.toFixed(1)}%, indicating a meaningful trend change.`
  } else {
    return `${columnName} remains relatively stable with a minor ${direction} of ${magnitude.toFixed(1)}%.`
  }
}

function generateOpportunities(
  columnName: string,
  trend: string,
  changePercent: number
): string[] {
  const opportunities: string[] = []

  if (trend === 'increasing') {
    opportunities.push(`Capitalize on the upward momentum in ${columnName}`)
    opportunities.push('Consider increasing investment in related areas')
  }
  
  if (Math.abs(changePercent) > 10) {
    opportunities.push(`Investigate the drivers behind the ${Math.abs(changePercent).toFixed(1)}% change`)
    opportunities.push('Share success stories or lessons learned with the team')
  }

  return opportunities
}

function generateRisks(
  columnName: string,
  trend: string,
  changePercent: number
): string[] {
  const risks: string[] = []

  if (trend === 'decreasing' && Math.abs(changePercent) > 10) {
    risks.push(`Significant decline in ${columnName} requires immediate investigation`)
    risks.push('Monitor closely for further deterioration')
  }

  if (Math.abs(changePercent) > 20) {
    risks.push('Volatility detected - establish stability measures')
  }

  return risks
}
