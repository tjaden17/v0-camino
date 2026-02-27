# Architecture Decision: Data Shape Registry

Date: February 2026
Status: DECIDED
Topic: How Camino scales to non-CRM data sources without custom dev per customer

---

## The Problem

The universal schema (CRM) works for deals, leads, and contacts because those data shapes are predictable. But our market also uses:

- Customer support tools (Zendesk, Freshdesk, Intercom, Pendo)
- Product analytics tools (Pendo, Mixpanel, Amplitude)
- Financial tools (Xero, QuickBooks, custom exports)

These are fundamentally different data shapes with different calculation logic. A single universal schema cannot cover all of them.

---

## The Decision: A Registry of Schemas

Instead of one universal schema, Camino maintains a registry of schemas — one per data type.

Each schema in the registry contains:
1. A set of universal field names for that data type
2. An alias library mapping tool-specific column names to those fields
3. A signal library of signals valid only for that data type
4. Calculation logic appropriate for that data type

---

## The Three Data Shape Categories

### Category 1: CRM / Deal Data
Tools: Zoho CRM, HubSpot, Salesforce, Pipedrive

Data shape: One row = one deal or lead. Value-based.

Universal schema fields:
- deal_value, stage, close_date, owner, lead_source, probability

Calculation logic: SUM, AVERAGE, COUNT, rate-based (win rate, conversion rate)

Signal examples: Pipeline Value, Win Rate, Leads This Month, Closed Revenue

Status: BUILT (MSS Goal 1)

---

### Category 2: Ticket / Support Data
Tools: Zoho Desk, Zendesk, Freshdesk, Intercom, Pendo

Data shape: One row = one support event with a status lifecycle and timestamps.

Universal schema fields:
- ticket_id, created_at, resolved_at, priority, category, agent, customer_id, status

Calculation logic: COUNT, DURATION (resolved_at minus created_at), distribution by category or priority

Signal examples: Open Ticket Count, Average Resolution Time, Tickets by Priority, First Response Time

Status: PARTIALLY BUILT (Zoho Desk for Locumate). Needs generalisation in Goal 2.

---

### Category 3: Financial / Operational Data
Tools: Xero, QuickBooks, custom spreadsheet exports

Data shape: One row = one transaction or ledger entry.

Universal schema fields:
- date, amount, category, account_type, description, direction (income or expense)

Calculation logic: SUM by category, period-over-period comparison, net calculation

Signal examples: Monthly Revenue, Top Expense Categories, Net Position, Revenue vs Last Month

Status: FUTURE (Goal 3 or beyond)

---

### Category 4: Product Usage / Behavioural Data
Tools: Pendo, Mixpanel, Amplitude, FullStory

Data shape: One row = one user event. Properties column is freeform JSON.

Universal schema fields:
- user_id, event_name, timestamp, session_count, feature_name, properties (extracted)

Calculation logic: FUNNEL, RETENTION, FREQUENCY, COHORT

Signal examples: DAU / MAU, Feature Adoption Rate, Session Duration, Retention at Day 30

Status: FUTURE (hardest category — see JSON problem below)

---

## The JSON Problem (Category 4)

Product analytics tools store event properties as a freeform JSON blob. There is no universal schema possible because every product defines its own event names and properties.

The 80/20 solution is NOT to build a generic JSON parser. That is a rabbit hole.

The solution is tool-specific extractors:
- A Pendo extractor that knows Pendo's standard event taxonomy
- A Mixpanel extractor that knows Mixpanel's standard event structure
- Admin flags any non-standard custom events for manual naming

This means: one adapter per tool, built once, reused for every customer on that tool. Not one adapter per customer.

---

## The Architectural Rule That Makes This Scale

Every schema, every alias mapping, every signal definition lives in the database as configuration — not in application code.

Adding a new data source (e.g., Freshdesk) must only require:
- Adding Freshdesk column aliases to the ticket schema alias table (database row)
- Zero code changes
- Zero deployments

If adding a new data source requires a code deploy, the architecture is wrong.

The test: a non-engineer with database access should be able to add Freshdesk support by inserting rows into the alias table.

---

## Build Order (What to Do and When)

| Phase | Schema | Unlocks |
|---|---|---|
| Goal 1 (NOW) | CRM schema | Zoho CRM, HubSpot, Salesforce customers |
| Goal 2 | Ticket schema (generalised) | Zendesk, Freshdesk, Intercom customers |
| Goal 3 | Financial schema | Xero, QuickBooks customers |
| Goal 4+ | Usage schema + extractors | Pendo, Mixpanel customers |
| Future | Cross-schema signals | "Customers with high tickets AND low usage churn faster" |

---

## Cross-Schema Signals (Future State)

The most valuable signals will eventually combine multiple schemas for the same customer:

- "Deals that went to support within 30 days of close" (CRM + Ticket)
- "Users who churned had 3x more tickets than retained users" (Ticket + Financial)
- "Feature adoption predicts expansion revenue" (Usage + Financial)

This requires a customer_id or account_id to be present in both schemas so records can be joined. This is a Goal 4+ capability but the schema design should account for it from day one — every schema should include a customer_id or account_id field where possible.

---

## What This Is NOT

- Not a generic data warehouse. Camino does not try to store and query arbitrary data shapes.
- Not a drag-and-drop report builder. Signals are curated, not user-defined from scratch.
- Not a real-time streaming system. Batch uploads (CSV) or scheduled API syncs only for now.
