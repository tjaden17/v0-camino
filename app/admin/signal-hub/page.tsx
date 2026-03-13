'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Headphones,
  Users,
  Settings,
  Database,
  ArrowRight,
  RefreshCw,
  Zap,
  Lock,
  FileUp
} from 'lucide-react'

interface DataSource {
  data_type: 'deals' | 'tickets' | 'accounts' | 'contacts'
  source_type: string
  is_available: boolean
  record_count: number
  latest_import_at: string | null
}

interface SignalDefinition {
  id: string
  signal_key: string
  name: string
  description: string
  category: string
  required_sources: string[]
  calculation_type: string
  unit: string
  format: string
  trend_direction: string
}

interface SignalAvailability {
  definition: SignalDefinition
  is_calculable: boolean
  missing_sources: string[]
  available_sources: string[]
  data_freshness: 'fresh' | 'stale' | 'unavailable'
  current_value: number | null
}

interface CalculatedSignal {
  signal_key: string
  value: number
  formatted_value: string
  trend: string
  calculated_at: string
}

const DATA_SOURCE_INFO: Record<string, { label: string; icon: any; color: string }> = {
  deals: { label: 'CRM Deals', icon: TrendingUp, color: 'text-blue-600' },
  tickets: { label: 'Desk Tickets', icon: Headphones, color: 'text-green-600' },
  accounts: { label: 'Accounts', icon: Users, color: 'text-purple-600' },
  contacts: { label: 'Contacts', icon: Users, color: 'text-orange-600' }
}

const CATEGORY_INFO: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  sales: { label: 'Sales', icon: TrendingUp, color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
  support: { label: 'Support', icon: Headphones, color: 'text-green-600', bgColor: 'bg-green-500/10' },
  customer: { label: 'Customer', icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-500/10' },
  operations: { label: 'Operations', icon: Settings, color: 'text-orange-600', bgColor: 'bg-orange-500/10' }
}

export default function SignalHubPage() {
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [signals, setSignals] = useState<SignalAvailability[]>([])
  const [calculatedSignals, setCalculatedSignals] = useState<CalculatedSignal[]>([])
  const [summary, setSummary] = useState({ totalSignals: 0, calculableSignals: 0, pendingSignals: 0 })
  const { toast } = useToast()

  useEffect(() => {
    loadSignalAvailability()
  }, [])

  async function loadSignalAvailability() {
    try {
      const response = await fetch('/api/admin/signals/availability')
      if (!response.ok) throw new Error('Failed to load signal availability')
      
      const data = await response.json()
      setDataSources(data.dataSources)
      setSignals(data.signals)
      setSummary(data.summary)
    } catch (error) {
      console.error('[v0] Load signal availability error:', error)
      toast({
        title: 'Error',
        description: 'Failed to load signal availability',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  async function calculateAllSignals() {
    setCalculating(true)
    try {
      const response = await fetch('/api/admin/signals/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      
      if (!response.ok) throw new Error('Failed to calculate signals')
      
      const data = await response.json()
      setCalculatedSignals(data.signals)
      
      toast({
        title: 'Signals calculated',
        description: `Successfully calculated ${data.calculatedCount} signals`
      })
      
      // Reload to get updated values
      await loadSignalAvailability()
    } catch (error) {
      console.error('[v0] Calculate signals error:', error)
      toast({
        title: 'Error',
        description: 'Failed to calculate signals',
        variant: 'destructive'
      })
    } finally {
      setCalculating(false)
    }
  }

  const availableDataCount = dataSources.filter(ds => ds.is_available).length
  const totalDataSources = dataSources.length
  const progressPercentage = (availableDataCount / totalDataSources) * 100

  // Group signals by category
  const groupedSignals = signals.reduce((acc, signal) => {
    const category = signal.definition.category
    if (!acc[category]) acc[category] = []
    acc[category].push(signal)
    return acc
  }, {} as Record<string, SignalAvailability[]>)

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Signal Hub</h1>
          <p className="text-muted-foreground">
            Manage your data sources and available signals
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/import">
              <FileUp className="h-4 w-4 mr-2" />
              Import Data
            </Link>
          </Button>
          <Button 
            onClick={calculateAllSignals} 
            disabled={calculating || summary.calculableSignals === 0}
          >
            {calculating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Calculate Signals
          </Button>
        </div>
      </div>

      {/* Data Sources Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Data Sources</h2>
              <p className="text-sm text-muted-foreground">
                {availableDataCount} of {totalDataSources} sources connected
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>

        <Progress value={progressPercentage} className="h-2 mb-6" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dataSources.map(source => {
            const info = DATA_SOURCE_INFO[source.data_type]
            const Icon = info?.icon || Database
            
            return (
              <div 
                key={source.data_type}
                className={`p-4 rounded-lg border ${
                  source.is_available 
                    ? 'bg-green-500/5 border-green-500/20' 
                    : 'bg-muted/50 border-muted'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-4 w-4 ${source.is_available ? info?.color : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium">{info?.label}</span>
                </div>
                
                {source.is_available ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span className="text-xs">Connected</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {source.record_count.toLocaleString()} records
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <XCircle className="h-3 w-3" />
                    <span className="text-xs">Not imported</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {availableDataCount < totalDataSources && (
          <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700">
                Import more data to unlock additional signals
              </span>
              <Button size="sm" variant="outline" className="ml-auto bg-transparent" asChild>
                <Link href="/admin/import">
                  Import Now
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Signal Availability Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.calculableSignals}</p>
              <p className="text-sm text-muted-foreground">Ready to Calculate</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.pendingSignals}</p>
              <p className="text-sm text-muted-foreground">Need More Data</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.totalSignals}</p>
              <p className="text-sm text-muted-foreground">Total Signals</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Signals by Category */}
      <div className="space-y-6">
        {Object.entries(groupedSignals).map(([category, categorySignals]) => {
          const catInfo = CATEGORY_INFO[category] || CATEGORY_INFO.operations
          const Icon = catInfo.icon
          const calculableCount = categorySignals.filter(s => s.is_calculable).length
          
          return (
            <Card key={category} className="overflow-hidden">
              <div className={`px-6 py-4 ${catInfo.bgColor} border-b`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${catInfo.color}`} />
                    <h3 className="font-semibold">{catInfo.label} Signals</h3>
                  </div>
                  <Badge variant="secondary">
                    {calculableCount}/{categorySignals.length} available
                  </Badge>
                </div>
              </div>
              
              <div className="divide-y">
                {categorySignals.map(signal => {
                  const calculatedValue = calculatedSignals.find(
                    c => c.signal_key === signal.definition.signal_key
                  )
                  
                  return (
                    <div 
                      key={signal.definition.id} 
                      className={`px-6 py-4 ${!signal.is_calculable ? 'bg-muted/30' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{signal.definition.name}</span>
                            {signal.is_calculable ? (
                              <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ready
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-muted-foreground">
                                <Lock className="h-3 w-3 mr-1" />
                                Locked
                              </Badge>
                            )}
                            {signal.definition.calculation_type === 'multi_source' && (
                              <Badge variant="outline" className="text-xs">
                                Multi-source
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {signal.definition.description}
                          </p>
                          
                          {/* Data requirements */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">Requires:</span>
                            {signal.definition.required_sources.map(source => {
                              const isAvailable = signal.available_sources.includes(source)
                              const sourceInfo = DATA_SOURCE_INFO[source]
                              
                              return (
                                <Badge 
                                  key={source}
                                  variant="outline"
                                  className={isAvailable 
                                    ? 'border-green-500/50 text-green-700 bg-green-500/5' 
                                    : 'border-red-500/50 text-red-700 bg-red-500/5'
                                  }
                                >
                                  {isAvailable ? (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  {sourceInfo?.label || source}
                                </Badge>
                              )
                            })}
                          </div>
                        </div>
                        
                        {/* Value display */}
                        <div className="text-right ml-4">
                          {calculatedValue ? (
                            <div>
                              <p className="text-xl font-bold">{calculatedValue.formatted_value}</p>
                              <p className="text-xs text-muted-foreground">
                                Calculated {new Date(calculatedValue.calculated_at).toLocaleDateString()}
                              </p>
                            </div>
                          ) : signal.is_calculable ? (
                            <p className="text-sm text-muted-foreground">Click calculate to compute</p>
                          ) : (
                            <div>
                              <p className="text-sm text-muted-foreground">Missing data:</p>
                              <p className="text-sm font-medium text-red-600">
                                {signal.missing_sources.map(s => DATA_SOURCE_INFO[s]?.label || s).join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Empty state if no signals */}
      {signals.length === 0 && (
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">No Signal Definitions Found</h3>
          <p className="text-muted-foreground mb-4">
            Run the database migration to set up signal definitions.
          </p>
        </Card>
      )}
    </div>
  )
}
