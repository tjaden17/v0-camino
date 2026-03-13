import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MultiSourceSignalService } from '@/lib/multi-source-signal-service'

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
    const { signalKeys } = body as { signalKeys?: string[] }
    
    // Calculate signals
    const calculatedSignals = await MultiSourceSignalService.calculateSignals(profile.organization_id)
    
    // Filter by requested keys if specified
    const results = signalKeys 
      ? calculatedSignals.filter(s => signalKeys.includes(s.signal_key))
      : calculatedSignals
    
    // Store calculated values in signals table
    for (const signal of results) {
      // Check if signal exists in signals table
      const { data: existingSignal } = await supabase
        .from('signals')
        .select('id')
        .eq('organization_id', profile.organization_id)
        .eq('config->>zohoSignalId', signal.signal_key)
        .single()
      
      if (existingSignal) {
        // Update existing signal
        await supabase
          .from('signals')
          .update({
            current_value: signal.value,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSignal.id)
        
        // Add data point
        await supabase
          .from('data_points')
          .insert({
            signal_id: existingSignal.id,
            value: signal.value,
            date: new Date().toISOString().split('T')[0],
            created_by: user.id,
            notes: `Calculated from ${signal.data_sources_used.join(', ')}`
          })
      }
    }
    
    return NextResponse.json({
      success: true,
      calculatedCount: results.length,
      signals: results
    })
    
  } catch (error) {
    console.error('[v0] Calculate signals error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to calculate signals' },
      { status: 500 }
    )
  }
}
