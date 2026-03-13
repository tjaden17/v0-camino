30-MINUTE BLOCKER MANAGEMENT: Signal Calc Produces 7 Correct Signals
Applied Framework Example

Sprint: Week 1
Task: "Signal calculation service produces 7 correct signals for Locumate data"
Time Budget: 30 minutes total
Date Run: [Insert date when you do this]

═══════════════════════════════════════════════════════════════════════════════

PART 1: TECH SPIKE (15 minutes)
Goal: Find unknowns that could block progress

───────────────────────────────────────────────────────────────────────────────

MINUTE 0-5: Scan for Unknowns
Quick braindump of "what don't I know yet?"

Unknown #1: What are the 7 signals?
- Status: ✅ KNOWN
- Source: /docs/00_DECISIONS/customer/CUSTOMER_AGREEMENT.md
- Answer: 
  1. Open Tickets
  2. Avg Response Time
  3. Avg Resolution Time
  4. Customer Satisfaction (CSAT)
  5. First Response Time
  6. Ticket Volume Trend
  7. Resolution Rate

Unknown #2: What data format does Locumate export?
- Status: 🟡 PARTIALLY KNOWN
- What I know: They use Zoho Desk
- What I don't know: Exact column names, date formats, null handling
- Risk: MEDIUM - Could waste 2+ hours on data parsing

Unknown #3: What calculations are required for each signal?
- Status: ✅ KNOWN
- Source: /docs/00_DECISIONS/specs/METRIC_SPECIFICATIONS.md
- Answer: Formulas documented

Unknown #4: Where does the calculation happen? Client or server?
- Status: 🟡 PARTIALLY KNOWN
- What I know: Should be server-side for performance
- What I don't know: Do we use Server Actions, Route Handlers, or background jobs?
- Risk: MEDIUM - Architecture decision affects implementation

Unknown #5: How do we handle missing data?
- Status: 🔴 UNKNOWN
- Risk: HIGH - Real data always has gaps, null values, inconsistencies
- Could block: Testing and validation

───────────────────────────────────────────────────────────────────────────────

MINUTE 5-10: 5-Minute Research Bursts (Pick Top 2 Risks)

🔴 HIGH RISK: Research #1 - Missing Data Handling (5 min)

Question: What happens if CSAT score is missing? Or response time is null?

Quick search in codebase:
- Check: /docs/00_DECISIONS/specs/SIGNAL_CATALOG.md
- Check: /docs/00_DECISIONS/architecture/SIGNAL_SERVICE_V2.md

Findings:
- Signal Service V2 has null handling logic
- Default behavior: Show "N/A" if insufficient data
- CSAT specifically: If <5 responses, show "Insufficient Data"
- Response time: If no closed tickets, show "No Data Yet"

Decision: Use existing null handling patterns from Signal Service V2
Confidence: HIGH ✅

───────────────────────────────────────────────────────────────────────────────

🟡 MEDIUM RISK: Research #2 - Locumate Data Format (5 min)

Question: What columns/format does Locumate's Zoho export have?

Check docs:
- /docs/00_DECISIONS/customer/PILOT_ZOHO_SETUP.md
- /docs/00_DECISIONS/customer/pilot_customer_zoho_data_requirements.csv

Findings:
- CSV exists with sample data structure
- Columns confirmed: ticket_id, created_date, closed_date, first_response_date, customer_email, status, satisfaction_rating
- Date format: ISO 8601 (YYYY-MM-DD HH:MM:SS)
- Nulls: Empty strings for missing CSAT, "null" string for missing dates

Decision: Build parser that handles empty strings and "null" strings
Confidence: MEDIUM 🟡 (assume format until we see real export)

───────────────────────────────────────────────────────────────────────────────

MINUTE 10-15: Document Confidence Levels & Decisions

Summary of Unknowns After Spike:

✅ HIGH CONFIDENCE (Can start building):
- The 7 signals are defined
- Calculation formulas documented
- Null handling pattern exists

🟡 MEDIUM CONFIDENCE (Validated assumptions, may need adjustment):
- Data format based on sample CSV
- Date parsing logic needed for ISO 8601
- Empty string and "null" string handling

🔴 LOW CONFIDENCE (Need to resolve before sprint ends):
- Architecture decision: Server Action vs Route Handler vs background job
- WHERE TO ASK: Check with v0 or review existing data upload patterns

BLOCKERS IDENTIFIED:
1. Architecture decision needed (Server Action vs Route Handler) - BLOCKS implementation start
2. Need real Locumate export to validate assumptions - BLOCKS testing

ACTION ITEMS:
[ ] Decision: Choose Server Action or Route Handler for calc (5 min conversation)
[ ] Request: Get actual Zoho Desk export from Locumate (async, not blocking build)

───────────────────────────────────────────────────────────────────────────────

═══════════════════════════════════════════════════════════════════════════════

PART 2: DEPENDENCY MAPPING (15 minutes)
Goal: Prevent "I can't start this until that's done" surprises

───────────────────────────────────────────────────────────────────────────────

MINUTE 15-20: List All Sub-Tasks

Breaking down "Signal calc produces 7 correct signals":

A. Create signal calculation service
B. Parse Locumate CSV upload
C. Store parsed data in database
D. Calculate each of 7 signals
E. Return signals to frontend
F. Display signals in UI
G. Write tests for calculations
H. Handle edge cases (null data, empty files)

───────────────────────────────────────────────────────────────────────────────

MINUTE 20-25: Draw Dependencies (What blocks what?)

Simple dependency map:

START
  ↓
A. Create signal calculation service ← (Architecture decision needed)
  ↓
B. Parse Locumate CSV upload
  ↓
C. Store parsed data in database ← (Requires DB schema for Locumate data)
  ↓
D. Calculate each of 7 signals
  ↓
E. Return signals to frontend
  ↓
F. Display signals in UI ← (Requires UI components)
  ↓
G. Write tests
  ↓
H. Handle edge cases
  ↓
END

PARALLEL WORK (Can happen simultaneously):
- B (Parse CSV) can happen while A (service) is being built
- F (Display UI) can be mocked with fake data before D (calculations) is done
- G (Tests) can be written as soon as D (calculations) logic exists

───────────────────────────────────────────────────────────────────────────────

MINUTE 25-30: Create Build Order

CRITICAL PATH (Must happen in order):
1. Architecture decision (Server Action vs Route Handler) - 5 min
2. Create calculation service skeleton - 30 min
3. Implement 7 signal calculations - 2 hours
4. Test with real data - 1 hour

PARALLEL WORK (Can do anytime):
- Parse CSV logic (can build with sample data) - 1 hour
- UI display components (mock data) - 1 hour
- Edge case handling - 1 hour

DEPENDENCIES TO CHECK:
✅ Database schema exists? 
   → Check: /docs/00_DECISIONS/architecture/DUAL_PATH_STORAGE.md
   → Answer: Yes, signals table exists

✅ UI components exist?
   → Check: /app/dashboard or /components
   → Answer: Need to verify signal card component exists

🔴 BLOCKER: Architecture decision needed before I can start writing code

───────────────────────────────────────────────────────────────────────────────

═══════════════════════════════════════════════════════════════════════════════

OUTCOME AFTER 30 MINUTES

WHAT I LEARNED:
1. I can start building 7 signal calculations immediately (formulas documented)
2. I need one architecture decision before writing code (Server Action vs Route Handler)
3. CSV parsing is straightforward but needs null handling
4. Database schema already exists (no blocker)
5. I can mock UI while building calculations (parallel work)

BLOCKERS IDENTIFIED:
1. 🔴 Architecture decision needed (5-minute conversation to resolve)
2. 🟡 Real Locumate data would be helpful (not blocking, can use sample CSV)

CONFIDENCE LEVEL:
🟢 HIGH - I can start this sprint with minimal blockers

NEXT STEPS:
1. Decide: Server Action or Route Handler for calculations (5 min)
2. Start building calculation service with sample CSV
3. Request real Locumate export for validation later

TIME SAVED:
- Without this spike: Would've discovered architecture question 2 hours into coding
- With this spike: Resolved upfront, can start building immediately

═══════════════════════════════════════════════════════════════════════════════

TEMPLATE FOR NEXT SPRINT

Copy this structure for any task:

TECH SPIKE (15 min):
- Minute 0-5: List unknowns
- Minute 5-10: Research top 2 risks
- Minute 10-15: Document confidence levels

DEPENDENCY MAP (15 min):
- Minute 15-20: List sub-tasks
- Minute 20-25: Draw dependencies
- Minute 25-30: Create build order

Result: Know what you don't know, catch blockers early, start building confidently.
