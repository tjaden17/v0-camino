"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X, ChevronRight, Database, Calculator, Link, CheckCircle2 } from "lucide-react"
import type { Insight } from "@/lib/types"

interface InsufficientDataCardProps {
  insight: Insight
}

export function InsufficientDataCard({ insight }: InsufficientDataCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const data = insight.insufficientData

  if (!data) return null

  return (
    <>
      {/* Compact Card */}
      <Card
        className="w-full cursor-pointer border border-dashed border-amber-300 bg-amber-50/40 dark:bg-amber-950/10 dark:border-amber-800 hover:shadow-md transition-all hover:border-amber-400"
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="p-4">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                {insight.category}
              </Badge>
              <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                <AlertTriangle className="h-3 w-3" />
                <span className="text-xs font-semibold">Insufficient Data</span>
              </div>
            </div>
          </div>

          {/* Signal Name + Greyed Out Value */}
          <div className="mb-3">
            <h3 className="font-bold text-foreground text-base mb-1">{insight.header}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-muted-foreground/40 select-none">- -</span>
              <span className="text-xs text-muted-foreground">No data available</span>
            </div>
          </div>

          {/* Reason snippet */}
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {data.reason}
          </p>

          {/* Footer CTA */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <Database className="h-3 w-3" />
              {data.requiredData.length} data {data.requiredData.length === 1 ? "field" : "fields"} needed
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-amber-700 dark:text-amber-400 hover:text-amber-800 hover:bg-amber-100 gap-1 pr-1"
              onClick={(e) => { e.stopPropagation(); setIsOpen(true) }}
            >
              See what&apos;s needed
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center sm:items-center"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-background w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-background z-10 flex items-start justify-between p-5 border-b">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                    {insight.category}
                  </Badge>
                  <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="text-xs font-semibold">Insufficient Data</span>
                  </div>
                </div>
                <h2 className="text-lg font-bold text-foreground">{insight.header}</h2>
                <p className="text-sm text-muted-foreground mt-1">{insight.metric}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-5 space-y-6">

              {/* Why we can't calculate */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Why this signal is unavailable
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                  {data.reason}
                </p>
              </div>

              {/* How this KPI is calculated */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  How this KPI is calculated
                </h3>
                <div className="bg-muted/50 rounded-xl p-4 font-mono text-sm text-foreground border border-border">
                  {data.formula}
                </div>
              </div>

              {/* Required Data Fields */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  Data required to calculate this signal
                </h3>
                <div className="space-y-3">
                  {data.requiredData.map((req, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl border border-border bg-background hover:bg-muted/30 transition-colors"
                    >
                      <div className="mt-0.5 h-5 w-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-muted-foreground">{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-sm font-semibold text-foreground">{req.field}</span>
                          <Badge variant="outline" className="text-xs">{req.source}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{req.description}</p>
                        {req.example && (
                          <p className="text-xs text-primary mt-1 font-mono">
                            e.g. {req.example}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How to connect */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Link className="h-4 w-4 text-primary" />
                  How to provide this data
                </h3>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <p className="text-sm text-foreground leading-relaxed">{data.howToConnect}</p>
                </div>
              </div>

              {/* Once connected message */}
              <div className="flex items-start gap-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                  Once this data is connected, this signal will be automatically calculated and added to your dashboard.
                </p>
              </div>

              {/* CTA */}
              <Button
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                Connect Data Source
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
