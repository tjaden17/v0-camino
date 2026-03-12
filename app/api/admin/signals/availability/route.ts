import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MultiSourceSignalService } from '@/lib/multi-source-signal-service'

export async function GET() {
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
    
    // Get data sources
    const dataSources = await MultiSourceSignalService.getDataSources(profile.organization_id)
    
    // Get signal availability
    const signalAvailability = await MultiSourceSignalService.getSignalAvailability(profile.organization_id)
    
    // Group by category
    const groupedSignals = signalAvailability.reduce((acc, signal) => {
      const category = signal.definition.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(signal)
      return acc
    }, {} as Record<string, typeof signalAvailability>)
    
    return NextResponse.json({
      dataSources,
      signals: signalAvailability,
      groupedSignals,
      summary: {
        totalSignals: signalAvailability.length,
        calculableSignals: signalAvailability.filter(s => s.is_calculable).length,
        pendingSignals: signalAvailability.filter(s => !s.is_calculable).length,
        availableDataTypes: dataSources.filter(ds => ds.is_available).map(ds => ds.data_type)
      }
    })
    
  } catch (error) {
    console.error('[v0] Signal availability error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get signal availability' },
      { status: 500 }
    )
  }
}
