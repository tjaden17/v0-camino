AI EXPERT PANEL CONSULTATION
How to Handle Ad-Hoc Signal Requests
================================================================================

CONTEXT
You have 7 core signals for the MSS (Goal 1). Users will inevitably ask for signals outside of the 7, potentially in weekly conversations. How do you handle this without becoming bespoke consulting?

================================================================================

PRODUCT MANAGER - Strategic Perspective
================================================================================

This is the most dangerous question for a new product. Here's why:

Every customer asking for custom signals feels like validation. "They're engaged! They want more!" But custom work scales linearly with your time, not your product. If every customer gets 3-5 custom signals per month, you're doing 15-25 custom calculations for 5 customers. That's a full-time job.

**The trap:** You start as a product, become a consulting service with a nice UI.

**The reality check:** Is the request universal or specific?

UNIVERSAL REQUESTS (add to product):
- "Can I see deals by owner?" → Every company with >1 salesperson needs this
- "What's my average ticket resolution time?" → Every support team needs this
- "What's my lead conversion rate?" → Every sales org needs this

SPECIFIC REQUESTS (don't productize):
- "Can I see deals where the industry is healthcare AND the contact clicked our pricing page?" → Hyper-specific to one customer's workflow
- "Track time between lead create and first call for leads owned by Sarah" → One person, one workflow
- "Show me NPS score correlated with sales cycle length" → Requires data they haven't uploaded yet

**My framework for Goal 1-2:**

ALLOW: Self-service signal discovery from the 3-question flow already generates ~5-10 signals per upload (count, per month, sum, average, group-by). Users can already get "deals by owner" or "tickets by priority" without asking you. This is already built.

DO NOT ALLOW: Custom signal requests via support. Instead, track every request in a spreadsheet. When 3+ customers ask for the same thing (e.g., "conversion rate between two stages"), THEN you productize it.

**Why this works:** You're not saying "no." You're saying "let me see if this is a pattern worth building for everyone." Most customers respect that. The ones who don't weren't going to pay you productized pricing anyway.

================================================================================

SAM (MANAGEMENT CONSULTANT) - Is this a signal or a question?
================================================================================

Here's the thing: most "I need a custom signal" requests aren't actually signal requests. They're questions the customer doesn't know how to answer.

CUSTOMER SAYS: "Can you show me deals by owner?"
WHAT THEY MEAN: "I think Sarah is carrying the team and I want to confirm it."

CUSTOMER SAYS: "Can I see ticket volume by product?"
WHAT THEY MEAN: "I think Product A has more issues than Product B and I want proof."

CUSTOMER SAYS: "What's our conversion rate from proposal to closed won?"
WHAT THEY MEAN: "My close rate feels low and I want to know if it's the proposals or the pipeline."

Most of these are answerable with the 7 core signals + one follow-up question. Your job as "Camino advisor" is to help them realize that.

**Example conversation:**

CUSTOMER: "Can you add a signal for deals by owner?"

YOU: "Absolutely. Quick question: are you trying to understand if the pipeline is concentrated on one person, or if certain people close faster than others?"

CUSTOMER: "Both, honestly. I think Surge owns too many deals and I want to know if that's a bottleneck."

YOU: "Got it. The good news is we can already see that from your current signals. Your Pipeline Value is AUD 450K, and when we look at your deals data, 85% of open deals are owned by one person. That's not a separate signal—it's context for your existing signals. Would it help if we flagged that insight in your AI interpretation?"

CUSTOMER: "Oh. Yeah, that would be perfect."

**What just happened:** You validated their concern, answered it with existing data, and didn't build a new signal. The customer is happy. You saved yourself 2 hours of custom work. The product stayed focused.

**My rule:** For every custom signal request, ask "what decision are you trying to make?" If the answer is answerable with existing signals + interpretation, do that. If it's not, track the request and see if it's a pattern.

================================================================================

CTO (HEAD OF TECH) - Architecture for Flexibility
================================================================================

The good news: your architecture already supports ad-hoc signals. The 3-question flow is a signal creation interface. It generates signals dynamically based on user input. You don't need to rebuild anything.

**What you have right now:**

1. User uploads Deals CSV
2. 3-question flow asks: "What does each row represent?" → Deals
3. "Which column is the metric?" → Amount
4. "Which column is the date?" → Closing Date
5. System auto-generates: count, per month, sum, average, group-by signals
6. User sees ~8-10 signals from one upload

**That IS the custom signal engine.** If a user wants "deals by stage", they upload deals again and select "Stage" as the group-by column. If they want "tickets by priority", they upload tickets and select "Priority".

**What needs to change for Goal 2-3:** Right now, the 3-question flow is admin-only. Users can't create their own signals. Change that.

GOAL 2 FEATURE: "Analyze My Data" button
- User clicks "Analyze My Data"
- Upload CSV modal appears (same 3-question flow)
- User uploads a subset of their data or a new cut
- System generates signals
- Tag these as "custom" or "user-created" so they don't clutter the main dashboard

GOAL 3 FEATURE: "Save This Signal" button
- After a user creates a custom signal, they can save it
- Saved signals appear alongside the core 7
- Over time, you see which custom signals get saved by multiple users → those become core signals in the product

**Build effort for Goal 2:** ~1 day. Move the upload flow from admin-only to user-facing. Add a permission check and UI for "create custom signal."

**The architecture already scales.** You're not hardcoding new signal types. The user is telling you what they want via the 3-question interface. You just need to expose it to them.

================================================================================

MORGAN (CHIEF OF STAFF) - Attention Management
================================================================================

Let's be honest about what "weekly conversations with users about signals" actually means. It means:

- 5 customers × 15 min/week = 75 min/week of custom requests
- Each request takes 30 min to implement (find column, write calc, test)
- Each request takes 10 min to explain back to the customer
- Total: ~2.5 hours/week minimum, or 10 hours/month

At 5 customers, that's manageable. At 20 customers, that's 40 hours/month of custom work. At 50 customers, the math breaks.

**My recommendation:**

GOAL 1-2: You handle custom requests manually via admin upload. Budget 2 hours/week max. Track every request. When a customer asks for "deals by stage", you upload their data with Stage as the group-by column and show them the output. You're teaching them the pattern.

GOAL 3: Enable self-service. Users can upload their own CSVs and create custom signals. You're no longer the bottleneck.

GOAL 4: Auto-suggest signals. The system sees that a customer uploaded deals with a "Lead Source" column and proactively suggests "Would you like to see deals by lead source?" The user clicks yes. No conversation needed.

**The key insight:** Custom signals are a feature request disguised as support work. The product already has the answer (the 3-question flow). Your job is to move it from "admin does it for you" to "self-service" to "proactive suggestion."

================================================================================

ALEX (BI ANALYST) - Data Quality for Custom Signals
================================================================================

One warning: custom signals have lower data quality by definition. The core 7 signals are battle-tested. You've validated the calculations against real data. You know the edge cases. You know that "Closed - No Budget" means lost, that "Policy acknowledgment required" isn't a real ticket, that AUD prefixes need to be stripped.

When a user uploads a custom CSV with a column called "Custom Field 42", you have no idea what that is or whether the data is clean. If you calculate a signal from it and the number is wrong, they lose trust.

**My rules for custom signals:**

1. **Show confidence score prominently.** Every custom signal should be labeled "Experimental" or "Custom" with a visible confidence indicator. If the data coverage is <80%, flag it.

2. **Require a minimum sample size.** Don't calculate a rate from 2 data points. Don't show an average from 1 value. Set thresholds.

3. **Let the user verify.** Show the raw calculation formula and the sample data used. "Average Deal Size = AUD 45,000 (calculated from 12 deals with valid Amount values out of 14 total deals)." If the number looks wrong to them, they can investigate.

4. **Don't interpret custom signals automatically.** The AI interpretation should only run on core signals where you've validated the data. For custom signals, show the number with no commentary. The user can draw their own conclusions.

**Why this matters:** One bad custom signal can destroy credibility for all signals. Protect trust by being transparent about confidence.

================================================================================

RECOMMENDATION: THE 3-TIER SIGNAL SYSTEM
================================================================================

Based on the panel's input, here's the recommended architecture:

TIER 1: CORE SIGNALS (the 7)
- Hardcoded, validated, always shown
- Full AI interpretation
- High confidence, battle-tested calculations
- These are the product

TIER 2: AVAILABLE SIGNALS (from 3-question flow)
- Auto-generated from uploaded data
- Examples: "Deals by Owner", "Tickets by Priority", "Leads by Status"
- User can browse/enable these, but they're not shown by default
- Light AI commentary ("This shows your pipeline distribution")
- These are self-service exploration

TIER 3: CUSTOM SIGNALS (user-created)
- User uploads their own CSV and runs the 3-question flow
- Tagged as "Custom" or "Experimental"
- Confidence score shown prominently
- No AI interpretation unless confidence is high
- These are ad-hoc analysis

**What changes per goal:**

GOAL 1: Only Tier 1 exists. Admin manually creates Tier 2 signals on request.

GOAL 2: Tier 2 becomes visible. Users see "More signals available from your data" and can enable them. Still no self-service creation.

GOAL 3: Tier 3 unlocked. Users can upload custom CSVs and create their own signals.

GOAL 4: System auto-suggests Tier 2 signals based on detected columns. "We noticed you have a Lead Source column. Would you like to see leads by source?"

================================================================================

BOTTOM LINE
================================================================================

1. Your architecture already supports custom signals via the 3-question flow. You don't need to rebuild anything.

2. For Goal 1-2, handle custom requests manually but track every request. When 3+ customers ask for the same thing, add it to Tier 1 (core signals).

3. For Goal 3, expose the 3-question flow to users so they can create their own signals. This moves custom work from "you do it" to "self-service."

4. Always show confidence scores on custom signals. Never interpret low-confidence signals with AI. Protect trust.

5. Most "custom signal" requests are actually questions about existing signals. Teach users to read the 7 core signals deeply before adding more.

**Action item:** Add to roadmap for Goal 3: "User-created custom signals via upload interface." Estimated effort: 1 day.

================================================================================
END CONSULTATION
================================================================================
