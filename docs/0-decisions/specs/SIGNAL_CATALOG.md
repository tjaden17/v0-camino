# Signal Requirements & Catalog

**Version:** 1.0  
**Purpose:** Comprehensive catalog of signals to track across business functions, with context on who needs them and when.

---

## How to Use This Document

Each signal includes:
- **What:** Description of the metric
- **Who:** Which roles/functions find this valuable
- **When:** Business stage and situations where this matters
- **Data Source:** Where to get the data
- **Calculation:** How it's computed (if applicable)
- **Urgency Triggers:** What values indicate immediate attention needed

---

## 1. Revenue & Financial Signals

### 1.1 Monthly Recurring Revenue (MRR)

**What:** Total predictable revenue generated each month from subscriptions.

**Who:**
- CEO/Founders (primary)
- CFO/Finance teams
- Board members
- Investors

**When:**
- **Post-PMF stage:** Once you have paying customers
- **Scale stage:** Critical for growth tracking
- **Fundraising:** Key metric investors track
- **Monthly:** Track as a north star metric

**Data Source:** Payment processor (Stripe), CRM, accounting software

**Calculation:** Sum of all active subscription values normalized to monthly

**Urgency Triggers:**
- Declining MRR for 2+ consecutive months
- MRR growth rate below 10% month-over-month (growth stage)
- Large churns affecting >5% of MRR

---

### 1.2 MRR Growth Rate

**What:** Percentage change in MRR period-over-period.

**Who:**
- CEO/Founders
- Sales leadership
- Investors/Board

**When:**
- **Growth stage:** Track weekly/monthly
- **Scaling:** Monitor against targets
- **Investor updates:** Key health indicator

**Data Source:** Calculated from MRR data

**Calculation:** `((Current MRR - Previous MRR) / Previous MRR) × 100`

**Urgency Triggers:**
- Growth rate declining for 3+ periods
- Below target growth rate by >20%
- Negative growth (contraction)

---

### 1.3 Net Revenue Retention (NRR)

**What:** Percentage of revenue retained from existing customers, including expansions and upgrades, minus churn and downgrades.

**Who:**
- CEO/Founders
- Customer Success teams
- Product leadership
- Investors

**When:**
- **Post-PMF:** Once you have cohorts of customers (6+ months)
- **SaaS companies:** Critical metric
- **Enterprise:** Especially important with long sales cycles

**Data Source:** Billing system, CRM

**Calculation:** `((Starting MRR + Expansion - Contraction - Churn) / Starting MRR) × 100`

**Urgency Triggers:**
- NRR below 100% (losing money from existing customers)
- NRR below 90% (critical churn issue)
- Declining NRR trend over 3+ months

---

### 1.4 Average Revenue Per Account (ARPA)

**What:** Average monthly revenue generated per customer account.

**Who:**
- Pricing teams
- Product leadership
- Sales/Marketing (understanding customer value)

**When:**
- **Always:** Track from first paying customer
- **Pricing changes:** Monitor impact
- **Market expansion:** Compare across segments

**Data Source:** Billing system

**Calculation:** `Total MRR / Number of Paying Customers`

**Urgency Triggers:**
- ARPA declining while customer count grows (downmarket drift)
- ARPA flat while adding premium features (monetization issue)

---

### 1.5 Cash Runway

**What:** Number of months until cash reserves are depleted at current burn rate.

**Who:**
- CEO/Founders (critical)
- CFO/Finance
- Board members

**When:**
- **Always:** Especially pre-profitability
- **Pre-fundraise:** Triggers fundraising timeline
- **Burn rate changes:** Re-evaluate monthly

**Data Source:** Bank account balance, monthly expenses

**Calculation:** `Current Cash Balance / Average Monthly Burn Rate`

**Urgency Triggers:**
- <12 months runway (start fundraising)
- <6 months runway (emergency mode)
- <3 months runway (critical)

---

## 2. Sales & Pipeline Signals

### 2.1 Sales Pipeline Value

**What:** Total potential revenue in active sales opportunities.

**Who:**
- Sales leadership
- CEO/Revenue leaders
- Finance (forecasting)

**When:**
- **Always:** Once sales motion starts
- **Weekly:** For active sales teams
- **Quarterly:** For planning and forecasting

**Data Source:** CRM (Salesforce, HubSpot, Pipedrive)

**Calculation:** Sum of all open opportunity values × probability weights

**Urgency Triggers:**
- Pipeline value below 3x quarterly revenue target
- Pipeline declining for 2+ weeks
- No new opportunities added for 2+ weeks

---

### 2.2 Pipeline Velocity

**What:** Speed at which deals move through the sales pipeline.

**Who:**
- Sales leadership
- Sales ops
- Revenue operations

**When:**
- **Post-PMF:** Once you have consistent deal flow
- **Scaling sales:** To optimize process
- **Weekly/Monthly:** Track changes

**Data Source:** CRM stage progression data

**Calculation:** `(Number of Deals × Win Rate × Average Deal Size) / Sales Cycle Length`

**Urgency Triggers:**
- Velocity declining for 2+ periods
- Deals stalling in specific stages
- Sales cycle lengthening by >20%

---

### 2.3 Win Rate

**What:** Percentage of opportunities that close as won vs. lost.

**Who:**
- Sales leadership
- CEO/Revenue teams
- Sales reps (individual performance)

**When:**
- **Always:** Once you have closed deals
- **Monthly:** Sufficient sample size
- **By segment:** Enterprise vs. SMB

**Data Source:** CRM closed opportunities

**Calculation:** `(Closed Won / (Closed Won + Closed Lost)) × 100`

**Urgency Triggers:**
- Win rate below 20% (qualification problem)
- Win rate declining for 2+ months
- Win rate varies drastically by rep (training issue)

---

### 2.4 Average Deal Size

**What:** Average revenue value of closed-won deals.

**Who:**
- Sales leadership
- Pricing/Product teams
- Finance (forecasting)

**When:**
- **Always:** Track from first deals
- **Market expansion:** Compare segments
- **Pricing changes:** Measure impact

**Data Source:** CRM closed-won deals

**Calculation:** `Sum of Closed-Won Deal Values / Number of Closed-Won Deals`

**Urgency Triggers:**
- Deal size shrinking (downmarket drift)
- Deal size highly variable (inconsistent targeting)

---

### 2.5 Sales Cycle Length

**What:** Average time from first contact to closed deal.

**Who:**
- Sales leadership
- Sales ops
- Finance (cash flow planning)

**When:**
- **Always:** Once you have multiple closed deals
- **Process changes:** Measure impact
- **Scaling:** Benchmark and optimize

**Data Source:** CRM opportunity created date to closed date

**Calculation:** `Average days between opportunity created and closed-won`

**Urgency Triggers:**
- Sales cycle lengthening by >20%
- Inconsistent cycle times (process issue)

---

## 3. Marketing & Growth Signals

### 3.1 Marketing Qualified Leads (MQLs)

**What:** Number of leads that meet qualification criteria and are ready for sales.

**Who:**
- Marketing leadership
- Sales leadership
- Growth teams

**When:**
- **Lead gen stage:** Once inbound motion starts
- **Weekly:** For active campaigns
- **Campaign launches:** Measure effectiveness

**Data Source:** Marketing automation (HubSpot, Marketo), CRM

**Calculation:** Count of leads meeting MQL criteria

**Urgency Triggers:**
- MQL volume declining for 2+ weeks
- MQL to SQL conversion rate below 25%
- Zero MQLs from new campaigns

---

### 3.2 Cost Per Acquisition (CAC)

**What:** Total sales and marketing cost to acquire one new customer.

**Who:**
- Marketing leadership
- CEO/CFO
- Growth teams

**When:**
- **Always:** Once spending on acquisition
- **Monthly:** Sufficient data
- **By channel:** Optimize spend

**Data Source:** Marketing spend + sales costs, customer count

**Calculation:** `(Total Sales & Marketing Costs) / Number of New Customers`

**Urgency Triggers:**
- CAC increasing while ARPA flat/declining
- CAC > ARPA (immediate profitability issue)
- CAC payback period >12 months

---

### 3.3 CAC Payback Period

**What:** Months required to recover the cost of acquiring a customer.

**Who:**
- CFO/Finance
- CEO
- Investors

**When:**
- **Growth stage:** Critical for unit economics
- **Fundraising:** Key metric for investors
- **Monthly:** Track trends

**Data Source:** CAC and ARPA data

**Calculation:** `CAC / (ARPA × Gross Margin)`

**Urgency Triggers:**
- Payback period >18 months (unsustainable)
- Payback period increasing trend

---

### 3.4 Website Traffic

**What:** Number of unique visitors to your website.

**Who:**
- Marketing teams
- Growth teams
- Product marketing

**When:**
- **Always:** Once you have a website
- **Weekly:** For active marketing
- **Campaign periods:** Daily monitoring

**Data Source:** Google Analytics, analytics platforms

**Calculation:** Count of unique visitors in time period

**Urgency Triggers:**
- Traffic declining for 3+ weeks
- Traffic spike with no conversion increase (quality issue)

---

### 3.5 Conversion Rate (Website to Lead)

**What:** Percentage of website visitors who become leads.

**Who:**
- Marketing teams
- Product marketing
- Growth/Optimization teams

**When:**
- **Always:** Once capturing leads
- **A/B tests:** Measure experiments
- **Weekly:** Ongoing optimization

**Data Source:** Analytics + marketing automation

**Calculation:** `(New Leads / Website Visitors) × 100`

**Urgency Triggers:**
- Conversion rate below 2% (website/messaging issue)
- Conversion rate declining after changes

---

## 4. Product & Engagement Signals

### 4.1 Daily Active Users (DAU)

**What:** Number of unique users who engage with your product each day.

**Who:**
- Product leadership
- CEO/Founders
- Engineering (infrastructure planning)

**When:**
- **Post-launch:** Track from day 1
- **Daily:** For consumer/PLG products
- **Weekly:** For B2B products

**Data Source:** Product analytics (Amplitude, Mixpanel)

**Calculation:** Count of unique users with qualifying activity per day

**Urgency Triggers:**
- DAU declining for 5+ consecutive days
- Weekend DAU drops >50% (engagement issue)

---

### 4.2 Monthly Active Users (MAU)

**What:** Number of unique users who engage with your product each month.

**Who:**
- Product leadership
- CEO
- Investors

**When:**
- **Always:** Track from launch
- **Monthly:** Primary metric
- **Cohort analysis:** Retention tracking

**Data Source:** Product analytics

**Calculation:** Count of unique users with qualifying activity per month

**Urgency Triggers:**
- MAU flat or declining for 2+ months (growth stalled)
- MAU growing but engagement declining (low-quality users)

---

### 4.3 DAU/MAU Ratio (Stickiness)

**What:** Percentage of monthly users who are active daily (product engagement strength).

**Who:**
- Product leadership
- CEO
- Growth teams

**When:**
- **Post-PMF:** Once you have user base
- **Feature launches:** Measure impact
- **Monthly:** Track trends

**Data Source:** Product analytics

**Calculation:** `(Average DAU / MAU) × 100`

**Urgency Triggers:**
- Stickiness below 20% (low engagement)
- Stickiness declining for 3+ months

---

### 4.4 Feature Adoption Rate

**What:** Percentage of users who use a specific feature.

**Who:**
- Product managers
- Product leadership
- Engineering (prioritization)

**When:**
- **Feature launches:** First 30-90 days critical
- **Monthly:** Ongoing tracking
- **A/B tests:** Measure variants

**Data Source:** Product analytics

**Calculation:** `(Users Who Used Feature / Total Active Users) × 100`

**Urgency Triggers:**
- <10% adoption for core features
- Declining adoption after initial launch

---

### 4.5 Time to Value (TTV)

**What:** Time from signup to first meaningful action or "aha moment."

**Who:**
- Product leadership
- Onboarding teams
- Growth teams

**When:**
- **Onboarding optimization:** Always
- **PLG motion:** Critical metric
- **Weekly:** Track improvements

**Data Source:** Product analytics

**Calculation:** `Median time from account creation to key activation event`

**Urgency Triggers:**
- TTV >24 hours (friction in onboarding)
- TTV increasing over time

---

## 5. Customer Success & Retention Signals

### 5.1 Customer Churn Rate

**What:** Percentage of customers who cancel or don't renew.

**Who:**
- Customer Success leadership
- CEO
- Product leadership

**When:**
- **Always:** Track from first customers
- **Monthly:** For subscription businesses
- **Cohorts:** By acquisition date/channel

**Data Source:** Billing system, CRM

**Calculation:** `(Customers Lost / Total Customers at Start) × 100`

**Urgency Triggers:**
- Monthly churn >5% (critical issue)
- Churn increasing for 2+ months
- Churn spike after product changes

---

### 5.2 Revenue Churn Rate

**What:** Percentage of MRR lost from existing customers.

**Who:**
- CEO/Founders
- Customer Success
- Finance

**When:**
- **Always:** More important than customer count churn
- **Monthly:** Track trends
- **Segment analysis:** By customer tier

**Data Source:** Billing system

**Calculation:** `(MRR Lost from Churn + Downgrades) / Starting MRR × 100`

**Urgency Triggers:**
- Monthly revenue churn >3%
- Large customer churn events (>5% MRR)

---

### 5.3 Customer Health Score

**What:** Composite score indicating likelihood of renewal/expansion or churn risk.

**Who:**
- Customer Success teams
- Account managers
- Customer Success leadership

**When:**
- **Proactive CS:** Once you have usage data
- **Weekly:** For at-risk accounts
- **Quarterly:** For all accounts

**Data Source:** Product usage + support tickets + engagement metrics

**Calculation:** Weighted score based on:
- Product usage frequency
- Feature adoption
- Support ticket volume
- NPS/satisfaction scores
- Payment status

**Urgency Triggers:**
- Health score dropping below 40/100
- Red health score for high-value customers
- Batch of accounts declining simultaneously

---

### 5.4 Net Promoter Score (NPS)

**What:** Customer satisfaction metric measuring likelihood to recommend your product.

**Who:**
- Product leadership
- Customer Success
- CEO/Founders

**When:**
- **Quarterly:** Sufficient sample, not survey fatigue
- **Post-onboarding:** 30-60 days after activation
- **Post-renewal:** Gauge satisfaction

**Data Source:** NPS surveys

**Calculation:** `% Promoters (9-10) - % Detractors (0-6)`

**Urgency Triggers:**
- NPS below 0 (more detractors than promoters)
- NPS declining by >10 points
- High detractor rate from specific segment

---

### 5.5 Customer Lifetime Value (LTV)

**What:** Total revenue expected from a customer over their entire relationship.

**Who:**
- Finance/CFO
- CEO
- Marketing (CAC:LTV ratio)

**When:**
- **Post-PMF:** Once you have churn data
- **Quarterly:** Sufficient cohort maturity
- **Strategic planning:** Growth modeling

**Data Source:** ARPA + churn rate

**Calculation:** `ARPA / Monthly Churn Rate` or cohort-based analysis

**Urgency Triggers:**
- LTV declining while CAC stable/increasing
- LTV:CAC ratio below 3:1

---

## 6. Support & Customer Service Signals

### 6.1 Support Ticket Volume

**What:** Number of support requests received per time period.

**Who:**
- Support leadership
- Product teams (quality issues)
- Operations (staffing)

**When:**
- **Always:** From first support tickets
- **Daily:** For operations planning
- **Spike detection:** Immediate alerts

**Data Source:** Support platform (Zendesk, Intercom, Zoho Desk)

**Calculation:** Count of new tickets

**Urgency Triggers:**
- Volume spike >30% vs. baseline
- Volume increasing with flat/declining user base (quality issue)
- Weekend volume spikes (critical bugs)

---

### 6.2 Average Resolution Time

**What:** Mean time from ticket creation to resolution.

**Who:**
- Support leadership
- Support team performance
- Customer Success (SLA tracking)

**When:**
- **Always:** Track from day 1 of support
- **Daily:** For operations
- **By priority:** Critical vs. low

**Data Source:** Support platform

**Calculation:** `Average of (Ticket Resolved Time - Ticket Created Time)`

**Urgency Triggers:**
- Resolution time >24 hours for high-priority
- Resolution time increasing trend
- SLA breaches

---

### 6.3 First Response Time

**What:** Time from ticket creation to first agent response.

**Who:**
- Support leadership
- Support operations
- Customer experience teams

**When:**
- **Always:** Customer satisfaction driver
- **Daily:** Operations metric
- **By channel:** Compare email, chat, phone

**Data Source:** Support platform

**Calculation:** `Average of (First Response Time - Ticket Created Time)`

**Urgency Triggers:**
- First response >4 hours for any ticket
- Response time increasing trend
- Weekend/off-hours delays >8 hours

---

### 6.4 Support Ticket Backlog

**What:** Number of open/unresolved tickets.

**Who:**
- Support leadership
- Operations (staffing decisions)
- Product (if bug-related)

**When:**
- **Daily:** Operations planning
- **End of week:** Backlog review
- **Staffing changes:** Monitor impact

**Data Source:** Support platform

**Calculation:** Count of open tickets at point in time

**Urgency Triggers:**
- Backlog >100 tickets (understaffed)
- Backlog growing for 5+ consecutive days
- Backlog of high-priority tickets >10

---

### 6.5 Customer Satisfaction Score (CSAT)

**What:** Direct customer rating of support interaction satisfaction.

**Who:**
- Support leadership
- Customer Success
- Support team performance

**When:**
- **Post-interaction:** After ticket resolution
- **Weekly:** Aggregate scores
- **By agent:** Performance tracking

**Data Source:** Support platform post-interaction surveys

**Calculation:** `(Satisfied Responses / Total Responses) × 100`

**Urgency Triggers:**
- CSAT below 80%
- CSAT declining for 2+ weeks
- Specific agent CSAT below 70%

---

## 7. Operational & Team Signals

### 7.1 Team Headcount

**What:** Total number of employees by department.

**Who:**
- CEO/Founders
- Finance/HR
- Department heads

**When:**
- **Always:** Basic organizational metric
- **Monthly:** Planning and forecasting
- **Pre-fundraise:** Burn rate planning

**Data Source:** HR system, payroll

**Calculation:** Count of active employees

**Urgency Triggers:**
- Headcount growth outpacing revenue growth 2:1
- High concentration in one department
- Hiring plan off track by >20%

---

### 7.2 Employee Net Promoter Score (eNPS)

**What:** Employee satisfaction and likelihood to recommend company as place to work.

**Who:**
- CEO/Founders
- HR/People Ops
- Leadership team

**When:**
- **Quarterly:** Sufficient frequency without fatigue
- **Post-onboarding:** 30-60 days for new hires
- **Exit surveys:** For departing employees

**Data Source:** Employee surveys

**Calculation:** `% Promoters (9-10) - % Detractors (0-6)`

**Urgency Triggers:**
- eNPS below 0
- eNPS declining by >15 points
- High detractor rate in key teams

---

### 7.3 Time to Hire

**What:** Average days from job posting to offer acceptance.

**Who:**
- HR/Recruiting
- Department heads
- CEO (growth velocity)

**When:**
- **Always:** Once actively hiring
- **Monthly:** Process optimization
- **By role:** Different pipelines

**Data Source:** ATS (Applicant Tracking System)

**Calculation:** `Average days from job posted to offer accepted`

**Urgency Triggers:**
- Time to hire >60 days (slow hiring)
- Time increasing trend (market competition)
- Critical roles unfilled >90 days

---

### 7.4 Revenue Per Employee

**What:** Total revenue divided by number of employees (efficiency metric).

**Who:**
- CEO/Founders
- Finance
- Investors/Board

**When:**
- **Quarterly:** Meaningful trends
- **Benchmarking:** Compare to peers
- **Growth stages:** Track efficiency

**Data Source:** Revenue data + headcount

**Calculation:** `Total Revenue / Total Headcount`

**Urgency Triggers:**
- Revenue per employee declining while scaling
- Below industry benchmarks ($150K+ for SaaS)

---

### 7.5 Gross Margin

**What:** Revenue minus cost of goods sold (COGS) as percentage of revenue.

**Who:**
- CFO/Finance
- CEO
- Investors

**When:**
- **Always:** Fundamental profitability metric
- **Monthly:** Track trends
- **New products:** Validate unit economics

**Data Source:** Financial statements

**Calculation:** `((Revenue - COGS) / Revenue) × 100`

**Urgency Triggers:**
- Gross margin below 70% (SaaS standard)
- Gross margin declining trend
- Gross margin below 30% (any business)

---

## 8. Technical & Infrastructure Signals

### 8.1 Application Uptime

**What:** Percentage of time application is available and functional.

**Who:**
- Engineering leadership
- CTO
- Operations/DevOps

**When:**
- **Always:** 24/7 monitoring
- **Real-time:** Immediate alerts
- **Monthly:** SLA tracking

**Data Source:** Monitoring tools (Datadog, New Relic, Sentry)

**Calculation:** `(Total Time - Downtime) / Total Time × 100`

**Urgency Triggers:**
- Uptime below 99.5% (SLA breach)
- Unplanned downtime >30 minutes
- Repeated outages in 7-day period

---

### 8.2 API Response Time

**What:** Average time for API endpoints to respond to requests.

**Who:**
- Engineering teams
- Product (performance issues)
- DevOps

**When:**
- **Always:** Continuous monitoring
- **Feature releases:** Performance testing
- **Scaling:** Infrastructure planning

**Data Source:** APM tools

**Calculation:** `Average response time across all API calls`

**Urgency Triggers:**
- Response time >500ms for core endpoints
- Response time degrading trend
- Timeout errors increasing

---

### 8.3 Error Rate

**What:** Percentage of requests that result in errors.

**Who:**
- Engineering teams
- Product leadership
- CTO

**When:**
- **Always:** Real-time monitoring
- **Releases:** Post-deployment tracking
- **Daily:** Review trends

**Data Source:** Error tracking (Sentry), logs

**Calculation:** `(Error Requests / Total Requests) × 100`

**Urgency Triggers:**
- Error rate >1%
- Error rate spike after deployment
- Critical errors affecting payments/data

---

### 8.4 Deployment Frequency

**What:** How often code is deployed to production.

**Who:**
- Engineering leadership
- CTO
- DevOps/Platform teams

**When:**
- **Always:** Engineering velocity metric
- **Weekly:** Process improvements
- **By team:** Compare efficiency

**Data Source:** CI/CD systems (GitHub Actions, CircleCI)

**Calculation:** Count of production deployments per time period

**Urgency Triggers:**
- Deployment frequency declining (slower velocity)
- >7 days between deployments (slow iteration)
- Deployment failures >20%

---

### 8.5 Mean Time to Recovery (MTTR)

**What:** Average time to restore service after an incident.

**Who:**
- Engineering leadership
- DevOps/Operations
- CTO

**When:**
- **Always:** Incident response metric
- **Post-incident:** Review and improve
- **Quarterly:** Process optimization

**Data Source:** Incident management tools (PagerDuty)

**Calculation:** `Average time from incident detection to resolution`

**Urgency Triggers:**
- MTTR >4 hours
- MTTR increasing trend
- Repeated incidents with slow recovery

---

## 9. Strategic Decision Signals

### 9.1 Market Share (Category/Niche)

**What:** Your company's revenue or users as percentage of total market.

**Who:**
- CEO/Founders
- Strategy teams
- Investors/Board

**When:**
- **Post-PMF:** Once you have traction
- **Quarterly:** Market tracking
- **Competitive analysis:** Strategic planning

**Data Source:** Industry reports, competitive intelligence

**Calculation:** `Your Revenue / Total Market Revenue × 100`

**Urgency Triggers:**
- Market share declining
- Competitor gaining share rapidly
- Market consolidation events

---

### 9.2 Feature Parity Gap

**What:** Number/percentage of competitor features you don't have.

**Who:**
- Product leadership
- CEO/Strategy
- Sales (competitive losses)

**When:**
- **Quarterly:** Competitive analysis
- **Lost deals:** Understand gaps
- **Product planning:** Roadmap prioritization

**Data Source:** Competitive research, sales feedback

**Calculation:** Manual tracking of feature comparison matrix

**Urgency Triggers:**
- Losing deals to feature gaps
- Critical features missing that competitors have
- Feature parity declining over time

---

### 9.3 Customer Concentration Risk

**What:** Percentage of revenue from top customers (e.g., top 5 or top 10).

**Who:**
- CEO/Founders
- CFO/Finance
- Board members

**When:**
- **Always:** Risk management
- **Monthly:** Track trends
- **Large deals:** Immediate assessment

**Data Source:** Billing system, revenue reports

**Calculation:** `(Revenue from Top N Customers / Total Revenue) × 100`

**Urgency Triggers:**
- Top 5 customers >50% of revenue (high risk)
- Single customer >25% of revenue
- Top customer concentration increasing

---

## 10. Cross-Functional Composite Signals

### 10.1 Product-Market Fit Score

**What:** Composite metric indicating product-market fit strength.

**Who:**
- CEO/Founders
- Product leadership
- Investors

**When:**
- **Pre-PMF:** Track progress
- **Monthly:** Understand momentum
- **Pivots:** Validate direction

**Data Source:** User surveys + retention + growth metrics

**Calculation:** Sean Ellis survey: "How would you feel if you could no longer use this product?"
- >40% answering "Very disappointed" = PMF

**Urgency Triggers:**
- PMF score declining
- PMF score <30% (no PMF)

---

### 10.2 Growth Efficiency Score

**What:** How efficiently you convert spend into growth (e.g., LTV:CAC, Magic Number).

**Who:**
- CEO/Founders
- CFO
- Growth teams

**When:**
- **Growth stage:** Critical metric
- **Quarterly:** Strategic assessment
- **Fundraising:** Key investor metric

**Data Source:** Multiple sources (CAC, LTV, revenue, marketing spend)

**Calculation:** Multiple approaches:
- LTV:CAC ratio (target 3:1)
- Magic Number: `(ARR Growth / Sales & Marketing Spend)`

**Urgency Triggers:**
- LTV:CAC below 2:1 (inefficient growth)
- Magic Number below 0.75 (slow payback)

---

### 10.3 Operational Burnout Index

**What:** Composite score indicating team stress/burnout risk.

**Who:**
- CEO/Founders
- HR/People Ops
- Leadership team

**When:**
- **Always:** Prevention is key
- **High-growth periods:** Monitor closely
- **Post-crunch:** Recovery tracking

**Data Source:** Multiple sources:
- Working hours/overtime
- PTO utilization
- eNPS scores
- Turnover rates
- Support ticket volume per employee

**Calculation:** Weighted score across factors

**Urgency Triggers:**
- High overtime for >4 consecutive weeks
- PTO utilization <50% of allocation
- eNPS declining + turnover increasing

---

## Signal Priority Matrix

### Tier 1: Non-Negotiable (Track Regardless of Stage)
1. Cash Runway
2. MRR / Revenue
3. Customer Churn Rate
4. Gross Margin
5. MAU (for product-led)

### Tier 2: Post-PMF Essentials
1. MRR Growth Rate
2. NRR
3. CAC & CAC Payback
4. Sales Pipeline Value
5. DAU/MAU Ratio
6. Customer Health Score

### Tier 3: Scaling & Optimization
1. Win Rate
2. Pipeline Velocity
3. Feature Adoption Rate
4. Support Metrics
5. Revenue per Employee
6. Deployment Frequency

### Tier 4: Strategic & Advanced
1. Market Share
2. Growth Efficiency Score
3. Customer Concentration Risk
4. Operational Burnout Index

---

## Signal Selection Guide

### Pre-Product Market Fit (PMF)
**Focus:** Validation and learning
- Product engagement (DAU, MAU)
- Time to Value
- Customer satisfaction (NPS, CSAT)
- Cash Runway
- Feature adoption

### Post-PMF / Early Growth
**Focus:** Repeatability and efficiency
- MRR and growth rate
- Customer acquisition (CAC, payback)
- Customer retention (churn, NRR)
- Sales pipeline
- Gross margin

### Scaling Stage
**Focus:** Optimization and predictability
- All growth signals
- Operational efficiency (revenue per employee)
- Team health (eNPS, burnout)
- Technical infrastructure
- Cross-functional composite metrics

---

## Implementation Notes

**Data Quality Requirements:**
- Each signal needs minimum data thresholds (e.g., 30 data points for trends)
- Calculated signals require accurate source data
- Cross-platform signals need data normalization

**Frequency Recommendations:**
- Real-time: Uptime, error rate, critical incidents
- Daily: Support tickets, DAU, cash balance
- Weekly: MQLs, pipeline, feature adoption
- Monthly: Churn, NRR, CAC, financial metrics
- Quarterly: Strategic signals, NPS, market analysis

**Alert Fatigue Prevention:**
- Prioritize signals by business stage
- Set appropriate thresholds (not too sensitive)
- Combine related signals into digests
- Escalation paths (warning → urgent → critical)

---

**End of Signal Catalog**
