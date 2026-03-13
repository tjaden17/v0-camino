'use client'

import { useState } from 'react'
import { ArchHero } from '@/components/architecture/ArchHero'
import { ArchPrinciples } from '@/components/architecture/ArchPrinciples'
import { ArchLayers } from '@/components/architecture/ArchLayers'
import { ArchDataFlow } from '@/components/architecture/ArchDataFlow'
import { ArchScalability } from '@/components/architecture/ArchScalability'
import { ArchBuildPlan } from '@/components/architecture/ArchBuildPlan'

export default function ArchitecturePage() {
  return (
    <main className="min-h-screen bg-[#0d1117] text-white font-sans">
      <ArchHero />
      <ArchPrinciples />
      <ArchLayers />
      <ArchDataFlow />
      <ArchScalability />
      <ArchBuildPlan />
    </main>
  )
}
