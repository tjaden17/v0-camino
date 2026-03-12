'use client'

import { useState } from 'react'
import { PILLARS } from './Pillars'

const CAPABILITIES: Record<string, { label: string; detail: string }[]> = {
  trust: [
    {
      label: 'Source-faithful data',
      detail:
        'Metrics are derived directly from customer data sources (CSV today, native API tomorrow). Camino never invents a number — every KPI traces back to a raw column or an approved formula.',
    },
    {
      label: 'CSM-validated formulas',
      detail:
        'KPI definitions are reviewed and approved by the customer\'s data steward (e.g. Sam the CSM) before they go live. AI proposes — human confirms — system locks.',
    },
    {
      label: 'Transparent calculations',
      detail:
        'Every signal card shows its calculation method in plain English. Executives can verify any number against their own tools at any time.',
    },
    {
      label: 'Audit trail',
      detail:
        'Every snapshot is timestamped and versioned. If a number changes, Camino can explain when the data was last refreshed and what changed.',
    },
  ],
  synthesis: [
    {
      label: 'Weekly intelligence brief',
      detail:
        'A 400-word McKinsey-style memo delivered every Monday. What happened, why it matters, and what to decide — written at board-memo quality by the AI synthesis layer.',
    },
    {
      label: 'Cross-table insight engine',
      detail:
        'Insights that require joining multiple data sources (e.g. platform GMV vs. subscription pipeline) that no single internal tool can surface. This is the core moat.',
    },
    {
      label: 'Signal ranking',
      detail:
        'AI determines which of the 20+ available KPIs actually moved materially this week and surfaces only the top 5. No dashboard fatigue — only what warrants attention.',
    },
    {
      label: 'Decision-mapped signals',
      detail:
        'Every signal is tagged to a decision the exec faces (grow pipeline, reduce churn, expand accounts). Signals without decisions are noise — Camino only surfaces signal.',
    },
  ],
  intelligence: [
    {
      label: 'Goal context engine',
      detail:
        'Onboarding captures the exec\'s 90-day priorities in their own words. This context is injected into every AI prompt, personalising what is surfaced and how it is framed.',
    },
    {
      label: 'Proactive signal discovery',
      detail:
        'Camino surfaces metrics the exec did not ask for but should care about — concentration risk, frozen pipeline, operational accounts not yet on subscription. The analyst you don\'t have.',
    },
    {
      label: 'Native data integration',
      detail:
        'End state: one-time OAuth connection to Zoho, HubSpot, Salesforce, Xero. Source-agnostic ingestion layer means adding a new connector never requires re-onboarding the customer.',
    },
    {
      label: 'Compounding memory',
      detail:
        'The more data and feedback Camino accumulates per customer, the more accurately it ranks signals and the more relevant its synthesis becomes. Value compounds with tenure.',
    },
  ],
}

const ROW_LABELS = ['Defensible?', 'State of competition', 'Commercial impact']
const ROW_KEYS: (keyof typeof PILLARS[0])[] = ['defensible', 'competition', 'commercial']

export function Capabilities() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="bg-white">
      {/* Capability cards — 4 per pillar */}
      <div className="grid grid-cols-3 gap-px bg-[#dce3e8] border-t border-[#dce3e8]">
        {(['trust', 'synthesis', 'intelligence'] as const).map((pillarId) => (
          <div key={pillarId} className="bg-white p-4 flex flex-col gap-2">
            {CAPABILITIES[pillarId].map((cap) => {
              const key = `${pillarId}-${cap.label}`
              const isOpen = expanded === key
              return (
                <button
                  key={cap.label}
                  onClick={() => setExpanded(isOpen ? null : key)}
                  className={`text-left w-full rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 ${
                    isOpen
                      ? 'bg-[#e8f8f7] border-[#3ab8b0] text-[#1a3a4a]'
                      : 'bg-[#f0f3f5] border-[#dce3e8] text-[#2d4a5a] hover:bg-[#e4edf1] hover:border-[#adc4cf]'
                  }`}
                  aria-expanded={isOpen}
                >
                  <span>{cap.label}</span>
                  {isOpen && (
                    <p className="mt-2 text-[11px] font-normal text-[#4b6a7a] leading-relaxed border-t border-[#b8d8d5] pt-2">
                      {cap.detail}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Defensible / Competition / Commercial rows */}
      {ROW_LABELS.map((rowLabel, rowIdx) => (
        <div key={rowLabel}>
          <div className="bg-[#3ab8b0] px-5 py-2 text-center border-t border-[#dce3e8]">
            <span className="text-white text-xs font-semibold tracking-wide">
              {rowLabel}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-px bg-[#dce3e8]">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.id}
                className="bg-[#f8fafb] px-4 py-3 text-center"
              >
                <span className="text-[#2d4a5a] text-xs leading-relaxed">
                  {pillar[ROW_KEYS[rowIdx]]}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
