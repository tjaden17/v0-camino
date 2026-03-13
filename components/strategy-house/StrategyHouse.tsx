'use client'

import { Roof } from './Roof'
import { Pillars } from './Pillars'
import { Capabilities } from './Capabilities'
import { Foundation } from './Foundation'
import { Metrics } from './Metrics'

export function StrategyHouse() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Label */}
      <p className="text-xs font-semibold tracking-widest uppercase text-[#4b6a7a] mb-4 text-center">
        Camino — Strategy House
      </p>

      {/* The House */}
      <div className="w-full border border-[#dce3e8] rounded-2xl overflow-hidden shadow-sm bg-white">
        {/* Roof */}
        <Roof />

        {/* Pillar headers */}
        <Pillars />

        {/* Capability cards */}
        <Capabilities />

        {/* Foundation bar */}
        <Foundation />

        {/* Metrics */}
        <Metrics />
      </div>

      {/* Footnote */}
      <p className="text-xs text-[#8a9aaa] text-center mt-5">
        Strategy House v0.1 — March 2026. For internal alignment only.
      </p>
    </div>
  )
}
