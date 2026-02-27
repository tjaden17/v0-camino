# Signal Categories, Signals, and Calculations

**Purpose:** Single reference table amalgamating categories, signal names, how each signal is calculated, and business/product stage. Use for cross-referencing which signals to include and how they are computed.

**Sources:** SIGNAL_CATALOG.md, METRIC_SPECIFICATIONS.md, MSS_BUILD_PLAN_LOCKED.md, and generate route category mapping.

---

## Main reference table

| **Category** | **Signal** | **Calculation** | **Stage / Tier** |
|--------------|------------|------------------|------------------|
| **Sales** | Monthly Pipeline | For each month: SUM(Amount) for open deals (Stage NOT IN Closed Won, Closed - No Budget) with Closing Date in that month. Primary value = latest month (potential revenue expected to close that month). Requires Closing Date. | Post-PMF; Tier 2 |
| **Sales** | Win Rate | Closed Won / **all deals** (open + closed) × 100. Primary value = latest month when Closing Date present (win rate for that period). Time series by Closing Date month. | Scaling; Tier 3 |
| **Sales** | Closed Revenue | Expected revenue (Closed Won). SUM(Amount) WHERE Stage = Closed Won. Primary = latest month when Closing Date present, else all-time. | Post-PMF |
| **Sales** | Avg Sales Cycle | AVG(Sales Cycle Duration) WHERE Stage = 'Closed Won'. Use pre-calculated days column. | Post-PMF; Tier 3 |
| **Sales** | Average Deal Size | SUM(deal_amount) / COUNT(deal_id) WHERE status IN ('Closed Won', 'Closed Lost'), deal_amount > 0. | Post-PMF |
| **Sales** | Deal Velocity (Sales Cycle from dates) | AVG(close_date − created_date) in days WHERE status IN ('Closed Won', 'Closed Lost'). | Post-PMF |
| **Sales** | Pipeline Velocity | (Deals × Win Rate × Avg Deal Size) / Sales Cycle Length. | Scaling; Tier 3 |
| **Support** | Ticket Volume (real) | COUNT(rows) after excluding non-real tickets (e.g. Subject = "Policy acknowledgment required"). | Always; Tier 3 |
| **Support** | Avg Resolution Time | AVG(resolution_time). Parse "X days HH:MM hrs" → hours. Filter: Status = 'Closed'; exclude policy-ack tickets. | Always; Tier 3 |
| **Support** | First Response Time | AVG(first_response_date − created_date). | Always |
| **Support** | Ticket Backlog | COUNT(tickets WHERE status = 'Open' / unresolved) at point in time. | Always |
| **Support** | Ticket Reopen Rate | (COUNT(Reopened) / COUNT(Resolved + Reopened)) × 100. | Post-PMF |
| **Customer Success** | Lead Conversion Rate | COUNT(Is Converted = 'Yes') / COUNT(all leads) × 100. Optional: dedup by email. | Post-PMF |
| **Customer Success** | CSAT | (Satisfied responses / Total responses) × 100, or AVG(satisfaction_score) where 1–5. | Post-PMF |
| **Customer Success** | NPS | % Promoters − % Detractors; from survey. | Post-PMF; Tier 1 |
| **Customer Success** | Customer Churn Rate | (Customers lost in period / Customers at start) × 100. | Always; Tier 1 |
| **Customer Success** | NRR | ((Starting MRR + Expansion − Contraction − Churn) / Starting MRR) × 100. | Post-PMF; Tier 2 |
| **Revenue & Financial** | MRR | Sum of active subscription values normalized to monthly. | Post-PMF; Tier 1 |
| **Revenue & Financial** | MRR Growth Rate | ((Current MRR − Previous MRR) / Previous MRR) × 100. | Post-PMF; Tier 2 |
| **Revenue & Financial** | Cash Runway | Cash balance / Monthly burn. | Always; Tier 1 |
| **Revenue & Financial** | Gross Margin | (Revenue − COGS) / Revenue × 100. | Always; Tier 1 |
| **Product & Engagement** | DAU | COUNT(distinct user_id) per day. | Pre-PMF |
| **Product & Engagement** | MAU | COUNT(distinct user_id) per month. | Pre-PMF; Tier 1 |
| **Product & Engagement** | DAU/MAU (Stickiness) | DAU / MAU. | Post-PMF; Tier 2 |
| **Product & Engagement** | Feature Adoption Rate | % of users (or accounts) using feature in period. | Post-PMF; Tier 3 |
| **Marketing & Growth** | MQLs | COUNT(leads) WHERE meets MQL criteria. | Post-PMF |
| **Marketing & Growth** | CAC | Total acquisition spend / New customers. | Post-PMF; Tier 2 |
| **Marketing & Growth** | Conversion Rate (website → lead) | (Leads / Visitors) × 100. | Post-PMF |
| **Operational & Team** | Team Headcount | COUNT(employees) by department/org. | Scaling |
| **Operational & Team** | Revenue per Employee | Revenue / Headcount. | Scaling; Tier 3 |

---

## MSS "7 signals" (Locumate) – quick reference

| **#** | **Category** | **Signal** | **Calculation** | **Stage** |
|-------|--------------|------------|------------------|-----------|
| 1 | Sales | Monthly Pipeline | SUM(Amount) for open deals with Closing Date in that month; primary value = latest month (potential revenue for that month) | Post-PMF |
| 2 | Sales | Win Rate | Closed Won / all deals × 100; primary = latest month when Closing Date present | Post-PMF |
| 3 | Sales | Closed Revenue | Expected revenue (Closed Won). Primary = latest month when Closing Date present | Post-PMF |
| 4 | Sales | Avg Sales Cycle | AVG(Sales Cycle Duration) WHERE Stage = Closed Won (days) | Post-PMF |
| 5 | Support | Ticket Volume | COUNT after excluding "Policy acknowledgment required" (and non-real filter) | Always |
| 6 | Support | Avg Resolution Time | AVG(Resolution Time in Business Hours), parse "X days HH:MM hrs"; Status = Closed only | Always |
| 7 | Customer Success | Lead Conversion Rate | COUNT(Is Converted = Yes) / COUNT(leads) × 100 | Post-PMF |

---

## Stage legend

- **Pre-PMF:** Validation, learning; product engagement, TTV, early satisfaction.
- **Post-PMF / Early growth:** Repeatability; MRR, pipeline, CAC, churn/NRR, margin.
- **Scaling:** Optimization; win rate, pipeline velocity, support metrics, revenue per employee.
- **Tier 1:** Non-negotiable (runway, MRR, churn, margin, MAU).
- **Tier 2:** Post-PMF essentials (MRR growth, NRR, CAC, monthly pipeline, DAU/MAU, health score).
- **Tier 3:** Scaling & optimization (win rate, velocity, feature adoption, support metrics).
- **Tier 4:** Strategic (market share, growth efficiency, concentration risk).
