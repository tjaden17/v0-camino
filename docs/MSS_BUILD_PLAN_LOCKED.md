What # MSS Build Plan - LOCKED (Feb 14 2026)

Approved by: CTO (Head of Tech), Management Consultant (Sam), BI Analyst (Alex)

## Context

- Customer: Health-tech company (~30 people), Locumate
- 3 users: CEO (Surge), Customer Success Manager, Operations Manager
- Demo order: CEO first, then CS Manager
- Admin: Solo (you)
- Data sources: Zoho CRM (Deals, Leads), Zoho Desk (Tickets, Agents)
- Deadline: 1 month (by March 14 2026)
- Constraint: Solo builder, using v0 + Cursor

---

## The 7 Signals (locked)

### Signal 1: Monthly Pipeline
- Who cares: CEO
- Source: zoho-crm-deals.csv
- Columns: "Amount", "Stage", "Closing Date" (required)
- Filter: Stage NOT IN ("Closed Won", "Closed - No Budget") — open deals only
- Operation: For each month M, SUM(Amount) where Closing Date is in month M. Primary value = latest month (potential revenue expected to close that month).
- Format: "$X" (AUD)
- Expected value: Pipeline expected to close in the latest month (potential revenue for that month)
- Open stages: "Qualification", "Value Proposition", "Id. Decision Makers", "Proposal/Price Quote", "Contracts", "On Hold - timing"

### Signal 2: Win Rate
- Who cares: CEO
- Source: zoho-crm-deals.csv
- Columns: "Stage"; optional "Closing Date" for time-period view
- Formula: Closed Won / **all deals** (open + closed won + closed lost). Not just closed deals.
- Operation: COUNT(Stage = "Closed Won") / COUNT(all rows). When Closing Date present, primary value = win rate for **latest month** (deals that closed in that month: won / total in that month).
- Format: "X%"
- Time series: Group by Closing Date month (win rate = won / total in that month)

### Signal 3: Closed Revenue
- Who cares: CEO
- Source: zoho-crm-deals.csv
- Columns: "Amount", "Stage"; optional "Closing Date" for period view
- Definition: Expected revenue = Closed Won (SUM of Amount where Stage = Closed Won). Primary value = for a period: **latest month** when Closing Date present, else all-time.
- Format: "$X" (AUD)
- Time series: Group by Closing Date month

### Signal 4: Avg Sales Cycle
- Who cares: CEO
- Source: zoho-crm-deals.csv
- Column: "Sales Cycle Duration"
- Filter: Stage = "Closed Won"
- Operation: AVG of Sales Cycle Duration (already in days, integer)
- Format: "X days"
- Note: Use the pre-calculated column. Do not compute from dates.

### Signal 5: Ticket Volume (Real Tickets)
- Who cares: CS Manager, Ops Manager
- Source: zoho-desk-tickets.csv
- Column: "Subject"
- Filter: EXCLUDE rows where Subject = "Policy acknowledgment required" (21 rows to exclude)
- Operation: COUNT of remaining rows
- Format: "X tickets"
- Time series: Group by Created Time month
- Sub-metric: Monthly rate (tickets per month)

### Signal 6: Avg Resolution Time
- Who cares: CS Manager
- Source: zoho-desk-tickets.csv
- Column: "Resolution Time in Business Hours"
- Filter: EXCLUDE "Policy acknowledgment required" tickets. Only include Status = "Closed".
- Operation: AVG of resolution time
- Format: "X hrs" or "X days Y hrs"
- Parse format: "375 days 22:43 hrs" -> convert to total hours
- Note: Some tickets have very long resolution times (300+ days). These are likely bulk-closed tickets. Consider using MEDIAN instead of AVG, or filtering out tickets older than 90 days resolution.

### Signal 7: Lead Conversion Rate
- Who cares: Ops Manager
- Source: zoho-crm-leads.csv
- Column: "Is Converted"
- Filter: None (all leads)
- Operation: COUNT(Is Converted = "Yes") / COUNT(total leads)
- Format: "X%"
- Data: ~10 converted out of ~67 total = ~15%
- Time series: Group by Created Time month
- Note: Some leads appear duplicated (same name/email). May need dedup by email.

---

## User-Signal Mapping

| User | Role | Signals They See | Their KPIs |
|------|------|-----------------|------------|
| Surge | CEO | Monthly Pipeline, Win Rate, Closed Revenue, Avg Sales Cycle | Win rate, sales |
| CS Manager | CS Manager | Ticket Volume, Avg Resolution Time | Ticket resolution, customer satisfaction |
| Ops Manager | Ops Manager | Ticket Volume, Lead Conversion Rate | Leads per month, operational efficiency |

---

## Exact Column Mappings (from real data)

### Deals CSV
| Our field | CSV column | Format | Example |
|-----------|-----------|--------|---------|
| deal_id | Id | integer | 85928000000331003 |
| deal_name | Deal Name | string | "Pod White-label" |
| owner | Deal Owner Name | string | "Surge Singh" |
| amount | Amount | "AUD X,XXX.XX" | "AUD 54,000.00" |
| stage | Stage | string | "Closed Won" |
| closing_date | Closing Date | DD/MM/YYYY | "31/03/2024" |
| sales_cycle | Sales Cycle Duration | integer (days) | 69 |
| probability | Probability (%) | integer | 100 |
| created | Created Time | DD/MM/YYYY HH:MM AM/PM | "05/07/2024 11:09 PM" |

### Leads CSV
| Our field | CSV column | Format | Example |
|-----------|-----------|--------|---------|
| lead_id | Id | integer | 85928000003842021 |
| name | Full Name | string | "Sam Gergis" |
| company | Company | string | "TWC Sydenham" |
| owner | Lead Owner Name | string | "Surge Singh" |
| is_converted | Is Converted | "Yes"/"No" | "No" |
| created | Created Time | DD/MM/YYYY HH:MM AM/PM | "20/10/2025 09:08 PM" |

### Tickets CSV
| Our field | CSV column | Format | Example |
|-----------|-----------|--------|---------|
| ticket_id | ID | integer | 20262000000307325 |
| subject | Subject | string | "Issue with app" |
| status | Status | string | "Closed" |
| priority | Priority | string | "High" |
| channel | Channel | string | "Email" |
| created | Created Time | YYYY-MM-DD HH:MM:SS | "2024-07-15 22:22:08" |
| resolution_time | Resolution Time in Business Hours | "X days HH:MM hrs" | "375 days 22:43 hrs" |
| first_response | First Response Time in Business Hours | "X days HH:MM hrs" | "0 days 00:21 hrs" |
| sla_violation | SLA Violation Type | string | "Not Violated" |
| department | Department | ID (needs mapping) | "20262000000012806" |

---

## Week-by-Week Plan

### Week 1 (Feb 17-21): Correct Signal Calculations
- Replace the 20 generic signal definitions with these exact 7
- Implement each calcSpec with the exact column mappings above
- Parse "AUD X,XXX.XX" amounts (already done)
- Parse "X days HH:MM hrs" resolution times (new)
- Filter out "Policy acknowledgment required" tickets
- Handle "Closed - No Budget" as lost in Win Rate
- Use pre-calculated "Sales Cycle Duration" column
- Handle duplicate leads (dedup by email)
- Validate every signal against manual spreadsheet calculation
- Date parsing: handle both DD/MM/YYYY and YYYY-MM-DD formats

### Week 2 (Feb 24-28): Personalised AI Interpretation
- Wire user context (role, KPIs, business type) into AI prompt
- CEO prompt: reference pipeline, deals, revenue targets
- CS Manager prompt: reference ticket trends, resolution benchmarks
- Generate 5-section analysis per signal using real numbers
- Auto-trigger interpretation after signal calculation
- Cache interpretations, allow refresh

### Week 3 (Mar 3-7): User Accounts + Admin Flow
- Create 3 user accounts (CEO, CS Manager, Ops Manager)
- Each user sees ONLY their relevant signals (see mapping above)
- Admin upload-on-behalf flow (you upload CSVs for the org)
- Admin signal verification screen (flag incorrect signals)
- Profile page read-only for users, admin-editable

### Week 4 (Mar 10-14): QA + Demo
- Full end-to-end walkthrough with real data
- Fix bugs found in testing
- Prepare CEO demo (Monthly Pipeline, Win Rate, Closed Revenue, Avg Sales Cycle)
- Prepare CS Manager demo (Ticket Volume, Avg Resolution Time)
- Goal: Surge logs in, sees his numbers, says "I'll pay"

---

## What We Are NOT Building

- Zoho API integration (CSV upload is sufficient)
- Weekly briefs / focus briefs
- Cross-source signal correlation
- More than 7 signals
- Market synthesis
- Progressive signal discovery
- Elaborate filter/sort on signals page (My KPIs toggle is enough)

---

## Known Data Quirks

1. Deals amounts prefixed with "AUD" and comma-formatted
2. Deals dates are DD/MM/YYYY, tickets dates are YYYY-MM-DD HH:MM:SS
3. 21 "Policy acknowledgment required" tickets to exclude
4. Some tickets have 300+ day resolution times (bulk-closed in Aug 2025)
5. Some leads are duplicated (same email appears twice)
6. Ticket department is an ID, not a name (needs mapping or ignore)
7. Sales Cycle Duration is 0 for some Closed Won deals (created and closed same day)
8. "Forecast Type" column shows "Won" for Closed Won and "Open" for open stages

---

## Success Criteria (Billing Gate)

Surge (CEO) logs in and sees:
1. His monthly pipeline (potential revenue expected to close) in AUD - and it matches what he sees in Zoho for that month
2. His win rate as a percentage - and it's correct
3. Total closed revenue - and it matches
4. Average sales cycle in days - and it's plausible
5. An AI interpretation that references HIS business, not generic text
6. He says: "This is useful. I'll pay."
