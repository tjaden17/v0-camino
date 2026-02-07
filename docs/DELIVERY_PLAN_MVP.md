# Camino MVP Delivery Plan

**Last Updated:** 7 February 2026
**Sprint Duration:** 1 week
**Builder:** Solo
**North Star:** 1 upload (manager) + 1 view/week (any user)
**Customer Promise:** 4-6 weeks from end of December 2025 (Week 6 = 7 Feb 2026)

---

## User Problems We're Solving

| # | Problem | Desired Outcome |
|---|---------|----------------|
| 1 | **Too slow:** Current company workflow is too slow to surface valuable information required for action | Increased speed to valuable information. Decrease time to produce reports, analyse information, find opps & risks |
| 2 | **So what?** Lacking "so what" from managers who are providing data & reporting | Better business results from actions |
| 3 | **Overwhelm:** Execs find it difficult to use current tools, which are analyst-first | Improved ease/intuitiveness in exploring valuable information |
| 4 | **Easy integrations:** Easy for team members to connect & update data. No IT department required | Decreased time to produce reports |

---

## Tier Structure

**Tier 1: "Start Charging" (Sprints 1-2, weeks of 10 Feb - 23 Feb)**
The minimum pipeline: Manager uploads CSV -> System stages data -> Discovers signals -> Calculates values -> AI generates synthesis -> Exec sees signal cards.

**Tier 2: "Keep Delivering Value" (Sprints 3-6, weeks of 24 Feb - 23 Mar)**
Progressive discovery, cross-correlation, market synthesis, ranking, status tracking, filters. One new capability per week so the customer always sees progress.

---

## Definition of Billable (Tier 1 Exit Criteria)

The customer agrees to pay when all of these are true:

- [ ] Manager can upload a CSV and see it processed within 2 minutes
- [ ] System generates at least 3 signals from the upload
- [ ] Each signal has an AI-generated interpretation with the 5-section analysis
- [ ] Exec can browse signals and read the expanded view
- [ ] Master admin can create users and assign to organisations
- [ ] Analysis is accurate and relevant to the customer's business context
- [ ] App is deployed to production (not localhost)
- [ ] Customer has been demoed and agreed scope is billable

---

## Sprint Plan

### Sprint 1: End-to-End Pipeline
**Dates:** 10 Feb - 16 Feb 2026
**Tier:** 1 (Start Charging)
**Status:** ACTIVE
**Goal:** Full pipeline working: Upload CSV -> Stage -> Discover signals -> Calculate -> AI Synthesis -> Display card. Demo to customer Friday.

**Stories:**

| ID | Story | Persona | Priority | Status |
|----|-------|---------|----------|--------|
| T1-DI-1 | Manager Uploads CSV/XLSX | Manager | Critical | In Progress |
| T1-DI-2 | System Stages Data | System | Critical | In Progress |
| T1-DI-3 | System Discovers Signals from Upload | System | Critical | In Progress |
| T1-SC-1 | Calculate Signal Values | System | Critical | In Progress |
| T1-SC-2 | Detect Trends Over Time | System | High | In Progress |
| T1-SY-1 | AI Generates 5-Section Analysis | System | Critical | In Progress |
| T1-PR-1 | Signal List Display | All Users | Critical | In Progress |
| T1-PR-2 | Expanded Signal Card View | All Users | Critical | In Progress |

---

### Sprint 2: Polish + Admin + Ship
**Dates:** 17 Feb - 23 Feb 2026
**Tier:** 1 (Start Charging)
**Status:** Planning
**Goal:** AI interpretation quality, master admin user management, exec browse experience, deploy to production, start billing.

**Stories:**

| ID | Story | Persona | Priority | Status |
|----|-------|---------|----------|--------|
| T1-SY-2 | Implication on Company KPIs (Section 6) | System | High | Not Started |
| T1-PR-3 | Exec Browse Experience | Executive | High | Not Started |
| T1-PR-4 | Manager Sees Available Signals After Upload | Manager | High | Not Started |
| T1-AD-1 | Create User Profiles & Passwords | Master Admin | High | In Progress |
| T1-AD-2 | See User's Signal View | Master Admin | High | Not Started |
| T1-AD-3 | See User & Org Context | Master Admin | Medium | Not Started |
| T1-UP-1 | User Sign Up & Sign In | All Users | Critical | Done |
| T1-UP-2 | User Context (Lite Discovery) | All Users | High | In Progress |

---

### Sprint 3: Weekly Uploads + Status
**Dates:** 24 Feb - 2 Mar 2026
**Tier:** 2 (Keep Delivering)
**Status:** Planning
**Goal:** Returning upload recognition, upload status tracking, upload history.

**Stories:**

| ID | Story | Persona | Priority | Status |
|----|-------|---------|----------|--------|
| T2-DI-1 | Weekly Returning Upload | Manager | High | Not Started |
| T2-DI-2 | Upload Status Tracking | All Users | Medium | Not Started |
| T2-PR-1 | Upload Status View for All Users | All Users | Medium | Not Started |

---

### Sprint 4: Progressive Discovery + Ranking
**Dates:** 3 Mar - 9 Mar 2026
**Tier:** 2 (Keep Delivering)
**Status:** Planning
**Goal:** Progressive user context, signal ranking by user relevance, category filters.

**Stories:**

| ID | Story | Persona | Priority | Status |
|----|-------|---------|----------|--------|
| T2-UC-1 | Progressive Discovery ("What I'm Wanting") | All Users | Medium | Not Started |
| T2-SC-1 | Rank Signals by User Relevance | System | Medium | Not Started |
| T2-PR-2 | Filter Signals by Category | All Users | Medium | Not Started |
| T2-DI-3 | Partial Signal Identification | System | Medium | Not Started |

---

### Sprint 5: Cross-Correlation + Depth
**Dates:** 10 Mar - 16 Mar 2026
**Tier:** 2 (Keep Delivering)
**Status:** Planning
**Goal:** Cross-signal pattern detection, multi-source signal discovery, signal detail depth.

**Stories:**

| ID | Story | Persona | Priority | Status |
|----|-------|---------|----------|--------|
| T2-SC-2 | Cross-Correlation Pattern Detection | System | Medium | Not Started |
| T2-SC-3 | Multi-Source Signal Discovery | System | Medium | Not Started |
| T2-SY-1 | Signal Detail Depth (Trends + Benchmarks) | System | Medium | Not Started |

---

### Sprint 6: Market Synthesis + Polish
**Dates:** 17 Mar - 23 Mar 2026
**Tier:** 2 (Keep Delivering)
**Status:** Planning
**Goal:** Public network synthesis, leading indicator detection, AI review admin, QA.

**Stories:**

| ID | Story | Persona | Priority | Status |
|----|-------|---------|----------|--------|
| T2-SY-2 | Market Synthesis (Public Networks) | System | Low | Not Started |
| T2-SY-3 | Leading Indicator Detection | System | Low | Not Started |
| T2-AD-1 | AI Review & QA Admin | Master Admin | Medium | Not Started |

---

## Release Plan

### Release 1: Profiles & Organisation
**Target:** 16 Feb 2026 | **Status:** In Progress
**Hypothesis to test:** Knowing (Role, desired KPIs) + (business stage, product stage, target market) is enough to inform AI calls to produce valuable synthesis for each signal.

| ID | Story | Tier | Acceptance Criteria | Status |
|----|-------|------|-------------------|--------|
| T1-UP-1 | User Sign Up & Sign In | 1 | User can sign up with email/password; User can sign in; System connects user to org; System saves name/email | DONE |
| T1-UP-2 | User Context (Lite) | 1 | System saves user role (Exec/Manager); System saves desired KPIs; System saves business/product/market context; Based on context, system suggests relevant signals | IN PROGRESS |

---

### Release 2: Data In
**Target:** 16 Feb 2026 | **Status:** In Progress
**Hypothesis to test:** Manager finds it easy to upload a file. Signals found are accurately based on columns from staging layer. User sees unexpected valuable signals from combining multiple columns/sources.

| ID | Story | Tier | Acceptance Criteria | Status |
|----|-------|------|-------------------|--------|
| T1-DI-1 | Manager Uploads CSV/XLSX | 1 | Drag/drop or browse for file; See upload progress; File parsed, columns extracted; System normalises columns (aliases) | IN PROGRESS |
| T1-DI-2 | System Stages Data | 1 | Saves columns into staging layer; Stores raw data with metadata; Staging layer queryable for discovery | IN PROGRESS |
| T1-DI-3 | System Discovers Signals | 1 | Discovers new signals from columns; Discovers signals from combining columns; Saves new signals; Updates existing signals; Categorises signals; User sees detected signals within 30s | IN PROGRESS |
| T2-DI-1 | Weekly Returning Upload | 2 | Recognizes returning user/format; Shows "Comparing to previous..."; Results grouped by Opps/Risks, Improved, Steady; Upload history | NOT STARTED |
| T2-DI-2 | Upload Status Tracking | 2 | Status of uploaded data (new/updated/completed/partial); Real-time status updates | NOT STARTED |
| T2-DI-3 | Partial Signal ID | 2 | Identifies partial signals; Identifies missing data points; User sees what's missing | NOT STARTED |

---

### Release 3: Signal Core
**Target:** 16 Feb 2026 | **Status:** In Progress
**Hypothesis to test:** Signal value and trends are accurate. Default view shows most relevant signals. Cross-correlation detection is valuable and less costly than AI calls.

| ID | Story | Tier | Acceptance Criteria | Status |
|----|-------|------|-------------------|--------|
| T1-SC-1 | Calculate Signal Values | 1 | Calculates from staging layer (sum, average); Saves to org signal DB; Shows name, value, trend, change % | IN PROGRESS |
| T1-SC-2 | Detect Trends Over Time | 1 | Detects trends over time; Trends from date range in file; Saves trend info | IN PROGRESS |
| T2-SC-1 | Rank Signals by Relevance | 2 | Ranks by relevance to org members; Priority view shows most to least relevant | NOT STARTED |
| T2-SC-2 | Cross-Correlation Detection | 2 | Finds cross-correlation patterns; Saves cross-correlation data; Relationships are valuable | NOT STARTED |
| T2-SC-3 | Multi-Source Discovery | 2 | Discovers signals from multiple sources; New multi-source signals surfaced | NOT STARTED |

---

### Release 4: Signal Synthesis
**Target:** 16 Feb 2026 | **Status:** In Progress
**Hypothesis to test:** The information the AI reads is enough to create accurate synthesis. The 6-section analysis is valuable and relevant. This is the most cost-effective way to create synthesis.

| ID | Story | Tier | Acceptance Criteria | Status |
|----|-------|------|-------------------|--------|
| T1-SY-1 | AI 5-Section Analysis | 1 | 1. Executive summary; 2. What informed it; 3. Benchmark comparison; 4. Why it happened/drivers; 5. Relationships via causal chain; System caches interpretations | IN PROGRESS |
| T1-SY-2 | KPI Implication (Section 6) | 1 | 6. Implication on company KPIs; References upcoming decisions; Auto-chases missing interpretations | NOT STARTED |
| T2-SY-1 | Signal Detail Depth | 2 | Trend visualisation (4+ weeks); Benchmark comparison; Leading indicators | NOT STARTED |
| T2-SY-2 | Market Synthesis (Public) | 2 | Market category cards from AI; General market news/trends; Competitor news | NOT STARTED |
| T2-SY-3 | Leading Indicator Detection | 2 | Detects leading indicators; Surfaced in signal detail | NOT STARTED |

---

### Release 5: Presentation
**Target:** 16 Feb 2026 | **Status:** In Progress
**Hypothesis to test:** Signal card is compelling way for users to browse signals quickly. Expanded view is right way to explore deeper. Filters help explore breadth.

| ID | Story | Tier | Acceptance Criteria | Status |
|----|-------|------|-------------------|--------|
| T1-PR-1 | Signal List Display | 1 | Shows signal list by org; Each shows name, value, trend; Opps/risks highlighted | IN PROGRESS |
| T1-PR-2 | Expanded Signal Card View | 1 | Shows full AI synthesis; "What We Found" breakdown; "What It Means" explanation; Easy navigation back | IN PROGRESS |
| T1-PR-3 | Exec Browse Experience | 1 | Exec can browse signal list; Exec can see expanded view; Feels intuitive | NOT STARTED |
| T1-PR-4 | Manager Post-Upload View | 1 | Manager sees available signals after upload; Can tap to explore; Clear upload-to-signal connection | NOT STARTED |
| T2-PR-1 | Upload Status View | 2 | Status of uploaded data; Browse with status indicators | NOT STARTED |
| T2-PR-2 | Filter by Category | 2 | Filter by category (user/market/business); Filter by function (product/marketing/sales/tech) | NOT STARTED |

---

### Release 6: Master Admin
**Target:** 23 Feb 2026 | **Status:** In Progress
**Hypothesis to test:** Master admin can manage users and see what customers see, enabling effective onboarding and QA without engineering involvement.

| ID | Story | Tier | Acceptance Criteria | Status |
|----|-------|------|-------------------|--------|
| T1-AD-1 | Create User Profiles & Passwords | 1 | Create user with email/name/role/password; Assign to org; Update user context | IN PROGRESS |
| T1-AD-2 | See User's Signal View | 1 | Admin sees user's signal screen; Admin verifies signals display correctly | NOT STARTED |
| T1-AD-3 | See User & Org Context | 1 | Admin sees user/org context; Admin verifies context is correct | NOT STARTED |
| T2-AD-1 | AI Review & QA Admin | 2 | Review AI interpretations; Mark as Approved/Needs Edit/Regenerate; Edit text; Quality metrics | NOT STARTED |

---

### Release 7: Progressive User Context (Tier 2 only)
**Target:** 9 Mar 2026 | **Status:** Not Started
**Hypothesis to test:** Progressive context collection makes signals increasingly relevant over time without overwhelming users upfront.

| ID | Story | Tier | Acceptance Criteria | Status |
|----|-------|------|-------------------|--------|
| T2-UC-1 | Progressive Discovery | 2 | Save business model/stage; Save product stage; Save target market; Save upcoming decisions; System refines suggestions | NOT STARTED |

---

## Critical Path: Tier 1 Pipeline (Upload to Signal Card)

This is the exact data flow that must work end-to-end for Tier 1:

```
STEP 1: Manager uploads CSV
  Page:    /upload (upload-page-client.tsx)
  API:     POST /api/upload/discover
  Service: signal-discovery-service.ts -> discoverSignals()
  Action:  Parse file, detect columns, match against signal library

STEP 2: System stages data
  API:     POST /api/upload/discover (same call)
  Service: csv-parser.ts -> parseCSV() / xlsx via XLSX lib
  DB:      Neon staging tables (upload_history, staged rows)

STEP 3: System discovers signals
  Service: signal-discovery-service.ts -> SIGNAL_DEFINITIONS + FIELD_ALIASES
  Action:  Match columns to signal definitions, categorise as new/updated/partial
  Output:  List of DiscoveredSignal objects shown to user

STEP 4: User selects signals, system calculates
  Page:    /upload (user selects checkboxes)
  API:     POST /api/upload/calculate
  Service: signal-calculation-service.ts -> calculateSignal()
  DB:      INSERT/UPSERT into signals table (Neon)
  Action:  Calculate value, trend, format, save

STEP 5: AI generates 5-section synthesis
  API:     POST /api/signals/[id]/interpretation
  Service: interpretation-service.ts -> generateInterpretation()
  AI:      generateText() with 5-section prompt
  DB:      Save interpretation to Supabase

STEP 6: User views signal list
  Page:    /signals (signals-page-client.tsx)
  Service: signals-service.ts -> getSignals()
  DB:      SELECT from signals (Neon) by organization_id

STEP 7: User expands signal card
  Page:    /signals/[id] (signal-detail-client.tsx)
  Service: Fetches interpretation from Supabase
  Display: 5-section analysis in expandable sections
```

### Key Files in Critical Path

| Step | File | What It Does |
|------|------|-------------|
| 1 | `components/upload-page-client.tsx` | Drag/drop UI, file selection, progress |
| 1 | `app/api/upload/discover/route.ts` | Parse file, run discovery, categorise |
| 1 | `lib/signal-discovery-service.ts` | Signal definitions, field aliases, matching |
| 2 | `lib/csv-parser.ts` | CSV parsing, column detection |
| 3 | `lib/signal-discovery-service.ts` | discoverSignals() function |
| 4 | `app/api/upload/calculate/route.ts` | Calculate + save signals |
| 4 | `lib/signal-calculation-service.ts` | Calculation logic (sum, avg, rate, trend) |
| 5 | `app/api/signals/[id]/interpretation/route.ts` | Trigger AI interpretation |
| 5 | `lib/interpretation-service.ts` | AI prompt, 5-section framework |
| 6 | `app/(protected)/signals/page.tsx` | Server component, fetches signals |
| 6 | `lib/signals-service.ts` | getSignals() query |
| 6 | `components/signals-page-client.tsx` | Signal list UI |
| 7 | `app/(protected)/signals/[id]/page.tsx` | Signal detail server component |
| 7 | `components/signal-detail-client.tsx` | Expanded card with interpretation |

### What's Blocking Tier 1 Completion

| Blocker | Impact | Fix Required |
|---------|--------|-------------|
| Trend detection from date ranges not working | Trends show "stable" for everything | Fix time-series detection in signal-calculation-service.ts |
| Signal discovery doesn't combine columns | Missing cross-column signals | Low priority for Tier 1 - single column signals are enough |
| No auto-interpretation after calculate | User must manually trigger AI | Wire up auto-interpretation call after /api/upload/calculate |
| User context (desired KPIs) not saved in onboarding | AI synthesis can't reference user's KPIs | Add KPI selection step to onboarding flow |
| Admin can't create users with passwords | Can't onboard customer team | Complete user creation in admin panel |
| Admin can't see user's signal view | Can't QA what customer sees | Add "view as user" mode to admin |
| Upload-to-signal connection unclear | Manager doesn't see cause/effect | Add post-upload redirect to signals page with highlight |

---

## Module Status

| Module | Built | Partial | Not Started | Tier 1 Ready? |
|--------|-------|---------|-------------|---------------|
| Profiles & Org | 3 | 2 | 1 | Mostly - needs KPI save |
| Data In | 4 | 0 | 3 | Mostly - core pipeline works |
| Signal Core | 3 | 0 | 2 | Mostly - needs trend fix |
| Synthesis (AI) | 2 | 0 | 3 | Mostly - needs auto-trigger + Section 6 |
| Presentation | 2 | 0 | 3 | Mostly - needs post-upload UX |
| Master Admin | 1 | 1 | 3 | Needs work - user creation + view-as |

---

## Weekly Rhythm

| Day | Activity |
|-----|----------|
| **Monday** | Sprint planning: pick stories, set priorities |
| **Tue-Thu** | Build: focus on critical path blockers first |
| **Friday** | Demo to customer + sprint review |
| **Saturday** | Update delivery plan, prep next sprint |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| AI synthesis quality is poor with limited data | Medium | High | Test with real customer CSV before demo. Tune prompt. |
| Customer expects more than Tier 1 scope | Medium | Medium | Set expectations in Friday demo. Show Tier 2 roadmap. |
| Signal discovery misses signals from customer's data format | High | High | Get sample CSV from customer before Sprint 1 ends. Test discovery. |
| Database schema inconsistencies (Neon + Supabase dual) | Low | Medium | Tier 1 uses Neon for signals, Supabase for auth. Keep separation clean. |
| Solo builder bandwidth - can't finish Sprint 1 in 1 week | Medium | High | Cut T1-SC-2 (trend detection) from Sprint 1 if needed. Ship without trends. |

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 7 Feb 2026 | Split MVP into Tier 1 (billable) and Tier 2 (ongoing value) | Solo builder can't ship everything at once. Need to start charging ASAP. |
| 7 Feb 2026 | Cut market synthesis (public networks) from Tier 1 | Separate data source + AI pipeline. Customer gets more value from their own data analysis. |
| 7 Feb 2026 | Cut cross-correlation from Tier 1 | Impressive but not required for first payment. Single-source signals are valuable enough. |
| 7 Feb 2026 | Cut signal ranking from Tier 1 | Just show all signals sorted by recency. Ranking needs user context that isn't fully built. |
| 7 Feb 2026 | 1-week sprint cycles | Tight feedback loops essential for solo builder. Ship weekly, learn weekly. |
