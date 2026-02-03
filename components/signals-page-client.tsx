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
  Bookmark, 
  BookmarkCheck, 
  AlertTriangle, 
  TrendingUp, 
  Minus, 
  Star, 
  LayoutGrid, 
  Layers, 
  ChevronRight 
} from "lucide-react"
import type { SignalWithData } from "@/lib/signals-service"
import type { SignalInterpretation } from "@/lib/interpretation-service"

interface SignalsPageClientProps {
  signals: SignalWithData[]
  userId: string
  savedSignalIds?: string[]
  userRole?: "executive" | "manager"
}

export function SignalsPageClient({ signals: initialSignals, userId, savedSignalIds: initialSavedIds = [], userRole = "manager" }: SignalsPageClientProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [trendFilter, setTrendFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [savedOnly, setSavedOnly] = useState(userRole === "executive" && initialSavedIds.length > 0)
  const [functionFilter, setFunctionFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
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

      return matchesCategory && matchesTrend && matchesStatus && matchesSaved && matchesFunction && matchesType
    })
  }, [allSignals, categoryFilter, trendFilter, statusFilter, savedOnly, savedIds, functionFilter, typeFilter])

  // Sort signals by rank (intelligence score), trend, or recency
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
    
    return sorted
  }, [filteredSignals, sortBy])

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
            <AlertsBell onAlertClick={() => {}} />
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
          <AlertsBell onAlertClick={() => {}} />
        </div>
      </header>

      <div className="sticky top-[57px] z-10 bg-card border-b border-border shadow-sm">
        <div className="container max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant={savedOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setSavedOnly(!savedOnly)}
                className="h-9 px-3 shrink-0"
                title="My Signals"
              >
                {savedOnly ? <BookmarkCheck className="h-4 w-4 mr-1" /> : <Bookmark className="h-4 w-4 mr-1" />}
                <span className="text-xs">My Signals</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode(viewMode === "card" ? "grouped" : "card")}
                className="h-9 w-9 shrink-0 hover:bg-primary/10"
                title={viewMode === "card" ? "Switch to grouped view" : "Switch to card view"}
              >
                {viewMode === "card" ? <Layers className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                <span className="sr-only">{viewMode === "card" ? "Grouped view" : "Card view"}</span>
              </Button>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as "rank" | "trend" | "recent")}>
                <SelectTrigger className="w-[90px] h-9 text-xs border-border shrink-0">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rank">By Rank</SelectItem>
                  <SelectItem value="trend">By Trend</SelectItem>
                  <SelectItem value="recent">Recent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] h-9 text-xs border-border shrink-0">
                  <div className="flex items-center gap-1.5">
                    {statusFilter === 'needs_attention' && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                    {statusFilter === 'opportunity' && <Star className="h-3.5 w-3.5 text-amber-500" />}
                    {statusFilter === 'improved' && <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
                    {statusFilter === 'all' && <Filter className="h-3.5 w-3.5 text-muted-foreground" />}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="needs_attention">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      Needs Attention
                    </span>
                  </SelectItem>
                  <SelectItem value="opportunity">
                    <span className="flex items-center gap-2">
                      <Star className="h-3.5 w-3.5 text-amber-500" />
                      Opportunity
                    </span>
                  </SelectItem>
                  <SelectItem value="improved">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      Improved
                    </span>
                  </SelectItem>
                  <SelectItem value="steady">
                    <span className="flex items-center gap-2">
                      <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                      Steady
                    </span>
                  </SelectItem>
                  <SelectItem value="new">New</SelectItem>
                </SelectContent>
              </Select>

              <Select value={functionFilter} onValueChange={setFunctionFilter}>
                <SelectTrigger className="w-[110px] h-9 text-xs border-border shrink-0">
                  <SelectValue placeholder="Function" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Functions</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[110px] h-9 text-xs border-border shrink-0">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="opportunities">Opportunities</SelectItem>
                  <SelectItem value="risks">Risks</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[100px] h-9 text-xs border-border shrink-0">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat || "uncategorized"}>
                      {cat || "Uncategorized"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={trendFilter} onValueChange={setTrendFilter}>
                <SelectTrigger className="w-[85px] h-9 text-xs border-border shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Trend</SelectItem>
                  <SelectItem value="increasing">Up</SelectItem>
                  <SelectItem value="decreasing">Down</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                </SelectContent>
              </Select>
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
                                <BookmarkCheck className="h-4 w-4 text-primary shrink-0" />
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
