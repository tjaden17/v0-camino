# Camino Modular Architecture

## Overview

This document defines the module boundaries within the Camino monolith. Each module is designed to be extractable as a microservice when scale demands it, but currently runs as part of a single Next.js deployment.

## Module Map

```
lib/
├── modules/
│   ├── import/           # File upload, parsing, validation
│   ├── staging/          # Data normalization, storage
│   ├── signals/          # Discovery, calculation, quality
│   ├── analysis/         # Trends, root cause, segments
│   ├── impact/           # Goals, projections, business impact
│   ├── dashboard/        # Card composition, views
│   └── integration/      # External system connections
├── shared/               # Cross-module utilities
└── core/                 # Auth, database, config
```

## Module Definitions

### 1. Import Module (`lib/modules/import/`)

**Responsibility:** Get data into the system

**Contains:**
- File upload handling
- CSV/XLSX parsing
- Format detection (Zoho CRM, Desk, etc.)
- Validation

**Current Files:**
- `lib/csv-parser.ts`
- `lib/xlsx-parser.ts`
- `lib/zoho-signal-discovery.ts` (detection parts)
- `app/api/admin/import/*`

**Public Interface:**
```typescript
// lib/modules/import/index.ts
export { uploadFile } from './upload'
export { parseCSV, parseXLSX } from './parsers'
export { detectFileType, detectSheetType } from './detection'
export { validateImport } from './validation'
export type { ImportResult, ParsedFile, FileType } from './types'
```

---

### 2. Staging Module (`lib/modules/staging/`)

**Responsibility:** Store and manage normalized raw data

**Contains:**
- Data normalization
- Batch management
- Data source tracking
- Raw data queries

**Current Files:**
- `lib/universal-schema.ts`
- `lib/multi-source-signal-service.ts` (staging parts)
- `app/api/admin/import/stage/route.ts`

**Public Interface:**
```typescript
// lib/modules/staging/index.ts
export { stageRecords, getStagedData } from './storage'
export { normalizeToSchema } from './normalize'
export { getDataSources, trackDataSource } from './sources'
export type { StagedRecord, DataSource, ImportBatch } from './types'
```

---

### 3. Signals Module (`lib/modules/signals/`)

**Responsibility:** Signal discovery, calculation, and quality

**Contains:**
- Signal definitions
- Discovery from staged data
- Value calculation
- Quality scoring
- Multi-source signal logic

**Current Files:**
- `lib/signals-service.ts`
- `lib/signal-discovery-service.ts`
- `lib/signal-templates-service.ts`
- `lib/zoho-signal-discovery.ts` (signal parts)
- `lib/multi-source-signal-service.ts` (calculation parts)
- `app/api/signals/*`
- `app/api/admin/signals/*`

**Public Interface:**
```typescript
// lib/modules/signals/index.ts
export { discoverSignals, getAvailableSignals } from './discovery'
export { calculateSignal, calculateMultiSource } from './calculation'
export { scoreQuality, getQualityGaps } from './quality'
export { getSignalDefinitions } from './definitions'
export type { Signal, SignalValue, QualityScore, SignalDefinition } from './types'
```

---

### 4. Analysis Module (`lib/modules/analysis/`)

**Responsibility:** Generate insights from signal data

**Contains:**
- Trend calculation (30/60/90 day)
- Root cause analysis
- Sub-segment identification
- Anomaly detection

**Current Files:**
- `lib/ai-analysis-service.ts`
- `lib/signal-intelligence.ts`
- `lib/signal-relationships-service.ts`
- `app/api/signals/ai-analyze/route.ts`
- `app/api/signals/detect-relationships/route.ts`

**Public Interface:**
```typescript
// lib/modules/analysis/index.ts
export { calculateTrend } from './trends'
export { analyzeRootCause } from './root-cause'
export { identifySegments } from './segments'
export { detectAnomalies } from './anomalies'
export type { Trend, RootCause, Segment, Anomaly } from './types'
```

---

### 5. Impact Module (`lib/modules/impact/`)

**Responsibility:** Connect signals to business outcomes

**Contains:**
- Goal mapping
- Impact scoring
- Projections ("if trend continues...")
- Directional assessment

**Current Files:**
- `lib/impact-prediction-service.ts`
- `lib/value-of-information.ts`
- `app/api/signals/predict-impact/route.ts`

**Public Interface:**
```typescript
// lib/modules/impact/index.ts
export { mapToGoals, getRelatedGoals } from './goals'
export { calculateImpact } from './scoring'
export { projectTrend } from './projections'
export { assessDirection } from './direction'
export type { Goal, Impact, Projection, Direction } from './types'
```

---

### 6. Dashboard Module (`lib/modules/dashboard/`)

**Responsibility:** Compose and serve signal cards

**Contains:**
- Signal card composition
- Three-view logic (found/means/so what)
- User preferences
- Card filtering/sorting

**Current Files:**
- `lib/user-context-service.ts`
- Various dashboard components

**Public Interface:**
```typescript
// lib/modules/dashboard/index.ts
export { getSignalCards, composeCard } from './cards'
export { getFoundView, getMeansView, getSoWhatView } from './views'
export { getUserPreferences, savePreferences } from './preferences'
export type { SignalCard, CardView, UserPreferences } from './types'
```

---

### 7. Integration Module (`lib/modules/integration/`)

**Responsibility:** Connect to external systems

**Contains:**
- OAuth flows
- API clients (Zoho, HubSpot, etc.)
- Sync logic
- Connection management

**Current Files:**
- `lib/zoho-api-client.ts`
- `lib/zoho-oauth-service.ts`
- `lib/zoho-desk-processor.ts`
- `lib/integrations-service.ts`
- `app/api/integrations/*`

**Public Interface:**
```typescript
// lib/modules/integration/index.ts
export { connectZoho, syncZohoData } from './zoho'
export { connectHubSpot, syncHubSpotData } from './hubspot'
export { getConnections, disconnectIntegration } from './connections'
export type { Integration, Connection, SyncResult } from './types'
```

---

## Shared Utilities (`lib/shared/`)

Cross-cutting concerns used by multiple modules:

```typescript
// lib/shared/index.ts
export { formatCurrency, formatPercentage, formatNumber } from './formatters'
export { parseDate, formatDateRange } from './dates'
export { cn } from './classnames'
export { createClient } from './supabase'
```

---

## Module Communication Rules

1. **Modules only communicate through public interfaces** (index.ts exports)
2. **No direct imports of internal module files** from other modules
3. **Shared types go in `lib/shared/types.ts`** if used by 3+ modules
4. **Database access only through module's own functions** (not raw Supabase calls from outside)

---

## Extraction Checklist

When a module needs to become a service:

1. [ ] Create separate repo/package
2. [ ] Move module files
3. [ ] Replace internal calls with API calls
4. [ ] Add API route in original app that proxies to new service
5. [ ] Update environment variables
6. [ ] Set up separate deployment

---

## Current vs Target State

| Module | Current State | Target State |
|--------|---------------|--------------|
| Import | Scattered files | Organized module |
| Staging | Partially built | Complete module |
| Signals | Multiple services | Unified module |
| Analysis | Basic | Needs enhancement |
| Impact | Stub | Build for Locumate |
| Dashboard | Exists | Restructure for 3-view |
| Integration | Zoho only | Zoho complete, others ready |
