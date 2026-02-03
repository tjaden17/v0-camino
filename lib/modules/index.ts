/**
 * Camino Modules
 * 
 * This is the main entry point for all module exports.
 * Import from here to maintain clean module boundaries.
 * 
 * Example:
 *   import { parseCSVToRecords } from '@/lib/modules/import'
 *   import { stageRecords, getDataSources } from '@/lib/modules/staging'
 *   import { calculateSignal, getAvailableSignals } from '@/lib/modules/signals'
 */

// Re-export all modules
export * from './import'
export * from './staging'
export * from './signals'
export * from './analysis'
export * from './impact'
export * from './dashboard'

// Module-specific re-exports with namespaces for clarity
import * as ImportModule from './import'
import * as StagingModule from './staging'
import * as SignalsModule from './signals'
import * as AnalysisModule from './analysis'
import * as ImpactModule from './impact'
import * as DashboardModule from './dashboard'

export {
  ImportModule,
  StagingModule,
  SignalsModule,
  AnalysisModule,
  ImpactModule,
  DashboardModule
}
