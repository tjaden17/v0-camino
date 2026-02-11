# Focus Brief - Product Specification
# Date: 11 Feb 2026
# Status: Concept / Design Exploration


## The Insight

When a user searches Google, the system answers their implicit query by ranking
results so the right answer is at the top. The user doesn't have to dig.

Camino can do the same thing. The user's implicit query every time they open the
app is:

> "Based on what's important to me, what should I focus on so I can make fast
> and quality decisions?"

The system already knows everything it needs to answer this:
- **Who you are** -- role, from profile
- **What you care about** -- priorities, signal preferences, from admin/discovery call
- **What's changed** -- signal trends, from data layer
- **What's urgent** -- anomalies, thresholds breached, from calculateSignalStatus()
- **What's connected** -- cross-signal correlations, from signal_relationships table


## The Shift

| Aspect | Signal List (Current) | Focus Brief (Alternative) |
|---|---|---|
| Framing | "Here are your metrics" | "Here's what needs your attention" |
| Sorting | By rank or trend | By decision urgency |
| Quantity | All signals (10+) | Max 5, curated |
| Language | Metric name + value | Decision prompt + context |
| User effort | Browse, filter, decide | Read, act or dismiss |
| Session length | 5-10 minutes | 60 seconds |
| Implicit role | Dashboard (BI Analyst tool) | Chief of Staff briefing |

The signal list is not removed. It becomes the detail layer underneath the brief.


## User Experience


### Screen 1: The Brief (Home)

User opens app. No navigation required. The brief is the first thing they see.

Three sections, in priority order, max 5 items total:


#### Section A: "Needs Your Attention" (max 2 items)

Signals that crossed a threshold, reversed direction, or are anomalous.
Each is framed as a decision prompt, not a metric.

Example item:

```
NEEDS YOUR ATTENTION

Your deal pipeline dropped 34% this week.
3 deals moved to Closed Lost on Monday.

Consider reviewing the pipeline with your
sales lead before end of week.
```

The anatomy of each item:
1. **What changed** -- the signal movement, in plain language (not "Pipeline Value: -34%")
2. **Why it matters** -- additional context from the data (which deals, when)
3. **Suggested next step** -- a decision prompt, not a command

Mapping to existing code:
- Items come from signals where `calculateSignalStatus()` returns `needs_attention`
- "What changed" comes from signal name + absolute_value + trend_value
- "Why it matters" comes from AI interpretation (so_what section)
- "Suggested next step" comes from AI interpretation (opportunities or risks section)


#### Section B: "Tracking Well" (max 2 items)

Signals that are on track relative to the user's stated priorities.
Framed as confirmation, not a metric.

Example item:

```
TRACKING WELL

Ticket resolution time improved to 4.2 hours,
down from 6.1 hours last month.

Your customer retention KPI is trending
in the right direction.
```

Mapping to existing code:
- Items come from signals where `calculateSignalStatus()` returns `improved` or `opportunity`
- Filtered to match user's signal_preferences or upcoming_priorities from profile
- KPI connection comes from AI interpretation (so_what.kpi_impact)


#### Section C: "For Your Awareness" (max 1 item)

Something that isn't urgent but is worth knowing.
Framed as a heads-up.

Example item:

```
FOR YOUR AWARENESS

New lead volume is flat for the third week.
Not alarming yet, but worth watching if
you're planning a Q2 pipeline push.
```

Mapping to existing code:
- Items come from signals where `calculateSignalStatus()` returns `steady`
  but the signal matches the user's priorities
- Or signals that are `new` (first time appearing)
- Contextualised against user's upcoming_priorities


### Screen 2: Signal Detail (Tap to Expand)

When user taps a brief item, they see the full signal detail:
- Signal card (name, value, trend, chart)
- Full 5-section AI interpretation
- Related signals (from signal_relationships)
- Data source info (upload vs API, last updated)

This is essentially the existing signal expanded view, unchanged.


### Screen 3: All Signals (Browse)

Accessible via a "See all signals" link at the bottom of the brief.
This is the existing /signals page, unchanged.
For users who want to browse beyond the curated brief.


## Architecture


### New Service: Brief Generator (lib/brief-generator-service.ts)

This service sits on top of the existing signals and interpretation services.
It does not replace them. It orchestrates them into a curated output.

```
Input:
  - userId (from auth)
  - orgId (from profile)

Steps:
  1. Fetch user profile (role, upcoming_priorities, signal_preferences)
  2. Fetch all active signals for org (via getSignalsWithSavedStatus)
  3. Score each signal on 3 dimensions (see Scoring Model below)
  4. Rank by combined score
  5. Take top 5
  6. Assign to buckets (Attention / Tracking Well / Awareness)
  7. For each, generate a brief sentence using AI (see Brief Prompt below)

Output:
  BriefResponse {
    generated_at: string
    user_id: string
    needs_attention: BriefItem[]    // max 2
    tracking_well: BriefItem[]      // max 2
    for_awareness: BriefItem[]      // max 1
  }

  BriefItem {
    signal_id: string
    signal_name: string
    headline: string               // e.g. "Deal pipeline dropped 34% this week"
    context: string                // e.g. "3 deals moved to Closed Lost on Monday"
    suggestion: string             // e.g. "Review pipeline with sales lead"
    signal_value: string           // e.g. "$127K"
    signal_trend: string           // e.g. "-34%"
    bucket: 'attention' | 'tracking_well' | 'awareness'
    relevance_score: number        // for debugging / admin visibility
  }
```


### Scoring Model

Each signal is scored on 3 dimensions (0-100 each), then combined:

```
Combined Score = (Change * 0.4) + (Relevance * 0.35) + (Urgency * 0.25)
```

#### 1. Change Magnitude (0-100)

How much did this signal move? Bigger moves = higher score.

```
Source: signal.change_percent (from getSignalsWithSavedStatus)

Scoring:
  |change| > 30%  -->  100
  |change| > 20%  -->  80
  |change| > 10%  -->  60
  |change| > 5%   -->  40
  |change| > 0%   -->  20
  no change       -->  0
```

#### 2. User Relevance (0-100)

Does this signal match what the user cares about?

```
Source: user profile fields (role, upcoming_priorities, signal_preferences)

Scoring:
  Signal category matches signal_preferences       --> +40
  Signal name mentioned in upcoming_priorities      --> +30
  Signal category matches role defaults:
    - CEO/exec: revenue, pipeline, customers        --> +20
    - Head of Support: tickets, resolution, CSAT    --> +20
    - Sales Manager: deals, leads, conversion       --> +20
  Signal is saved by this user                      --> +10
  No match                                          --> 0
```

Role defaults are a fallback. If the admin has set signal_preferences during
onboarding, those take priority. Role defaults catch cases where preferences
are sparse.

#### 3. Decision Urgency (0-100)

Does this signal require action, or is it informational?

```
Source: calculateSignalStatus() output + trend duration

Scoring:
  status = needs_attention                          --> 100
  status = needs_attention + trend sustained 3+ wks --> 100 (cap)
  status = opportunity                              --> 70
  status = improved                                 --> 40
  status = new                                      --> 30
  status = steady                                   --> 10
```


### Bucket Assignment

After scoring and ranking the top 5 signals:

```
For each signal in top 5 (in score order):
  if urgency >= 70 AND bucket 'attention' has < 2 items:
    --> assign to 'attention'
  elif change is positive AND bucket 'tracking_well' has < 2 items:
    --> assign to 'tracking_well'
  elif bucket 'awareness' has < 1 item:
    --> assign to 'awareness'
  else:
    --> assign to next available bucket with capacity
```


### Brief Prompt (AI Generation)

For each brief item, we generate a concise, decision-framed summary.
This uses the existing AI interpretation service but with a different prompt.

```
System prompt:

You are a Chief of Staff briefing a busy executive. You have 3 sentences maximum
per signal. Your job is to:
1. State what changed (plain language, no jargon)
2. Explain why it matters to THIS person (given their role and priorities)
3. Suggest what they could do about it (or confirm things are on track)

Be direct. No hedging. No "it's worth noting that..." -- just say it.

User context:
- Role: {user.role}
- Priorities: {user.upcoming_priorities}
- Signal preferences: {user.signal_preferences}
- Industry: {org.industry}
- Company stage: {org.company_stage}

Signal:
- Name: {signal.name}
- Value: {signal.absolute_value}
- Trend: {signal.trend_value} ({signal.trend})
- Category: {signal.category}
- Status: {signal.status}

Output format (JSON):
{
  "headline": "one sentence, what changed",
  "context": "one sentence, why it matters to them",
  "suggestion": "one sentence, what to do or confirmation"
}
```

This is a lightweight AI call (3 sentences, structured output, gpt-4o-mini).
For 5 brief items, that's 5 calls. Can be parallelised. Total cost: ~$0.002.

Alternative: batch all 5 signals into one prompt call for efficiency.


### Caching

The brief should be regenerated when:
- New data is uploaded (signals change)
- A Zoho sync is triggered (signals change)
- User profile is updated (relevance scores change)
- 24 hours have passed (freshness)

Between regenerations, serve the cached brief.

Storage: `focus_briefs` table in Neon:
```sql
CREATE TABLE focus_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  brief_data JSONB NOT NULL,         -- the full BriefResponse
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stale BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_focus_briefs_user ON focus_briefs(user_id, stale, generated_at DESC);
```

Invalidation: when signals are upserted or interpretations regenerated,
mark the brief as stale. Next page load regenerates.


## How This Maps to User Problems

### Problem 1: Too Slow
- Before: user opens a dashboard, scans 10+ metrics, tries to figure out what changed
- With Brief: user opens app, sees "your pipeline dropped 34%" in 2 seconds

### Problem 2: So What?
- Before: user sees a number and a trend arrow, has to interpret it themselves
- With Brief: each item is framed as "here's what changed, here's why it
  matters to YOU, here's what to do"

### Problem 3: Overwhelm
- Before: user sees all signals, all categories, has to filter and prioritise
- With Brief: system already prioritised. Max 5 items. 60-second session.

### Problem 4: Easy Integrations
- No direct impact (this is about data input, not output)
- Indirect benefit: if API auto-refresh is working, the brief updates
  automatically without the user doing anything


## Implementation Phases


### Phase 1: Static Brief (MSS - could ship in Week 2)

Use existing data only. No new AI calls.

- Fetch signals with status via getSignalsWithSavedStatus()
- Apply simple scoring (change magnitude + status only, no relevance yet)
- Group into 3 buckets based on calculateSignalStatus() output
- Display on home page as plain text cards (no AI-generated sentences yet)
- Each card shows: signal name, value, trend, status label
- Tap to go to signal detail

This is a presentation layer change only. No new services, no new tables.
It reframes the existing signal list as a curated brief.

Effort: 1-2 days. Uses existing signals-service.ts and calculateSignalStatus().


### Phase 2: Relevance Scoring (Week 4, aligns with US12)

Add user profile matching to the scoring model.

- Read user profile (role, upcoming_priorities, signal_preferences)
- Score relevance based on profile match
- Combined score = change * 0.4 + relevance * 0.35 + urgency * 0.25
- Brief items are now personalised to the user, not just the org

Effort: 2-3 days. New brief-generator-service.ts with scoring logic.


### Phase 3: AI-Generated Brief Sentences (Week 5, aligns with US15/US16)

Replace static signal names with decision-framed sentences.

- Brief prompt generates headline + context + suggestion per item
- Uses user context from profile for personalisation
- Cached in focus_briefs table
- Brief feels like a Chief of Staff wrote it, not a dashboard

Effort: 2-3 days. New brief prompt, focus_briefs table, caching logic.


### Phase 4: Cross-Signal Brief (Week 5+, aligns with US15)

The brief can reference multiple signals in a single item.

- "Pipeline dropped 34% AND ticket volume spiked 28% -- your team may be
  firefighting instead of closing deals"
- Requires cross-signal analysis from signal_relationships table
- AI prompt includes all org signals, not just the one being briefed

Effort: 1-2 days on top of Phase 3. Prompt enhancement only.


## Relationship to Existing Architecture

```
Existing (unchanged):
  CSV/XLSX Upload --> /api/upload/generate --> signals table (Neon)
  Zoho API        --> /api/upload/generate --> signals table (Neon)
  signals table   --> signals-service.ts   --> /signals page (browse)
  signals table   --> interpretation-service.ts --> AI analysis (5-section)

New (additive):
  signals table   --> brief-generator-service.ts --> Focus Brief (home)
  user profile    --> brief-generator-service.ts --> (relevance scoring)
  interpretations --> brief-generator-service.ts --> (brief sentence source)
```

The brief generator is a read-only consumer of existing data.
It does not modify signals, interpretations, or profiles.
It can be added without changing any existing service.


## Key Design Decisions

1. **Max 5 items, not configurable.** The constraint IS the value. If the user
   wants to see everything, they go to /signals. The brief is opinionated.

2. **Decision-framed, not metric-framed.** "Your pipeline dropped 34%" not
   "Pipeline Value: $127K (-34%)". The language implies action.

3. **Buckets, not a flat list.** "Needs Attention" vs "Tracking Well" vs
   "For Your Awareness" gives the user a framework for processing, not just
   a ranked list.

4. **60-second session target.** If the user needs more than 60 seconds to
   read the brief, there are too many items or they're too long.

5. **The brief is the home page, not a feature.** This isn't a tab or a
   section. It's what you see when you open the app. The signal list is
   demoted to a secondary view.

6. **Regenerate on data change, not on page load.** Generating on every page
   load would be slow and expensive. Generate when data changes, cache, serve.


## Open Questions

- Should the brief be the ONLY home page, or should the signal list remain
  the default with the brief as an optional "summary" at the top?
- Should the user be able to dismiss/snooze a brief item?
- Should the brief include items from saved signals only, or all org signals?
- What happens when there are fewer than 3 signals total? Show a partial brief
  or fall back to the signal list?
- Should there be a brief history? ("Last week's brief said X, this week...")
- How does the brief work for Admin vs Exec? Admin might want to see all orgs.


## Metrics for Success

How we know the brief is working:

1. **Session time drops** -- from 5-10 min to <2 min (user gets what they need faster)
2. **Return rate increases** -- user opens the app more often (daily vs weekly)
3. **Signal detail clicks are targeted** -- user taps 1-2 items, not browsing 10
4. **Customer feedback** -- "I open Camino every morning" vs "I check it when I remember"
