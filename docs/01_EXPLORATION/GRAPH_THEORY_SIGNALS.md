# Graph Theory Applied to Camino Signals

Status: EXPLORATION — not a decision, not committed to build
Date: February 25, 2026
Origin: Conversation exploring qualitative data signals and how graph theory could be exploited

---

## The Core Insight

Right now Camino shows signals as independent cards. Each signal is an island. Graph theory asks: what if signals are nodes, and the relationships between them are edges? Suddenly you are not showing 8 numbers — you are showing a causal map of a business.

---

## What the Graph Looks Like

Every data point becomes a node. Relationships between them become edges with a direction and a weight.

NPS Score drops, which causes Churn Risk to rise, which causes Pipeline Value to fall.
Response Time rises, which causes CSAT Score to drop, which causes Renewal Rate to fall.

This is not a visualisation feature. It is an inference engine. When NPS drops, the graph tells you which downstream signals are at risk before they actually move.

---

## 3 Concrete Ways to Exploit It

### 1. Leading Indicator Detection

In a graph, some nodes are upstream (causes) and some are downstream (effects). Standard analytics treats all signals equally. Graph theory lets you rank them by influence.

Known causal chain in most businesses:
- Response time is upstream of CSAT
- CSAT is upstream of NPS
- NPS is upstream of churn
- Churn is upstream of revenue

If response time spikes this week, you can surface: "This has historically preceded a CSAT drop within 3 weeks for businesses like yours." That is a genuinely different product from a dashboard.

The data already in Camino — ticket data, CRM data, NPS exports — contains this causal structure. It just has not been mapped yet.

### 2. Signal Clustering (Finding What Actually Moves Together)

Graph theory includes algorithms for finding clusters — groups of nodes that move together more than they move with the rest of the graph.

In practice:
- Run correlation across all signals over time per org
- Draw edges where correlation exceeds a threshold (e.g. r above 0.7)
- Clusters that emerge are the customer's real business levers

One customer might find their business has two clusters: a customer health cluster (NPS, CSAT, churn) and a sales velocity cluster (pipeline, win rate, cycle time). Another customer might find everything is tightly connected — one unified business health graph.

This is insight no dashboard tool currently surfaces for SMBs.

### 3. Anomaly Propagation ("What Else Should I Check?")

When one signal fires an alert, graph traversal tells you which connected signals to check next.

Instead of: "Win Rate is down."

Camino surfaces: "Win Rate is down. Based on your signal graph, check Deal Cycle Time (directly connected, 0.8 correlation), Pipeline Volume (2 hops, historically follows within 2 weeks), and Revenue Forecast (3 hops, end node)."

This turns a passive alert into an active investigation guide. The executive does not need to know where to look — the graph tells them.

---

## The Data Already in Camino Is Enough to Start

No new data is needed to explore this. What is required:

- Signal values over time per org — these are the nodes and time series values
- Correlation between signal time series — these become edge weights
- Directional business logic (response time causes CSAT, not the reverse) — these become edge directions

The directional logic does not need to be learned from data initially. It can be seeded manually based on known business causality. That is a one-time configuration, not per-customer work.

---

## The Hierarchy of Exploitation

Level 1 — Signal correlation
Know which signals move together.
Effort: Low. Pure maths on existing data.

Level 2 — Upstream/downstream ranking
Surface leading indicators before downstream signals move.
Effort: Low. Seed directional graph manually.

Level 3 — Anomaly propagation
"Check these signals too" when an alert fires.
Effort: Medium. Graph traversal triggered on alert.

Level 4 — Predictive signals
"This will likely drop in 2 weeks."
Effort: High. Requires sufficient historical data per org.

Level 5 — Cross-customer graph
"Businesses like yours show this pattern."
Effort: Very high. Requires data volume across many orgs.

Levels 1 and 2 are exploitable right now with current data and standard correlation maths. No ML required.

---

## Why This Could Be a Moat

Every dashboard tool shows signals as independent numbers. Nobody in the SMB space is showing causal relationships between signals. If Camino can say "your response time increase is the upstream cause of your NPS drop, and your revenue is the downstream risk" — that is a categorically different product, not a feature difference.

---

## Open Questions (Not Answered Yet)

- How many orgs and how many time periods of data are needed before correlation is meaningful?
- Do we seed the directional graph manually forever, or build a system to learn it from data?
- How does the graph change when a customer connects a new data source?
- Is the graph per-org (personalised) or shared across all orgs (generalised)?
- Does this become a visible UI feature or stays as a background inference engine?

---

## Related Docs

- 01_EXPLORATION/ai-panel-consultations/ANALYSIS_FORMATS.md — signal card format exploration
- 01_EXPLORATION/ai-panel-consultations/SCALABILITY.md — data shape registry context
- 00_DECISIONS/architecture/DATA_SHAPE_REGISTRY.md — schema design for multiple data types
- 00_DECISIONS/architecture/SIGNAL_CALC_ENGINE.md — how signal calculations are structured
