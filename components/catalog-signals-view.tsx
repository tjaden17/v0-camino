"use client"

import { BarChart3, Layers } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SignalAccordionCard, type TrendPeriod, type TrendDisplay } from "@/components/signal-accordion-card"
import type { SignalWithData } from "@/lib/signals-service"
import type { SignalInterpretation } from "@/lib/interpretation-service"

export interface CatalogSignalItem {
  id: string
  name: string
  category: string
  status: "calculated" | "partial" | "missing"
  value?: number | null
  formattedValue?: string | null
  trend?: string | null
  trendPercentage?: number | null
  message?: string | null
  requiredColumns?: string[]
  signalId?: string
}

/** Minimal signal shape from org (e.g. admin details API) to build SignalWithData. */
export interface OrgSignalLike {
  id?: string
  name?: string
  category?: string | null
  absolute_value?: string | null
  trend?: string | null
  latest_value?: number | null
  summary?: string | null
  trend_30d_pct?: number | null
  trend_90d_pct?: number | null
  trend_30d_delta?: number | null
  trend_90d_delta?: number | null
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

function toSignalWithData(
  item: CatalogSignalItem,
  orgSignal?: OrgSignalLike | null
): SignalWithData {
  const id = item.signalId ?? item.id
  return {
    id,
    name: item.name,
    category: item.category ?? null,
    absolute_value: item.formattedValue ?? String(item.value ?? "") ?? orgSignal?.absolute_value ?? "",
    trend: item.trend ?? orgSignal?.trend ?? "stable",
    latest_value: item.value ?? orgSignal?.latest_value ?? null,
    previous_value: null,
    change: null,
    change_percent: null,
    data_points: [],
    owner_name: null,
    trend_30d_pct: item.trendPercentage ?? orgSignal?.trend_30d_pct ?? null,
    trend_90d_pct: orgSignal?.trend_90d_pct ?? null,
    trend_30d_delta: orgSignal?.trend_30d_delta ?? null,
    trend_90d_delta: orgSignal?.trend_90d_delta ?? null,
    trend_30d_from_label: orgSignal?.trend_30d_from_label ?? null,
    trend_30d_to_label: orgSignal?.trend_30d_to_label ?? null,
    trend_90d_from_label: orgSignal?.trend_90d_from_label ?? null,
    trend_90d_to_label: orgSignal?.trend_90d_to_label ?? null,
    summary: orgSignal?.summary ?? null,
    organization_id: null,
    owner_id: null,
    benchmark_value: null,
    benchmark_type: null,
    trend_value: null,
    source_type: null,
    created_at: orgSignal?.updated_at ?? "",
    updated_at: orgSignal?.updated_at ?? "",
  }
}

export interface CatalogSignalsViewProps {
  catalogSignals: CatalogSignalItem[]
  /** Signals for this org (to resolve full signal for calculated catalog items). */
  orgSignals?: OrgSignalLike[]
  trendPeriod?: TrendPeriod
  /** Show trend as % or absolute change. */
  trendDisplay?: TrendDisplay
  readOnly?: boolean
  /** Show "Other signals from uploads" section with these signals (excludes catalog names). */
  otherSignals?: SignalWithData[]
  savedSignalIds?: Set<string>
  onToggleSave?: (signalId: string) => void
  savingSignalId?: string | null
  interpretations?: Record<string, SignalInterpretation | null>
  loadingInterpretation?: string | null
  onRequestInterpretation?: (signalId: string) => void
}

const MSS_CATALOG_NAMES = [
  "Monthly Pipeline",
  "Win Rate",
  "Closed Revenue",
  "Avg Sales Cycle",
  "Ticket Volume",
  "Avg Resolution Time",
  "Lead Conversion Rate",
]

export function CatalogSignalsView({
  catalogSignals,
  orgSignals = [],
  trendPeriod = "30d",
  trendDisplay = "percent",
  readOnly = false,
  otherSignals = [],
  savedSignalIds = new Set(),
  onToggleSave,
  savingSignalId = null,
  interpretations = {},
  loadingInterpretation = null,
  onRequestInterpretation,
}: CatalogSignalsViewProps) {
  const orgSignalsById = new Map(orgSignals.map((s) => [s.id ?? (s as { signal_id?: string }).signal_id, s]))

  return (
    <div className="space-y-8">
      {catalogSignals.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Your KPIs
          </h2>
          <div className="space-y-4">
            {catalogSignals.map((item) => {
              if (item.status === "calculated" && item.signalId) {
                const orgSignal = orgSignalsById.get(item.signalId) ?? null
                const signal = toSignalWithData(item, orgSignal)
                return (
                  <SignalAccordionCard
                    key={item.id}
                    signal={signal}
                    trendPeriod={trendPeriod}
                    trendDisplay={trendDisplay}
                    isSaved={savedSignalIds.has(signal.id)}
                    onToggleSave={readOnly ? undefined : onToggleSave}
                    isSaving={savingSignalId === signal.id}
                    interpretation={interpretations[signal.id]}
                    isLoadingInterpretation={loadingInterpretation === signal.id}
                    onRequestInterpretation={
                      readOnly
                        ? undefined
                        : onRequestInterpretation
                          ? () => onRequestInterpretation(signal.id)
                          : undefined
                    }
                  />
                )
              }
              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-foreground">{item.name}</h3>
                    {item.category && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {item.message ??
                      (item.status === "partial"
                        ? "Add required columns to calculate."
                        : "Upload data to unlock.")}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {otherSignals.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Other signals from uploads
          </h2>
          <div className="space-y-4">
            {otherSignals.map((signal) => (
              <SignalAccordionCard
                key={signal.id}
                signal={signal}
                trendPeriod={trendPeriod}
                trendDisplay={trendDisplay}
                isSaved={savedSignalIds.has(signal.id)}
                onToggleSave={readOnly ? undefined : onToggleSave}
                isSaving={savingSignalId === signal.id}
                interpretation={interpretations[signal.id]}
                isLoadingInterpretation={loadingInterpretation === signal.id}
                onRequestInterpretation={
                  readOnly
                    ? undefined
                    : onRequestInterpretation
                      ? () => onRequestInterpretation(signal.id)
                      : undefined
                }
              />
            ))}
          </div>
          <div className="text-center text-sm text-muted-foreground pt-4">
            {otherSignals.length} signal{otherSignals.length !== 1 ? "s" : ""}
          </div>
        </section>
      )}
    </div>
  )
}

/** Filter org signals to those not in the 7 catalog (for "Other signals" section). */
export function filterOtherSignals<T extends { name?: string | null }>(signals: T[]): T[] {
  return signals.filter((s) => s.name && !MSS_CATALOG_NAMES.includes(s.name))
}

/** Convert an org signal (e.g. from admin details API) to SignalWithData for display. */
export function orgSignalToSignalWithData(s: OrgSignalLike): SignalWithData {
  const id = (s.id ?? (s as { signal_id?: string }).signal_id) as string
  return {
    id,
    name: (s.name as string) ?? "",
    category: (s.category as string | null) ?? null,
    absolute_value: (s.absolute_value as string | null) ?? null,
    trend: (s.trend as string | null) ?? "stable",
    latest_value: typeof s.latest_value === "number" ? s.latest_value : null,
    previous_value: null,
    change: null,
    change_percent: null,
    data_points: [],
    owner_name: null,
    trend_30d_pct: (s.trend_30d_pct != null ? s.trend_30d_pct : null) as number | null,
    trend_90d_pct: (s.trend_90d_pct != null ? s.trend_90d_pct : null) as number | null,
    trend_30d_delta: (s.trend_30d_delta != null ? s.trend_30d_delta : null) as number | null,
    trend_90d_delta: (s.trend_90d_delta != null ? s.trend_90d_delta : null) as number | null,
    summary: (s.summary as string | null) ?? null,
    organization_id: null,
    owner_id: null,
    benchmark_value: null,
    benchmark_type: null,
    trend_value: null,
    source_type: null,
    created_at: (s.created_at as string) ?? "",
    updated_at: (s.updated_at as string) ?? "",
  }
}
