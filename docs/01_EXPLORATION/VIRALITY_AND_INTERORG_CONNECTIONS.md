# Exploration: Virality and Inter-Org Connections

Date: February 27, 2026
Status: Exploration — no decisions locked
Related docs: GRAPH_THEORY_SIGNALS.md, GROUP_FORMATION_AND_NETWORK_EFFECTS.md, CAMINO_GROWTH_MODEL.md, HOW_WILL_THIS_PRODUCT_GROW.md

Extended thinking: GROUP_FORMATION_AND_NETWORK_EFFECTS.md extends this doc with group types (portfolio, cohort, supply chain, advisor network), group-to-group connections, receiver-side virality mechanics, and the org_group_memberships data model that must be built from day one.

---

## The Viral Coefficient Defined

The viral coefficient (K) = invitations sent per user x conversion rate of those invitations.

K > 1 means the product grows on its own. K = 0.5 means every 2 users bring 1 more. Most B2B SaaS sits between 0.1 and 0.4. You do not need K > 1 to meaningfully reduce CAC — even K = 0.3 compounds significantly over 12 months.

The question for Camino: what naturally makes a user want to show this to someone outside their org?

---

## The 3 Viral Loops Available to Camino

### Loop 1: The Shared Report (Pull Viral)

Highest-conversion loop because the recipient asks for it — not pushed on them.

How it works:
- A CEO uses Camino and generates a signal summary
- They share it with their board, investor, or accountant — because it is the clearest way to communicate business health they have
- The recipient sees a Camino-branded signal view and thinks "I want this for my portfolio companies / clients"
- They sign up or refer it to another business they advise

Key design decision: the shared view must be beautiful and clearly different from a spreadsheet or PDF. It needs to feel like a product, not a report. Camino attribution visible but not aggressive.

K contribution: Board members typically advise 3-8 companies. One impressed board member is worth 3-8 warm referrals with near-zero sales friction.

---

### Loop 2: The Supplier / Customer Loop (Push-Pull Viral)

This is the inter-org connection opportunity — unique to Camino.

How it works:
- A CEO tracks their pipeline signals internally
- Their biggest customer also uses Camino
- The CEO invites their customer to share a subset of signals — "here is what I am tracking on our relationship: your ticket volume, your NPS, your renewal date"
- The customer now has a reason to log into Camino to see that shared view
- They realise they want their own full signal view

This is a two-sided inter-org connection — not a collaboration tool, but a signal handshake between businesses that have a relationship. The CEO does not see the customer's internal data. The customer sees only the signals the CEO chose to share. But both parties are now in the Camino graph.

Why this is powerful: B2B relationships have a natural data-sharing incentive. Suppliers want customers to see health metrics. Customers want visibility into supplier performance. Camino becomes the neutral layer that enables this without exposing raw data.

K contribution: Every B2B org has 5-50 key supplier or customer relationships. One sharing event seeds 5-50 potential new orgs.

---

### Loop 3: The Benchmark Invitation (Data Viral)

Unique to the cross-customer graph from the network effects discussion.

How it works:
- Camino surfaces: "Your win rate of 67% is in the top quartile for B2B SaaS at your deal size. Invite a peer to compare."
- The user invites a founder peer — not to collaborate, but to get a benchmark comparison
- The peer signs up, connects their data, and both get a richer benchmark
- The benchmark improves for everyone in the cohort

This is the same mechanic that made LinkedIn's "See who's viewed your profile" viral — the value is in the comparison, and getting the comparison requires the other person to participate.

K contribution: Founder peer groups are tight — YC batches, accelerators, industry groups. One benchmark invitation to a peer group chat converts at much higher rates than cold outreach.

---

## Inter-Org Connections: The Technical Architecture

For Loops 2 and 3 to work, one new concept is needed in the data model: an inter-org edge.

org_connections table:
  id
  source_org_id       — the org sharing
  target_org_id       — the org receiving
  connection_type     — supplier / customer / peer / investor
  shared_signals      — array of signal keys permitted to share
  status              — pending / active / revoked
  created_at

This is a directed graph at the org level — an extension of the signal graph already designed, but operating one level up. Each org is a node. Relationships between orgs are edges. The signals that travel across those edges are configurable per connection.

This structure also unlocks entirely new customer segments:
- An investor connects to 8 portfolio companies and sees a unified benchmark view across all of them — without any seeing each other's data
- An accountant or advisor connects to multiple client orgs and gets a cross-client signal dashboard
- A franchisor connects to all franchisee orgs and tracks performance across the network

---

## Increasing the Viral Coefficient: 5 Specific Levers

Lever 1 — Frictionless share link
Mechanism: One tap to generate a read-only signal view with Camino branding
K Impact: High — reduces share activation cost to near zero

Lever 2 — Benchmark invite
Mechanism: "Invite a peer to unlock your industry benchmark" — gated feature
K Impact: High — creates a concrete reason to invite

Lever 3 — Board pack integration
Mechanism: Auto-generate a monthly board signal summary, sent from Camino's domain
K Impact: Medium — board members are high-value referrers

Lever 4 — Advisor multi-org view
Mechanism: Accountants and advisors get a free multi-org dashboard if they refer 2+ clients
K Impact: Medium — advisors have pre-existing trust with target customers

Lever 5 — Inter-org signal handshake
Mechanism: B2B signal sharing between supplier and customer orgs
K Impact: Medium — low volume, high conversion

---

## The Viral Coefficient Math for Camino

Realistic scenario at 100 customers:

Sharing loop:
  100 orgs
  x 20% share a report externally per month   = 20 share events
  x 3 recipients per share event              = 60 recipient exposures
  x 15% conversion (warm, relevant audience)  = 9 new orgs per month
  K = 0.09

Benchmark invitation loop:
  100 orgs
  x 30% send a benchmark invite per quarter   = 30 invitations
  x 25% conversion                            = 7.5 new orgs per quarter = 2.5 per month
  K contribution = 0.025

Combined K = approximately 0.115

Meaning roughly 1 in 9 customers brings another customer organically. Not explosive, but at a $500-1000 ACV this meaningfully reduces CAC and compounds over time.

The number that moves K most is share conversion rate — which is almost entirely a function of how good the shared view looks. This is a design problem as much as a product problem.

---

## The One Thing to Build First

Before any of the above loops can activate, Camino needs a shareable signal view — a read-only, beautifully designed URL that a non-Camino user can open without logging in, that shows a curated set of signals and makes them want the full product.

Everything else builds on top of that primitive:
- Inter-org connections require it
- Benchmark invitations require it
- Board pack integration requires it

---

## Open Questions

- What signals should be shareable by default vs requiring explicit selection?
- Should the shared view require the recipient to create an account to see anything, or is a fully public URL acceptable?
- How do we handle the inter-org connection request — email invite, link, or in-app?
- At what customer volume does the benchmark data become statistically meaningful enough to show?
- What is the right incentive structure for the advisor multi-org tier — free forever, or free until a threshold?

---

## Connection to Graph Theory Doc

The inter-org connections described here are the org-level graph sitting above the signal-level graph in GRAPH_THEORY_SIGNALS.md. Both graphs use the same directed edge model. The signal graph operates within an org. The org graph operates between orgs. Together they form a two-tier graph that compounds in value as both user count and org count grow.
