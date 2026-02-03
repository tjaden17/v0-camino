# Suggested Modules - 3 Feb 2026

## Overview

Camino is structured as a **modular monolith** - logically separated modules within a single deployment. This provides simplicity now while enabling future extraction to services when scale demands it.

---

## Module Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION                              │
│         (Signal cards, filters, dashboards, exports)            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       USER CONTEXT                               │
│        (Saved signals, roles, preferences, org settings)        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SYNTHESIS                                 │
│      (AI interpretation, opportunity/risk, 5-section analysis)  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SIGNAL CORE                                │
│    (Calculation, trend detection, ranking, cross-correlation)   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA IN                                  │
│       (File uploads, API connectors, staging, discovery)        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Module Definitions

### 1. Data In

**Goal:** Get data into the system from any source, validate it, and prepare it for signal calculation.

**How It Works:**
- Accepts file uploads (CSV, Excel) via drag-drop or file picker
- Parses and validates data structure
- Auto-discovers which signals can be calculated from the data
- Categorizes discovered signals as NEW, UPDATED, or PARTIAL
- Stages validated data for processing by Signal Core
- Future: Connects to external APIs (HubSpot, Salesforce, Stripe, Zoho)

**Current State:**
| Component | Status |
|-----------|--------|
| File uploads (CSV, Excel) | Built |
| Signal discovery | Built |
| Auto-categorization (new/updated/partial) | Built |
| Staging service | Built |
| API connectors | Not started |

**Key Files:**
- `app/api/upload/discover/route.ts`
- `app/api/upload/calculate/route.ts`
- `lib/signal-discovery-service.ts`
- `lib/staging-service.ts`
- `lib/csv-parser.ts`

**Open Questions:**
- Which API connectors are priority? (HubSpot, Salesforce, Stripe, Zoho)
- How do we handle API rate limits and sync frequency?
- Should staging data have TTL or persist indefinitely?

---

### 2. Signal Core

**Goal:** Calculate signal values, detect trends, rank by importance, and find cross-source correlations.

**How It Works:**
- Takes staged data and applies calculation methods (sum, average, count, rate)
- Tracks values over time to detect trends (increasing, decreasing, stable)
- Compares current vs previous period to calculate change %
- Ranks signals by intelligence score (urgency + impact)
- Identifies cross-source patterns (e.g., "churn up + NPS down")

**Current State:**
| Component | Status |
|-----------|--------|
| Signal calculation | Built |
| Trend detection | Built |
| Change tracking | Built |
| Intelligence ranking | Built |
| Cross-source correlation | Partial |

**Key Files:**
- `lib/signals-service.ts`
- `lib/signal-intelligence-service.ts`
- `lib/multi-source-signal-service.ts`
- `app/api/signals/route.ts`

**Open Questions:**
- What correlation patterns matter most? (leading indicators)
- How do we weight signals from different sources?
- Should ranking algorithm be configurable per org?

---

### 3. Synthesis (AI Layer)

**Goal:** Transform raw signal data into executive-ready insights using AI.

**How It Works:**
- Takes signal data (value, trend, change %) as input
- Makes single unified AI call to generate 5-section analysis:
  1. **Executive Summary** - What the data shows
  2. **Takeaway Breakdown** - Why it's changing
  3. **Benchmark Comparison** - How it compares to norms
  4. **Root Cause Analysis** - Deeper drivers
  5. **Implications on Goals** - Business impact
- Additionally generates **Opportunities** and **Risks** with action items
- Caches interpretations to avoid redundant AI calls

**Current State:**
| Component | Status |
|-----------|--------|
| 5-section unified interpretation | Built |
| Opportunity detection | Built |
| Risk detection | Built |
| Caching | Built |
| Cross-signal pattern recognition | Not started |
| Predictive insights | Not started |

**Key Files:**
- `lib/interpretation-service.ts`
- `app/api/signals/interpret/route.ts`

**Open Questions:**
- Should interpretations regenerate on each data refresh or only on significant change?
- How do we handle AI hallucination/accuracy issues?
- Can we add confidence scores to interpretations?

---

### 4. User Context

**Goal:** Personalize the experience based on user role, preferences, and organization settings.

**How It Works:**
- Stores which signals each user has saved
- Applies role-based defaults (executive sees saved signals first, analyst sees all)
- Manages organization-level settings (goals, benchmarks, thresholds)
- Tracks user preferences (default filters, notification settings)

**Current State:**
| Component | Status |
|-----------|--------|
| Saved signals per user | Built |
| Role-based views | Built |
| Organization settings | Built |
| Notification preferences | Not started |
| Alert thresholds | Not started |

**Key Files:**
- `lib/user-context-service.ts`
- `lib/saved-signals-service.ts`
- `app/api/user/saved-signals/route.ts`

**Open Questions:**
- How do alerts/notifications get delivered? (email, push, in-app)
- Should executives be able to "assign" signals to team members?
- How do we handle multi-org users?

---

### 5. Presentation

**Goal:** Render signals and insights in consumable formats for different use cases.

**How It Works:**
- Displays signals as expandable cards with L1 (summary) and L2 (details) views
- Provides filtering by status, function, type, category, trend
- Supports sorting by intelligence rank, trend, or recency
- Enables search across signal names and descriptions
- Future: Dashboards, charts, PDF exports, sharing

**Current State:**
| Component | Status |
|-----------|--------|
| Signal cards (single expand/collapse) | Built |
| Filtering (status, function, type, category, trend) | Built |
| Sorting (rank, trend, recent) | Built |
| Search | Built |
| Grouped view | Built |
| Dashboards | Not started |
| Export/Share | Partial |

**Key Files:**
- `components/signal-accordion-card.tsx`
- `components/signals-page-client.tsx`
- `app/(dashboard)/signals/page.tsx`

**Open Questions:**
- What dashboard layouts do executives want?
- Should we support scheduled email reports?
- How do shared links work for non-authenticated viewers?

---

## Module Communication

| From | To | Method |
|------|-----|--------|
| Presentation | User Context | Function calls (same runtime) |
| Presentation | Signal Core | Function calls |
| Presentation | Synthesis | Async API call (for AI) |
| Signal Core | Data In | Function calls |
| Synthesis | Signal Core | Function calls |
| User Context | Signal Core | Function calls |

All modules share the same Supabase/Neon database. No network calls between modules except for async AI operations.

---

## Priority Gaps

| Gap | Module | Impact | Effort |
|-----|--------|--------|--------|
| API Connectors (HubSpot, Salesforce) | Data In | High - enables live data | High |
| Cross-signal correlation | Signal Core | High - key differentiator | Medium |
| Alerting system | User Context | Medium - retention driver | Medium |
| Dashboards | Presentation | Medium - executive preference | Medium |
| Predictive insights | Synthesis | Low - nice to have | High |

---

## Future: Extraction to Services

When to extract a module to a separate service:

1. **Synthesis** - Extract first if AI costs need isolation or separate scaling
2. **Data In** - Extract if connector complexity grows or needs separate deploy cycles
3. **Signal Core** - Extract if calculation volume requires dedicated compute

**Extraction triggers:**
- Module needs independent scaling
- Teams need independent deploy cycles
- Failure isolation becomes critical
- Cost attribution needed per module

---

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 3 Feb 2026 | v0 | Initial 5-module architecture based on current implementation |
