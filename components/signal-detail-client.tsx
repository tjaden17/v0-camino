"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/bottom-nav"
import { ArrowLeft, TrendingUp, TrendingDown, Minus, User, Bookmark, BookmarkCheck, AlertTriangle, Star, Database, BarChart3, Layers, Loader2 } from "lucide-react"
import type { SignalWithData } from "@/lib/signals-service"
import type { SignalInterpretation } from "@/lib/interpretation-service"
import Link from "next/link"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface SignalDetailClientProps {
  signal: SignalWithData
  ninetyDayAvg: number | null
  interpretation?: SignalInterpretation | null
  isSaved?: boolean
  userId: string
}

export function SignalDetailClient({ signal, ninetyDayAvg, interpretation, isSaved: initialSaved = false, userId }: SignalDetailClientProps) {
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [isSaving, setIsSaving] = useState(false)
  const getTrendIcon = () => {
    if (signal.trend === "increasing") return <TrendingUp className="h-5 w-5 text-green-500" />
    if (signal.trend === "decreasing") return <TrendingDown className="h-5 w-5 text-red-500" />
    return <Minus className="h-5 w-5 text-muted-foreground" />
  }

  const getTrendColor = () => {
    if (signal.trend === "increasing") return "text-green-600"
    if (signal.trend === "decreasing") return "text-red-600"
    return "text-muted-foreground"
  }

  const handleToggleSave = async () => {
    setIsSaving(true)
    try {
      if (isSaved) {
        const res = await fetch(`/api/signals/save?signalId=${signal.id}`, { method: 'DELETE' })
        if (res.ok) setIsSaved(false)
      } else {
        const res = await fetch('/api/signals/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signalId: signal.id })
        })
        if (res.ok) setIsSaved(true)
      }
    } catch (error) {
      console.error('Toggle save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const chartData = signal.data_points
    .slice()
    .reverse()
    .map((point) => ({
      date: point.date,
      value: point.value,
      formattedDate: format(new Date(point.date), "MMM d"),
    }))

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-20 bg-gradient-to-r from-primary to-accent border-b border-border shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="text-primary-foreground">
            <Link href="/signals">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold text-primary-foreground truncate flex-1">{signal.name}</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleToggleSave}
            disabled={isSaving}
            className="text-primary-foreground hover:bg-white/20"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isSaved ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{signal.name}</CardTitle>
                {signal.category && (
                  <Badge variant="outline" className="mt-2">
                    {signal.category}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon()}
                <span className="text-sm font-semibold">{signal.trend || "stable"}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Current Value</div>
                <div className="text-3xl font-bold">
                  {signal.latest_value !== null ? signal.latest_value.toLocaleString() : "—"}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Change</div>
                <div className={`text-2xl font-semibold ${getTrendColor()}`}>
                  {signal.change !== null ? (
                    <>
                      {signal.change > 0 && "+"}
                      {signal.change_percent}%
                    </>
                  ) : (
                    "—"
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">90-Day Average</div>
                <div className="text-2xl font-semibold">{ninetyDayAvg !== null ? ninetyDayAvg.toFixed(1) : "—"}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Benchmark</div>
                <div className="text-2xl font-semibold">
                  {signal.benchmark_value !== null ? signal.benchmark_value.toLocaleString() : "—"}
                </div>
              </div>
            </div>

            {signal.owner_name && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Owned by {signal.owner_name}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trend (Last 90 Days)</CardTitle>
            <CardDescription>Historical performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No historical data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Interpretation */}
        {interpretation ? (
          <div className="space-y-4">
            {/* What We Found */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">What We Found</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-base font-medium">{interpretation.what_we_found.absolute_value}</p>
                <p className="text-sm text-muted-foreground">{interpretation.what_we_found.trend}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{interpretation.what_we_found.sample_size} samples</Badge>
                  <Badge variant="outline">{interpretation.what_we_found.time_period}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* What It Means */}
            <Card className="border-accent/30">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  <CardTitle className="text-lg">What It Means</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-relaxed">{interpretation.what_it_means.why_change_happened}</p>
                {interpretation.what_it_means.benchmark && (
                  <p className="text-sm text-muted-foreground italic">{interpretation.what_it_means.benchmark}</p>
                )}
                {interpretation.what_it_means.scope_customers && (
                  <p className="text-xs text-muted-foreground">{interpretation.what_it_means.scope_customers}</p>
                )}
              </CardContent>
            </Card>

            {/* So What */}
            <Card className={cn(
              "border-2",
              interpretation.so_what.direction === "positive" 
                ? "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20" 
                : interpretation.so_what.direction === "negative"
                ? "border-destructive/30 bg-destructive/5"
                : "border-primary/30 bg-primary/5"
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Layers className={cn(
                    "h-5 w-5",
                    interpretation.so_what.direction === "positive" 
                      ? "text-emerald-600" 
                      : interpretation.so_what.direction === "negative"
                      ? "text-destructive"
                      : "text-primary"
                  )} />
                  <CardTitle className="text-lg">So What</CardTitle>
                  {interpretation.so_what.direction === "positive" && (
                    <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30">
                      <Star className="h-3 w-3 mr-1" /> Opportunity
                    </Badge>
                  )}
                  {interpretation.so_what.direction === "negative" && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" /> Needs Attention
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed">{interpretation.so_what.expected_vs_unexpected}</p>
                <div className="p-3 bg-background/80 rounded-lg">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">KPI Impact</p>
                  <p className="text-sm">{interpretation.so_what.kpi_impact}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Fallback Analysis */
          <Card>
            <CardHeader>
              <CardTitle>Analysis</CardTitle>
              <CardDescription>AI-powered insights and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">
                  {signal.trend === "increasing" &&
                    `${signal.name} is showing positive momentum, increasing by ${signal.change_percent}% from the previous period.`}
                  {signal.trend === "decreasing" &&
                    `${signal.name} has decreased by ${Math.abs(signal.change_percent || 0)}% from the previous period. This requires attention.`}
                  {signal.trend === "stable" && `${signal.name} is stable with minimal changes from the previous period.`}
                </p>

                {signal.benchmark_value && signal.latest_value && (
                  <p className="text-muted-foreground mt-4">
                    {signal.latest_value >= signal.benchmark_value ? (
                      <>
                        Current value ({signal.latest_value.toLocaleString()}) is{" "}
                        <span className="text-green-600 font-semibold">meeting the benchmark</span> of{" "}
                        {signal.benchmark_value.toLocaleString()}.
                      </>
                    ) : (
                      <>
                        Current value ({signal.latest_value.toLocaleString()}) is{" "}
                        <span className="text-yellow-600 font-semibold">below the benchmark</span> of{" "}
                        {signal.benchmark_value.toLocaleString()} by{" "}
                        {(signal.benchmark_value - signal.latest_value).toLocaleString()}.
                      </>
                    )}
                  </p>
                )}

                {ninetyDayAvg && signal.latest_value && (
                  <p className="text-muted-foreground mt-4">
                    The 90-day average is {ninetyDayAvg.toFixed(1)}.
                    {signal.latest_value > ninetyDayAvg
                      ? ` Current performance is above the recent average.`
                      : ` Current performance is below the recent average.`}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
