# Exploration: Group Formation, Group-to-Group Connections, and Receiver-Side Virality

Date: February 27, 2026
Status: Exploration — no decisions locked
Related docs: VIRALITY_AND_INTERORG_CONNECTIONS.md, GRAPH_THEORY_SIGNALS.md

---

## The Gap in Previous Thinking

The virality doc handles org-to-org connections as bilateral — one org shares with another.
That is the starting point, but it misses the most powerful structure: groups of orgs that
form a shared context, and groups connecting to other groups.

This is where Metcalfe's Law actually kicks in. Value scales with the square of connected
nodes, not linearly. A group of 10 orgs has 45 possible connections. A group of 50 has 1225.

---

## The 4 Natural Group Types

Groups do not need to be invented. They already exist in the real world.
Camino needs to recognise and formalise them.

---

### Group Type 1: The Portfolio (Investor to Portfolio Companies)

An investor or fund connects to all their portfolio companies. Each portfolio company is
an org node. The investor sits above as a group coordinator node.

What the investor gets:
- A unified cross-portfolio signal view — all companies in one screen, ranked by health
- Anomaly alerts across the portfolio — 3 of your 8 portfolio companies show declining NPS
- Benchmark within the portfolio — Company A win rate is 2x Company B at the same stage

What the portfolio company gets:
- Their investor can see health signals without them preparing a board pack
- They are automatically benchmarked against portfolio peers
- Their investor's other portfolio companies become an anonymous benchmark cohort

Sales mechanic: One investor sale equals 8-15 new orgs. Conversion is near 100% because
adoption is driven by a trusted authority relationship, not a cold product pitch.

---

### Group Type 2: The Cohort (Peer Group to Members)

Accelerator cohorts, YC batches, industry associations, mastermind groups. These groups
already have trust, regular communication, and a shared interest in benchmarking.

What the coordinator gets:
- A cohort-level benchmark dashboard — how is the cohort performing as a whole
- Anonymous individual benchmarks — you are in the top 3 of your cohort on pipeline velocity
- Monthly cohort signal report auto-generated and sent to all members

What a member gets:
- A benchmark they could not get anywhere else — relevant peers, same stage, same context
- Status — being top quartile in a cohort is something they will share externally

The viral mechanic here is status. The member who is top quartile shares that signal
externally — beyond the cohort — which seeds the shared report loop from the virality doc.

---

### Group Type 3: The Supply Chain (Franchisor or Platform to Operators)

A franchisor, marketplace, or vertical SaaS platform has multiple operators beneath them —
each running their own business but sharing a relationship with the parent entity.

Examples: A franchise brand with 40 franchisees. A marketplace with 200 sellers.
A vertical SaaS with 80 SMBs all in the same industry.

What the franchisor gets:
- Operational health signals across all operators
- Identify underperforming operators before they churn or fail
- Benchmark operators against each other — what are the top performers doing differently

What the operator gets:
- Targeted support from the franchisor based on actual signals, not gut feel
- Visibility into how they rank against peers — motivation to improve specific signals

This is the highest-value group type. One enterprise deal unlocks 40-200 org nodes instantly.

---

### Group Type 4: The Advisor Network (Accountant or Consultant to Clients)

An accountant, CFO-as-a-service firm, or business advisor manages 10-30 SMB clients.
They have recurring relationships and deep trust.

What the advisor gets:
- A multi-client dashboard — all clients' health signals in one view
- Early warning across their client base — know which clients need attention before they call
- Automated monthly signal summaries they can brand and send to clients as a value-add

What the client gets:
- Their advisor comes to meetings already knowing what is happening — no prep time
- Proactive insight: your pipeline velocity dropped 3 weeks ago, here is what that means
  for your cash position in 90 days

The viral mechanic: the advisor is the distribution channel. They recommend Camino to
every new client as part of onboarding. One advisor relationship equals 10-30 client orgs
over 12 months, with low churn because the advisor relationship creates switching cost.

---

## Group-to-Group Connections: The Second-Order Graph

Once groups exist, groups can connect to each other. This is where network effects
become genuinely exponential.

Example: An accelerator cohort contains 12 startups. Three of those startups are also
in the same investor's portfolio. Those three orgs now sit at the intersection of two
groups — their signal data enriches both graphs simultaneously.

Structural model:

  Portfolio Group (Investor A)
    Org 1 — also in — Accelerator Cohort Group
    Org 2 — also in — Industry Association Group
    Org 3
    Org 4 — also in — Accelerator Cohort Group

  Accelerator Cohort Group
    Org 1 (shared with Portfolio)
    Org 4 (shared with Portfolio)
    Org 7 — supplier of — Org 12
    Org 12

An org at the intersection of multiple groups contributes to multiple benchmark pools.
The benchmark they receive is richer — informed by their portfolio peers, cohort peers,
and industry association peers simultaneously.

This is a multi-graph. The same nodes (orgs) appear in multiple group graphs.
Compound value grows non-linearly because each new group connection improves signal
context from multiple angles at once.

---

## Receiver-Side Virality: Value Before Sign-Up

The problem with most B2B virality is the receiver gets nothing until they complete a
long onboarding. Conversion drops to near zero. The fix: the receiver must get real
value before they create an account.

---

### Receiver Value 1: The Instant Benchmark (Before Sign-Up)

When a founder receives a benchmark invitation, before they sign up they see:

  You have been invited to join a benchmark cohort of 14 B2B SaaS companies at your stage.
  Cohort averages: Win Rate 58%, Pipeline Velocity 23 days, CSAT 72%.
  Sign up to see where you rank.

They do not know their own numbers yet — but they have a benchmark to compare against.
The gap in their knowledge (where do I rank?) is the conversion driver. They sign up
to fill that gap, not to try a product.

This mechanic requires the cohort data to exist first. Only works at 50+ orgs.
But worth designing data collection for now so it is structured correctly.

---

### Receiver Value 2: The Pre-Populated Insight (Warm Share)

When a CEO shares a signal view with a board member, include in the shared view:

  For your reference: businesses in this sector at this stage typically see pipeline value
  of X. [CEO name]'s pipeline is Y. This is Z% above or below typical.

The board member, who may advise 6 companies, now has a benchmark reference they did not
have before — derived from Camino's cross-org data. They got value from opening a link.
That triggers the thought: I should look at this for my other portfolio companies.

---

### Receiver Value 3: The Relationship Signal (Inter-Org Share)

When a supplier shares signals with a customer, the customer receives something
genuinely useful before signing up:

  [Supplier] is tracking these signals on your relationship:
  Response Time (current: 3.2hrs, target: under 4hrs)
  Open Tickets (current: 4)
  Renewal Date (87 days away)

The customer can see this in a read-only view without an account. The value is
transparency from their supplier. The conversion driver: I want to share my signals
back, and I want to see what else Camino can show me about my own business.

This is the highest-quality receive-side experience because it is personalised to
an actual business relationship — not a generic benchmark.

---

## The Revised Viral Coefficient With Groups

Without groups (from previous doc):    K = approximately 0.115

With groups added:
  1 investor join event       = 8-15 new orgs (near 100% conversion)
  1 accelerator partnership   = 12-20 new orgs per cohort
  1 advisor relationship      = 10-30 new orgs over 12 months
  1 franchisor deal           = 40-200 new orgs

Group-adjusted contribution:
  If 1 in 10 signups triggers a group event, each group event adds 0.5-1.5 to K

The insight: group formation events are not viral in the K-coefficient sense — they are
step-changes. A single investor joining is not K = 14, it is a discrete jump of +14 orgs
that then each contribute to the ongoing K calculation.

The growth model is: K-based viral growth + occasional step-change group events.
Both need to be designed for.

---

## The One Structural Decision That Unlocks All of This

Every org must have a group membership table from day one — even if no groups exist yet.

org_group_memberships table:
  org_id
  group_id
  group_type          — portfolio / cohort / supply_chain / advisor_network
  role                — coordinator / member
  joined_at
  signal_permissions  — which signals this org shares with the group

This table costs almost nothing to add now. Without it, retrofitting group logic into
an existing data model is a significant engineering project. With it, every group type
described above is a query, not a rebuild.

---

## Summary: The Three-Layer Growth Model

Layer 1 — Individual viral
  Mechanism: Share links, benchmark invites, inter-org handshakes
  Growth type: K-coefficient, continuous

Layer 2 — Group formation
  Mechanism: Investor, advisor, cohort, franchisor bring their whole network
  Growth type: Step-change events

Layer 3 — Group-to-group
  Mechanism: Orgs in multiple groups compound benchmark value
  Growth type: Network effect, exponential

Each layer requires the previous one to exist. Build Layer 1 first (shareable signal view).
Layer 2 emerges from Layer 1. Layer 3 is a natural consequence of Layer 2.

---

## Open Questions

- How do we incentivise a group coordinator to bring their whole network vs just themselves?
- Should group membership be visible to members, or anonymous?
- What is the minimum group size for benchmark data to be statistically meaningful?
- How do we handle a coordinator who wants to leave — do their members lose the group context?
- Should groups be able to connect to other groups directly, or only via shared member orgs?
