# Camino Product Specification

> **Version:** 1.0 (MVP)  
> **Last Updated:** January 2026  
> **Status:** Draft for Review

---

## A. Context

### The Problem

Small and medium businesses (SMBs) generate operational data across many tools—Zoho Desk, HubSpot, spreadsheets—but struggle to extract actionable insights. They lack:

1. **Time** to analyze data manually each week
2. **Expertise** to know what metrics matter and what "good" looks like
3. **Tools** that connect raw data to business decisions (enterprise BI is overkill)

The result: Managers spend hours creating reports that don't inform decisions. Executives ask for data that arrives too late or lacks context. Knowledge walks out the door when employees leave.

### The Opportunity

SMBs need a tool that:
- Accepts data they already have (spreadsheets, exports)
- Automatically identifies what matters
- Explains what it means in plain language
- Connects insights to decisions they're actually facing
- Takes 5 minutes per week, not 5 hours

### Target Market

**Primary:** B2B SaaS companies, 20-200 employees

**Initial Users:**
- Customer Service Managers (using Zoho Desk)
- Sales Managers (using HubSpot/Zoho CRM)
- Operations/Finance Managers (using spreadsheets)

**Buyers:**
- VPs of Operations, COOs, CEOs who need visibility without asking for reports

---

## B. Camino Goal

### Vision Statement

> **Camino transforms raw business data into decisions—automatically.**

### Product Thesis

We believe that if we make it effortless to:
1. **Upload** weekly data (30 seconds)
2. **See** what changed and why it matters (1 minute)
3. **Understand** the implications (1 minute)
4. **Share** insights with stakeholders (30 seconds)

Then managers will adopt Camino as their weekly rhythm, executives will trust the insights, and organizations will make better decisions faster.

### Core Value Proposition

| For | Camino Is | That | Unlike |
|-----|-----------|------|--------|
| **Managers** | A weekly intelligence assistant | Turns their data into shareable insights in 5 minutes | Manual reporting that takes hours |
| **Executives** | A real-time dashboard of what matters | Shows only signals that need attention | Information overload from dashboards |

---

## C. Success Metrics

### North Star Metric

**Weekly Active Organizations (WAO):** Organizations where at least one user uploads data AND at least one user views signals in a given week.

### Primary Metrics (MVP)

| Metric | Definition | Target (90 days) |
|--------|------------|------------------|
| **Upload Retention** | % of managers who upload 4+ weeks in a row | >60% |
| **Signal Engagement** | % of weekly users who explore at least 1 signal | >70% |
| **Share Rate** | % of managers who share at least 1 signal/week | >30% |
| **Exec Return Rate** | % of execs who return weekly to check signals | >50% |

### Secondary Metrics

| Metric | Definition | Why It Matters |
|--------|------------|----------------|
| Time to First Signal | Minutes from signup to seeing first insight | Activation speed |
| Signals Saved (Exec) | Average signals saved per exec user | Engagement depth |
| Interpretation Usefulness | % of interpretations rated helpful | AI quality |
| Share Completion Rate | % of share sheet opens that complete | UX friction |

### Guardrail Metrics

- **False Positives:** % of "Needs Attention" flags that users dismiss as not important (<20%)
- **Upload Errors:** % of uploads that fail to parse (<5%)
- **AI Hallucinations:** % of interpretations with factual errors (<1%)

---

## D. User Stories

### User Types

| Type | Role Examples | Primary Behavior | Key Motivation |
|------|---------------|------------------|----------------|
| **Manager** | CS Manager, Sales Manager | Uploads data weekly, explores signals, shares to leadership | Look prepared, surface problems early |
| **Executive** | VP Ops, COO, CEO | Views saved signals, drills into problems | Quick pulse, no surprises |

---

### Manager User Stories

#### First Time Experience

\`\`\`
US-M1: First Upload
As a Manager,
I want to upload my first data file,
So that I can see what signals Camino detects.

Acceptance Criteria:
- Can drag/drop or browse for XLSX/CSV file
- See upload progress indicator
- Within 30 seconds, see list of detected signals
- Each signal shows: name, current value
- Message indicates this is baseline (no trends yet)
\`\`\`

\`\`\`
US-M2: Explore First Signal
As a Manager,
I want to tap on a signal to see details,
So that I understand what the number means.

Acceptance Criteria:
- Signal detail page shows value prominently
- "What We Found" section shows breakdown (by category, by day, etc.)
- "What It Means" section explains in plain language
- Can navigate back to signal list easily
\`\`\`

#### Ongoing Experience

\`\`\`
US-M3: Weekly Upload
As a Manager,
I want to upload this week's data,
So that I can see what changed from last week.

Acceptance Criteria:
- Upload recognizes returning user/format
- Processing shows "Comparing to last week..."
- Results grouped by: Needs Attention, Improved, Steady
- Each signal shows: value, change %, trend direction
\`\`\`

\`\`\`
US-M4: Explore Problem Signal
As a Manager,
I want to drill into a signal marked "Needs Attention",
So that I can understand the problem and what to do.

Acceptance Criteria:
- Signal detail shows trend visualization (4+ weeks)
- "What We Found" shows where problem is concentrated
- "What It Means" compares to benchmarks/expectations
- "So What" suggests 2-3 specific actions
\`\`\`

\`\`\`
US-M5: Share Signal to Manager
As a Manager,
I want to share a signal insight with my VP,
So that they have context before our 1:1.

Acceptance Criteria:
- Tap "Share" button on signal detail
- See preview of shareable summary
- Can toggle: include metric, include meaning, include recommendation
- Copy to clipboard with one tap
- Option to send via email (pre-filled recipient from org)
\`\`\`

\`\`\`
US-M6: Share Win with Team
As a Manager,
I want to share a positive signal with my team,
So that we can celebrate progress.

Acceptance Criteria:
- Share sheet allows posting to Slack channel
- Summary is concise and celebratory in tone
- Team channel shows formatted message with metric + context
\`\`\`

---

### Executive User Stories

#### First Time Experience

\`\`\`
US-E1: View Available Signals
As an Executive,
I want to see all signals my team has uploaded,
So that I can choose which ones to track.

Acceptance Criteria:
- See list of all signals in my organization
- Each shows: name, current value, trend indicator
- Signals my team flagged as "Needs Attention" are highlighted
\`\`\`

\`\`\`
US-E2: Save Key Signals
As an Executive,
I want to save the 3-5 signals I care most about,
So that I can see them quickly each week.

Acceptance Criteria:
- Tap star icon to save/unsave a signal
- Visual confirmation when saved
- Can save up to 10 signals
\`\`\`

#### Ongoing Experience

\`\`\`
US-E3: Weekly Check-in
As an Executive,
I want to open Camino and immediately see my key signals,
So that I get a pulse on the business in 60 seconds.

Acceptance Criteria:
- App opens to "My Signals" view by default
- Shows only saved signals
- Grouped by: Needs Attention, On Track
- Most concerning signal is visually prominent
\`\`\`

\`\`\`
US-E4: Drill into Problem
As an Executive,
I want to tap a flagged signal to understand the issue,
So that I can ask informed questions in my 1:1.

Acceptance Criteria:
- See same detail view as Manager
- "So What" section is relevant to executive decisions
- Can see who uploaded the data and when
\`\`\`

---

## E. Product Specifications

### Information Architecture

\`\`\`
├── Onboarding
│   ├── Sign Up / Sign In
│   ├── Role Selection (Executive / Manager)
│   └── Organization Join/Create
│
├── Signals List (Home)
│   ├── All Signals view
│   ├── My Signals view (saved only)
│   ├── Grouped by status (Needs Attention / Improved / Steady)
│   └── Upload trigger (+)
│
├── Signal Detail
│   ├── Header (name, value, change, trend)
│   ├── Trend visualization
│   ├── What We Found (Layer 1)
│   ├── What It Means (Layer 2)
│   ├── So What (Layer 3)
│   └── Actions (Save, Share, Add Learning)
│
├── Upload Flow
│   ├── File picker / drag-drop
│   ├── Processing indicator
│   └── Results (grouped signals)
│
└── Share Sheet
    ├── Summary preview
    ├── Include options (toggles)
    └── Destination (Copy / Slack / Email)
\`\`\`

### Screen Specifications

#### 1. Signals List

| Element | Specification |
|---------|---------------|
| Header | "Signals" title, filter toggle (All / My Signals), Upload (+) button |
| Filter Toggle | Executive users default to "My Signals"; Manager users default to "All" |
| Grouping | Dynamic groups: "Needs Attention" (red), "Improved" (green), "Steady" (gray) |
| Signal Card | Name, Value, Change %, Trend arrow, Star (saved) indicator |
| Empty State | "No signals yet" + CTA based on role |

#### 2. Signal Detail

| Section | Content |
|---------|---------|
| Header | Signal name, Star toggle, Back button |
| Metric Display | Large value, Change badge (↑12% or ↓5%), Trend label |
| Trend Chart | Sparkline or bar chart, last 4-6 periods |
| What We Found | Bullet points: breakdown by dimension, raw observations |
| What It Means | Paragraph: context, benchmarks, correlation with other signals |
| So What | Bullet points: suggested actions, linked decisions |
| Actions | [Share] [Add Learning] buttons |

#### 3. Upload Flow

| Step | Content |
|------|---------|
| Trigger | Tap (+) or "Upload" CTA |
| File Selection | Drag-drop zone, "Browse" button, supported formats note |
| Processing | Progress bar, "Analyzing..." then "Comparing to last week..." |
| Results | Grouped signal list (same layout as Signals List) |

#### 4. Share Sheet

| Element | Specification |
|---------|---------------|
| Preview | Formatted summary in card (simulates how recipient sees it) |
| Toggles | Include: Key metric, What it means, Recommendation |
| Destinations | [Copy Text] [Share to Slack] [Email to {name}] |
| Confirmation | Toast: "Copied to clipboard" or "Sent to #channel" |

---

### Signal Interpretation Framework

Each signal interpretation follows this structure:

\`\`\`
WHAT WE FOUND (Layer 1)
───────────────────────
- Primary observation (metric + change)
- Breakdown by dimension 1 (e.g., by day)
- Breakdown by dimension 2 (e.g., by category)
- Notable outliers or patterns

WHAT IT MEANS (Layer 2)
───────────────────────
- Context: How does this compare to benchmarks?
- Trend: Is this part of a pattern or an anomaly?
- Correlation: What else changed that might explain this?
- Risk/Opportunity: What's the potential impact?

SO WHAT (Layer 3)
─────────────────
- Recommendation 1 (specific, actionable)
- Recommendation 2 (if applicable)
- Questions to investigate further
- Confidence level (High/Medium/Low)
\`\`\`

### Signal Status Logic

| Status | Criteria | Visual |
|--------|----------|--------|
| **Needs Attention** | (trend is bad direction AND 3+ weeks) OR (change > 20% in bad direction) | Red accent, top of list |
| **Improved** | Change > 5% in good direction | Green accent |
| **Steady** | Change < 5% in either direction | Gray/neutral |
| **New** | First data point, no comparison available | Blue accent, "Baseline" label |

"Good direction" is defined per signal type:
- CSAT, Win Rate, Resolution Rate → higher is better
- Response Time, Churn, Cost → lower is better

---

## F. Technical Specifications

### Architecture Overview

\`\`\`
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                  │
│  Next.js 16 App Router + React 19 + Tailwind CSS + shadcn/ui       │
├─────────────────────────────────────────────────────────────────────┤
│                           API LAYER                                 │
│  Next.js API Routes (Server Actions for mutations)                 │
├─────────────────────────────────────────────────────────────────────┤
│                          SERVICES                                   │
│  signals-service │ upload-service │ interpretation-service │ share │
├─────────────────────────────────────────────────────────────────────┤
│                          DATABASE                                   │
│  Supabase (Auth + Postgres) or Neon (Postgres)                     │
├─────────────────────────────────────────────────────────────────────┤
│                          EXTERNAL                                   │
│  AI Gateway (OpenAI) │ Slack API │ Email (Resend)                  │
└─────────────────────────────────────────────────────────────────────┘
\`\`\`

### Database Schema (MVP)

\`\`\`sql
-- Core Tables (Existing)
───────────────────────

profiles
├── id (UUID, PK)
├── email
├── full_name
├── role ('executive' | 'manager')  -- ADD
├── organization_id (FK)
└── created_at

organizations
├── id (UUID, PK)
├── name
├── slug
└── created_at

signals
├── id (UUID, PK)
├── organization_id (FK)
├── name
├── description
├── category
├── good_direction ('up' | 'down')
├── unit (string: '%', 'hrs', '$', etc.)
└── source_id (FK)

signal_values
├── id (UUID, PK)
├── signal_id (FK)
├── period (string: '2026-01-W4')
├── value (numeric)
├── previous_value (numeric, nullable)
├── change_percent (numeric, nullable)
├── trend ('up' | 'down' | 'stable' | 'new')
├── needs_attention (boolean)
└── created_at

data_sources
├── id (UUID, PK)
├── organization_id (FK)
├── name
├── source_type
├── schema (JSONB)
└── uploaded_by (FK)

raw_data
├── id (UUID, PK)
├── source_id (FK)
├── period
├── row_data (JSONB)
└── created_at


-- New Tables (MVP)
───────────────────

saved_signals
├── id (UUID, PK)
├── user_id (FK → profiles)
├── signal_id (FK → signals)
├── created_at
└── UNIQUE(user_id, signal_id)

signal_interpretations
├── id (UUID, PK)
├── signal_id (FK → signals)
├── period (string)
├── what_we_found (text)
├── what_it_means (text)
├── so_what (text)
├── suggested_actions (text[])
├── confidence ('high' | 'medium' | 'low')
├── generated_at
└── stale (boolean, default false)

signal_shares
├── id (UUID, PK)
├── signal_id (FK)
├── shared_by (FK → profiles)
├── share_type ('copy' | 'slack' | 'email')
├── destination (string, nullable)
├── summary_text (text)
└── created_at
\`\`\`

### API Endpoints

| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| `/api/signals` | GET | List signals | `?saved=true&period=2026-01` | `Signal[]` |
| `/api/signals/[id]` | GET | Get signal detail | - | `SignalDetail` |
| `/api/signals/[id]/save` | POST | Save signal | - | `{ saved: true }` |
| `/api/signals/[id]/save` | DELETE | Unsave signal | - | `{ saved: false }` |
| `/api/signals/[id]/interpret` | GET | Get interpretation | - | `Interpretation` |
| `/api/signals/[id]/share` | POST | Generate share summary | `{ include: [...] }` | `{ summary, options }` |
| `/api/signals/[id]/share/send` | POST | Send share | `{ type, destination }` | `{ sent: true }` |
| `/api/upload` | POST | Upload file | `FormData` | `{ signals, period }` |

### Service Layer

\`\`\`
lib/
├── services/
│   ├── signals-service.ts      # CRUD for signals + values
│   ├── upload-service.ts       # File parsing + signal detection
│   ├── interpretation-service.ts  # AI generation + caching
│   └── share-service.ts        # Summary generation + sending
├── ai/
│   ├── prompts.ts              # AI prompt templates
│   └── schemas.ts              # Zod schemas for AI output
└── utils/
    ├── calculations.ts         # Trend detection, change %
    └── benchmarks.ts           # Industry benchmark data
\`\`\`

### AI Integration

**Model:** `openai/gpt-4o-mini` via Vercel AI Gateway

**Interpretation Generation:**
\`\`\`typescript
const interpretation = await generateObject({
  model: 'openai/gpt-4o-mini',
  schema: interpretationSchema,
  prompt: buildInterpretationPrompt({
    signal,
    currentValue,
    history,
    breakdown,
    benchmarks,
    organizationContext
  })
})
\`\`\`

**Caching Strategy:**
- Cache interpretations in `signal_interpretations` table
- Invalidate when new data uploaded (mark `stale = true`)
- Regenerate on next view (lazy) or background job (eager)
- TTL: 24 hours even if no new data

### Component Structure

\`\`\`
components/
├── signals/
│   ├── signals-list.tsx        # Main list view
│   ├── signal-card.tsx         # Individual signal in list
│   ├── signal-filter.tsx       # All / My Signals toggle
│   └── signal-status-group.tsx # Grouped section (Needs Attention, etc.)
├── signal-detail/
│   ├── signal-detail-page.tsx  # Full detail view
│   ├── signal-header.tsx       # Name, value, save button
│   ├── signal-trend-chart.tsx  # Sparkline visualization
│   ├── signal-layer.tsx        # Reusable section (What/Means/So What)
│   └── signal-actions.tsx      # Share, Add Learning buttons
├── upload/
│   ├── upload-modal.tsx        # Upload flow container
│   ├── upload-dropzone.tsx     # File picker
│   └── upload-results.tsx      # Post-upload signal list
├── share/
│   ├── share-sheet.tsx         # Share modal
│   ├── share-preview.tsx       # Summary preview
│   └── share-options.tsx       # Destination buttons
└── common/
    ├── trend-badge.tsx         # ↑12% styled badge
    ├── status-indicator.tsx    # Red/green/gray dot
    └── empty-state.tsx         # No data states
\`\`\`

---

## G. MVP Scope

### In Scope (Build First)

| Feature | Priority | User |
|---------|----------|------|
| Upload file → detect signals | P0 | Manager |
| View signal list (grouped by status) | P0 | Both |
| Signal detail with What/Means/So What | P0 | Both |
| Save/unsave signals | P0 | Executive |
| "My Signals" filter | P0 | Executive |
| Share via copy | P0 | Manager |
| Role selection (exec/manager) | P0 | Both |

### Out of Scope (Post-MVP)

| Feature | Reason |
|---------|--------|
| Slack integration for sharing | Adds OAuth complexity |
| Email delivery for sharing | Adds email infrastructure |
| Goals and Decisions tracking | Adds onboarding friction |
| Team/organization management | Admin features can wait |
| Multiple data source types | Start with generic spreadsheet |
| Historical data import | Start fresh with weekly rhythm |
| Mobile native app | Web-first, responsive design |

### MVP Timeline Estimate

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1: Database + Backend | 3-4 days | New tables, services, API routes |
| Phase 2: Frontend (Core) | 4-5 days | Signal list, detail, save |
| Phase 3: Frontend (Upload + Share) | 3-4 days | Upload flow, share sheet |
| Phase 4: Polish + Testing | 2-3 days | Edge cases, error states |
| **Total** | **~2 weeks** | Functional MVP |

---

## H. Open Questions

1. **Data source flexibility:** Should MVP support only generic CSV/XLSX, or also specific integrations (Zoho, HubSpot)?

2. **Interpretation quality:** How do we measure if AI interpretations are helpful? Manual review? User feedback?

3. **Benchmark data:** Where do benchmarks come from? Static data? User-reported? Industry research?

4. **Sharing without Slack:** Is copy-to-clipboard sufficient for MVP, or is Slack integration critical?

5. **Organization size:** What's the max team size for MVP? Does sharing work differently at 5 vs 50 users?

6. **Retention mechanics:** Beyond core features, what prompts/nudges drive weekly return? Email reminders?

---

## I. Appendix

### User Workflow Diagrams

**Executive Weekly Flow:**
\`\`\`
Open App → My Signals (3-5 saved) → See "Needs Attention" → Tap to explore → Understand context → Prepared for 1:1
\`\`\`

**Manager Weekly Flow:**
\`\`\`
Export from tool → Upload to Camino → See what changed → Explore problems → Share to VP → Share win to team
\`\`\`

### Competitive Landscape

| Competitor | Strength | Weakness | Camino Differentiation |
|------------|----------|----------|------------------------|
| **Tableau/PowerBI** | Powerful visualization | Complex, expensive, requires expertise | Automatic insights, no setup |
| **Google Sheets** | Flexible, familiar | No intelligence, manual analysis | AI interpretation layer |
| **Databox** | Dashboard aggregation | Still requires metric selection, no "so what" | Decision-focused, not dashboard |
| **Klipfolio** | SMB-focused dashboards | Visual dashboards, not insights | Narrative over visualization |

### Signal Definition Examples

| Signal | Source | Calculation | Good Direction | Benchmark |
|--------|--------|-------------|----------------|-----------|
| CSAT | Zoho Desk | AVG(satisfaction_rating) | Up | 4.0+ is good |
| First Response Time | Zoho Desk | AVG(first_response_hours) | Down | <2 hrs is good |
| Win Rate | HubSpot | WON / (WON + LOST) | Up | 25-30% is average |
| Pipeline Value | HubSpot | SUM(deal_value) WHERE stage != closed | Up | Depends on quota |
| Tickets per Rep | Zoho Desk | COUNT(tickets) / COUNT(agents) | Down | 40-50/week is healthy |

---

*End of Product Specification*
