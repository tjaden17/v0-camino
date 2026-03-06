# AI-Driven Signal Extraction: Delivery Plan

**Timeline:** Milestone 1 (4 weeks) + Milestone 2 (8 weeks)
**Owner:** Head of Engineering + Head of Delivery
**Status:** READY FOR EXECUTION

---

## Executive Summary

This plan maps the 7-phase AI extraction architecture to two critical milestones:

1. **Milestone 1: START CHARGING** (Week 1-4) — Surge pays by Mar 14
   - Scope: Extract + interpret 7 core signals (Win Rate, Pipeline Value, Revenue, etc.)
   - Constraint: Must validate signals against Surge's manual records (trust checkpoint)
   - Delivery: Demo-ready, mobile-responsive, 2 users (CEO + CS Manager) can log in

2. **Milestone 2: RETAIN 3 MONTHS** (Week 5-12) — Surge stays subscribed
   - Scope: Expand to 15-20 signals + signal filtering + OAuth for Zoho/Desk
   - Constraint: Product becomes part of their weekly routine
   - Delivery: Zoho CRM + Desk sync working, weekly brief generated

---

## Milestone 1: START CHARGING (4 Weeks)

### Critical Path: Must deliver in order
1. ✅ **Column inference working** (users can upload without 3-question survey)
2. ✅ **7 core signals calculated** (Win Rate, Pipeline Value, Revenue, etc.)
3. ✅ **Numbers match Surge's records** (trust checkpoint)
4. ✅ **Personalized interpretation** (CEO sees different text than CS Manager)
5. ✅ **Period-over-period trends** (7/30-day changes visible)
6. ✅ **2 users can log in** (different views per role)
7. ✅ **Mobile responsive** (Surge uses phones)

### Scoping Decision for M1

**Original Plan:** Extract 15-20 signals, use Phase 6 (signal filtering) to show only 5
**M1 Scoping:** Extract exactly 7 signals (no filtering needed), defer Phase 6 to M2

**Why:** Simpler validation + faster time-to-trust. Focus on correctness of 7 core signals, not managing overflow of 20 signals.

---

## Week-by-Week Breakdown

### Week 1: Foundation & Phase 1-2

**Goal:** Column inference + signal extraction working on Surge's CRM data

| Phase | Task | Owner | Status | Risk |
|-------|------|-------|--------|------|
| **Phase 1** | `column-inference-service.ts`: AI infers columns from CSV headers + confidence scoring | Backend | 🟡 4d | Fallback UI for <80% confidence |
| **Phase 1** | Integrate into `/app/api/upload/route.ts` | Backend | 🟡 2d | Must NOT break existing 3-q survey (yet) |
| **Phase 2** | `data-mode-detector-service.ts`: Detect snapshot vs time-series | Backend | 🟡 3d | User confirmation flow if <80% |
| **Phase 2** | `signal-extraction-service.ts`: AI extracts 7 core signals from raw data | Backend | 🔴 5d | **CRITICAL**: Prompt engineering, handling edge cases |
| **DB** | Run migrations 1-2 (column_inferences, signals table, signal_extractions) | Backend | 🟡 1d | Test in dev/staging first |

**Deliverable:** Upload CSV → AI infers columns + detects mode + extracts 7 signals. Numbers returned (not yet stored).

**Validation:** Test on Surge's real Feb CRM export. Verify signals match manual expectations.

---

### Week 2: Phase 3-4 & Validation

**Goal:** Trends calculated, interpretations generated, numbers match Surge's records

| Phase | Task | Owner | Status | Risk |
|-------|------|-------|--------|------|
| **Phase 3** | `ai-trend-service.ts`: Calculate 7/30/90-day changes for each signal | Backend | 🟡 3d | Handle insufficient data (mark as "N/A") |
| **Phase 3** | Store trends in `signal_period_metrics` | Backend | 🟡 2d | Design lookback window correctly |
| **Phase 4** | Calculate Pearson correlations between 7 signals | Backend | 🟡 2d | Deferred if time-constrained; can add post-M1 |
| **Phase 5** | `ai-interpretation-enhanced-service.ts`: 6-section interpretation | Backend | 🔴 5d | **CRITICAL**: Prompt testing, QA opportunities section |
| **Phase 5** | Caching logic (input_data_hash) | Backend | 🟡 2d | Test cache invalidation |
| **DB** | Migrations 3-6 (signal_extractions, signal_correlations, signal_interpretation_cache, signal_period_metrics) | Backend | 🟡 1d | Coordinate with Phase 5 |
| **QA** | Manual validation: Upload Feb data → check all 7 signals against Surge's records | QA/CTO | 🔴 3d | **CRITICAL**: Trust checkpoint. Fix any calculation bugs now. |
| **QA** | Validate interpretation text: Does it make sense for CEO? For CS Manager? | QA/Product | 🟡 2d | Opportunities section realistic? |

**Deliverable:** Signals + trends + interpretations stored in DB. All 7 signals validated against Surge's manual records.

**Blockers:** If signal calculations don't match Surge's numbers, loop back to Phase 2 AI prompt.

---

### Week 3: Presentation & Integration

**Goal:** UI rendering, user login, personalization working. Surge CEO sees their data.

| Phase | Task | Owner | Status | Risk |
|-------|------|-------|--------|------|
| **Phase 7** | Update `/app/api/upload/route.ts`: Integrate Phases 1-5 in sequence | Backend | 🟡 3d | Test end-to-end flow once |
| **Phase 7** | Update `/app/api/upload/calculate/route.ts`: Queue interpretation async | Backend | 🟡 2d | Ensure interpretation doesn't block upload response |
| **UI** | Create test accounts: Surge CEO (kpi_1=Revenue) + CS Manager (kpi_1=NPS) | Admin | 🟡 1d | Use existing admin panel |
| **UI** | `components/signal-list.tsx`: Render 7 signals + period selector (7/30/90) | Frontend | 🟡 3d | Show confidence badges (green/yellow) |
| **UI** | Signal card details: Show formula + interpretation (all 6 sections) + trends | Frontend | 🟡 3d | Mobile responsive (critical for Surge) |
| **UI** | Interpretation caching + invalidation on user context change | Frontend | 🟡 2d | Test cache hit/miss |
| **Testing** | Admin uploads Surge's data → CEO logs in → verifies 7 signals + interpretation | QA/Product | 🟡 2d | Manual regression test |
| **Testing** | Same data → CS Manager logs in → verifies different interpretation | QA/Product | 🟡 1d | Personalization validation |

**Deliverable:** Surge CEO + CS Manager can log in, see personalized signal list + interpretations. Mobile responsive.

**Blockers:** UI styling issues → defer to Week 4 polish.

---

### Week 4: Polish & Demo Prep

**Goal:** Bug fixes, mobile responsiveness, demo-ready walkthrough.

| Task | Owner | Status | Risk |
|------|-------|--------|------|
| Bug fixes from Week 3 testing | Backend/Frontend | 🟡 2d | Track in GitHub issues |
| Mobile responsiveness: Test on iPhone/iPad | Frontend | 🟡 1d | Surge execs use phones |
| Performance tuning: Interpretation generation latency | Backend | 🟡 1d | Async is OK, but show loading state |
| Admin walkthrough documentation | Product/CTO | 🟡 1d | How to upload, verify numbers, show to Surge |
| Final QA: Fresh eyes review | QA Lead | 🟡 1d | Catch any last-minute bugs |
| Demo dry-run: Show Surge CEO the product | Product/CTO | 🟡 1d | Get feedback, iterate if needed |

**Deliverable:** Demo-ready product. Surge CEO sees signals matching their records. Ready for Friday demo.

---

## Milestone 1: Critical Path Dependencies

```
Week 1: Phase 1-2 (column inference + signal extraction)
  ↓ (blocks)
Week 2: Phase 3-5 (trends + interpretation) + QA validation
  ↓ (blocks)
Week 3: Phase 7 (integration) + UI rendering
  ↓ (blocks)
Week 4: Polish + demo
```

**Go/No-Go Checkpoints:**
- **EOW1:** Column inference + signal extraction working on Surge data
- **EOW2:** All 7 signals validated against Surge's manual records (TRUST CHECKPOINT)
- **EOW3:** 2 users can log in, see personalized interpretations
- **EOW4:** Demo ready, no critical bugs

---

## Milestone 1: Resource Allocation

| Role | Count | Tasks |
|------|-------|-------|
| **Backend Engineers** | 2-3 | Phases 1-5, DB migrations, API endpoints |
| **Frontend Engineers** | 1-2 | UI rendering, signal cards, personalization, mobile responsive |
| **QA / Test Engineer** | 1 | Signal validation, interpretation review, regression testing |
| **Product/CTO** | 0.5 | Requirements clarity, decisions, demo walkthrough |

**Total Effort:** ~22 person-days across 4 weeks (feasible with 2-3 backend + 1-2 frontend)

---

---

## Milestone 2: RETAIN FOR 3 MONTHS (Weeks 5-12)

### Objectives

1. **Expand signal extraction:** 7 → 15-20 signals with signal filtering (Phase 6)
2. **OAuth integrations:** Zoho CRM + Zoho Desk auto-sync
3. **Weekly brief:** Synthesize signals into actionable brief for CEO
4. **Product becomes part of routine:** Surge checks it weekly

### Scoping: Phases Deferred from M1

- **Phase 6: Signal Filtering** — NOW CRITICAL (solves Overwhelm)
- **Phase 4: Correlations** — Expand if time (was deferred from M1)

---

## Week 5-6: Phase 6 & Expand to 15-20 Signals

**Goal:** Signal filtering working. Surge CEO sees 5 signals by default, can expand to all 15-20.

| Phase | Task | Owner | Timeline |
|-------|------|-------|----------|
| **Phase 6** | `signal-recommendation-service.ts`: Rank signals by tier (Requested → Recommended → Available) | Backend | 3d |
| **Phase 6** | UI: Show 5 signals by default (3 KPIs + 2 recommended), "See All" expands to 15-20 | Frontend | 2d |
| **Phase 6** | Confidence badges: Green (>85%), Yellow (70-85%), Red (<70% hidden) | Frontend | 1d |
| **Signal Extraction** | Expand AI prompt to extract 15-20 signals (not just 7) | Backend | 2d |
| **QA** | Manual QA: 10+ opportunities reviewed for quality | QA/Product | 3d |
| **Testing** | Upload Surge's data → verify 15-20 signals extracted + filtering works | QA | 2d |

**Deliverable:** Surge CEO sees 5-signal curated view. Can explore 15-20 signals if interested. No overwhelm.

---

## Week 7-8: Zoho OAuth Integration

**Goal:** Zoho CRM + Desk sync working. Auto-pull data, parse, map to universal schema.

| Task | Owner | Timeline |
|------|-------|----------|
| OAuth setup: Zoho app registration + scopes | Backend | 2d |
| `/api/integrations/zoho/connect`: OAuth flow | Backend | 2d |
| Zoho CRM API: Fetch deals, map to `deal_value`, `stage`, `close_date` | Backend | 3d |
| Zoho Desk API: Fetch tickets, map to `ticket_status`, `resolution_time` | Backend | 3d |
| Parse response → normalize to universal schema | Backend | 2d |
| Manual trigger: Admin clicks "Sync now" in admin panel | Backend | 1d |
| Error handling: Show "Sync failed, try again" | Backend | 1d |
| Testing: Full Zoho sync → signals auto-extract | QA | 2d |

**Deliverable:** Surge can connect Zoho CRM/Desk via OAuth. One-time manual sync working.

---

## Week 9-10: Weekly Brief Feature

**Goal:** Surge CEO sees curated "Weekly Brief" with 5 key items.

| Task | Owner | Timeline |
|------|-------|----------|
| Design weekly brief structure: 3 buckets (Needs Attention, Tracking Well, For Your Awareness) | Product/CTO | 2d |
| Build brief generation: Select top signals, frame as decision prompts | Backend | 3d |
| Email delivery: Send brief every Monday AM | Backend | 2d |
| UI: Weekly brief screen (read-only, no drill-down for M2) | Frontend | 2d |
| Testing: Generate brief for Surge data, verify relevance | QA/Product | 2d |

**Deliverable:** Surge CEO receives weekly brief in email + can view in app.

---

## Week 11-12: Optimization & Retention Focus

**Goal:** Product feels natural, no friction. Surge uses it weekly.

| Task | Owner | Timeline |
|------|-------|----------|
| Performance: Interpretation generation < 2s latency | Backend | 2d |
| UI polish: Loading states, error messages, empty states | Frontend | 1d |
| Mobile: Test all features on Surge's actual devices | QA | 1d |
| Documentation: In-app help, tooltip, admin guide | Product | 1d |
| Feedback loop: Monthly check-in with Surge on what's working | Product | 1d |
| Iterate: Address feedback from Surge (quick fixes) | Eng | 2-3d (buffer) |

**Deliverable:** Smooth user experience. Surge reports "using it weekly."

---

## Milestone 2: Go/No-Go Checkpoints

- **EOW6:** Signal filtering working, 15-20 signals extracted safely
- **EOW8:** Zoho OAuth + auto-sync fully working
- **EOW10:** Weekly brief sent, Surge CEO finding value
- **EOW12:** Surge commits to 3-month subscription (retention metric)

---

---

## Risk Register & Mitigation

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|-----------|-------|
| **Signal calculations don't match Surge's records** | M1 blocked | High | QA validation in Week 2. Loop with CTO to fix AI prompt if needed. | CTO |
| **Interpretation quality poor** | Trust broken | High | Manual QA of 10+ opportunities. Refine prompt iteratively. | Product |
| **Overwhelm problem not solved** | User doesn't adopt | Medium | Phase 6 signal filtering. Test with CEO before launch. | Frontend |
| **OAuth integration scope creep** | M2 delayed | Medium | Scope to manual sync only for M2. OAuth is "nice to have." | Backend Lead |
| **Performance: interpretation too slow** | Frustration | Medium | Async generation + loading state. Cache heavily. | Backend |
| **Mobile responsiveness issues** | Demo fails with Surge | Medium | Test on real devices in Week 3. | Frontend |
| **AI extraction hallucination** | Wrong signals shown | Medium | Confidence thresholds (<70% hidden). User can hide bad signals. | Backend |

---

## Success Criteria

### Milestone 1: START CHARGING
- ✅ Surge CEO + CS Manager log in
- ✅ All 7 core signals match Surge's manual records (±1%)
- ✅ Personalized interpretation visible (different for each user)
- ✅ Period-over-period trends shown (7/30-day)
- ✅ Mobile responsive on iPhone/iPad
- ✅ Demo walkthrough runs smoothly
- ✅ **Surge signs contract** by Mar 14

### Milestone 2: RETAIN 3 MONTHS
- ✅ 15-20 signals extracted, no overwhelm reported
- ✅ Zoho CRM/Desk sync working
- ✅ Weekly brief sent, CEO opens it
- ✅ CEO reports "using it in our weekly team meeting"
- ✅ No critical bugs, <1% support tickets
- ✅ **Surge commits to 3-month renewal** by mid-April

---

## Open Decisions for Leadership

1. **Signal extraction scope for M1:** Extract all 7 signals, or prioritize Win Rate first? (Recommend: all 7 to show full value)
2. **Zoho sync frequency:** Daily, weekly, or manual-only for M2? (Recommend: manual for M2, daily for M3)
3. **Opportunities QA:** Who reviews + approves opportunities before showing to Surge? (Recommend: CTO + Product)
4. **Mobile-first constraint:** Can Surge demo work on desktop-only for now? (Recommend: mobile-responsive required, but desktop is "first class")

---

## Next Steps

1. **Approve plan** — Head of Engineering + Head of Delivery sign off
2. **Create GitHub Epic** — Link all issues to Milestone 1 + Milestone 2 epics
3. **Kick off engineering** — Week 1 starts immediately (Phase 1-2)
4. **Weekly sync** — Every Friday EOD status update + blockers
5. **Pre-demo checklist** — Review in Week 3 before Surge walkthrough

---

**Prepared by:** CTO + Head of Delivery
**Approved by:** [CEO signature]
**Status:** READY FOR EXECUTION
**Date:** March 6, 2026
