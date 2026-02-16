CAMINO PRODUCT ROADMAP
Organised by Modular Area
AI Expert Panel Recommendations | February 2026

Each recommendation is mapped to one of 5 modular areas and one of 4 goals. This makes it easy to see what changes in each layer of the system at each stage of growth.

The 5 modules:
- UNDERSTANDING: How the system learns about the user, their role, their business, and what they care about.
- DATA IN: How data enters the system, gets parsed, mapped, and normalised.
- SIGNAL CALCS: How signals are calculated, validated, and scored for confidence.
- INTERPRETATION: How the AI turns numbers into personalised, actionable insight.
- PRESENTATION: How signals and insights are shown to the user.


================================================================================
GOAL 1: START CHARGING
================================================================================
Timeline: Month 1 (4 weeks)
Objective: Close first paying customer (Locumate). Surge logs in, sees correct numbers from his own data, and says "I'll pay."


UNDERSTANDING
-------------

1.1  Create 3 user accounts with role-based profiles
     Create accounts for CEO (Surge), CS Manager, Ops Manager. Each has a role, KPIs, and business context stored in their profile.
     Why: The system needs to know WHO is looking at the data before it can decide WHAT to show them and HOW to explain it. Role is the most basic unit of personalisation. (Sam, CTO)

1.2  Store user's requested KPIs from onboarding
     The KPIs each user asked for (e.g. Surge: win rate, leads per month, sales) are stored and used to drive signal priority and AI prompts.
     Why: Showing what they asked for first proves you listened. This is the foundation of trust at the billing gate. (Sam)


DATA IN
-------

1.3  Hardcode column mappings for Locumate's Zoho data
     Map exact column names: "Amount" (AUD prefix) to deal_value, "Stage" to stage, "Closing Date" (DD/MM/YYYY) to close_date, "Sales Cycle Duration" (integer days) to sales_cycle, "Resolution Time in Business Hours" ("X days HH:MM hrs") to resolution_time, "Is Converted" (Yes/No) to is_converted.
     Why: The first customer's data has specific quirks. These must be handled correctly before demo day. A wrong number from a parsing error kills credibility. (Jordan, Alex)

1.4  Filter out non-real tickets
     Exclude 21 "Policy acknowledgment required" tickets from all ticket calculations. These are automated system messages.
     Why: Including them inflates volume by ~0.5% and distorts resolution time averages. The CS Manager will immediately spot the mismatch. (Alex)

1.5  Admin upload-on-behalf flow
     Admin selects an org, uploads CSVs, answers the 3 questions, verifies generated signals, flags anything incorrect.
     Why: You're the only admin. This flow is the human bridge that makes MSS work. It needs to be fast and reliable. (CTO)


SIGNAL CALCS
------------

1.6  Lock to 7 signals, remove everything else
     Cut from 93 signal definitions to exactly 7: Pipeline Value, Win Rate, Closed Revenue, Avg Sales Cycle, Ticket Volume, Avg Resolution Time, Lead Conversion Rate. Every signal has an explicit calcSpec.
     Why: Showing 20 signals where 5 are wrong destroys trust. Fewer, correct signals beats more, mediocre ones. (CTO, Alex)

1.7  Fix Win Rate calculation
     Win Rate = COUNT("Closed Won") / COUNT("Closed Won" + "Closed - No Budget"). "Closed - No Budget" means lost.
     Why: Win rate was the first KPI the customer asked for. If this number is wrong, the entire product loses credibility. (Alex)

1.8  Add confidence scoring to every signal
     Each signal gets: high (30+ data points, 90%+ coverage), medium (10-29, 70-89%), low (5-9, 50-69%), insufficient (<5, don't show).
     Why: A half-day addition that protects you from showing bad numbers. If the CEO asks "how did you calculate this?" you need a clear answer. (Alex)

1.9  Validate every signal against manual spreadsheet
     Before demo day, cross-check each signal against a manual calculation in a spreadsheet using the same CSV data. Numbers must match exactly.
     Why: If Pipeline Value says $450K and Surge's Zoho says $430K, the conversation is over. (Alex)


INTERPRETATION
--------------

1.10 Wire user context into AI interpretation
     Pass role, KPIs, business context, and upcoming priorities into the AI prompt. CEO sees pipeline-focused commentary. CS Manager sees ticket-focused commentary.
     Why: Generic AI commentary is the difference between a reporting tool and an advisor worth paying for. Personalisation is what makes Surge say "this gets me." (Sam, Morgan)

1.11 Auto-trigger interpretation after calculation
     Remove the manual step where admin triggers AI interpretation separately. Interpretation generates automatically after signal calculation.
     Why: Extra manual steps slow onboarding and create gaps. The admin flow needs to be lean since you're the only admin. (CTO)

1.12 Per-metric opportunities and risks
     Each signal gets its own opportunities and risks. Win Rate opportunities: "strong close rate, codify your winning process." Win Rate risks: "small sample size, key person dependency."
     Why: The customer isn't paying for numbers. They're paying for what the numbers mean. This is the "advisor" layer. (Sam)


PRESENTATION
------------

1.13 Show user's requested KPIs first
     Default "My KPIs" filter to ON. Signals the user asked for appear at the top, prominently. Everything else is secondary.
     Why: Trust is established when the customer sees you listened. Win rate first if they asked for win rate. (Sam)

1.14 Show the formula for every signal
     Display "Win Rate = 8 won / 12 closed = 66.7%." Use the existing formula field prominently.
     Why: Transparency builds trust. Surge will cross-check against Zoho. A visible, correct formula builds confidence. A hidden one creates suspicion. (Alex)

1.15 Role-based signal visibility
     CEO sees: Pipeline Value, Win Rate, Closed Revenue, Avg Sales Cycle. CS Manager sees: Ticket Volume, Avg Resolution Time. Ops Manager sees: Ticket Volume, Lead Conversion Rate.
     Why: Showing a CS Manager pipeline value is noise. Each user only sees what's relevant to their role. (Sam)


================================================================================
GOAL 2: RETAIN FIRST CUSTOMER FOR 3 MONTHS
================================================================================
Timeline: Month 2-3
Objective: Locumate stays subscribed. The product becomes part of their weekly routine.


UNDERSTANDING
-------------

2.1  Expand onboarding profile
     Add: upcoming priorities (free text, e.g. "hit $500K revenue in Q2"), business context (industry, stage, team size). Wire into AI prompts.
     Why: "Your pipeline of $450K needs to grow to $1.5M to hit your stated Q2 target at your current win rate" retains a customer. Generic commentary doesn't. (Sam)

2.2  Evolving signal recommendations
     As data accumulates (3+ months), recommend trend-based signals. Store in a signal_recommendations table (org_id, signal_id, reason, recommended_at).
     Why: The signals that matter change as data matures. Month 1: raw values. Month 3: trends. Month 6: patterns. The product should evolve with the customer. (Sam)


DATA IN
-------

2.3  Persist column mappings per org
     Store confirmed mappings in a column_mappings table (org_id, source_name, field_name, column_name). Re-uploads auto-apply saved mappings.
     Why: Without saved mappings, you repeat the 3-question flow every monthly re-upload. Also establishes the pattern for customer #2. (Jordan)


SIGNAL CALCS
------------

2.4  Calculate period-over-period change
     Store previous values on re-upload. Show "Win Rate: 66.7%, up from 55% last month."
     Why: Static numbers get stale. The customer checked last month. This month they need to know what changed. This is what makes them come back. (Sam, Alex)

2.5  Hardcode industry benchmarks for the 7 signals
     Typical B2B SaaS: win rate 20-30%, sales cycle 30-90 days, first response under 4 hours, lead conversion 10-15%.
     Why: "Your win rate is 66.7%" is informative. "66.7% is significantly above the B2B SaaS average of 25%" is compelling. Benchmarks add context. (Sam, Alex)


INTERPRETATION
--------------

2.6  Recommend 1-2 signals beyond what they asked for
     After showing requested KPIs, suggest additional signals with a one-sentence rationale: "We noticed 85% of deals are owned by one person. Tracking deals by owner could surface a key-person dependency."
     Why: This graduates Camino from reporting tool to advisor. Every suggestion must answer "what decision does this inform?" Never more than 2. (Sam)

2.7  Add org-level synthesis section
     A single AI-generated summary that synthesises all signals: "Your high win rate combined with moderate pipeline coverage suggests a volume opportunity. Focus on lead generation rather than sales process."
     Why: Per-metric analysis is useful daily. Monthly, the CEO wants the big picture. Only show if 3+ signals have high confidence. (Sam)


PRESENTATION
------------

2.8  Show period-over-period change visually
     Display trend arrows, percentage change, and mini sparklines alongside each signal value.
     Why: A number with direction ("66.7%, up 12%") is immediately actionable. A number alone ("66.7%") requires the user to remember what it was last month. (UX Designer)

2.9  Show benchmark context alongside values
     Display "66.7% (industry avg: 25%)" next to each signal that has a benchmark.
     Why: Benchmarks without visual placement are easy to miss. Putting them inline with the signal gives immediate context. (UX Designer, Sam)


================================================================================
GOAL 3: WIN AND DELIVER VALUE TO FIRST 5 CUSTOMERS
================================================================================
Timeline: Month 3-4
Objective: Onboard 4 more customers from different companies. Prove the product works beyond one customer.


UNDERSTANDING
-------------

3.1  Confidence scoring in lead magnet
     High confidence signals shown prominently. Medium with a flag. Low with a warning. Insufficient replaced with "Upload more records to see this signal."
     Why: A lead magnet that shows wrong numbers to strangers is worse than no lead magnet. Confidence scoring protects your reputation with people who have no reason to give you the benefit of the doubt. (Alex)


DATA IN
-------

3.2  Pre-built column mapping templates per tool
     Create templates: "Zoho CRM Deals", "HubSpot Deals", "Salesforce Opportunities", "Zoho Desk Tickets", "Zendesk Tickets." Admin selects a template.
     Why: By customer #3 you've seen Zoho twice. By #5, possibly HubSpot. Templates make onboarding 2 minutes instead of 10. Each tool becomes a reusable template. (Jordan)

3.3  Auto-detect source tool from column headers
     Zoho, HubSpot, Salesforce have distinctive column names. Auto-detect and pre-select the mapping template.
     Why: Reduces admin effort per onboarding. When managing 5 customers solo, every saved minute compounds. Also a prerequisite for the self-service lead magnet. (Jordan, CTO)

3.4  Support HubSpot and Salesforce column naming
     Expand FIELD_ALIASES for HubSpot (amount, dealstage, closedate, hubspot_owner_id) and Salesforce (Amount, StageName, CloseDate, Owner.Name). Test with actual exports.
     Why: Customers #2-5 will likely use different CRMs. The universal schema handles this through aliases, but you need to verify with real exports. (Jordan)

3.5  Lead magnet restrictions
     CSV/XLSX only, max 10MB, 3 row types (deals, leads, tickets), minimum 5 rows. Auto-map via FIELD_ALIASES. Helpful error messages that guide users.
     Why: Tight restrictions communicated as guidance feel professional. 80% of users will have a perfect experience. An unrestricted tool that breaks on edge cases damages your brand. (Jordan, UX Designer)


SIGNAL CALCS
------------

3.6  Same 7 signals work for all 5 customers
     The calcSpecs are tool-agnostic. They reference deal_value, stage, close_date, not "Amount" or "Stage." Column resolution happens at the data-in layer.
     Why: This is the payoff of the universal schema. You don't write new calculation code for each customer. You just map their columns to the normalised fields. (Jordan, CTO)


INTERPRETATION
--------------

3.7  Lead magnet AI interpretation (lighter version)
     Show a condensed version of the AI interpretation in the lead magnet. 2-3 sentences per signal, not the full 5-section analysis. End with "Get the full analysis" CTA.
     Why: The lead magnet needs to show enough value to convert, but hold back enough to justify signing up. The full interpretation is the premium product. (Product Manager, Sam)


PRESENTATION
------------

3.8  Build the self-service lead magnet
     Public /try route, no auth. Upload + 3 questions. Generate signals for a temp org. Show results with "Book a demo" CTA. Email capture after results. Auto-expire after 7 days.
     Why: You've validated with paying customers. You know which signals resonate. Now convert strangers into prospects. Estimated 5-7 days of work. (CTO, Product Manager)


================================================================================
GOAL 4: WIN CUSTOMERS 5-50 FROM VARYING SEGMENTS AND TOOLS
================================================================================
Timeline: Month 5-8
Objective: Scale beyond manual onboarding. Support diverse tools, data shapes, and business types.


UNDERSTANDING
-------------

4.1  Self-service onboarding (no admin required)
     New customers sign up, upload data, answer 3 questions, see signals immediately. Admin becomes exception handling only.
     Why: At 30+ customers, admin-assisted onboarding doesn't scale. The lead magnet was the prototype. Now make it the default path. (CTO, Product Manager)

4.2  Segment-specific signal packs
     Pre-built signal sets per vertical: Health-tech Pack, Professional Services Pack, SaaS Pack. Each includes 7-10 signals plus industry-specific benchmarks.
     Why: "Built for health-tech companies like you" converts better than "works for everyone." Also makes sales conversations faster. (Sam, Product Manager)

4.3  Role-based dashboard templates
     Pre-built layouts: CEO Dashboard (pipeline, revenue, win rate, risks), Sales Manager Dashboard (deals by owner, cycle, pipeline by stage), CS Dashboard (tickets, resolution, SLA, satisfaction).
     Why: At scale, the signals page becomes cluttered. Role-based dashboards give each user a curated view matching their job. (Sam, UX Designer)


DATA IN
-------

4.4  API integrations (Zoho, HubSpot, Salesforce)
     Replace CSV upload with direct API connections. Pull data on a schedule (daily/weekly). No more manual exports.
     Why: At 10+ customers, monthly CSV re-uploads become unsustainable. API integrations make the product self-service and enable automatic signal refresh. (CTO)

4.5  Expand to new entity types
     Add: Customers/Accounts (retention, churn), Subscriptions/Invoices (MRR, revenue), Activities (engagement). Each needs: universal schema, FIELD_ALIASES, 3-5 signal definitions.
     Why: At 20+ customers, some need metrics beyond deals/leads/tickets. "Customer retention rate" needs subscription data. Expand based on demand, not preemptively. (Jordan, Sam)

4.6  Custom signal builder
     Advanced users define custom signals: choose operation (count, sum, average, rate), select columns, set filters, name it. Stored as custom calcSpec per org.
     Why: At 30+ customers across industries, some need unique metrics. Rather than adding to the global catalog for every request, let them build their own. Reduces support burden. (CTO, Jordan)


SIGNAL CALCS
------------

4.7  Multi-source signal correlation
     Combine data across sources: "When lead volume increases, win rate decreases, suggesting sales team is capacity-constrained."
     Why: Single-source signals are table stakes. Connecting deals + leads + tickets reveals strategic insights that justify a premium price. (Sam, CTO)

4.8  Customer-derived benchmarks
     Replace hardcoded benchmarks with anonymised aggregates from all Camino customers. "Your win rate is in the top 15% of B2B SaaS on Camino."
     Why: At 20+ customers you have enough data. This is a powerful differentiator and retention mechanism since customers track their ranking. (Sam, Alex)


INTERPRETATION
--------------

4.9  Weekly brief / focus brief
     Auto-generated weekly email or in-app summary: "3 most important signals this week, what changed, what to do." Personalised per role.
     Why: Not every user logs in weekly. A push mechanism keeps the product in their workflow. This is the retention mechanism at scale. (Morgan, Sam)


PRESENTATION
------------

4.10 Role-based dashboard views
     Each role gets a default dashboard layout. CEO sees a strategic overview. Sales sees pipeline detail. CS sees ticket health.
     Why: Reduces cognitive load and increases engagement. Users see a view that matches their job, not a wall of every signal. (UX Designer, Sam)


================================================================================
WHAT NOT TO BUILD (AND WHY)
================================================================================

Progressive Signal Discovery
Automatically discovering new signals from data without user input. Accuracy matters more than volume. Better to have 7 reliable signals than 20 auto-discovered wrong ones. Revisit at 50+ customers. (Alex, CTO)

AI Chat Interface
Conversational Q&A about data. Adds complexity without billing value. Users want answers, not a chat. The 5-section analysis already provides answers. Revisit if customers request it. (Product Manager, Sam)

Real-Time Data Sync
Continuous sync with CRM APIs. SMB data doesn't change fast enough. Daily/weekly refresh is sufficient. Real-time adds cost and complexity. Revisit for enterprise tier. (CTO, Jordan)

White-Label / Reseller Model
Let agencies resell Camino. A distribution strategy, not a product feature. Focus on direct customers first. Revisit at 100+ customers. (Sam, Product Manager)

Mobile App
Native iOS/Android. The web app works on mobile. A native app doubles maintenance with no proven demand. Revisit only if 50%+ of traffic is mobile. (CTO, UX Designer)


================================================================================
MODULE SUMMARY: WHAT CHANGES WHERE, BY GOAL
================================================================================

UNDERSTANDING
  Goal 1: User roles, stored KPIs
  Goal 2: Expanded profiles, evolving recommendations
  Goal 3: Confidence scoring for strangers
  Goal 4: Self-service onboarding, segment packs, role dashboards

DATA IN
  Goal 1: Hardcoded Zoho mappings, ticket filtering, admin upload
  Goal 2: Persisted column mappings
  Goal 3: Tool templates, auto-detection, HubSpot/Salesforce aliases, lead magnet restrictions
  Goal 4: API integrations, new entity types, custom signal builder

SIGNAL CALCS
  Goal 1: 7 locked signals, Win Rate fix, confidence scoring, manual validation
  Goal 2: Period-over-period change, benchmarks
  Goal 3: Same 7 signals for all customers (universal schema payoff)
  Goal 4: Multi-source correlation, customer-derived benchmarks

INTERPRETATION
  Goal 1: User-context AI prompts, auto-trigger, per-metric opps/risks
  Goal 2: Suggested signals (max 2), org-level synthesis
  Goal 3: Lighter lead magnet interpretation
  Goal 4: Weekly briefs

PRESENTATION
  Goal 1: My KPIs first, visible formulas, role-based visibility
  Goal 2: Trend arrows, benchmark context
  Goal 3: Self-service lead magnet UI
  Goal 4: Role-based dashboards
