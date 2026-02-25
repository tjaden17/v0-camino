# Week 3 Sprint Plan
## Feb 23 - Mar 1, 2026
## Theme: Interpretation to Presentation

Source: CAMINO_ROADMAP_FINAL.md — Goal 1, Week 3
Status: Backlog

---

## Stories This Week

| # | Story | Status |
|---|---|---|
| 1 | AI interpretation wired to user context | Backlog |
| 2 | Period-over-period change for all 7 signals | Backlog |
| 3 | Role-based signal screen for 2 users | Backlog |

Build order: Story 2 first (Stories 1 and 3 depend on trend data existing).

---

## Story 1: AI Interpretation Wired to User Context

As a user, I want the AI analysis to reference my actual role, KPIs, and business context — not generic placeholder text.

### Acceptance Criteria

- AI prompt includes: user role, requested KPIs, business context (industry, stage, team size), and upcoming priorities
- 6-section analysis (Executive Summary, Takeaway, Benchmark, Root Cause, Relationships, Implications) references the user's real signal values — no placeholder text
- For requested KPIs, analysis says "Here's what your win rate means for your business"
- For recommended signals, analysis says "We're flagging this because..." with explicit reason
- Interpretation auto-triggers after signal calculation completes — no manual step required
- CEO (Surge) and CS Manager see different interpretations because their KPIs and roles differ

### Definition of Done

- [ ] AI prompt template updated to include user context fields
- [ ] Tested with Surge (CEO) profile — output references his KPIs and role
- [ ] Tested with CS Manager profile — output references their KPIs and role
- [ ] No placeholder text appears in any section of the 6-section analysis
- [ ] Interpretation triggers automatically after signal calc — no manual trigger

---

## Story 2: Period-Over-Period Change for All 7 Signals

As a user, I want to see how each signal has changed vs the prior period so I know if things are improving or declining.

### Acceptance Criteria

- Each of the 7 signals calculates change vs 7, 30 (default), and 90 day prior periods
- Change is stored as: absolute value change, percentage change, and direction (up / down / flat)
- Period selector (7 / 30 / 90 days) visible on signal screen, defaults to 30 days
- Where prior period data does not exist, signal card shows "Insufficient data for X-day comparison" — not an error state, not blank
- Period-over-period values stored in database so they persist between sessions — not recalculated on every load

### Definition of Done

- [ ] All 7 signals return period-over-period values for 7, 30, and 90 day windows
- [ ] Absolute change, percentage change, and direction stored per signal per period
- [ ] Period selector defaults to 30 days and updates all signal cards on change
- [ ] Insufficient data case handled gracefully — message displayed, not an error
- [ ] Values persist in database — verified by refreshing session and confirming values match

---

## Story 3: Role-Based Signal Screen for 2 Users

As Surge (CEO) or the CS Manager, I want to log in and see a signal screen ordered and personalised to my role — not a generic list.

### Acceptance Criteria

- Surge logs in and sees his 3 requested KPIs as the top signals, in order
- CS Manager logs in and sees their KPI signals first
- Signal ordering: Requested KPIs first, then Recommended signals, then Available (collapsed)
- Each signal card shows: label, current value, period-over-period change with directional arrow, and the formula used
- Recommended signals (up to 2) show a visible "Why we're showing this" reason
- Signals requested but not calculable show: "You asked for X. To calculate this we need Y. Upload Z to enable it."

### Definition of Done

- [ ] Surge profile tested — KPI signals appear first, in the order he specified
- [ ] CS Manager profile tested — their KPI signals appear first
- [ ] Signal ordering logic confirmed: Requested > Recommended > Available
- [ ] Each signal card renders: value, trend arrow, percentage change, formula
- [ ] Recommended signals show a reason string — not blank
- [ ] Uncalculable requested signals show the correct message — not an error or blank card

---

## Dependencies

- Story 2 must be complete before Story 3 can be fully tested (trend arrows require period-over-period data)
- Story 1 requires user profile data (role, KPIs, business context) to be populated for both test users before the sprint begins
- Both test users (Surge CEO + CS Manager) must have accounts set up and signal data uploaded before Story 3 testing

## Out of Scope This Week

- Visual trend charts or sparklines (Week 4)
- Per-signal opportunities and risks section (deferred from original Week 3 scope)
- More than 2 test users
