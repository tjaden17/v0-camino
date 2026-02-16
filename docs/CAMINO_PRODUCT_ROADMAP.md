CAMINO PRODUCT ROADMAP
AI Expert Panel Recommendations
February 2026


GOAL 1: START CHARGING
Timeline: Month 1 (4 weeks)
Objective: Close first paying customer (Locumate). Surge logs in, sees correct numbers from his own data, and says "I'll pay."


1.1 Lock to 7 Signals, Remove Everything Else
Cut from 93 signal definitions to exactly 7: Pipeline Value, Win Rate, Closed Revenue, Avg Sales Cycle, Ticket Volume, Avg Resolution Time, Lead Conversion Rate. Every signal has an explicit calcSpec with exact column mappings.
Why now: The current system generates too many unreliable signals. Showing 20 signals where 5 are wrong destroys trust. Fewer, correct signals beats more, mediocre ones. This is the billing gate. (CTO, Alex)

1.2 Hardcode Column Mappings for Locumate's Zoho Data
Map exact column names from their exports: "Amount" (with AUD prefix) to deal_value, "Stage" to stage, "Closing Date" (DD/MM/YYYY) to close_date, "Sales Cycle Duration" (integer days) to sales_cycle, "Resolution Time in Business Hours" ("X days HH:MM hrs" format) to resolution_time, "Is Converted" (Yes/No) to is_converted.
Why now: The first customer's data has specific quirks (AUD-prefixed amounts, mixed date formats, pre-calculated duration fields). These must be handled correctly before demo day. (Jordan, Alex)

1.3 Fix Win Rate Calculation
Win Rate = COUNT(Stage = "Closed Won") / COUNT(Stage IN "Closed Won" OR "Closed - No Budget"). "Closed - No Budget" means lost. No other closed-lost stages exist in their data.
Why now: Win rate was the first KPI the customer asked for. If this number is wrong, the entire product loses credibility. (Alex)

1.4 Filter Out Non-Real Tickets
Exclude 21 "Policy acknowledgment required" tickets from all ticket calculations. These are automated system messages, not real support interactions.
Why now: Including these inflates ticket volume by ~0.5% and distorts resolution time averages. The CS Manager will immediately spot that the number doesn't match their experience. (Alex)

1.5 Wire User Context into AI Interpretation
Pass user profile data (role, KPIs, business context, upcoming priorities) into the AI prompt. CEO sees "your pipeline is AUD $450K with a 66.7% win rate" not "pipeline value is $450K." CS Manager sees ticket-focused commentary, not sales commentary.
Why now: Generic AI commentary is the difference between a reporting tool and an advisor worth paying for. Personalisation is what makes Surge say "this gets me." (Sam, Morgan)

1.6 Auto-Trigger Interpretation After Calculation
Remove the manual step where admin triggers AI interpretation separately. When signals are calculated, interpretation generates automatically.
Why now: Extra manual steps slow down onboarding and create opportunities for things to be missed. The admin flow needs to be as lean as possible since you're the only admin. (CTO)

1.7 Create 3 User Accounts with Role-Based Signal Visibility
CEO (Surge): Pipeline Value, Win Rate, Closed Revenue, Avg Sales Cycle. CS Manager: Ticket Volume, Avg Resolution Time. Ops Manager: Ticket Volume, Lead Conversion Rate.
Why now: Each user should only see signals relevant to their role. Showing a CS Manager pipeline value is noise. Role-based filtering is what makes this feel personalised rather than generic. (Sam)

1.8 Show User's Requested KPIs First
Default the "My KPIs" filter to ON. The signals the user asked for during onboarding appear at the top, prominently. Everything else is secondary.
Why now: The customer needs to see that you listened. If Surge asked for "win rate" and the first thing he sees is win rate, trust is established. (Sam)

1.9 Add Confidence Scoring to Every Signal
Each signal gets a confidence field: high (30+ data points, 90%+ coverage), medium (10-29 data points, 70-89% coverage), low (5-9 data points, 50-69% coverage), insufficient (fewer than 5, don't show). Never show a number you can't defend.
Why now: A half-day addition that protects you from showing bad numbers. If the CEO asks "how did you calculate this?" you need a clear answer. (Alex)

1.10 Show the Formula for Every Signal
Display "how this was calculated" for each signal: "Win Rate = 8 deals won / 12 total closed deals = 66.7%." Use the existing formula field prominently.
Why now: Transparency builds trust. Surge will cross-check against Zoho. If the formula is visible and correct, he'll trust the system. If it's hidden, he'll assume something is wrong. (Alex)

1.11 Per-Metric Opportunities and Risks
Each signal gets its own opportunities and risks sections. Win Rate opportunities: "strong close rate, codify your winning sales process." Win Rate risks: "small sample size (12 deals), key person dependency (Surge owns 85% of deals)."
Why now: This is the "advisor" layer that differentiates Camino from a dashboard. The customer isn't paying for numbers, they're paying for what the numbers mean. (Sam)

1.12 Admin Upload-on-Behalf Flow
Admin can select an org, upload CSVs, answer the 3 questions, verify generated signals, and flag anything incorrect. Admin-only, not user-facing.
Why now: You're the only admin. The flow needs to be fast and reliable so you can onboard customers without friction. The admin flow is the human bridge that makes MSS work at this stage. (CTO)

1.13 Validate Every Signal Against Manual Spreadsheet Calculation
Before demo day, cross-check each of the 7 signals against a manual calculation in a spreadsheet using the same CSV data. The numbers must match exactly.
Why now: If Pipeline Value in the app says $450K and Surge's Zoho says $430K, the conversation is over. Accuracy is non-negotiable for the billing gate. (Alex)


GOAL 2: RETAIN FIRST CUSTOMER FOR 3 MONTHS
Timeline: Month 2-3
Objective: Locumate stays subscribed. The product becomes part of their weekly routine. Each user checks their signals regularly.


2.1 Persist Column Mappings Per Org
Store confirmed column mappings in a column_mappings database table (org_id, source_name, field_name, column_name). On re-upload, auto-apply saved mappings instead of asking the 3 questions again.
Why now: You'll re-upload Locumate's data monthly. Without saved mappings, you repeat the 3-question flow every time. This also establishes the pattern for scaling to customer #2. (Jordan)

2.2 Calculate Period-Over-Period Change
Store previous period values when re-uploading data. Show "Win Rate: 66.7%, up from 55% last month" instead of just "Win Rate: 66.7%."
Why now: Static numbers get stale. The customer checked their signals last month. This month, they need to know what changed and whether things are getting better or worse. This is what makes them come back. (Sam, Alex)

2.3 Hardcode Industry Benchmarks for the 7 Signals
Add benchmarks: typical B2B SaaS win rate is 20-30%, typical sales cycle is 30-90 days, typical first response time is under 4 hours, typical lead conversion is 10-15%.
Why now: "Your win rate is 66.7%" is informative. "Your win rate is 66.7%, which is significantly above the B2B SaaS average of 25%" is compelling. Benchmarks add context that makes the AI interpretation much more valuable. (Sam, Alex)

2.4 Expand Onboarding Profile
Add to user profile: upcoming priorities (free text, e.g. "hit $500K revenue in Q2"), business context (industry dropdown, company stage, team size). Wire these into AI prompts.
Why now: The more context the AI has, the more personalised and useful the interpretation becomes. "Your pipeline of $450K needs to grow to $1.5M to hit your stated Q2 target of $500K at your current win rate" is the kind of insight that retains a customer. (Sam)

2.5 Recommend 1-2 Signals Beyond What They Asked For
After showing the customer's requested KPIs, suggest 1-2 additional signals with a one-sentence rationale. "We noticed 85% of your deals are owned by one person. Tracking deals by owner could help identify a key-person dependency."
Why now: This is how you graduate from reporting tool to advisor. The customer sees signals they didn't know they needed. Every suggestion must answer "what decision does this inform?" Never suggest more than 2. (Sam)

2.6 Add Org-Level Synthesis Section
A single AI-generated summary at the top of the signals page that synthesises all signals together: "Your high win rate (66.7%) combined with moderate pipeline coverage (2.5x) suggests a volume opportunity. Focus on lead generation rather than improving sales process."
Why now: Per-metric analysis is useful for daily check-ins. But once a month, the CEO wants to see the big picture. Cross-signal patterns reveal strategic insights that individual metrics miss. Only show this if at least 3 signals have high confidence. (Sam)

2.7 Evolving Signal Recommendations
As more data accumulates (3+ months), start recommending trend-based signals: "Win rate trend (3-month rolling average)", "Seasonal pipeline patterns." Store recommendations in a signal_recommendations table (org_id, signal_id, reason, recommended_at).
Why now: The signals that matter change as data matures. In month 1, raw values are useful. In month 3, trends are more valuable. In month 6, patterns emerge. The product should evolve with the customer's data maturity. (Sam)


GOAL 3: WIN AND DELIVER VALUE TO FIRST 5 CUSTOMERS
Timeline: Month 3-4
Objective: Onboard 4 more customers from different companies. Prove the product works beyond one customer.


3.1 Pre-Built Column Mapping Templates Per Tool
Create templates: "Zoho CRM Deals", "HubSpot Deals", "Salesforce Opportunities", "Zoho Desk Tickets", "Zendesk Tickets." Admin selects a template instead of mapping columns manually.
Why now: By customer #3 you'll have seen Zoho twice. By customer #5 you might see HubSpot or Salesforce. Templates make onboarding take 2 minutes instead of 10. Each new tool you encounter becomes a reusable template. (Jordan)

3.2 Auto-Detect Source Tool from Column Headers
Zoho, HubSpot, and Salesforce exports have distinctive column naming patterns. Auto-detect the source tool and pre-select the mapping template.
Why now: Reduces admin effort per onboarding. When you're managing 5 customers solo, every minute saved compounds. Also a prerequisite for the self-service lead magnet. (Jordan, CTO)

3.3 Build the Self-Service Lead Magnet
Add a public /try route (no auth required). Reuse the upload + 3-question flow. Generate signals for a temporary org (UUID). Show results with a "Book a demo" CTA. Add email capture after showing results. Auto-expire temp data after 7 days.
Why now: You've validated the value prop with paying customers. You know which signals resonate and which data formats work. Now you can confidently build a self-service experience that converts strangers into prospects. Estimated 5-7 days of work. (CTO, Product Manager)

3.4 Lead Magnet Restrictions
Restrict to: CSV/XLSX only, max 10MB, 3 row types (deals, leads, tickets), minimum 5 data rows. Auto-map columns via FIELD_ALIASES (300+ variations already supported). Graceful degradation for edge cases. Helpful error messages that guide users to fix their data rather than just saying "error."
Why now: An unrestricted lead magnet will break on weird data and damage your brand. Tight restrictions communicated as guidance ("Upload your Deals export") feel professional. 80% of users will have a perfect experience, 15% will need minor guidance, 5% will hit genuine failures. (Jordan, UX Designer)

3.5 Confidence Scoring in Lead Magnet
High confidence signals shown prominently. Medium confidence shown with a flag ("Limited data, this metric may be less reliable"). Low confidence shown with a warning. Insufficient data not shown at all, replaced with "Upload more records to see this signal."
Why now: A lead magnet that shows wrong numbers to a prospect is worse than no lead magnet. Confidence scoring protects your reputation with strangers who have no reason to give you benefit of the doubt. (Alex)

3.6 Support HubSpot and Salesforce Column Naming
Expand FIELD_ALIASES to cover HubSpot (amount, dealstage, closedate, hubspot_owner_id, hs_lead_status) and Salesforce (Amount, StageName, CloseDate, Owner.Name, LeadSource). Test with actual HubSpot and Salesforce exports.
Why now: Customers #2-5 are likely to use different CRM tools. The universal schema handles this automatically through FIELD_ALIASES, but you need to verify with real exports, not just assumed column names. (Jordan)


GOAL 4: WIN CUSTOMERS 5-50 FROM VARYING SEGMENTS AND TOOLS
Timeline: Month 5-8
Objective: Scale beyond manual onboarding. Support diverse tools, data shapes, and business types. Build operational efficiency.


4.1 API Integrations (Zoho, HubSpot, Salesforce)
Replace CSV upload with direct API connections. Pull data automatically on a schedule (daily/weekly). No more manual exports and re-uploads.
Why now: At 10+ customers, monthly CSV re-uploads become unsustainable. API integrations make the product self-service and enable automatic signal refresh. Start with Zoho (existing customer), then HubSpot (largest market), then Salesforce (enterprise). (CTO)

4.2 Multi-Source Signal Correlation
Combine data across sources: "When lead volume from marketing increases, win rate decreases, suggesting the sales team is capacity-constrained." Requires a signal_relationships table and cross-signal analysis in the AI prompt.
Why now: Single-source signals are table stakes at this point. The real insight comes from connecting deals + leads + tickets together. "Your ticket volume spiked 30% last month AND your lead conversion dropped. Your team may be spending support time instead of selling." This is the insight that justifies a premium price. (Sam, CTO)

4.3 Weekly Brief / Focus Brief
Auto-generated weekly email or in-app summary: "Here are your 3 most important signals this week, what changed, and what to do about it." Personalised per user role.
Why now: Not every user will log in weekly. A push notification (email brief) keeps the product in their workflow even when they don't actively use it. This is the retention mechanism at scale. (Morgan, Sam)

4.4 Expand to New Entity Types
Add support for: Customers/Accounts (for retention and churn analysis), Subscriptions/Invoices (for MRR and revenue analytics), Activities (for engagement tracking). Each new entity needs: universal schema definition (12-15 fields), FIELD_ALIASES for common tools, 3-5 new signal definitions.
Why now: At 20+ customers, some will ask for metrics you can't calculate from deals/leads/tickets alone. "Customer retention rate" needs subscription data. "Employee productivity" needs activity data. Expand entity types based on demand, not preemptively. (Jordan, Sam)

4.5 Customer-Derived Benchmarks
Replace hardcoded industry benchmarks with anonymised, aggregate benchmarks calculated across all Camino customers. "Your win rate of 66.7% is in the top 15% of B2B SaaS companies on Camino."
Why now: At 20+ customers, you have enough data to calculate meaningful benchmarks. This is a powerful differentiator: "We don't just show your metrics, we show how you compare to similar companies." Also a retention mechanism since customers want to track their ranking over time. (Sam, Alex)

4.6 Self-Service Onboarding (No Admin Required)
New customer signs up, uploads their own data, answers the 3 questions, sees signals immediately. No admin involvement. Column mappings auto-detected or confirmed by the user. Template library for common tools.
Why now: At 30+ customers, admin-assisted onboarding doesn't scale. The lead magnet (Goal 3.3) was the prototype for this. Now make it the primary onboarding path. Admin becomes exception handling only. (CTO, Product Manager)

4.7 Custom Signal Builder
Let advanced users (or admin) define custom signals: choose an operation (count, sum, average, rate), select columns, set filters, name the signal. Store as a custom calcSpec per org.
Why now: At 30+ customers across different industries, some will need metrics you haven't pre-defined. Rather than adding signals to the global catalog for every request, let them build their own. This also reduces your support burden. (CTO, Jordan)

4.8 Role-Based Dashboard Templates
Pre-built dashboard layouts per role: CEO Dashboard (pipeline, revenue, win rate, key risks), Sales Manager Dashboard (deals by owner, sales cycle, pipeline by stage), CS Dashboard (ticket volume, resolution time, SLA compliance, satisfaction). New users get a default dashboard matching their role.
Why now: At scale, the signals page becomes cluttered. Role-based dashboards give each user a curated view that matches their job. Reduces cognitive load and increases engagement. (Sam, UX Designer)

4.9 Segment-Specific Signal Packs
Pre-built signal sets for specific verticals: Health-tech Pack, Professional Services Pack, SaaS Pack. Each pack includes 7-10 signals relevant to that segment plus industry-specific benchmarks.
Why now: At 30-50 customers, you'll see patterns in which segments convert best. Segment packs let you tailor the product positioning: "Built for health-tech companies like you" instead of "works for everyone." Also makes sales conversations faster. (Sam, Product Manager)


APPENDIX: WHAT NOT TO BUILD (AND WHY)

These items were discussed by the panel and explicitly deprioritised:

Progressive Signal Discovery - Automatically discovering new signals from uploaded data without user input. Deprioritised because accuracy is more important than volume. Better to have 7 reliable signals than 20 auto-discovered ones that might be wrong. Revisit at 50+ customers. (Alex, CTO)

AI Chat Interface - A conversational interface where users ask questions about their data. Deprioritised because it adds complexity without adding billing value. Users want answers, not a chat experience. The 5-section analysis already provides answers. Revisit if customers explicitly request it. (Product Manager, Sam)

Real-Time Data Sync - Continuous sync with CRM APIs instead of periodic refresh. Deprioritised because SMB data doesn't change fast enough to justify real-time. Daily or weekly refresh is sufficient. Real-time adds infrastructure cost and complexity. Revisit for enterprise tier only. (CTO, Jordan)

White-Label / Reseller Model - Allowing consultants or agencies to resell Camino under their brand. Deprioritised because it's a distribution strategy, not a product feature. Focus on direct customers first. Revisit at 100+ customers when you have operational maturity. (Sam, Product Manager)

Mobile App - Native iOS/Android app. Deprioritised because the web app works on mobile. A native app adds two codebases to maintain with no proven demand. Revisit only if usage data shows 50%+ mobile traffic. (CTO, UX Designer)
