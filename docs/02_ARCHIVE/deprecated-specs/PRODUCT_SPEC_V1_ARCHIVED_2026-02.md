# Signal Intelligence Platform - Product Specification

**Version:** 1.0.0 | **Last Updated:** 2026-02-01

## Overview

A B2B SaaS signal intelligence platform that helps businesses extract, analyze, and act on business signals from their data. The platform uses a 3-layer exploration model (L1: Overview, L2: Details, L3: AI Insights) with progressive disclosure.

---

## Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js 16)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  /upload          → File upload, signal discovery, calculation              │
│  /signals         → Signal dashboard with accordion cards (L1/L2/L3)        │
│  /signals/[id]    → Individual signal detail page                           │
│  /auth/onboarding → Organization & user context setup                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API ROUTES                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  /api/upload/*           → File processing pipeline                         │
│  /api/signals/*          → Signal CRUD & intelligence                       │
│  /api/user/*             → User context & onboarding                        │
│  /api/integrations/*     → OAuth & third-party connections                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SERVICES (lib/)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Core Services           │  Intelligence Services  │  Integration Services  │
│  ────────────────────    │  ─────────────────────  │  ────────────────────  │
│  signals-service         │  signal-intelligence    │  integrations-service  │
│  staging-service         │  interpretation-service │  zoho-oauth-service    │
│  upload-service          │  relationship-detection │  dual-path-storage     │
│  signal-discovery        │  multi-source-intel     │                        │
│  user-context-service    │  impact-prediction      │                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASES                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  Neon (PostgreSQL)       │  Supabase                                        │
│  ────────────────────    │  ─────────────────────                           │
│  - signals               │  - auth.users (authentication)                   │
│  - organizations         │  - profiles (Supabase copy)                      │
│  - profiles              │                                                   │
│  - user_context          │                                                   │
│  - staged_* tables       │                                                   │
│  - signal_relationships  │                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## Core Services

### 1. Signal Discovery Service
**File:** `/lib/signal-discovery-service.ts`
**Purpose:** Detects available signals from uploaded file columns

**Key Functions:**
| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `discoverSignals()` | Main discovery entry point | parsed rows, columns | DiscoveryResult |
| `normalizeFieldName()` | Maps column names to canonical field names via FIELD_ALIASES | column name | normalized name |
| `detectColumnType()` | Infers column type (number, date, string, boolean) | sample values | type string |
| `detectColumns()` | Analyzes all columns in dataset | parsed rows | DetectedColumn[] |
| `detectSourceType()` | Identifies data source (zoho_crm, hubspot, salesforce, etc.) | filename, columns | source type string |

**Signal Definitions:**
- Contains 100+ SIGNAL_DEFINITIONS covering Revenue, Sales, Support, Product, Marketing, Finance, HR categories
- Uses FIELD_ALIASES to match various column naming conventions to canonical names
- Supports required fields, calculation types (aggregated, direct), and formulas

**Debug Points:**
\`\`\`typescript
console.log("[v0] discoverSignals - columns:", columns)
console.log("[v0] discoverSignals - matched signals:", result.available.length)
\`\`\`

---

### 2. Staging Service
**File:** `/lib/staging-service.ts`
**Purpose:** Manages data staging layer for cross-source signal discovery

**Key Functions:**
| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `stageUpload()` | Creates staged upload record | userId, file metadata | upload ID |
| `stageFields()` | Stores normalized field mappings | uploadId, detected columns | field IDs |
| `discoverCrossSourceOpportunities()` | Finds signals calculable from multiple sources | userId | SignalOpportunity[] |
| `getFieldAvailability()` | Gets all available fields for user | userId | field availability map |

**Database Tables:**
- `staged_uploads` - Upload metadata before processing
- `staged_fields` - Normalized column→field mappings
- `staged_data_points` - Actual data values (optional)
- `signal_opportunities` - Discovered signal opportunities
- `field_availability` - Index of all available fields per user

**Cross-Source Flow:**
\`\`\`
Upload A (CRM)     Upload B (Finance)
     │                    │
     └───────┬────────────┘
             ▼
    Field Availability Index
             │
             ▼
    Check SIGNAL_DEFINITIONS
    for multi-field signals
             │
             ▼
    Signal Opportunities
    (ready, partial, missing)
\`\`\`

---

### 3. Signals Service
**File:** `/lib/signals-service.ts`
**Purpose:** CRUD operations for signals

**Key Functions:**
| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `getSignals()` | Fetches signals for organization | organizationId | SignalWithData[] |
| `getSignalById()` | Fetches single signal | signalId | SignalWithData |
| `getSavedSignalIds()` | Gets user's saved/bookmarked signals | userId | string[] |

**Important:** Reads from **Neon** (not Supabase) using `DISTINCT ON (name)` to deduplicate

**Debug Points:**
\`\`\`typescript
console.log("[v0] getSignals - org:", organizationId, "found:", signals.length)
\`\`\`

---

### 4. Signal Intelligence Service
**File:** `/lib/signal-intelligence-service.ts`
**Purpose:** Ranks and prioritizes signals based on user context

**Key Functions:**
| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `getRankedSignals()` | Gets signals ranked by relevance to user | userId | RankedSignal[] |
| `calculateRelevanceScore()` | Scores signal relevance based on role | signal, userContext | 0-100 score |
| `calculateGoalAlignment()` | Checks if signal aligns with user goals | signal, goals | 0-100 score |
| `calculateUrgencyScore()` | Scores urgency based on anomalies/changes | signal | 0-100 score |

**Ranking Formula:**
\`\`\`
Total Score = (Relevance × 0.40) + (Goal Alignment × 0.35) + (Urgency × 0.25)
\`\`\`

**Role-Signal Relevance Matrix:**
| Role | High Priority Categories |
|------|-------------------------|
| CEO | Revenue (10), Sales (8), Finance (7) |
| VP Sales | Sales (10), Revenue (8), Pipeline (9) |
| CFO | Finance (10), Revenue (9) |
| Support Lead | Support (10), Product (7) |

---

### 5. User Context Service
**File:** `/lib/user-context-service.ts`
**Purpose:** Manages user preferences, role, and goals

**Key Functions:**
| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `getUserContext()` | Gets full user context | userId | UserContext |
| `updateUserContext()` | Updates context fields | userId, updates | void |
| `getUserGoals()` | Gets user's tracked KPIs | userId | Goal[] |

**User Context Fields:**
- role, department, seniority_level
- industry, company_size, business_stage
- goals, priority_areas
- pinned_signals, hidden_signals
- onboarding_completed, onboarding_step

---

### 6. Interpretation Service
**File:** `/lib/interpretation-service.ts`
**Purpose:** Generates AI-powered signal interpretations (L3)

**Key Functions:**
| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `getInterpretation()` | Gets or generates interpretation | signalId | SignalInterpretation |
| `generateInterpretation()` | Creates new AI interpretation | signal, context | interpretation |

**Interpretation Structure:**
\`\`\`typescript
interface SignalInterpretation {
  what_we_found: { title: string; points: string[] }
  what_it_means: { title: string; points: string[] }
  so_what: { title: string; actions: string[] }
}
\`\`\`

---

### 7. Relationship Detection Engine
**File:** `/lib/relationship-detection-engine.ts`
**Purpose:** Detects correlations and causal chains between signals

**Key Functions:**
| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `detectRelationships()` | Finds signal correlations | signals[] | Relationship[] |
| `buildCausalChains()` | Constructs A→B→C chains | relationships[] | CausalChain[] |
| `calculateCorrelation()` | Pearson correlation coefficient | signalA, signalB | -1 to 1 |

**Known Relationship Patterns:**
- Leads → Pipeline → Revenue
- Support Tickets → Customer Churn
- Feature Adoption → NRR (Net Revenue Retention)
- Marketing Spend → Leads → Opportunities

---

## API Routes

### Upload Pipeline

| Route | Method | Purpose | Service Used |
|-------|--------|---------|--------------|
| `/api/upload/discover-signals` | POST | Analyze file, discover signals | signal-discovery-service |
| `/api/upload/calculate` | POST | Calculate & save signal values | signals-service |
| `/api/upload/stage` | POST | Stage upload for cross-source | staging-service |

**Upload Flow:**
\`\`\`
1. POST /api/upload/discover-signals
   - Parse CSV/XLSX
   - Detect columns and types
   - Match to SIGNAL_DEFINITIONS
   - Return: available, partial, unavailable signals

2. User selects signals

3. POST /api/upload/calculate
   - Calculate values using matched fields
   - UPSERT into signals table (dedup by name+org)
   - Return: created signal IDs
\`\`\`

### Signal Routes

| Route | Method | Purpose | Service Used |
|-------|--------|---------|--------------|
| `/api/signals` | GET | List signals for org | signals-service |
| `/api/signals/ranked` | GET | Get intelligence-ranked signals | signal-intelligence-service |
| `/api/signals/[id]/interpretation` | GET | Get AI interpretation (L3) | interpretation-service |
| `/api/signals/save` | POST | Save/bookmark signal | signals-service |
| `/api/signals/share` | POST | Share signal summary | - |

### User Routes

| Route | Method | Purpose | Service Used |
|-------|--------|---------|--------------|
| `/api/user/onboarding-status` | GET | Check if onboarding complete | user-context-service |
| `/api/user/complete-onboarding` | POST | Save onboarding data, create org | organization-service |
| `/api/user/context` | GET/PUT | Get/update user context | user-context-service |
| `/api/user/goals` | GET/POST | Manage user goals/KPIs | user-context-service |

---

## Database Tables

### Core Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `organizations` | Multi-tenant orgs | id, name, created_by |
| `profiles` | User profiles (Neon) | id, organization_id, role, email |
| `signals` | Business signals | id, name, category, organization_id, absolute_value, trend |
| `user_context` | User preferences | user_id, role, goals, onboarding_completed |

### Staging Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `staged_uploads` | Upload metadata | id, user_id, file_name, status |
| `staged_fields` | Column→field mappings | upload_id, original_column_name, normalized_field_name |
| `signal_opportunities` | Discoverable signals | signal_name, is_calculable, missing_fields |
| `field_availability` | Available fields index | user_id, normalized_field_name, upload_ids |

### Intelligence Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `signal_relationships` | Signal correlations | signal_a_id, signal_b_id, correlation_coefficient |
| `causal_chains` | A→B→C relationships | signal_sequence, total_confidence |
| `signal_interpretations` | AI interpretations | signal_id, what_we_found, what_it_means, so_what |
| `signal_recommendations` | Suggested signals | user_id, signal_name, relevance_score |

---

## User Flows

### Flow 1: New User Onboarding

\`\`\`
1. Sign up (Supabase Auth)
2. Redirect to /auth/onboarding
3. Step 1: Organization (name, industry, size, stage)
4. Step 2: Your Role (role, department, seniority)
5. Step 3: Goals (select KPIs to track)
6. POST /api/user/complete-onboarding
   - Creates organization in Neon
   - Updates profiles.organization_id
   - Creates user_context record
7. Redirect to /signals (dashboard)
\`\`\`

**Debug Checklist:**
- [ ] Organization created in `organizations` table
- [ ] Profile updated with `organization_id`
- [ ] user_context created with `onboarding_completed = true`

### Flow 2: File Upload to Signals

\`\`\`
1. Navigate to /upload
2. Select file (CSV/XLSX)
3. POST /api/upload/discover-signals
   - Returns available signals with matched fields
4. User selects signals to calculate
5. POST /api/upload/calculate
   - Calculates values using appropriate method
   - UPSERTS signals (prevents duplicates)
6. Redirect to /signals
7. Signals appear in accordion cards
\`\`\`

**Debug Checklist:**
- [ ] File parsed correctly (check row count)
- [ ] Columns detected with correct types
- [ ] Signals matched via FIELD_ALIASES
- [ ] Values calculated (not all showing same number)
- [ ] organization_id set correctly on insert
- [ ] No duplicates (unique index enforced)

### Flow 3: Signal Exploration (L1→L2→L3)

\`\`\`
1. /signals page loads
2. GET /api/signals (filtered by organization_id)
3. L1: Accordion card shows name, value, trend, change%
4. Click "View Details"
5. L2: Expanded view with metrics grid, source info
6. Click "Get AI Insights"
7. GET /api/signals/[id]/interpretation
8. L3: AI interpretation (What We Found, What It Means, So What)
\`\`\`

**Debug Checklist:**
- [ ] organization_id correctly fetched from Neon profiles
- [ ] Signals filtered by organization_id
- [ ] Accordion expands correctly
- [ ] Interpretation loads (check AI service)

---

## Common Issues & Debugging

### Issue: All signals show same value (e.g., "53")

**Cause:** Signal calculation falling through to default `rows.length`

**Debug:**
\`\`\`typescript
// In /api/upload/calculate/route.ts
console.log("[v0] calculateAggregatedSignal - signal:", signal.signalId)
console.log("[v0] calculateAggregatedSignal - matchedFields:", matchedFields)
console.log("[v0] calculateAggregatedSignal - numericField:", numericField)
\`\`\`

**Fix:** Ensure signal name patterns match calculation logic (total, average, rate, etc.)

---

### Issue: Signals not appearing after upload

**Cause:** organization_id mismatch between insert and query

**Debug:**
\`\`\`typescript
// Check what org_id is used on insert
console.log("[v0] Calculate - inserting with org:", organizationId)

// Check what org_id is used on query
console.log("[v0] Signals page - querying org:", organizationId)
\`\`\`

**Fix:** Ensure both read from Neon `profiles` table (not Supabase)

---

### Issue: Duplicate signals appearing

**Cause:** Missing unique constraint, multiple uploads

**Debug:**
\`\`\`sql
SELECT name, COUNT(*) FROM signals 
WHERE organization_id = 'xxx' 
GROUP BY name HAVING COUNT(*) > 1
\`\`\`

**Fix:** 
1. Delete duplicates
2. Add unique index: `CREATE UNIQUE INDEX idx_signals_name_org ON signals(name, organization_id)`
3. Use UPSERT with `ON CONFLICT DO UPDATE`

---

### Issue: Onboarding redirect loop

**Cause:** user_context not created or onboarding_completed = false

**Debug:**
\`\`\`sql
SELECT * FROM user_context WHERE user_id = 'xxx'
SELECT * FROM profiles WHERE id = 'xxx'
\`\`\`

**Fix:** Ensure `/api/user/complete-onboarding` creates user_context with `onboarding_completed = true`

---

## Environment Variables

| Variable | Source | Purpose |
|----------|--------|---------|
| `NEON_DATABASE_URL` | Neon | Primary database connection |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Auth API endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Public auth key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Admin auth operations |

---

## Version History

| Date | Change |
|------|--------|
| 2025-02 | Initial spec created |
| 2025-02 | Added staging layer for cross-source discovery |
| 2025-02 | Added organization onboarding flow |
| 2025-02 | Fixed signal calculation logic |
| 2025-02 | Added accordion card with L1/L2/L3 exploration |
