# Camino — Strategy House
> Status: Approved draft — post sign-off session
> Version: 2.0
> Last updated: March 2026
> Context: Derived from Surge (Locumate) discovery sessions, onboarding notes, KPI tree, CTO/CPO strategic review, and formal sign-off on 22 architectural and product decisions.

---

## NORTH STAR

**Give executives and their teams faster, better decisions that unlock revenue and business value.**

Not "show them metrics." Not "build dashboards." Give them the clarity to act with confidence, earlier than they otherwise would have.

---

## THE THREE STRATEGIC PILLARS

---

### PILLAR 1: VERIFIED INTELLIGENCE
> "The numbers are right. Every signal traces back to the source."

An executive cannot act on a number they don't trust. The first time a metric in Camino doesn't match what they see in their CRM, the product is dead. Verification is not a feature — it is the permission structure for everything else Camino does.

**What this means in practice:**
- Every metric traces directly to a source system the customer controls
- KPI calculations are deterministic SQL — not AI estimates, not approximations
- The operator (CSM/manager) validates the schema once — column mappings, stage translations, join keys — before any signal reaches the exec
- Raw source data is stored faithfully and never modified — only interpreted
- The exec can always ask "how was this calculated?" and the answer exists in the system

**Who owns this:** The operator (CSM/manager) does the heavy lifting — validating data, confirming formulas, flagging anomalies. The exec never sees the plumbing. They see the verified output.

**Defensible?** Yes. Most BI tools produce numbers that diverge from the source CRM, creating trust gaps. Camino's operator-validated, SQL-deterministic model is architecturally distinct.

**State of competition:** No clear trust leader in the executive intelligence category. Most tools require significant setup and regularly produce numbers executives don't recognise.

**Commercial impact:** Verified numbers = retained customers. An exec who trusts the signal reads every brief. An exec who doesn't trust it cancels in week 3.

---

### PILLAR 2: DECISION INTELLIGENCE
> "We connect your signals to your decisions. Not just what changed — what it means and what to do."

The metrics an executive cares about are not columns in a database. They are functions of multiple tables, interpreted in the context of their priorities, their market, and what changed this week versus last. No internal tool produces this. Camino does.

**What this means in practice:**
- KPIs are derived calculations — not raw column readouts — spanning multiple data sources
- Every signal is mapped to a decision the exec is actively facing, not a generic insight
- The weekly brief answers three questions for every signal: what happened, why it matters, what to do about it
- Cross-table insights surface connections that are invisible to single-source reporting
- Proactive signals are surfaced that the exec did not ask for but should know — because the data says so

**The insight no single tool will ever show:**
A pharmacy group generating significant operational GMV through the platform, sitting in the CRM pipeline as an open, unconverted deal. Revenue on the table. Visible only by joining operational data with commercial data. Camino surfaces it. Zoho, HubSpot, Salesforce — none of them do.

**Defensible?** Yes. The synthesis layer is calibrated to the specific executive's stated priorities and the decisions they are actively navigating. Generic BI tools have no context. Camino builds context over time and it compounds.

**State of competition:** No clear decision intelligence leader. Existing tools show dashboards. None write decision-relevant briefs calibrated to an individual executive's live priorities.

**Commercial impact:** Decision intelligence = willingness to pay. Executives pay for clarity they cannot produce themselves. The brief is the product. The decision it enables is the value.

---

### PILLAR 3: COMPOUNDING INTELLIGENCE
> "The system learns your business. Every week it knows more. The longer you use it, the harder it is to leave."

The first version requires a CSV upload and a one-time operator validation session. The end state is a system that connects directly to every data source, remembers every decision made, tracks whether actions moved the right metrics, and gets smarter every week through interaction.

**What this means in practice:**
- Native one-time integrations to data sources — Zoho CRM, HubSpot, Zoho Desk, Xero — no recurring manual exports
- Persistent goal context: the system remembers what the executive said matters and filters every signal accordingly
- KPI trend memory: did Camino's signals and recommendations help move the right metrics in the right direction? That question is answered weekly.
- Benchmark intelligence: as the customer base grows, anonymised cross-org signal data (sourced from public databases and LLM research) provides market context — "your win rate of 34% is below the median for B2B SaaS at your deal size"
- Network effects: shared signal language between exec and operator, between portfolio companies, between advisors and founders — value grows as the network grows
- The longer a customer uses Camino, the more context it holds — goals set, decisions logged, anomalies annotated, patterns learned. That context cannot be transferred to a competitor. It is the moat.

**Defensible?** Yes. The combination of compounding context, integrated data sources, and cross-org benchmarks creates a switching cost that grows with tenure.

**State of competition:** No clear compounding intelligence leader for the executive layer. The space is wide open.

**Commercial impact:** Compounding intelligence = long-term retention and margin. A system that gets meaningfully smarter every week commands premium pricing and retains customers at a fundamentally different rate than a static dashboard.

---

## THE CAPABILITIES (How We Deliver Each Pillar)

### Verified Intelligence Capabilities
- Source-faithful ingestion — raw data stored as-is, never modified
- AI-assisted schema mapping — column names translated to semantic schema, operator-confirmed once
- Deterministic SQL computation — all KPI calculations are versioned SQL views
- Operator validation layer — CSM/manager confirms formulas before any signal reaches the exec
- Full audit trail — every number traces to a source row, an upload event, and a validation record

### Decision Intelligence Capabilities
- Multi-table KPI derivation — metrics computed across joined data sources
- Goal-aware signal ranking — signals ranked by relevance to exec's stated decisions, not generic importance
- Weekly intelligence brief — decision-mapped memo: what, so what, now what
- Proactive cross-table discovery — insights the exec didn't ask for, surfaced from pattern detection
- Benchmark context — "how does this compare to market" via LLM-researched public data

### Compounding Intelligence Capabilities
- Native data source integrations — Zoho CRM, HubSpot, Zoho Desk, Xero (phased roadmap)
- Persistent executive context — goals, priorities, and concerns stored and personalise every signal
- KPI trend tracking — did the signals and actions move the metrics that matter?
- Automated brief delivery — weekly brief to inbox, triggered by new data, zero manual action
- Network formation — shared signal language between exec and operator; group and portfolio views (roadmap)
- Interaction-based refinement — signal engagement feeds back into ranking weights over time

---

## THE OPERATOR LAYER (Layer 2 of the Customer Journey)

The exec is the primary user. The operator (CSM, Chief of Staff, Operations Manager) is the power user.

**The workflow:**
1. Exec receives push notification or opens app — scans signal cards in under 90 seconds
2. Exec flags a signal: "Sam, look at this"
3. Operator receives the flagged signal with full context pre-loaded — no briefing meeting needed
4. Operator investigates: root cause, downstream impact, possible actions
5. Operator logs decision/action notes and closes the loop
6. Exec sees resolution surfaced in their view

**The operator surface is not in the Minimum Sellable Service.** It is the next layer — the feature that transforms Camino from an executive notification app into a full decision intelligence system. The operator surface is designed from day one so that the data model, the signal share primitive, and the action log schema are present even before the operator UI exists.

**The long-term vision:** As the system matures and trust is established, more of the operator's investigation work is automated by Camino — root cause surfaced automatically, impact modelled, actions suggested. The operator's role shifts from investigator to decision-maker.

---

## FOUNDATION

**Mobile-first. Exec-grade. Delivered before Monday morning.**

Every design decision, every interaction, every brief is built for an executive reading on their phone at 7am before their week begins. If it takes more than 90 seconds to extract the decision-relevant signal, the product has failed. The operator's investigation layer runs deeper but always begins from the same mobile-first signal card.

---

## NORTH STAR METRICS

The metrics that tell us Camino is working are not vanity metrics. They are evidence that executives and their teams are making faster, better decisions.

| What we're measuring | Metric | Why it matters |
|---|---|---|
| Decisions enabled | Number of signals acted on per customer per month | A signal that changes a behaviour is worth paying for |
| Decision quality | % of actioned signals where the targeted KPI moved in the right direction within 30 days | Did Camino's synthesis lead to the right action? |
| Time to insight | Minutes from data upload to exec reading first signal | Speed is a core product promise |
| Trust | % of signal values the operator has validated in the system | Unvalidated signals are noise; validated signals are product |
| Retention | Revenue retained and expanded past 90 days | The commercial proof that decisions are improving |

---

## ROADMAP HORIZONS

### Minimum Sellable Service (Weeks 1-8)
The exec-only product. Single user. Signal cards. Weekly brief. Mobile-first. Verified numbers. Decision-mapped synthesis.

**Target outcome:** Surge is paying. He opens the brief every week. He has made at least one business decision informed by a Camino signal.

### MVP (Months 3-6)
Two-sided product. Operator surface added. Signal share primitive. Action log. Native Zoho integration. First 3-5 paying customers beyond Surge.

**Target outcome:** The Surge/Sam workflow is live and replacing their existing reporting process. At least one customer has connected a native integration rather than uploading CSVs.

### Growth Product (Months 7-18)
Network effects activated. Group formation. Benchmark data layer. Virality features (shared signal view, inter-org signal handshake). Organisation memory (decision log, goal evolution tracking).

**Target outcome:** K-factor measurably above 0. Customers joining via referral from an existing customer's shared signal.

---

## COMPETITIVE POSITIONING

| | Camino | Generic BI | CRM Reporting | GPT/Claude direct |
|---|---|---|---|---|
| Source-verified numbers | Yes | Partial | Yes | No |
| Decision-mapped synthesis | Yes | No | No | Ad hoc |
| Exec-grade mobile UX | Yes | No | No | No |
| Goal-aware personalisation | Yes | No | No | No |
| Operator investigation layer | Roadmap | No | No | No |
| Weekly automated brief | Yes | No | No | No |
| Cross-table insights | Yes | Requires analyst | No | Partial |
| Benchmark context | Roadmap | No | No | No |
| Network / group effects | Roadmap | No | No | No |

---

## STRATEGIC RISKS AND MITIGATIONS

| Risk | Mitigation |
|---|---|
| AI produces wrong interpretation, exec loses trust | AI never computes metrics. Only SQL views do. AI only interprets pre-verified numbers. |
| Schema mapping fails for a new customer | Operator validation step is mandatory before any signal reaches the exec. |
| Brief quality feels generic | Goal context is injected into every prompt. Brief is always decision-mapped to stated priorities. |
| Operator (Sam) is too busy to validate data | Validation UX is designed for speed — a one-time session, not ongoing admin. |
| Solo founder bandwidth in 8 weeks | Architecture is designed so new customers require no new code — only a new schema fingerprint. |
| Benchmark data is inaccurate or irrelevant | Sourced from LLM research against public databases, cited with sources, framed as context not fact. |

---
