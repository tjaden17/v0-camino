GOAL DECISION FRAMEWORK
How to Think About the Decision That Defines Each Goal

=============================================================================
OVERVIEW
=============================================================================

Every goal in your roadmap should enable ONE specific decision by ONE specific person at ONE specific moment.

If you can't complete this sentence, your goal is too vague:

"By the end of [Goal X], [Person] will decide whether to [Action], based on [Evidence]."


=============================================================================
PART 1: WHAT MAKES A GOOD GOAL DECISION
Product Manager
=============================================================================

A good goal decision has four properties:

1. BINARY
   The decision has a clear yes/no answer.
   
   Good: "Will Surge pay for Camino?" (Yes or No)
   Bad: "Will Surge like Camino?" (What does "like" mean? This is feelings, not a decision)
   
   Good: "Will customer #3 upload their own data?" (Yes or No)
   Bad: "Will customers find the product easy to use?" (Vague, no action)

2. OBSERVABLE
   You can tell when the decision has been made.
   
   Good: "Surge signs the contract" or "Surge says 'I'll take it'"
   Bad: "Surge is satisfied with the product" (How do you know? When did this happen?)
   
   Good: "Customer uploads their second month of data without asking for help"
   Bad: "Customer is engaged with the product" (What does engaged mean?)

3. CONSEQUENTIAL
   The decision changes what you do next.
   
   Good: "If Surge says yes, we onboard customer #2. If no, we fix what broke trust."
   Bad: "If users view the landing page, we know there's interest" (Viewing ≠ buying)
   
   If the decision doesn't change your roadmap, it's not a real decision.

4. TIME-BOUND
   The decision happens at a specific moment, not gradually.
   
   Good: "Friday March 14, Surge sees his signals and decides whether to commit"
   Bad: "Over the next few months, we'll see if customers adopt it"
   
   If you can't put it on a calendar, it's not a goal.


=============================================================================
PART 2: THE FOUR CORE DECISIONS IN B2B SAAS
Sam (Management Consultant)
=============================================================================

Most B2B products follow this decision sequence:

GOAL 1 DECISION: "Will customer #1 pay for this?"
- Person: The first customer (CEO, buyer, champion)
- Moment: After seeing the product work with their real data
- Evidence: The product solved a problem they have today
- What changes: If yes, you have product-market fit to refine. If no, the value prop is wrong.

GOAL 2 DECISION: "Will customer #1 renew/stay?"
- Person: Same customer, 1-3 months later
- Moment: When friction hits (re-upload, support, bug, etc)
- Evidence: They keep using it despite rough edges
- What changes: If yes, invest in scale. If no, the friction exceeds the value.

GOAL 3 DECISION: "Will customers 2-5 behave like customer #1?"
- Person: New customers from different segments, use cases, tools
- Moment: When they onboard and use the product independently
- Evidence: Similar activation rate, retention, willingness to pay
- What changes: If yes, you have a repeatable sales motion. If no, customer #1 was an outlier.

GOAL 4 DECISION: "Will customers self-serve without us?"
- Person: Strangers who find you via lead magnet, SEO, referral
- Moment: When they sign up, activate, and pay without talking to you
- Evidence: Conversion funnel, self-service activation rate
- What changes: If yes, you have a scalable go-to-market. If no, you're a consulting service.


=============================================================================
PART 3: WORKING BACKWARDS FROM THE DECISION
Morgan (Chief of Staff)
=============================================================================

Once you know the decision, work backwards to identify what must be true.

THE DECISION CASCADE

Start with the decision:
"By March 14, Surge will decide whether to pay for Camino, based on whether his signals match his internal numbers and the AI analysis saves him time."

Ask: "What must be true for Surge to say yes?"
1. His win rate must match what he already knows (67% vs his mental model)
2. His pipeline value must match Zoho (no made-up numbers)
3. The AI interpretation must reference his actual priorities (Q2 revenue target)
4. He must see this faster than doing it himself (5 min vs 30 min in spreadsheets)
5. The numbers must update easily (monthly re-upload takes <5 min)

Ask: "What must we build for those things to be true?"
1. Win rate formula must handle "Closed - No Budget" as lost (not just "Closed Lost")
2. Amount parser must handle "AUD 54,000.00" format
3. User profile must store his KPIs and business context
4. AI prompt must read user profile and personalize output
5. Admin upload flow must work flawlessly with 3 CSVs

Ask: "What's the minimum version of each that proves it works?"
1. Hardcode the Zoho stage mappings for Locumate
2. Add AUD currency parsing (10 min fix)
3. Add KPI fields to user creation form
4. Pass user.kpi_1, user.role to AI prompt
5. Admin uploads via existing flow, verifies signals match Surge's numbers

That's your Week 1-4 backlog. Everything else is cut.

THE VALIDATION MOMENT

Every goal decision needs a validation moment - a specific event where you test the decision.

Goal 1: "Friday demo with Surge. He logs in, sees his signals, and we ask: 'Would you pay $X/month for this?'"

Goal 2: "Week 8. Surge needs to upload February data. Does he do it himself or does he email you asking for help?"

Goal 3: "Customer #3 onboarding. Do they say 'this is exactly what we need' or 'can you add [huge custom feature]?'"

Goal 4: "Lead magnet launch. Do 10% of trial users activate without talking to you?"

Put these moments on your calendar. They're your checkpoints.


=============================================================================
PART 4: COMMON MISTAKES
UX Designer
=============================================================================

MISTAKE 1: Confusing activity with decision
❌ "Goal 1: Get 100 signups"
✅ "Goal 1: Get customer #1 to commit to paying"

Why: 100 signups who never pay is worse than 1 customer who does. The decision is commitment, not curiosity.

MISTAKE 2: Picking a decision you can't influence
❌ "Goal 2: Customer becomes profitable"
✅ "Goal 2: Customer stays for 3 months"

Why: Profitability depends on your pricing, cost structure, etc. You can't "build" profitability in Month 2. But you CAN build retention features.

MISTAKE 3: Making the decision too far in the future
❌ "Goal 1: Achieve product-market fit"
✅ "Goal 1: Get customer #1 to pay"

Why: PMF is the outcome of many decisions over 6-12 months. It's not measurable in 4 weeks. Start with the first domino.

MISTAKE 4: Optimizing for the wrong person's decision
❌ "Goal 1: Investors think this is fundable"
✅ "Goal 1: Customer #1 pays for it"

Why: Investors care about customer behavior, not your pitch. Prove the customer decision first.

MISTAKE 5: Picking a decision without evidence
❌ "Goal 3: Launch lead magnet"
✅ "Goal 3: Win customers 2-5 from different segments"

Why: If customers 1-5 all came from warm intros and hand-holding, a self-service lead magnet will fail. Prove the product works for multiple segments FIRST, then make it self-service.


=============================================================================
PART 5: EXAMPLES FROM CAMINO
Product Manager
=============================================================================

GOAL 1: Will Surge pay for Camino?

Decision: "Yes, I'll pay $X/month" or "No, this doesn't solve my problem"
Person: Surge (CEO of Locumate)
Moment: Friday March 14, 2026 (4 weeks from now)
Evidence required:
  - His win rate matches his mental model (trust)
  - His pipeline value matches Zoho (accuracy)
  - The AI tells him something useful he didn't already know (insight)
  - Logging in is faster than opening Zoho (convenience)

Features that enable this decision:
  ✅ Correct signal calculations for his 7 KPIs
  ✅ Personalized AI interpretation using his role/KPIs
  ✅ Admin upload flow that works with his 3 Zoho CSVs
  ✅ 3 user accounts (CEO, CS Manager, Ops Manager)
  ❌ OAuth integration (nice to have, doesn't affect billing decision)
  ❌ Weekly briefs (not in scope for MSS)

GOAL 2: Will Surge stay for 3 months?

Decision: "Yes, this is worth the effort" or "No, too much friction"
Person: Surge (still)
Moment: Month 2-4, when he needs to re-upload data or encounters a bug
Evidence required:
  - Re-uploads take <5 minutes (friction removed)
  - API sync works automatically (no more manual uploads)
  - Bugs are fixed within 48 hours (you're responsive)
  - He refers another CEO (signal of satisfaction)

Features that enable this decision:
  ✅ API integration with Zoho (removes CSV friction)
  ✅ Scheduled monthly sync (removes "remember to upload" burden)
  ✅ Template-based re-uploads (saved mappings auto-apply)
  ✅ Email notifications when new signals are ready
  ❌ Multi-source correlation (he only uses Zoho)

GOAL 3: Will customers 2-5 commit like Surge did?

Decision: "Yes, I'll pay" from 4 new customers with different tools/needs
Person: Customer #2 (HubSpot user), #3 (Salesforce user), #4 (different industry), #5 (larger team)
Moment: Weeks 16-24 (onboarding each customer)
Evidence required:
  - Column mapping templates work for HubSpot, Salesforce, not just Zoho
  - The 7 core signals are relevant across different industries
  - Onboarding each customer takes <2 days of your time
  - Customers activate without heavy hand-holding

Features that enable this decision:
  ✅ HubSpot and Salesforce column aliases
  ✅ Auto-detection of source tool from headers
  ✅ Pre-built templates per tool
  ✅ Role-based KPI defaults
  ❌ Unlimited custom signals (stick to the core 7)

GOAL 4: Will customers 5-50 self-serve?

Decision: "I'll sign up" from strangers who find your lead magnet
Person: Unknown prospects, no warm intro
Moment: Weeks 24-52 (lead magnet launch, inbound flow)
Evidence required:
  - 10%+ of leads upload data and activate without talking to you
  - Support tickets <1 per customer in first month
  - They understand the value before you explain it

Features that enable this decision:
  ✅ Self-service lead magnet (upload data, see instant signals)
  ✅ Guided onboarding with tips/tutorials
  ✅ Auto-interpretation (no manual admin step)
  ✅ Error messages that teach, not confuse
  ❌ Sales calls (defeats the point of self-service)


=============================================================================
PART 6: HOW TO USE THIS FRAMEWORK
=============================================================================

STEP 1: Write the decision sentence
"By [date], [person] will decide whether to [action], based on [evidence]."

STEP 2: List what must be true for a "yes"
- What must the product do?
- What must the user experience?
- What questions must be answered?

STEP 3: Work backwards to features
- What's the minimum we can build to make those things true?
- What can we defer because it doesn't affect this decision?

STEP 4: Put the validation moment on the calendar
- When will we test if this decision happens?
- How will we know if it's a yes or no?

STEP 5: After the decision, reflect
- Did they say yes or no?
- If yes, what made the difference?
- If no, what broke trust or failed to deliver value?
- What does this tell us about Goal 2?


=============================================================================
FINAL PRINCIPLE
Sam (Management Consultant)
=============================================================================

The decision is not the goal. The decision is the TEST of whether you built the right thing.

If Surge says no, you didn't fail at "building an MVP." You succeeded at learning what doesn't work, faster than your competitors who are still guessing.

The goal is to get to the decision moment as fast as possible, with the minimum build required to get a real answer.

Four weeks to a real customer decision beats four months of "building the right features."
