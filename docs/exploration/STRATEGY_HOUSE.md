# Camino — Strategy House

---

## NORTH STAR

**Be the intelligence layer that makes mission-critical decisions faster and better for every executive.**

---

## THE THREE STRATEGIC PILLARS

---

### PILLAR 1: RADICAL TRUST

> "The numbers always match the source. Every signal is verifiable."

Executives live and die by their numbers. The first time a metric in Camino doesn't match what they see in Zoho, the relationship is over. Trust is not a feature — it is the foundation that makes every other layer believable.

**What this means in practice:**
- Every metric traces directly back to a source system the customer controls
- Calculations are deterministic, versioned, and auditable — not AI-estimated
- The customer can always ask "how was this calculated?" and get a precise answer
- CSM-validated schema fingerprints ensure column mappings are human-approved before any KPI is computed
- Raw source data is stored faithfully and never modified — only interpreted

**Defensible?** Yes. Most BI tools compute metrics differently from the source CRM, creating trust gaps. Camino's source-faithful model is architecturally distinct.

**State of competition:** No clear trust leader in the executive intelligence category. Most tools (Tableau, Looker, generic BI) require significant setup and regularly produce numbers executives don't recognise.

**Commercial impact:** Trust = retention. An exec who trusts the numbers reads every brief. An exec who doesn't trust them cancels in week 3.

---

### PILLAR 2: SUPERIOR SYNTHESIS

> "We tell you what your data means, not just what it says. Across every table, every source, every signal."

The metrics Surge cares about are not columns in a database. They are functions of multiple tables, interpreted in the context of his priorities, his market, and what changed this week versus last. No internal tool produces this. Camino does.

**What this means in practice:**
- KPIs are derived calculations across one or more tables — not raw column readouts
- Cross-table insights surface connections invisible to single-source reporting (e.g. pharmacy groups generating platform GMV but with no subscription deal)
- The weekly brief is structured as a decision-relevant memo — what happened, why it matters, what to act on
- Proactive signals are surfaced that the executive did not ask for but should know
- The "so what" and "now what" are always present — not just the number

**The insight Zoho will never show:**
A pharmacy group generating significant shift GMV through the platform but sitting in the CRM pipeline as an open, unconverted deal. That is revenue on the table, visible only by joining operational data with commercial data. Camino surfaces it. Zoho doesn't.

**Defensible?** Yes. The synthesis layer is prompt-engineered around the specific domain (B2B SaaS, healthcare staffing, professional services) and the specific executive's stated priorities. Generic BI tools have no context. Camino builds context over time.

**State of competition:** No clear synthesis leader. Existing tools show dashboards. None write decision-relevant memos calibrated to an individual executive's goals.

**Commercial impact:** Synthesis = willingness to pay. Execs pay for insight they cannot produce themselves. The brief is the product.

---

### PILLAR 3: AGENTIC INTELLIGENCE

> "The system learns your business. It gets smarter every week. It updates itself."

The first version of Camino requires a CSV upload and a one-time CSM validation session. The end state is a system that connects directly to every data source, updates in real time, learns what the executive cares about through interaction, and surfaces emerging signals before they become problems.

**What this means in practice:**
- Native one-time integrations to Zoho CRM, HubSpot, Salesforce, Xero — no recurring manual exports
- Persistent goal context: the system remembers what the executive said matters and filters signals accordingly
- Proactive discovery: signals the executive did not know to ask for, surfaced because the data suggests they should care
- Feedback loop: when an exec taps a signal or dismisses it, the system learns what to weight more and less
- The system becomes harder to leave the longer it runs — historical context, approved formulas, and learned preferences compound

**Defensible?** Yes. The compounding nature of the context model creates a switching cost that grows with tenure. Rebuilding six months of validated KPI formulas, historical snapshots, and learned executive preferences at a competitor is a real barrier.

**State of competition:** No clear agentic intelligence leader for executives specifically. AI agents exist in the developer and analyst space (Cursor, Julius). The executive layer is wide open.

**Commercial impact:** Intelligence = margin and moat. A self-updating, self-improving system commands premium pricing and retains customers at a fundamentally different rate than a manual dashboard tool.

---

## THE CAPABILITIES (How We Deliver Each Pillar)

### Radical Trust Capabilities
- **Source-faithful ingestion** — raw data stored as-is, never modified
- **AI-assisted schema mapping** — column names translated to semantic schema with human validation
- **Deterministic SQL computation** — all KPI calculations are versioned SQL views, not AI estimates
- **Audit trail** — every number traces to a source row, an upload event, and a validation record

### Superior Synthesis Capabilities
- **Multi-table KPI derivation** — metrics computed across joined tables (deals + shifts, pipeline + targets)
- **Goal-aware signal ranking** — signals ranked by relevance to the executive's stated priorities, not generic importance
- **Weekly intelligence brief** — decision-mapped memo in McKinsey format: what, so what, now what
- **Proactive discovery** — insights the exec didn't ask for, surfaced from cross-table patterns

### Agentic Intelligence Capabilities
- **Native data source integrations** — Zoho CRM, HubSpot, Zoho Desk, Xero (phased)
- **Persistent executive context** — goals, concerns, priorities stored and used to personalise every signal
- **Automated brief delivery** — weekly brief to inbox, triggered by new data, no manual action required
- **Interaction-based learning** — engagement signals (opens, taps, dismissals) feed back into signal weighting

---

## FOUNDATION

**Mobile-first. Exec-grade. Delivered before Monday morning.**

Every design, every interaction, every brief is built for an executive reading on their phone at 7am before their week begins. Speed of consumption is not a nice-to-have — it is a core product constraint. If it takes more than 90 seconds to extract the decision-relevant insight, the product has failed.

---

## NORTH STAR METRICS (How We Know It's Working)

| Pillar | Metric | Why |
|---|---|---|
| Radical Trust | % of signal values verified by customer against source | Trust is measurable — if customers check and it matches, trust is building |
| Superior Synthesis | Brief open rate + forward rate | An exec who forwards the brief to their board has found it genuinely useful |
| Agentic Intelligence | % of customers on native integration (vs. CSV) | Integration adoption is the proxy for platform stickiness and retention |
| Overall | Revenue retained past 90 days | The business metric that validates the entire strategy |

---

## COMPETITIVE POSITIONING

| | Camino | Generic BI (Tableau, Looker) | CRM Reporting (Zoho, HubSpot) | GPT/Claude direct |
|---|---|---|---|---|
| Source-faithful numbers | Yes | Partial | Yes | No |
| Cross-table synthesis | Yes | Requires analyst | No | Ad hoc |
| Executive-grade UX | Yes | No | No | No |
| Goal-aware personalisation | Yes | No | No | No |
| Weekly automated brief | Yes | No | No | No |
| Native integrations | Roadmap | Yes | Native only | No |
| Proactive signal discovery | Yes | No | No | Partial |

---

## THE 8-WEEK MILESTONES

**Week 1-2: Trust foundation**
Surge sees numbers in Camino that exactly match his Zoho. CSM validates schema. First KPIs computed from real data.

**Week 3: The insight moment**
First cross-table insight delivered. Surge sees pharmacy groups generating GMV with no subscription deal. This is the "lean forward" moment.

**Week 4: First brief**
Weekly intelligence brief generated and delivered. Surge reads it in under 2 minutes. It connects to at least one decision he is actively facing.

**Week 5-6: Self-service**
Automated delivery live. Surge receives two consecutive briefs without any manual action from the founder. Second and third customers onboarded without writing new code.

**Week 7-8: Retention signal**
Three consecutive weeks of brief opens. At least one customer forwards a brief externally. Feedback loop collecting signal preference data.

---

## STRATEGIC RISKS AND MITIGATIONS

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI produces a wrong number, exec loses trust | Medium | Critical | AI never computes metrics — only SQL views do. AI only interprets. |
| Schema mapping fails for a new customer | High (early) | High | CSM validation step is mandatory before any KPI is surfaced |
| Brief quality is too generic | Medium | High | Goal context injected into every prompt. Brief is always decision-mapped. |
| Zoho API integration is harder than expected | High | Medium | Scheduled CSV export as bridge. API is Phase 3, not Phase 1. |
| Solo founder bandwidth | High | High | Architecture is designed so new customers require no new code, only a new schema fingerprint |

---

## DOCUMENT METADATA

- Status: Working draft
- Version: 1.0
- Created: March 2026
- Context: Derived from Surge (Locumate) discovery sessions, onboarding notes, KPI tree hypothesis, and CTO/CPO strategic review session
- Next review: After Week 4 milestones

---
