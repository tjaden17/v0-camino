CRITICAL PATH ROADMAP PLANNING
How Weekly Goals, Critical Path, and Decision-Focused Roadmaps Work Together

========================================
THE THREE LAYERS
========================================

LAYER 1: GOAL (Monthly Decision)
"Will Surge pay for Camino by March 14?"

LAYER 2: CRITICAL PATH (Features that must exist)
What must be built, in what order, to reach the decision?

LAYER 3: WEEKLY GOALS (Completion milestones)
"By Friday, what must be true to stay on the critical path?"

========================================
THE CRITICAL PATH CONCEPT
========================================

Definition: The sequence of dependent tasks that determines the minimum time to reach a goal.

The critical path is NOT "all the work." It's the chain of tasks where:
- Task B can't start until Task A is done
- Any delay in these tasks delays the entire goal

Non-critical tasks can be done in parallel, delayed, or skipped without affecting the goal timeline.

========================================
IDENTIFYING THE CRITICAL PATH
========================================

STEP 1: Start with the goal decision
"Surge must see accurate signals from his data and decide to pay"

STEP 2: Work backwards - what must be true?
- Surge logs in and sees 7 signals
  ← Signals are generated from his data
    ← His data is uploaded and mapped
      ← Column mappings work for Zoho
        ← Template system exists
          ← Database schema supports mappings

STEP 3: Identify dependencies
- Can't generate signals without uploaded data
- Can't upload data without user accounts
- Can't personalize AI without KPI fields on profiles
- Can't show signals without a working auth system

STEP 4: Find the longest chain
The critical path is the longest dependency chain from "start" to "goal decision."

========================================
CAMINO GOAL 1 CRITICAL PATH EXAMPLE
========================================

GOAL: Will Surge pay by March 14? (4 weeks)

CRITICAL PATH (must be sequential):

Week 1: Foundation
├─ Column mapping template system (can't upload without this)
├─ Ticket filtering logic (wrong numbers = broken trust)
└─ User accounts with KPI fields (can't personalize without this)

Week 2: Data → Signals
├─ Admin uploads Surge's 3 CSVs (can't calculate without data)
├─ Signal calculation produces 7 correct numbers (can't interpret without signals)
└─ Verify numbers against Surge's internal records (trust checkpoint)

Week 3: Interpretation → Presentation
├─ AI interpretation wired to user KPIs (can't deliver personalized value without this)
├─ Period-over-period trends calculated (just numbers = reporting tool)
└─ 3 users can log in and see role-specific signals

Week 4: Polish → Demo
├─ Fix bugs found in Week 3 testing
├─ Admin walkthrough with real workflow
└─ Friday demo to Surge

TOTAL CRITICAL PATH: 4 weeks (if everything goes right)

========================================
NON-CRITICAL TASKS (Can be done in parallel or deferred)
========================================

PARALLEL (can build while on critical path):
- Email notifications (nice to have, doesn't block demo)
- Admin audit logs (useful but not customer-facing)
- Export signals to CSV (not in MSS scope)

DEFERRED (doesn't enable Goal 1 decision):
- OAuth integration (CSV upload works for demo)
- Weekly briefs (not required for billing decision)
- Dark mode (zero impact on value)
- Mobile responsive (Surge uses desktop)

The key insight: Building OAuth in Week 1-2 doesn't help you reach the March 14 decision faster. It's 5-7 days of work on a non-critical path. Build it in Month 2 after Surge commits.

========================================
WEEKLY GOALS ON THE CRITICAL PATH
========================================

THE FORMULA:
"By Friday, [X] must be true, or we fall off the critical path."

Week 1 Friday:
"Column mapping system works. Admin can upload 3 CSVs and see parsed data in database."
- If TRUE: Week 2 can start (calculate signals from that data)
- If FALSE: Week 2 is blocked (can't calculate without data)

Week 2 Friday:
"7 signals calculated from Surge's data. Numbers verified against his Zoho exports."
- If TRUE: Week 3 can start (AI interprets those signals)
- If FALSE: Week 3 is blocked (can't interpret nonexistent/wrong signals)

Week 3 Friday:
"Surge logs in, sees 7 personalized signals with AI interpretation. No errors."
- If TRUE: Week 4 is polish and demo prep
- If FALSE: Week 4 is debugging (risky—no time buffer)

Week 4 Friday:
"Surge sees demo, makes billing decision."
- If TRUE: Goal 1 complete → Move to Goal 2
- If FALSE: Extend timeline or pivot strategy

========================================
HOW TO PLAN A SPRINT USING CRITICAL PATH
========================================

SUNDAY (Planning):

1. Identify this week's critical path milestone
   "By Friday, column mapping must work for Locumate's Zoho data"

2. List all tasks required to reach that milestone
   - Create column_mappings table
   - Add Zoho CRM Deals template
   - Add Zoho Desk Tickets template
   - Add Zoho CRM Leads template
   - Test upload with real CSVs

3. Identify dependencies within the week
   - Can't test upload without templates
   - Can't create templates without table schema
   - Critical path THIS WEEK: schema → templates → test

4. Estimate critical path time
   - Schema: 1 hour
   - 3 templates: 2 hours each = 6 hours
   - Testing: 2 hours
   - TOTAL: 9 hours (2 days if focused)

5. Add buffer for unknowns
   - 9 hours × 1.5 = 13.5 hours (3 days)
   - Leaves 1-2 days for non-critical tasks or overruns

MONDAY-THURSDAY (Execution):

- Work ONLY on critical path tasks until Friday milestone is guaranteed
- Once critical path is secure (Wed/Thu), add parallel tasks
- If you hit a blocker on critical path, drop everything else to unblock it

FRIDAY (Validation):

- Test the milestone: "Does column mapping work?"
- If YES: Plan next week's critical path
- If NO: Identify what broke, fix over weekend, adjust next week

========================================
COMMON MISTAKES IN ROADMAP PLANNING
========================================

MISTAKE 1: Treating all tasks as equal priority
"I'll build OAuth, signal calcs, and AI interpretation this week"
→ WRONG: If signal calcs block AI interpretation, do signal calcs FIRST

MISTAKE 2: Working on non-critical tasks early
"I'll polish the UI while the backend team builds the database"
→ WRONG: If database design changes, UI is wasted work. Wait for backend.

MISTAKE 3: No clear weekly milestone
"This week I'll work on user accounts"
→ WRONG: What does "done" look like? "User accounts work" is not a testable milestone.

BETTER: "By Friday, admin can create 3 Locumate users with KPIs, and they can log in"

MISTAKE 4: Optimizing non-critical path
"Let me refactor this code to be 20% faster"
→ WRONG: If it's not on the critical path to the decision, speed doesn't matter yet

MISTAKE 5: No buffer in critical path
"I estimated 20 hours of work for a 5-day sprint"
→ WRONG: You'll hit bugs, unknowns, distractions. Plan for 50-70% utilization.

========================================
APPLYING TO GOAL 2, 3, 4
========================================

GOAL 2: Will Surge stay for 3 months?
Critical path:
- Month 2, Week 1: Zoho OAuth integration (removes CSV friction)
- Month 2, Week 2: Auto-scheduled sync (set-and-forget)
- Month 2, Week 3: Email notification when signals ready
- Month 2, Week 4: First automated sync succeeds without admin intervention

Non-critical:
- Exporting signals to spreadsheet (Surge doesn't ask for this)
- Custom signal builder (only build if Surge requests a specific signal)

GOAL 3: Will customers 2-5 commit?
Critical path:
- Add HubSpot field aliases (customer #2 uses HubSpot)
- Test column mapping with HubSpot data
- Add Salesforce aliases (customer #3 uses Salesforce)
- Build tool auto-detection (which CRM is this CSV from?)

Non-critical:
- Support for 10 CRM tools (only support tools customers actually use)
- Multi-language support (not requested)

GOAL 4: Will strangers self-serve?
Critical path:
- Remove auth requirement for lead magnet flow
- Add temp session storage (preserve data during 5-min flow)
- Add email capture + magic link
- Add confidence scores (build trust with strangers)
- Test self-service flow with 5 external users

Non-critical:
- Sales team integration (defeats self-service purpose)
- Advanced customization (keep it simple for strangers)

========================================
THE CRITICAL PATH GANTT VIEW
========================================

Goal 1: Get Surge to Pay (4 weeks)
────────────────────────────────────────
Week 1
[■■■■■■■■] Column mapping system (CRITICAL)
[■■■■] Ticket filtering (CRITICAL)
[■■■] User accounts with KPIs (CRITICAL)
  [■■] Email notifications (parallel, non-critical)

Week 2
            [■■■■■■■■] Upload Surge's data (CRITICAL - blocked by Week 1)
            [■■■■■■■■■■] Calculate 7 signals (CRITICAL)
            [■■■■] Verify numbers (CRITICAL)
              [■■] Admin audit log (parallel, non-critical)

Week 3
                        [■■■■■■] AI interpretation (CRITICAL - blocked by Week 2)
                        [■■■■] Period-over-period (CRITICAL)
                        [■■■■■■] 3 users see signals (CRITICAL)
                          [■■] Dark mode (parallel, non-critical)

Week 4
                                    [■■■■] Bug fixes (CRITICAL)
                                    [■■] Demo prep (CRITICAL)
                                    [■] Friday demo (DECISION)

LEGEND:
[■] = Critical path (any delay pushes goal date)
[■] = Non-critical (can slip or be cut)

========================================
DECISION TREE: IS THIS TASK ON THE CRITICAL PATH?
========================================

Question 1: Does this task block another task that's required for the goal decision?
→ YES: On critical path
→ NO: Ask Question 2

Question 2: Is this task required for the customer to make their decision?
→ YES: On critical path
→ NO: Ask Question 3

Question 3: Will the customer notice if this is missing during the decision moment?
→ YES: On critical path
→ NO: NOT on critical path (defer or cut)

Examples:

Task: "Build OAuth integration"
Q1: Does it block signal calculation? NO
Q2: Required for Surge's billing decision? NO (CSV works)
Q3: Will Surge notice it's missing? NO (admin handles uploads)
→ NOT ON CRITICAL PATH for Goal 1. Build in Goal 2.

Task: "Fix win rate calculation"
Q1: Does it block AI interpretation? YES (can't interpret wrong numbers)
Q2: Required for decision? YES (wrong numbers break trust)
Q3: Will Surge notice? YES (he knows his win rate)
→ ON CRITICAL PATH. Must be correct.

Task: "Add dark mode"
Q1: Does it block anything? NO
Q2: Required for decision? NO
Q3: Will Surge notice? NO
→ NOT ON CRITICAL PATH. Defer indefinitely.

========================================
THE WEEKLY RITUAL
========================================

SUNDAY NIGHT:
1. What is this week's critical path milestone?
2. What tasks must be done sequentially to reach it?
3. What's the estimated critical path time?
4. Do I have enough buffer for unknowns?

MONDAY MORNING:
5. Start with Task #1 on the critical path
6. Ignore everything else until Task #1 is done

WEDNESDAY CHECK-IN:
7. Am I on track to hit Friday's milestone?
8. If NO, what's blocking me? Drop non-critical work.
9. If YES, continue critical path. Add parallel tasks if time.

FRIDAY AFTERNOON:
10. Test the milestone. Does it work?
11. If YES: Plan next week's critical path
12. If NO: What broke? Can I fix it by Monday? Do I need to adjust the roadmap?

========================================
SUMMARY: THE INTEGRATION
========================================

ROADMAP (Monthly decisions):
Goal 1 → Goal 2 → Goal 3 → Goal 4
Each goal = ONE decision moment

CRITICAL PATH (Feature dependencies):
What must be built, in what order, to reach each decision?
The longest chain of dependencies determines timeline.

WEEKLY GOALS (Execution checkpoints):
"By Friday, X must be true to stay on critical path"
Forces ruthless prioritization of critical tasks.

THE GOLDEN RULE:
If it's not on the critical path to the next decision, defer it.
You can always add features.
You can never get back time wasted on non-critical work.

========================================
CAMINO MSS CRITICAL PATH SUMMARY
========================================

GOAL 1 CRITICAL PATH (4 weeks):
Week 1: Data In foundation (can't calculate without data)
Week 2: Signal Calculation (can't interpret without signals)
Week 3: Interpretation + Presentation (can't demo without personalized value)
Week 4: Demo to Surge (decision moment)

GOAL 2 CRITICAL PATH (Month 2):
Week 5-6: OAuth + scheduled sync (removes friction)
Week 7-8: First automated cycle completes (retention proof)

GOAL 3 CRITICAL PATH (Months 3-4):
Week 9-12: Support HubSpot/Salesforce (prove it's not Zoho-only)
Week 13-16: Onboard customers 2-5 (prove repeatability)

GOAL 4 CRITICAL PATH (Months 5-6):
Week 17-20: Build self-service lead magnet (prove scalability)
Week 21-24: First 10 strangers activate without help (scale proof)

Each week has ONE milestone.
Each milestone unblocks the next week.
Any delay in critical path delays the goal.
Non-critical work happens in parallel or gets cut.

This is how you ship an MVP in 4 weeks instead of 4 months.
