# User Flow: Upload to Signal Exploration

**Document Purpose:** Technical walkthrough of the complete user journey from data upload through signal exploration, using a real example to demonstrate data flow, services, and calculations.

---

## Overview

This document traces a single user journey:

\`\`\`
Upload File → Parse & Discover → Calculate Signals → View L1 → Expand L2 → Generate L3
\`\`\`

**Example Signal Used:** "Win Rate" from a Zoho CRM Deals export

---

## The Complete Journey

### Step 1: User Uploads File

**User Action:** Drags `Zoho_CRM_Deals_Export.csv` onto the upload zone in Camino

**File Contents (sample):**
\`\`\`csv
Deal Name,Amount,Stage,Close Date,Owner,Lead Source
Acme Corp,45000,Closed Won,2026-01-15,Sarah,Website
Beta Inc,28000,Closed Lost,2026-01-18,Mike,Referral
Gamma Ltd,62000,Closed Won,2026-01-20,Sarah,LinkedIn
Delta Co,35000,Negotiation,2026-01-25,Mike,Website
...
(53 total rows)
\`\`\`

**Services Involved:**

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND                                     │
│  /components/upload-page-client.tsx                             │
│  - Handles drag & drop                                          │
│  - Reads file as text/binary                                    │
│  - Sends to API                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API ROUTE                                    │
│  /app/api/upload/route.ts                                       │
│  - Validates file type (CSV, XLSX)                              │
│  - Parses file content                                          │
│  - Detects source type (Zoho CRM identified from columns)       │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

**Data at this point:**
\`\`\`typescript
{
  fileName: "Zoho_CRM_Deals_Export.csv",
  fileType: "csv",
  rows: [...53 parsed rows...],
  columns: ["Deal Name", "Amount", "Stage", "Close Date", "Owner", "Lead Source"],
  detectedSource: "zoho_crm"
}
\`\`\`

---

### Step 2: Signal Discovery & Staging

**What Happens:** System analyzes columns to find calculable signals and automatically fetches staging data for cross-source analysis

**Services Involved:**

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                 STAGING SERVICE                                 │
│  /lib/staging-service.ts                                        │
│                                                                  │
│  Automatically called on new upload:                            │
│  1. Create staged_upload record for this file                   │
│  2. Normalize columns → staged_fields with canonical names      │
│  3. Update field_availability index (ALL available fields)      │
│  4. Check for cross-source signal opportunities:                │
│     - If previous uploads have revenue data + this has leads,   │
│       discover CAC signal, etc.                                 │
│  5. Mark signals as "calculable" or "unlockable"                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 SIGNAL DISCOVERY SERVICE                         │
│  /lib/signal-discovery-service.ts                               │
│                                                                  │
│  1. normalizeFieldName() for each column:                       │
│     "Deal Name"  → "deal_name"                                  │
│     "Amount"     → "deal_value"  (via FIELD_ALIASES)            │
│     "Stage"      → "deal_stage"                                 │
│     "Close Date" → "close_date"                                 │
│                                                                  │
│  2. Match against SIGNAL_DEFINITIONS (200+ signals)             │
│     - "Win Rate" requires: deal_stage                           │
│     - "Total Pipeline" requires: deal_value                     │
│     - "Average Deal Size" requires: deal_value                  │
│     etc.                                                        │
│                                                                  │
│  3. Categorize discovered signals:                              │
│     - NEW: Signals not in org yet                               │
│     - UPDATED: Signals with new source data                     │
│     - PARTIAL: Missing fields, can't calculate yet              │
│                                                                  │
│  4. Return discoverable signals with confidence scores          │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

**Output - Discovery Confirmation Popup:**
\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│  Found 32 Calculable Signals                                    │
│                                                                  │
│  ✓ 28 NEW signals      Ready to calculate immediately           │
│  ⟳  3 UPDATED signals  Will refresh existing data               │
│  ◐  1 PARTIAL signal   Missing field(s), available later        │
│                                                                  │
│              [Select All]  [Customize]                          │
│              
│              [Cancel]  [Calculate Signals]                      │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

**User sees:** Categories showing new/updated/partial signals, allows custom selection before calculation

---

### Step 3: User Selects Signals & Triggers Calculation

**User Action:** Selects "Win Rate" and 5 other signals, clicks "Calculate Signals"

**Services Involved:**

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                     API ROUTE                                    │
│  /app/api/upload/calculate/route.ts                             │
│  - Receives selected signals                                    │
│  - Gets user's organization_id from context                     │
│  - Calls calculation service for each signal                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               SIGNAL CALCULATION SERVICE                         │
│  /lib/signal-calculation-service.ts                             │
│                                                                  │
│  For "Win Rate" signal:                                         │
│                                                                  │
│  1. detectCalculationType("win_rate", "Win Rate")               │
│     → Returns: "rate"                                           │
│                                                                  │
│  2. findColumnByPattern(rows, ["status", "stage", "outcome"])   │
│     → Returns: "Stage" (actual column name in data)             │
│                                                                  │
│  3. calculateRate(rows, "Stage"):                               │
│     - Total rows: 53                                            │
│     - Positive outcomes (Stage contains "Won"): 17              │
│     - Calculation: (17 / 53) × 100 = 32.08%                     │
│                                                                  │
│  4. calculateTrend(values):                                     │
│     - First half avg: 28%                                       │
│     - Second half avg: 36%                                      │
│     - Change: +28.6% → trend: "up"                              │
│                                                                  │
│  5. formatSignalValue(32.08, "rate")                            │
│     → Returns: "32.1%"                                          │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

**Calculation Result:**
\`\`\`typescript
{
  value: 32.08,
  formattedValue: "32.1%",
  dataPoints: 53,
  trend: "up",
  trendPercentage: 28.6,
  calculationType: "rate",
  calculationMethod: "Rate/Percentage",
  formula: "(Positive outcomes / Total) × 100",
  usedColumn: "Stage"
}
\`\`\`

---

### Step 4: Signal Stored in Database

**Services Involved:**

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                     NEON DATABASE                                │
│  Table: signals                                                  │
│                                                                  │
│  INSERT/UPSERT:                                                 │
│  {                                                               │
│    id: "c4b02b7f-92f7-4572-b0d4-f8f5dfa56e3d",                  │
│    name: "Win Rate",                                            │
│    category: "Sales",                                           │
│    organization_id: "ad52a781-8b43-41d8-a610-ede614f75756",     │
│    absolute_value: "32.1%",                                     │
│    trend: "up",                                                 │
│    trend_value: "+28.6%",                                       │
│    source_type: "upload",                                       │
│    summary: "Rate/Percentage: (Positive outcomes / Total) ×    │
│              100. Based on 53 data points from \"Stage\" column." │
│  }                                                               │
│                                                                  │
│  Constraint: UNIQUE(name, organization_id) prevents duplicates  │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

**User sees:** Success message, redirected to /signals page

---

### Step 5: User Views Signals List (L1 - At a Glance)

**User Action:** Navigates to /signals

**Services Involved:**

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                     SERVER COMPONENT                             │
│  /app/signals/page.tsx                                          │
│  - Gets user session from Supabase Auth                         │
│  - Fetches user_context to get organization_id                  │
│  - Calls signals service with ranking option                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│             SIGNAL INTELLIGENCE SERVICE                          │
│  /lib/signal-intelligence-service.ts                            │
│                                                                  │
│  getRankedSignals(userId):                                      │
│    1. Fetch user_context (role, goals, department)              │
│    2. Get all signals for user's organization                   │
│    3. Score each signal:                                        │
│       - Goal alignment (40%)                                    │
│       - KPI relevance (30%)                                     │
│       - Trend significance (20%)                                │
│       - Recency (10%)                                           │
│    4. Sort by score descending                                  │
│                                                                  │
│    Returns: SignalWithData[] sorted by relevance                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CLIENT COMPONENT                               │
│  /components/signals-page-client.tsx                            │
│  - Renders signal cards in grid                                 │
│  - Default sort: by intelligence ranking                        │
│  - Filters available (dropdown):                                │
│    • Saved signals only                                         │
│    • By function (Sales, CS, Support, Marketing)               │
│    • Opportunities (high potential signals)                     │
│    • Risks (signals trending down)                              │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

**User sees - L1 Card for "Win Rate" (ranked #3 by intelligence):**
\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│  Win Rate                                    [Sales]            │
│                                                                  │
│                    32.1%           ↑ +28.6%                     │
│                                                                  │
│               [ View Details ]                                  │
│                                                                  │
│  [Share]  [Save]                              [More ▼]          │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

**Data displayed:**
- Signal name: "Win Rate"
- Category badge: "Sales"
- Value: "32.1%" (from absolute_value)
- Trend: ↑ up arrow with "+28.6%" (from trend + trend_value)
- Order: Ranked #3 by intelligence service for this user

---

### Step 6: User Expands to L2 (Context)

**User Action:** Clicks "View Details" on Win Rate card → Card expands vertically with single click

**Services Involved:**

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                   CLIENT COMPONENT                               │
│  /components/signal-accordion-card.tsx                          │
│                                                                  │
│  State: expandedLevel changes from 0 → 1                        │
│                                                                  │
│  Single click to expand/collapse (vertical scroll layout):      │
│  - L1: Signal name, value, trend, actions (always visible)      │
│  - L2: Trend chart, stats, metadata (scroll down to view)       │
│  - L3: AI Insights section (scroll down further)                │
│                                                                  │
│  On expand:                                                     │
│  - Show historical trend chart                                  │
│  - Display stats: data points, source, last updated             │
│  - Display calculation method and field used                    │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

**User sees - L2 Expanded (scroll down):**
\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│  Win Rate                                    [Sales]            │
│                                                                  │
│                    32.1%           ↑ +28.6%                     │
│                                                                  │
│  ═════════════════════════════════════════════════════════════ │
│                                                                  │
│  📊 TREND OVER TIME                                              │
│     36% │         ∙ ∙                                           │
│     32% │     ∙ ∙                                               │
│     28% │ ∙ ∙                                                   │
│         └──────────────────                                     │
│           Week 1    Week 2                                      │
│                                                                  │
│  📋 CALCULATION DETAILS                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ 53           │ │ Upload       │ │ Jan 31, 2026 │            │
│  │ Data Points  │ │ Source       │ │ Last Updated │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  💡 FORMULA                                                      │
│  Rate/Percentage: (Positive outcomes / Total) × 100             │
│  Field Used: "Stage" column → positive = "Closed Won"          │
│                                                                  │
│               [ Get AI Insights ]                               │
│                                                                  │
│  [Share]  [Save]                              [More ▼]          │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

---

### Step 7: User Requests L3 (AI Interpretation)

**User Action:** Clicks "Get AI Insights" on expanded card

**Services Involved:**

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                   CLIENT COMPONENT                               │
│  /components/signal-accordion-card.tsx                          │
│                                                                  │
│  1. Sets loading state                                          │
│  2. Calls API: GET /api/signals/[id]/interpretation             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API ROUTE                                    │
│  /app/api/signals/[id]/interpretation/route.ts                  │
│                                                                  │
│  1. Validates user has access to signal                         │
│  2. Checks cache (signal_interpretations table)                 │
│  3. If miss → calls interpretation service                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               INTERPRETATION SERVICE                             │
│  /lib/interpretation-service.ts                                 │
│                                                                  │
│  NEW UNIFIED PROMPT STRUCTURE (replaces old "what/what/so"):    │
│                                                                  │
│  1. Gather context:                                             │
│     - Signal data (value, trend, category)                      │
│     - User context (role, goals, department)                    │
│     - Org context (industry, size)                              │
│     - Historical data if available                              │
│                                                                  │
│  2. Build single unified prompt requesting:                     │
│     - Executive Summary (1-2 lines for busy execs)              │
│     - Takeaway Breakdown (key insights with numbers)            │
│     - Benchmark Comparison (vs industry standards)              │
│     - Root Cause Analysis (why is this happening?)              │
│     - Implications on Goals (business impact)                   │
│                                                                  │
│  3. One AI call (not multiple calls):                           │
│     Model: gpt-4o-mini                                          │
│     Returns: Structured JSON with all 5 sections                │
│                                                                  │
│  4. Cache full response in signal_interpretations               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AI GATEWAY                                     │
│  Vercel AI Gateway → OpenAI                                     │
│                                                                  │
│  Model: gpt-4o-mini                                             │
│  Response time: ~2-3 seconds                                    │
│  Output: Structured JSON with improved quality & accuracy       │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

**AI Response:**
\`\`\`json
{
  "executive_summary": "Win rate improving: 32.1% (↑28.6%). On track for team targets.",
  
  "takeaway_breakdown": "17 of 53 deals closed won. Second half performance (36%) outpaced first half (28%), indicating improving sales effectiveness. Team velocity accelerating.",
  
  "benchmark_comparison": "Your 32.1% rate is below B2B SaaS benchmark (35-40%). Consider: shorter sales cycles, product positioning, or early-stage market fit. Competitive position depends on target market.",
  
  "root_cause_analysis": "Upward trend suggests recent improvements: better lead qualification, sales training effects, or improved product positioning. Data shows pattern change around week 2.",
  
  "implications_on_goals": "If revenue target is $5M: current rate yields ~$1.6M. Reaching 35% benchmark would yield ~$1.75M (+$150K). Recommend: analyze second-half winning patterns, replicate across team, implement qualification process."
}
\`\`\`

---

### Step 8: User Sees Complete L3 View

**User sees - Full L3 Expanded:**
\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│  Win Rate                                    [Sales]            │
│                                                                  │
│                    32.1%           ↑ +28.6%                     │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  [L2 content: chart, stats...]                                  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ✨ AI Insights                                                 │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📊 WHAT WE FOUND                                        │   │
│  │                                                          │   │
│  │ Your win rate of 32.1% is based on 17 closed-won deals  │   │
│  │ out of 53 total opportunities. The trend shows a 28.6%  │   │
│  │ improvement, with win rates climbing from 28% in the    │   │
│  │ first half to 36% in the second half.                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 💡 WHAT IT MEANS                                        │   │
│  │                                                          │   │
│  │ Your team is closing deals more effectively over time.  │   │
│  │ This improvement suggests recent changes in sales       │   │
│  │ approach, better lead qualification, or improved        │   │
│  │ product-market fit are working. The 32% rate is         │   │
│  │ slightly below the B2B SaaS benchmark of 35-40%.        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🎯 SO WHAT (Recommended Actions)                        │   │
│  │                                                          │   │
│  │ • Double down on what's working: review deals closed    │   │
│  │   in the second half to identify winning patterns       │   │
│  │ • Implement learnings across the team                   │   │
│  │ • To reach 35% benchmark: disqualify poor-fit leads     │   │
│  │   earlier, increase touchpoints with high-intent        │   │
│  │   prospects                                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [Share]  [Save]                              [More ▼]          │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

**Complete User Experience:**
- Single click on card expands/collapses vertically
- Scroll down within card to view L2 (trend, stats, calculation) and L3 (5-section AI insights)
- "How is this calculated?" in More menu shows field names and source
- All ranking/filtering based on intelligence service
- New/Updated/Partial signals shown at discovery confirmation popup

---

## Complete Data Flow Diagram

\`\`\`
USER                    FRONTEND                 API                    SERVICES                 DATABASE
 │                         │                      │                        │                        │
 │ Drag file              │                      │                        │                        │
 ├────────────────────────►│                      │                        │                        │
 │                         │ POST /api/upload     │                        │                        │
 │                         ├─────────────────────►│                        │                        │
 │                         │                      │ parseCSV()             │                        │
 │                         │                      ├───────────────────────►│                        │
 │                         │                      │                        │ csv-parser.ts          │
 │                         │                      │◄───────────────────────┤                        │
 │                         │                      │ discoverSignals()      │                        │
 │                         │                      ├───────────────────────►│                        │
 │                         │                      │                        │ signal-discovery.ts    │
 │                         │                      │◄───────────────────────┤                        │
 │                         │◄─────────────────────┤ {discoveredSignals}    │                        │
 │ Select signals          │                      │                        │                        │
 ├────────────────────────►│                      │                        │                        │
 │                         │ POST /api/upload/calc│                        │                        │
 │                         ├─────────────────────►│                        │                        │
 │                         │                      │ calculateSignal()      │                        │
 │                         │                      ├───────────────────────►│                        │
 │                         │                      │                        │ signal-calculation.ts  │
 │                         │                      │◄───────────────────────┤                        │
 │                         │                      │ INSERT signals         │                        │
 │                         │                      ├───────────────────────────────────────────────►│
 │                         │                      │                        │                        │ NEON
 │                         │                      │◄───────────────────────────────────────────────┤
 │                         │◄─────────────────────┤ {createdSignals}       │                        │
 │ View /signals           │                      │                        │                        │
 ├────────────────────────►│                      │                        │                        │
 │                         │ getSignals()         │                        │                        │
 │                         ├─────────────────────►│                        │                        │
 │                         │                      │                        │                        │
 │                         │                      ├───────────────────────────────────────────────►│
 │                         │                      │◄───────────────────────────────────────────────┤
 │                         │◄─────────────────────┤                        │                        │
 │ L1 Cards               │                      │                        │                        │
 │◄────────────────────────┤                      │                        │                        │
 │ Click "View Details"    │                      │                        │                        │
 ├────────────────────────►│                      │                        │                        │
 │ L2 Expanded            │ (client-side expand) │                        │                        │
 │◄────────────────────────┤                      │                        │                        │
 │ Click "AI Insights"     │                      │                        │                        │
 ├────────────────────────►│                      │                        │                        │
 │                         │ GET /api/signals/id/ │                        │                        │
 │                         │     interpretation   │                        │                        │
 │                         ├─────────────────────►│                        │                        │
 │                         │                      │ generateInterpretation │                        │
 │                         │                      ├───────────────────────►│                        │
 │                         │                      │                        │ interpretation.ts      │
 │                         │                      │                        ├──────────────────────► │
 │                         │                      │                        │        AI Gateway      │
 │                         │                      │                        │◄─────────────────────  │
 │                         │                      │◄───────────────────────┤                        │
 │                         │◄─────────────────────┤ {interpretation}       │                        │
 │ L3 AI Insights         │                      │                        │                        │
 │◄────────────────────────┤                      │                        │                        │
\`\`\`

---

## Services Summary

| Step | Service | Location | Purpose |
|------|---------|----------|---------|
| 1 | CSV Parser | `/lib/csv-parser.ts` | Parse uploaded file |
| 2 | Signal Discovery | `/lib/signal-discovery-service.ts` | Find calculable signals |
| 3 | Signal Calculation | `/lib/signal-calculation-service.ts` | Calculate values, trends |
| 4 | Signals Service | `/lib/signals-service.ts` | CRUD operations |
| 5 | User Context | `/lib/user-context-service.ts` | Get org/user settings |
| 6 | Interpretation | `/lib/interpretation-service.ts` | Generate AI insights |

---

## Win Rate Calculation Deep Dive

**Input Data:**
\`\`\`
53 deals with "Stage" column containing:
- "Closed Won": 17 deals
- "Closed Lost": 21 deals  
- "Negotiation": 8 deals
- "Proposal": 7 deals
\`\`\`

**Calculation Steps:**

1. **Type Detection:** `detectCalculationType("win_rate")` → `"rate"`

2. **Column Resolution:** `findColumnByPattern(rows, ["status", "stage"])` → `"Stage"`

3. **Rate Calculation:**
   \`\`\`
   Total deals: 53
   Positive outcomes (Stage contains "Won"): 17
   Win Rate = (17 / 53) × 100 = 32.08%
   \`\`\`

4. **Trend Calculation:**
   \`\`\`
   First 26 deals: 7 won → 26.9%
   Last 27 deals: 10 won → 37.0%
   Trend = ((37.0 - 26.9) / 26.9) × 100 = +37.5%
   Rounded: +28.6% (using half averages)
   Direction: "up"
   \`\`\`

5. **Formatting:** `formatSignalValue(32.08, "rate")` → `"32.1%"`

**Stored Summary:**
\`\`\`
"Rate/Percentage: (Positive outcomes / Total) × 100. Based on 53 data points from "Stage" column."
\`\`\`

---

## Database Tables Touched

| Table | Operation | Data |
|-------|-----------|------|
| `user_context` | READ | Get organization_id for user |
| `signals` | UPSERT | Store calculated signal |
| `signal_interpretations` | READ/WRITE | Cache AI interpretation |

---

**Document Version:** 1.0
**Last Updated:** February 2026
