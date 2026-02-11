"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptySignalsTips } from "@/components/empty-signals-tips"
import { SignalAccordionCard } from "@/components/signal-accordion-card"
import { AlertsBell } from "@/components/alerts-bell"
import { 
  ChevronUp, 
  ChevronDown, 
  Filter, 
  Sparkles, 
  X, 
  Pin,
  AlertTriangle, 
  TrendingUp, 
  Minus, 
  Star, 
  LayoutGrid, 
  Layers, 
  ChevronRight,
  Settings2,
  Upload,
} from "lucide-react"
import type { SignalWithData } from "@/lib/signals-service"
import type { SignalInterpretation } from "@/lib/interpretation-service"

interface SignalsPageClientProps {
  signals: SignalWithData[]
  userId: string
  savedSignalIds?: string[]
  userRole?: "executive" | "manager"
  /** KPI names from profile (kpi_1, kpi_2, kpi_3) – matching signals are ordered to the top */
  preferredKpis?: string[]
}

export function SignalsPageClient({ signals: initialSignals, userId, savedSignalIds: initialSavedIds = [], userRole = "manager", preferredKpis = [] }: SignalsPageClientProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [trendFilter, setTrendFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [savedOnly, setSavedOnly] = useState(userRole === "executive" && initialSavedIds.length > 0)
  const [functionFilter, setFunctionFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [showMyKpisOnly, setShowMyKpisOnly] = useState(preferredKpis.length > 0) // Default ON if user has KPIs
  const [sortBy, setSortBy] = useState<"rank" | "trend" | "recent">("rank")
  const [viewMode, setViewMode] = useState<"card" | "grouped">("card")
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(initialSavedIds))
  const [savingSignalId, setSavingSignalId] = useState<string | null>(null)
  const [showNewBanner, setShowNewBanner] = useState(false)
  const [newSignalsCount, setNewSignalsCount] = useState(0)
  const [interpretations, setInterpretations] = useState<Record<string, SignalInterpretation | null>>({})
  const [loadingInterpretation, setLoadingInterpretation] = useState<string | null>(null)
  const [currentSignalIndex, setCurrentSignalIndex] = useState<number>(0)
  const [currentLayer, setCurrentLayer] = useState<"data" | "analysis" | "synthesis">("data")
  const allSignals = initialSignals

  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number, y: number } | null>(null)

  // Unique categories (functions) from signals for the filter dropdown
  const functionOptions = useMemo(() => {
    const categories = new Set(allSignals.map((s) => s.category).filter(Boolean)) as Set<string>
    return Array.from(categories).sort()
  }, [allSignals])

  // Helper: does a signal match any of the user's preferred KPIs?
  const signalMatchesKpi = (signal: SignalWithData): boolean => {
    if (preferredKpis.length === 0) return false
    const kpiLower = preferredKpis.map((k) => k.toLowerCase().trim())
    const signalNameLower = (signal.name || "").toLowerCase()
    const signalCategoryLower = (signal.category || "").toLowerCase()
    const signalSummaryLower = (signal.summary || "").toLowerCase()
    
    return kpiLower.some((kpi) => {
      // Exact or partial match in name
      if (signalNameLower.includes(kpi) || kpi.includes(signalNameLower.replace(/ /g, ""))) return true
      // Match in category
      if (signalCategoryLower.includes(kpi) || kpi.includes(signalCategoryLower)) return true
      // Match in summary
      if (signalSummaryLower.includes(kpi)) return true
      // Also check for common aliases: "sales" matches "revenue", "win rate" matches "win", etc.
      if (kpi.includes("win") && signalNameLower.includes("win")) return true
      if (kpi.includes("lead") && signalNameLower.includes("lead")) return true
      if (kpi.includes("sales") && (signalNameLower.includes("deal") || signalNameLower.includes("revenue") || signalCategoryLower === "sales")) return true
      return false
    })
  }

  const filteredSignals = useMemo(() => {
    return allSignals.filter((signal) => {
      const matchesCategory = categoryFilter === "all" || signal.category === categoryFilter
      const matchesTrend =
        trendFilter === "all" ||
        (trendFilter === "increasing" && signal.trend === "increasing") ||
        (trendFilter === "decreasing" && signal.trend === "decreasing") ||
        (trendFilter === "stable" && signal.trend === "stable")
      const matchesStatus = statusFilter === "all" || signal.status === statusFilter
      const matchesSaved = !savedOnly || savedIds.has(signal.id)
      
      // Function filter (revenue, marketing, sales, support, product)
      const matchesFunction = functionFilter === "all" || signal.category === functionFilter
      
      // Type filter: opportunities vs risks
      let matchesType = true
      if (typeFilter === "opportunities") {
        matchesType = signal.status === "opportunity" || signal.trend === "increasing"
      } else if (typeFilter === "risks") {
        matchesType = signal.status === "needs_attention" || signal.trend === "decreasing"
      }
      
      // My KPIs filter: if enabled, ONLY show signals that match user's preferred KPIs
      const matchesMyKpis = !showMyKpisOnly || signalMatchesKpi(signal)

      return matchesCategory && matchesTrend && matchesStatus && matchesSaved && matchesFunction && matchesType && matchesMyKpis
    })
  }, [allSignals, categoryFilter, trendFilter, statusFilter, savedOnly, savedIds, functionFilter, typeFilter, showMyKpisOnly, preferredKpis])

  // Sort signals by rank (intelligence score), trend, or recency; stuck (pinned) signals always at top
  const sortedSignals = useMemo(() => {
    const sorted = [...filteredSignals]
    
    if (sortBy === "rank") {
      // Sort by urgency/importance score: needs_attention > opportunity > improved > steady
      const statusPriority: Record<string, number> = {
        "needs_attention": 4,
        "opportunity": 3,
        "improved": 2,
        "steady": 1,
        "new": 3
      }
      sorted.sort((a, b) => {
        const aPriority = statusPriority[a.status || "steady"] || 0
        const bPriority = statusPriority[b.status || "steady"] || 0
        if (aPriority !== bPriority) return bPriority - aPriority
        // Secondary sort by change percent (highest impact first)
        const aChange = Math.abs(a.change_percent || 0)
        const bChange = Math.abs(b.change_percent || 0)
        return bChange - aChange
      })
    } else if (sortBy === "trend") {
      // Sort by trend: increasing > stable > decreasing
      const trendPriority: Record<string, number> = { "increasing": 3, "stable": 2, "decreasing": 1 }
      sorted.sort((a, b) => {
        const aPriority = trendPriority[a.trend || "stable"] || 0
        const bPriority = trendPriority[b.trend || "stable"] || 0
        return bPriority - aPriority
      })
    } else if (sortBy === "recent") {
      // Sort by recent updates
      sorted.sort((a, b) => {
        const aDate = a.updated_at ? new Date(a.updated_at).getTime() : 0
        const bDate = b.updated_at ? new Date(b.updated_at).getTime() : 0
        return bDate - aDate
      })
    }
    
    // Order: 1) Stuck (pinned), 2) Profile KPIs (signals matching user's kpi_1/kpi_2/kpi_3), 3) Rest
    const pinned = sorted.filter((s) => savedIds.has(s.id))
    const unpinned = sorted.filter((s) => !savedIds.has(s.id))
    if (preferredKpis.length === 0) return [...pinned, ...unpinned]

    const kpiLower = preferredKpis.map((k) => k.toLowerCase())
    const matchesProfileKpi = (s: SignalWithData) =>
      kpiLower.some(
        (k) =>
          (s.name && s.name.toLowerCase().includes(k)) ||
          (s.category && s.category.toLowerCase().includes(k))
      )
    const profileMatched = unpinned.filter(matchesProfileKpi)
    const rest = unpinned.filter((s) => !profileMatched.includes(s))
    return [...pinned, ...profileMatched, ...rest]
  }, [filteredSignals, sortBy, savedIds, preferredKpis])

  // Toggle save status for a signal
  const handleToggleSave = async (signalId: string) => {
    setSavingSignalId(signalId)
    const isSaved = savedIds.has(signalId)
    
    try {
      if (isSaved) {
        const res = await fetch(`/api/signals/save?signalId=${signalId}`, { method: 'DELETE' })
        if (res.ok) {
          setSavedIds(prev => {
            const next = new Set(prev)
            next.delete(signalId)
            return next
          })
        }
      } else {
        const res = await fetch('/api/signals/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signalId })
        })
        if (res.ok) {
          setSavedIds(prev => new Set(prev).add(signalId))
        }
      }
    } catch (error) {
      console.error('[v0] Toggle save error:', error)
    } finally {
      setSavingSignalId(null)
    }
  }

  // Check for recent upload and show highlight
  useEffect(() => {
    const uploadTimestamp = sessionStorage.getItem("signalsUploadTimestamp")
    if (uploadTimestamp) {
      const uploadTime = parseInt(uploadTimestamp, 10)
      const now = Date.now()
      // Only show if upload was within last 30 seconds
      if (now - uploadTime < 30000) {
        setShowNewBanner(true)
        // Count signals created in last 60 seconds
        const newCount = allSignals.filter(s => {
          if (!s.created_at) return false
          const created = new Date(s.created_at).getTime()
          return now - created < 60000
        }).length
        setNewSignalsCount(newCount || allSignals.length)
        
        // Clear after showing
        sessionStorage.removeItem("signalsUploadTimestamp")
        
        // Auto-hide banner after 5 seconds
        setTimeout(() => setShowNewBanner(false), 5000)
      } else {
        sessionStorage.removeItem("signalsUploadTimestamp")
      }
    }
  }, [allSignals])

  const categories = Array.from(new Set(allSignals.map((s) => s.category).filter(Boolean)))

  // Group filtered signals by status
  const groupedSignals = useMemo(() => {
    const groups: Record<string, SignalWithData[]> = {
      needs_attention: [],
      opportunity: [],
      improved: [],
      steady: [],
      new: [],
    }
    
    for (const signal of filteredSignals) {
      const status = signal.status || 'steady'
      if (groups[status]) {
        groups[status].push(signal)
      }
    }
    
    return groups
  }, [filteredSignals])

  const statusLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    needs_attention: { 
      label: 'Needs Attention', 
      icon: <AlertTriangle className="h-4 w-4" />, 
      color: 'text-destructive' 
    },
    opportunity: { 
      label: 'Opportunities', 
      icon: <Star className="h-4 w-4" />, 
      color: 'text-amber-500' 
    },
    improved: { 
      label: 'Improved', 
      icon: <TrendingUp className="h-4 w-4" />, 
      color: 'text-emerald-500' 
    },
    steady: { 
      label: 'Steady', 
      icon: <Minus className="h-4 w-4" />, 
      color: 'text-muted-foreground' 
    },
    new: { 
      label: 'New', 
      icon: <Sparkles className="h-4 w-4" />, 
      color: 'text-primary' 
    },
  }

  const hasNoSignals = allSignals.length === 0

  if (hasNoSignals) {
    return (
      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6 pb-24">
        <EmptySignalsTips />
      </main>
    )
  }

  if (filteredSignals.length === 0) {
    return (
  <div className="min-h-screen bg-background pb-20">
    <header className="sticky top-0 z-20 bg-gradient-to-r from-primary to-accent border-b border-border shadow-sm">
      <div className="container max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary-foreground">Signals</h1>
        <div className="flex items-center gap-1">
          <Link href="/signals/admin">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
              <Settings2 className="h-4 w-4" />
              <span className="sr-only">Data Management</span>
            </Button>
          </Link>
          <AlertsBell onAlertClick={() => {}} />
        </div>
      </div>
    </header>
    <main className="container max-w-2xl mx-auto px-4 py-6">
      <div className="text-center py-12">
        <p className="text-muted-foreground">No signals match your filters. Try adjusting your selection.</p>
            <Button asChild className="mt-4">
              <Link href="/upload">Upload Data</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 overflow-x-hidden max-w-full">
      {/* New signals banner */}
      {showNewBanner && (
        <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">
              {newSignalsCount > 0 ? `${newSignalsCount} new signals from your upload` : 'Your signals are ready'}
            </span>
          </div>
          <button 
            onClick={() => setShowNewBanner(false)}
            className="p-1 hover:bg-primary-foreground/10 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
  <header className="sticky top-0 z-20 bg-gradient-to-r from-primary to-accent border-b border-border shadow-sm">
    <div className="container max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
      <h1 className="text-xl font-bold text-primary-foreground">Signals</h1>
      <div className="flex items-center gap-1">
        <Link href="/upload">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10" title="Upload Data">
            <Upload className="h-4 w-4" />
            <span className="sr-only">Upload Data</span>
          </Button>
        </Link>
        <Link href="/signals/admin">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
            <Settings2 className="h-4 w-4" />
            <span className="sr-only">Data Management</span>
          </Button>
        </Link>
        <AlertsBell onAlertClick={() => {}} />
      </div>
    </div>
  </header>
  
  <div className="sticky top-[57px] z-10 bg-card border-b border-border shadow-sm">
        <div className="container max-w-2xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select value={functionFilter} onValueChange={setFunctionFilter}>
                <SelectTrigger className="h-9 w-[180px] text-sm">
                  <SelectValue placeholder="Function" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All functions</SelectItem>
                  {functionOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {preferredKpis.length > 0 && (
              <Button
                variant={showMyKpisOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowMyKpisOnly(!showMyKpisOnly)}
                className="h-9 text-sm shrink-0"
              >
                <Pin className="h-3.5 w-3.5 mr-1.5" />
                My KPIs
                {showMyKpisOnly && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {filteredSignals.length}
                  </Badge>
                )}
              </Button>
            )}
            
            <div className="ml-auto shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode(viewMode === "card" ? "grouped" : "card")}
                className="h-9 w-9 hover:bg-primary/10"
                title={viewMode === "card" ? "Switch to grouped view" : "Switch to card view"}
              >
                {viewMode === "card" ? <Layers className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                <span className="sr-only">{viewMode === "card" ? "Grouped view" : "Card view"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container max-w-2xl mx-auto px-4 py-6">
        {viewMode === "card" ? (
          <div className="space-y-4">
            {sortedSignals.map((signal) => (
              <SignalAccordionCard
                key={signal.id}
                signal={signal}
                isSaved={savedIds.has(signal.id)}
                onToggleSave={handleToggleSave}
                isSaving={savingSignalId === signal.id}
                interpretation={interpretations[signal.id]}
                isLoadingInterpretation={loadingInterpretation === signal.id}
                onRequestInterpretation={async () => {
                  if (interpretations[signal.id] !== undefined || loadingInterpretation === signal.id) return
                  setLoadingInterpretation(signal.id)
                  try {
                    const res = await fetch(`/api/signals/${signal.id}/interpretation`)
                    if (res.ok) {
                      const data = await res.json()
                      setInterpretations(prev => ({
                        ...prev,
                        [signal.id]: data.interpretation || null
                      }))
                    } else {
                      setInterpretations(prev => ({
                        ...prev,
                        [signal.id]: null
                      }))
                    }
                  } catch (error) {
                    setInterpretations(prev => ({
                      ...prev,
                      [signal.id]: null
                    }))
                  } finally {
                    setLoadingInterpretation(null)
                  }
                }}
              />
            ))}
            <div className="text-center text-sm text-muted-foreground pt-4">
              {sortedSignals.length} signal{sortedSignals.length !== 1 ? 's' : ''}
            </div>
          </div>
        ) : (
          // Grouped View
          <div className="space-y-6">
            {(['needs_attention', 'opportunity', 'improved', 'steady', 'new'] as const).map((status) => {
              const signals = groupedSignals[status]
              if (signals.length === 0) return null
              
              const { label, icon, color } = statusLabels[status]
              
              return (
                <div key={status} className="space-y-3">
                  <div className={`flex items-center gap-2 ${color}`}>
                    {icon}
                    <h2 className="text-sm font-semibold">{label}</h2>
                    <Badge variant="secondary" className="text-xs">
                      {signals.length}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {signals.map((signal) => (
                      <Link
                        key={signal.id}
                        href={`/signals/${signal.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-primary/50 hover:shadow-sm transition-all">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-foreground truncate">
                                {signal.name}
                              </h3>
                              {savedIds.has(signal.id) && (
                                <Pin className="h-4 w-4 text-primary fill-current shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {signal.category || 'Uncategorized'}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <div className="text-lg font-semibold">
                                {signal.latest_value !== null ? signal.latest_value.toLocaleString() : 'N/A'}
                                {signal.unit && <span className="text-xs text-muted-foreground ml-1">{signal.unit}</span>}
                              </div>
                              {signal.change_percent !== null && (
                                <div className={`text-xs flex items-center justify-end gap-1 ${
                                  signal.change_percent > 0 
                                    ? signal.good_direction === 'higher_is_better' ? 'text-emerald-500' : 'text-destructive'
                                    : signal.change_percent < 0
                                    ? signal.good_direction === 'lower_is_better' ? 'text-emerald-500' : 'text-destructive'
                                    : 'text-muted-foreground'
                                }`}>
                                  {signal.change_percent > 0 ? (
                                    <ChevronUp className="h-3 w-3" />
                                  ) : signal.change_percent < 0 ? (
                                    <ChevronDown className="h-3 w-3" />
                                  ) : null}
                                  {Math.abs(signal.change_percent).toFixed(1)}%
                                </div>
                              )}
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
