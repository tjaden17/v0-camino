# Camino — Weekly Brief Specification

**Version:** 1.0
**Status:** Approved for MSS build
**Owner:** Product
**Last updated:** March 2026

---

## What It Is

The Weekly Brief is the primary delivery mechanism for Camino's intelligence. It is a single-page, exec-grade summary sent every Monday morning before the working week begins. It gives Surge a complete picture of business health in under 90 seconds — without him having to open a dashboard, pull a report, or ask anyone.

It is not a newsletter. It is not a data dump. It is not a link to a chart. It is a self-contained, opinionated summary that tells the exec what is happening, why it matters, and what deserves attention this week.

---

## The Core Principle

> One signal per line. One insight per section. One action per brief.

Everything in the brief earns its place by answering: "Would Surge make a different decision this week if he knew this?" If the answer is no, it doesn't belong in the brief.

---

## Format — The Brief Structure

The brief is a single scrollable page. On mobile, it reads top to bottom in under 90 seconds. On desktop, it can be printed on one A4 page.

---

### Section 1: The Headline (3 lines)

The most important thing happening in the business this week. Written as a single sentence. Opinionated. Not hedged.

```
┌─────────────────────────────────────────────────────────┐
│  CAMINO — WEEKLY BRIEF                                  │
│  Week of 24 March 2026  |  Locumate                     │
│                                                         │
│  "Win rate has recovered to 38% — pipeline is healthy   │
│   but agency usage is approaching your concern          │
│   threshold. This week: watch agency."                  │
└─────────────────────────────────────────────────────────┘
```

**Rules:**
- One sentence only
- Must reference a real number from this week's data
- Must name what to watch or what is going well
- Written by AI, reviewed by no one — it must be good enough to stand alone

---

### Section 2: Signal Scorecard (the KPI table)

Every active KPI for this customer, shown as a row. Status at a glance.

```
┌─────────────────────────────────────────────────────────┐
│  YOUR SIGNALS THIS WEEK                                 │
│                                                         │
│  Pipeline Value       $1.24M     → flat      stable    │
│  Win Rate             38%        ↑ +6pts     improving │
│  Closed Revenue       $142K      ↓ -$18K     watch     │
│  Avg Sales Cycle      47 days    → flat      stable    │
│  Ticket Volume        84         ↑ +12       watch     │
│  Avg Resolution       6.2 hrs    ↓ -1.1 hrs  improving │
│  Lead Conversion      14%        → flat      stable    │
└─────────────────────────────────────────────────────────┘
```

**Each row contains:**
- KPI name
- Current value (absolute)
- Delta from last period (arrow + number)
- Status badge: `improving` / `stable` / `watch` / `alert`

**Status badge rules:**
| Badge | Condition |
|---|---|
| `improving` | Delta > threshold in positive direction |
| `stable` | Delta within ±threshold |
| `watch` | Delta > threshold in negative direction, not yet critical |
| `alert` | Delta > 2x threshold in negative direction, or threshold crossed |

Thresholds are set per KPI per customer in `customer_kpi_status`.

**What it does not show:**
- Charts (too much for a brief — charts live on the signal card)
- Historical trend (one sentence in Section 3 handles this)
- Raw data rows

---

### Section 3: The Focus Signal (one KPI, expanded)

The single most important signal this week gets one paragraph of interpretation. Not five paragraphs. One.

The AI selects the focus signal based on:
1. Highest urgency status (`alert` first, then `watch`)
2. If tied: the signal most relevant to the exec's stated 90-day priority
3. If still tied: the signal with the largest delta as a percentage of its historical range

```
┌─────────────────────────────────────────────────────────┐
│  THIS WEEK'S FOCUS                                      │
│                                                         │
│  Ticket Volume — 84 tickets (+12 from last week)        │
│                                                         │
│  Volume has been rising for three consecutive weeks:    │
│  60 → 72 → 84. At this rate it will cross 100 tickets   │
│  per week by mid-April. The increase correlates with    │
│  the onboarding of three new pharmacy groups in         │
│  late February. Resolution time has not yet been        │
│  affected (6.2 hrs, within target). Watch whether       │
│  resolution time follows volume up in coming weeks.     │
└─────────────────────────────────────────────────────────┘
```

**Rules:**
- Maximum 5 sentences
- Must reference the trend (not just this week's number)
- Must give one forward-looking statement ("watch whether X")
- Must not recommend an action — that's the exec's job
- If no signal is at `watch` or `alert`: the focus section becomes "What's going well" — the best-performing signal this week

---

### Section 4: One Action (optional, flagged by exec)

If Surge flagged something last week as needing follow-up, it appears here as a single line.

```
┌─────────────────────────────────────────────────────────┐
│  OPEN ITEM                                              │
│                                                         │
│  You flagged: Agency Usage crossed 30% (Mar 17)         │
│  Status: Not yet resolved — no update from Sam          │
│                                                         │
│  [View signal]                                          │
└─────────────────────────────────────────────────────────┘
```

**MSS scope:** This section is only shown if the exec has previously flagged a signal. In the MSS, flagging happens outside the product (Slack/email to Sam). This section is pre-populated manually by the founder for the MSS. In MVP (Level 2 operator layer), it is auto-populated from the signal thread status.

---

### Section 5: Footer

```
┌─────────────────────────────────────────────────────────┐
│  Data as of: 23 March 2026                              │
│  Next brief: Monday 30 March 2026                       │
│                                                         │
│  [Open full dashboard →]    [Something wrong? Tell us]  │
└─────────────────────────────────────────────────────────┘
```

---

## Delivery

| Property | Specification |
|---|---|
| Channel | Email (primary) + in-app notification |
| Send time | Monday 6:00am AEST |
| Subject line | "Camino Brief — Week of [date] — [headline KPI status]" |
| From name | "Camino" |
| Format | HTML email, responsive, readable on mobile without zooming |
| Fallback | Plain text version for email clients that block HTML |
| Email provider | Resend |
| Trigger | Vercel Cron Job — runs Monday 5:45am AEST, generates brief, sends at 6:00am |

**Subject line examples:**
- "Camino Brief — Week of 24 Mar — Win Rate recovering, Ticket Volume rising"
- "Camino Brief — Week of 31 Mar — All signals stable"
- "Camino Brief — Week of 7 Apr — Alert: Agency Usage crossed threshold"

---

## Generation Pipeline

How the brief goes from data to inbox:

```
Sunday night (data is current)
        ↓
Monday 5:45am — Cron job triggers
        ↓
Step 1: Read latest kpi_snapshots for this customer
        (all active KPIs, current period vs. previous period)
        ↓
Step 2: Calculate delta and status for each KPI
        (using customer_kpi_status thresholds)
        ↓
Step 3: Select focus signal
        (highest urgency, then goal alignment, then delta magnitude)
        ↓
Step 4: AI generates three text blocks:
        - Headline sentence (Section 1)
        - Focus signal paragraph (Section 3)
        - Subject line
        (Single prompt, structured output via Zod schema)
        ↓
Step 5: Assemble brief from template
        (Sections 1-5 populated with calculated values + AI text)
        ↓
Step 6: Store brief in weekly_briefs table
        (for in-app viewing and audit trail)
        ↓
Step 7: Send via Resend
        Monday 6:00am AEST
        ↓
Step 8: Log delivery status
        (delivered / bounced / opened — tracked via Resend webhooks)
```

---

## The AI Prompt (Section 1 + 3 + Subject)

The prompt is called once per brief. It receives the full signal scorecard as structured input and returns three text outputs.

**Input to AI:**
```json
{
  "customer": {
    "name": "Locumate",
    "exec_name": "Surge",
    "business_type": "Healthcare staffing marketplace",
    "stage": "early_revenue",
    "top_priority": "growing_revenue",
    "primary_concern": "agency_usage_rising"
  },
  "signals": [
    {
      "kpi": "win_rate",
      "current_value": "38%",
      "previous_value": "32%",
      "delta": "+6pts",
      "delta_direction": "up",
      "status": "improving",
      "trend_3_periods": [28, 32, 38]
    },
    {
      "kpi": "ticket_volume",
      "current_value": 84,
      "previous_value": 72,
      "delta": "+12",
      "delta_direction": "up",
      "status": "watch",
      "trend_3_periods": [60, 72, 84]
    }
    // ... all active signals
  ],
  "focus_signal": "ticket_volume",
  "open_item": {
    "signal": "agency_usage",
    "flagged_date": "2026-03-17",
    "status": "unresolved"
  }
}
```

**Output from AI (Zod schema):**
```typescript
{
  headline: string,          // max 30 words, one sentence
  focus_paragraph: string,   // max 5 sentences
  subject_line: string       // max 12 words
}
```

**Prompt constraints:**
- Use Surge's name once ("this week" not "Surge, this week")
- Reference at least two real numbers
- Never use: "it's important to note", "significantly", "leveraging", "robust"
- Never use hedging language: "may", "might", "could potentially"
- Tone: direct, confident, like a trusted advisor who has already read the data

---

## Database Schema

```sql
-- Stores each generated brief
weekly_briefs (
  id                uuid primary key,
  customer_id       uuid references customers(id),
  week_start_date   date,                    -- Monday of the brief week
  headline          text,                    -- AI-generated headline
  focus_signal      text,                    -- which KPI was selected as focus
  focus_paragraph   text,                    -- AI-generated focus paragraph
  subject_line      text,                    -- AI-generated email subject
  signal_snapshot   jsonb,                   -- full scorecard at time of generation
  open_item         jsonb,                   -- flagged item if any
  generated_at      timestamptz,
  sent_at           timestamptz,
  delivery_status   text,                    -- 'sent', 'delivered', 'bounced', 'failed'
  opened_at         timestamptz,             -- populated via Resend webhook
  created_at        timestamptz default now()
)
```

---

## What the In-App Version Looks Like

When Surge opens Camino on Monday morning (either via the email link or directly), he sees the brief rendered as the home screen — above the signal feed.

```
┌─────────────────────────────────────────────────────────┐
│  WEEKLY BRIEF  |  24 March 2026              [Archive]  │
│                                                         │
│  "Win rate has recovered to 38% — pipeline is healthy   │
│   but ticket volume has risen for three consecutive     │
│   weeks. This week: watch support."                     │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│  Pipeline Value     $1.24M   → flat      stable         │
│  Win Rate           38%      ↑ +6pts     improving      │
│  Closed Revenue     $142K    ↓ -$18K     watch          │
│  Ticket Volume      84       ↑ +12       watch          │
│  Avg Resolution     6.2 hrs  ↓ -1.1hrs   improving      │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  FOCUS: Ticket Volume                                   │
│  Volume has been rising for three consecutive weeks...  │
│  [Read more]                                            │
│                                                         │
│  OPEN ITEM: Agency Usage (flagged Mar 17)               │
│  No update from Sam yet.  [View signal]                 │
│                                                         │
└─────────────────────────────────────────────────────────┘

[Full signal feed below]
Signal 1: Win Rate
Signal 2: Pipeline Value
...
```

---

## Acceptance Criteria (MSS)

- [ ] Brief generates automatically every Monday at 6:00am AEST via cron job
- [ ] Brief contains all active KPIs for the customer with correct values
- [ ] Delta and status are calculated correctly against previous period
- [ ] Focus signal is selected by urgency (alert → watch → improving)
- [ ] AI generates headline (≤30 words), focus paragraph (≤5 sentences), subject line (≤12 words)
- [ ] AI output references at least two real numbers from the signal data
- [ ] Brief is sent via Resend from "Camino" to exec's registered email
- [ ] Email renders correctly on iPhone 14 Safari (primary mobile target)
- [ ] Email renders correctly on Gmail desktop
- [ ] Brief is stored in `weekly_briefs` table with all fields populated
- [ ] Brief is viewable in-app, pinned above the signal feed on Monday
- [ ] Previous briefs are accessible via "Archive" — last 4 weeks
- [ ] Delivery status is logged (sent / delivered / bounced)
- [ ] If cron job fails silently, an alert is triggered (Sentry or Vercel log alert)
- [ ] Surge opens the brief, reads all sections, says "this is useful"

---

## What This Is NOT

- Not a daily email (weekly only — daily would be noise)
- Not a report with charts (charts live on signal cards, not in the brief)
- Not a link to a dashboard (the brief is self-contained — the exec should not need to click anything to get value)
- Not personalised per signal card (one brief per customer per week — not one per signal)
- Not generated on demand (fixed Monday morning schedule — predictability matters for habit formation)

---

## Post-MSS Additions

| Feature | Phase |
|---|---|
| Sam receives a separate operator brief (signal queue for the week) | MVP — months 3-6 |
| Brief includes open item status auto-populated from signal thread | MVP — months 3-6 |
| Exec can adjust brief send time in settings | MVP |
| Brief can be forwarded to a board or investor with one tap | Growth |
| Multi-language support | Growth |
| Brief benchmark section ("Your win rate vs. industry median") | Month 6+ |
