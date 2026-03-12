const METRICS = [
  {
    pillar: 'Radical Trust',
    metric: 'Signal accuracy rate',
    description: '% of KPI values confirmed correct by customer vs. source system',
    target: '>95% match',
    color: 'bg-[#d6f0ee] border-[#3ab8b0] text-[#1a6e68]',
    arrow: 'text-[#3ab8b0]',
  },
  {
    pillar: 'Superior Synthesis',
    metric: 'Brief open rate + forward rate',
    description: '% of weekly briefs opened within 24h; % forwarded to a colleague or board',
    target: '>70% open, >20% forward',
    color: 'bg-[#d6f0ee] border-[#3ab8b0] text-[#1a6e68]',
    arrow: 'text-[#3ab8b0]',
  },
  {
    pillar: 'Agentic Intelligence',
    metric: 'Unprompted return rate',
    description: '% of customers who open Camino without a notification prompt, week-on-week',
    target: '>40% by week 8',
    color: 'bg-[#d6f0ee] border-[#3ab8b0] text-[#1a6e68]',
    arrow: 'text-[#3ab8b0]',
  },
]

export function Metrics() {
  return (
    <div className="bg-[#f0f3f5] border-t border-[#dce3e8]">
      <div className="px-5 pt-4 pb-2 text-center">
        <span className="text-[#4b6a7a] text-xs font-semibold tracking-widest uppercase">
          North Star Metrics
        </span>
      </div>

      {/* Upward arrows row */}
      <div className="grid grid-cols-3 gap-px bg-[#dce3e8] px-px">
        {METRICS.map((m) => (
          <div key={m.pillar} className="bg-[#f0f3f5] flex justify-center py-1">
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              aria-hidden="true"
              className="text-[#3ab8b0]"
            >
              <path
                d="M11 18V4M5 10l6-6 6 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-px bg-[#dce3e8] px-px pb-px">
        {METRICS.map((m) => (
          <div
            key={m.pillar}
            className={`rounded-b-lg border-2 px-4 py-3 m-1 mt-0 ${m.color}`}
          >
            <p className="font-semibold text-xs mb-1">{m.metric}</p>
            <p className="text-[11px] leading-relaxed opacity-80 mb-2">{m.description}</p>
            <span className="inline-block text-[10px] font-bold tracking-wide bg-white/60 rounded-full px-2 py-0.5 border border-current opacity-90">
              Target: {m.target}
            </span>
          </div>
        ))}
      </div>

      {/* Camino label */}
      <div className="text-center py-4">
        <span className="text-[#1a3a4a] text-lg font-bold tracking-tight">camino</span>
        <span className="text-[#3ab8b0] text-lg font-bold">.</span>
      </div>
    </div>
  )
}
