ADMIN UPLOAD FLOW & ACCEPTANCE CRITERIA

Date: February 17, 2026
Reviewed by: UX Designer, Product Manager, Jordan (Data Engineer), Morgan (Chief of Staff)

================================================================================
THE PROBLEM
================================================================================

Admin needs to upload data on behalf of an organization (e.g., Locumate) and later re-upload fresh data monthly without repeating configuration. The flow must handle:
- Initial upload (first time, requires 3-question flow)
- Re-upload (subsequent times, should auto-apply saved mappings)
- Verification (admin confirms signals look correct before users see them)
- Error handling (clear feedback if something goes wrong)


================================================================================
PART 1: INITIAL UPLOAD FLOW (First Time)
================================================================================

STEP 1: ADMIN SELECTS ORGANIZATION
----------------------------------
Where: /admin/organisations page → click org row → "Upload Data" button
Action: Admin navigates to /admin/organisations/[orgId]/upload

UI:
- Header shows "Upload Data for [Org Name]"
- Subtitle: "Upload CSV files from Zoho CRM, Zoho Desk, or other sources"
- Large "Choose Files to Upload" button

ACCEPTANCE CRITERIA:
✓ Admin can select multiple CSV files (deals, leads, tickets)
✓ File picker allows .csv and .xlsx extensions
✓ Shows file names and sizes after selection
✓ Can remove files before uploading


STEP 2: FILE PARSING & PREVIEW
-------------------------------
Action: System parses CSV, detects columns, shows preview

UI (Upload Modal):
- Shows each file as a tab (e.g., "Zoho - CRM - Deals")
- Displays first 5 rows as a table preview
- Shows column count and row count
- Detects column types automatically (text/number/date/id)

ACCEPTANCE CRITERIA:
✓ Parses CSV with proper encoding (handles UTF-8, commas in quotes)
✓ Handles multi-sheet XLSX files (each sheet becomes a tab)
✓ Shows clear error if file format is invalid
✓ Displays detected column types with badges (Text, Number, Date, ID)
✓ Processing completes within 3 seconds for files up to 10MB


STEP 3: THREE-QUESTION FLOW (Per File)
---------------------------------------
Action: Admin answers 3 questions for each uploaded file

Question 1: "What does each row represent?"
Options: Deals, Leads, Tickets, Customers, Events, Agents, Other
- Shows icons and descriptions for each type
- Pre-selects based on filename heuristics ("deals" in filename → "Deals")

Question 2: "Which column is the main metric?"
Options: Dropdown of numeric columns + "No metric" option
- Only shows columns detected as type "number"
- Pre-selects if column name includes "amount", "value", "revenue"

Question 3: "Which column is the date?"
Options: Dropdown of date columns + "No date" option
- Only shows columns detected as type "date"
- Pre-selects most recent-looking date column

ACCEPTANCE CRITERIA:
✓ Questions appear one at a time (linear flow, not all at once)
✓ Can go back to previous question
✓ Pre-selections are correct 80%+ of the time (tested with real Zoho data)
✓ "Next" button disabled until question is answered
✓ Shows validation error if metric column selected but not actually numeric


STEP 4: SIGNAL GENERATION & PREVIEW
------------------------------------
Action: System generates signals based on answers, shows preview

Process (backend):
- Applies column mappings via FIELD_ALIASES
- Filters non-real tickets (policy acknowledgments, etc.)
- Calculates 7 core signals + available signals
- Generates time-series data for trends
- Calculates period-over-period (30-day default)

UI:
- Shows "Generating signals..." loader
- Displays list of signals with preview values
  Example:
  ✓ Pipeline Value: AUD $450K
  ✓ Win Rate: 67% (↓ 13 points vs last month)
  ✓ Closed Revenue: AUD $180K
  ✓ Avg Sales Cycle: 87 days
  ✓ Tickets This Month: 342 (excludes 21 automated)
  ✓ Avg Resolution Time: 18 hours
  ✓ Lead Conversion Rate: 15%

- Each signal shows:
  - Name
  - Current value (formatted)
  - Trend (up/down/stable arrow)
  - Period comparison text
  - Formula used (expandable)
  - Confidence badge (high/medium/low)

ACCEPTANCE CRITERIA:
✓ Signal generation completes within 10 seconds for 5,000 rows
✓ Shows progress indicator during generation
✓ All 7 core signals display if data supports them
✓ Shows "Insufficient data" message if sample size too small
✓ Formula is visible and matches MSS_BUILD_PLAN_LOCKED.md specs
✓ Period comparison only shows if both periods have ≥3 data points
✓ Filtered ticket count is visible ("excludes 21 automated")


STEP 5: ADMIN VERIFICATION
---------------------------
Action: Admin reviews signals and confirms or flags issues

UI:
- Verification checklist:
  □ Signal values match what I expect from the source system
  □ No parsing errors or weird numbers
  □ Date ranges look correct
  □ Filters applied appropriately

- "Confirm & Save" button (green)
- "Flag Issue" button (yellow) - opens text field for notes
- "Cancel Upload" button (gray)

ACCEPTANCE CRITERIA:
✓ Admin can expand each signal to see:
  - Sample data rows used
  - Filters applied
  - Column mappings used
✓ "Flag Issue" saves notes to upload_history table
✓ Flagged uploads don't publish to users until resolved
✓ "Confirm & Save" persists signals and column mappings to database


STEP 6: SAVE TO DATABASE
-------------------------
Action: System saves signals, data points, and column mappings

Database writes:
1. signals table → 7 rows (one per signal)
2. signal_data_points table → time-series data
3. column_mappings table → field mappings for re-use
4. upload_history table → metadata (filename, row count, status, timestamp)

ACCEPTANCE CRITERIA:
✓ All writes complete or all roll back (transaction)
✓ Signals are linked to correct organization_id
✓ Signals are visible to org members immediately after save
✓ Column mappings are saved with source identifier (e.g., "zoho-crm-deals")
✓ Upload history shows "success" status and timestamp


================================================================================
PART 2: RE-UPLOAD FLOW (Subsequent Uploads)
================================================================================

SCENARIO: Admin uploads fresh data for Locumate on March 15 (1 month after initial upload)

STEP 1: DETECT EXISTING MAPPINGS
---------------------------------
Action: System checks if column_mappings exist for this org + source

Query:
SELECT * FROM column_mappings 
WHERE organization_id = 'locumate' 
  AND source_tool = 'zoho-crm-deals'

Result: Found mappings from Feb 17 upload

ACCEPTANCE CRITERIA:
✓ Lookup completes within 500ms
✓ Matches on org + source (not just org)
✓ Handles case where some files have mappings, others don't


STEP 2: AUTO-APPLY MAPPINGS
----------------------------
Action: System skips 3-question flow for files with saved mappings

UI:
- Shows green checkmark: "Using saved settings from Feb 17, 2026"
- Displays applied answers:
  ✓ Row type: Deals
  ✓ Metric: Amount → deal_value
  ✓ Date: Closing Date → close_date
- Button: "Change settings" (opens 3-question flow if admin needs to adjust)

ACCEPTANCE CRITERIA:
✓ Mappings auto-apply without admin clicking anything
✓ Admin can override if needed (e.g., new column added)
✓ If column names changed, shows warning: "Column 'Amount' not found. Please re-map."


STEP 3: SIGNAL GENERATION (SAME AS INITIAL)
--------------------------------------------
Process is identical to initial upload steps 4-6

DIFFERENCE: Shows comparison to previous upload
- "Pipeline Value: AUD $520K (↑ $70K vs Feb 17)"
- "Win Rate: 72% (↑ 5 points vs Feb 17)"

ACCEPTANCE CRITERIA:
✓ Period comparison uses 30-day window by default
✓ Shows delta vs previous upload date prominently
✓ Admin can toggle between "vs last upload" and "vs 30 days ago"


STEP 4: VERIFICATION & SAVE (SAME AS INITIAL)
----------------------------------------------
Admin reviews, confirms, and saves

ADDITIONAL CHECK for re-upload:
- Shows diff summary: "4 signals increased, 2 decreased, 1 unchanged"
- Flags if any signal value changed by >50% (possible data issue)

ACCEPTANCE CRITERIA:
✓ Large changes trigger warning: "Win rate dropped 40 points. Confirm this is expected."
✓ Admin can add notes explaining the change
✓ Previous signal values remain in database (historical record)
✓ New data points append to signal_data_points table


================================================================================
PART 3: EDGE CASES & ERROR HANDLING
================================================================================

EDGE CASE 1: Column Names Changed
----------------------------------
Scenario: Zoho renamed "Amount" to "Deal Amount"

Behavior:
- System shows warning: "Column 'Amount' not found. Found similar: 'Deal Amount'. Use this?"
- Admin clicks "Yes" → updates mapping
- Admin clicks "No" → opens 3-question flow

ACCEPTANCE CRITERIA:
✓ Suggests similar column names (Levenshtein distance < 3)
✓ Updated mapping saves to column_mappings table


EDGE CASE 2: New File Added
----------------------------
Scenario: Admin uploads "Zoho - CRM - Contacts" for the first time

Behavior:
- Existing files (deals, tickets) use saved mappings
- New file (contacts) triggers 3-question flow
- All processed together in one batch

ACCEPTANCE CRITERIA:
✓ Mixing saved + new files works in same upload session
✓ Admin doesn't have to upload separately


EDGE CASE 3: Parsing Error
---------------------------
Scenario: CSV has malformed row (e.g., missing closing quote)

Behavior:
- Shows error: "Row 47 could not be parsed. Preview issue?"
- Displays the problematic row
- Option: "Skip this row" or "Cancel upload"

ACCEPTANCE CRITERIA:
✓ Parsing errors don't crash the entire upload
✓ Admin sees exact row number and content
✓ Can skip bad rows (logged in upload_history)


EDGE CASE 4: No Signals Generated
----------------------------------
Scenario: Data too sparse, no signals meet confidence threshold

Behavior:
- Shows message: "No reliable signals could be generated from this data."
- Explains why: "Need at least 10 data points for each metric."
- Option: "Upload anyway" (saves raw data) or "Cancel"

ACCEPTANCE CRITERIA:
✓ Clear explanation of why signals weren't generated
✓ Admin can still save raw data for future re-processing
✓ Doesn't block upload entirely


================================================================================
PART 4: UI/UX REQUIREMENTS
================================================================================

From UX Designer:

1. PROGRESS INDICATOR
   - Multi-step progress bar: Parse → Configure → Generate → Verify → Save
   - Current step highlighted
   - Can't skip steps, but can go back

2. RESPONSIVE FEEDBACK
   - Loading states for all async operations
   - Success animations on completion
   - Error messages in red with clear actions

3. DATA TRANSPARENCY
   - Admin can always see:
     * Sample rows used for calculation
     * Filters applied
     * Column mappings
     * Formula used
   - "Show details" expandable on every signal

4. MOBILE SUPPORT
   - Upload flow works on tablet (iPad)
   - Not optimized for phone (admin task, desktop expected)

5. KEYBOARD NAVIGATION
   - Tab through questions
   - Enter to advance
   - Escape to close modal


================================================================================
PART 5: TECHNICAL ACCEPTANCE CRITERIA
================================================================================

From Jordan (Data Engineer):

DATABASE SCHEMA REQUIREMENTS
-----------------------------

column_mappings table:
- organization_id (uuid, FK to organizations)
- source_tool (text, e.g. "zoho-crm-deals")
- row_type (text, e.g. "deals")
- field_mappings (jsonb, e.g. {"deal_value": "Amount", "stage": "Stage"})
- created_at (timestamp)
- updated_at (timestamp)
- created_by (uuid, FK to admin user)

upload_history table:
- id (uuid, PK)
- organization_id (uuid, FK)
- uploaded_by (uuid, FK to admin user)
- filename (text)
- row_count (integer)
- signals_generated (integer)
- status (text: "pending", "success", "flagged", "failed")
- notes (text, nullable)
- created_at (timestamp)

API ENDPOINTS
-------------

POST /api/admin/upload/parse
- Input: multipart/form-data (CSV files)
- Output: Parsed tabs with column types

POST /api/admin/upload/generate
- Input: { orgId, tabs, answers, savedMappings? }
- Output: { signals, confidence, filters_applied }

POST /api/admin/upload/save
- Input: { orgId, signals, mappings, uploadMetadata }
- Output: { success, signalIds }

GET /api/admin/upload/mappings/:orgId
- Output: { mappings: [{ source_tool, field_mappings }] }


PERFORMANCE REQUIREMENTS
-------------------------
- Parse 10MB CSV: < 3 seconds
- Generate signals from 5,000 rows: < 10 seconds
- Save to database: < 2 seconds
- Total flow (parse to save): < 20 seconds for typical upload


SECURITY REQUIREMENTS
----------------------
- Only master_admin role can access /admin/organisations/*/upload
- All database writes include created_by audit trail
- File uploads validated (no .exe, no files >10MB)
- Org isolation enforced (admin can't upload to wrong org)


================================================================================
PART 6: TESTING CHECKLIST
================================================================================

From Alex (BI Analyst):

VALIDATION TESTS (Before demo day)
-----------------------------------

1. Upload Locumate's 3 Zoho files (deals, leads, tickets)
   ✓ All 7 signals generate
   ✓ Win rate = 8/12 = 66.7%
   ✓ Pipeline value = sum of open deals
   ✓ Tickets excludes 21 policy acknowledgments
   ✓ All formulas match MSS_BUILD_PLAN_LOCKED.md

2. Re-upload same files with 1 new deal added
   ✓ Mappings auto-apply
   ✓ New deal appears in pipeline
   ✓ Win rate recalculates
   ✓ Shows delta vs previous upload

3. Upload with column name changed
   ✓ Shows warning
   ✓ Suggests similar column
   ✓ Can update mapping

4. Upload with malformed CSV
   ✓ Shows parsing error
   ✓ Identifies problem row
   ✓ Doesn't crash

5. Upload with insufficient data (2 deals)
   ✓ Shows "insufficient data" message
   ✓ Doesn't generate unreliable signals


================================================================================
TIME ESTIMATE
================================================================================

From CTO:

Task 1.5: Admin upload flow (initial + re-upload)
- Build column_mappings table: 1 hour
- Enhance upload modal with org selection: 2 hours
- Auto-apply saved mappings: 2 hours
- Admin verification UI: 3 hours
- Upload history tracking: 2 hours
- Testing with real Zoho data: 2 hours

Total: 12 hours (1.5 days)

Fits within Week 3 of MSS build plan.


================================================================================
SUMMARY
================================================================================

The admin upload flow solves the core MSS problem: getting customer data into the system reliably. The acceptance criteria ensures:

1. SPEED: First upload takes 5 minutes. Re-upload takes 2 minutes.
2. RELIABILITY: Signals are correct or admin is warned.
3. SCALABILITY: Column mappings persist, making customer #2 faster.
4. TRUST: Admin can verify everything before users see it.

By the end of Goal 1 (Week 4), this flow must work flawlessly for Locumate's 3 Zoho files. That's the billing gate.
