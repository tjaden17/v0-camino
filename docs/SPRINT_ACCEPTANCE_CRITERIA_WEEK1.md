SPRINT ACCEPTANCE CRITERIA - WEEK 1 (Feb 16-22, 2026)
========================================================

USER STORY 1: Admin Creates User Accounts with Role-Based KPIs
===============================================================

CONTEXT
-------
Admin needs to create 3 user accounts for Locumate: CEO (Surge), Customer Success Manager, Operations Manager. Each user has different KPIs they care about. The system needs to store these KPIs so the signals page can show "My KPIs" first.

WHO: Admin (solo)
WHAT: Create user accounts with role, KPIs, and priorities
WHY: Users need accounts before they can see signals. Role-based KPIs drive which signals each user sees prominently.


ACCEPTANCE CRITERIA
-------------------

1. ADMIN CAN CREATE A USER ACCOUNT
   ✓ Navigate to /admin/organisations/[orgId]/users
   ✓ Click "Add User" button
   ✓ Form appears with fields:
     - Email (required, validates email format)
     - Full Name (required)
     - Organization Role: dropdown (admin / read-only)
     - Profile Role: dropdown (executive / manager)
     - KPI 1 (text field, optional)
     - KPI 2 (text field, optional)
     - KPI 3 (text field, optional)
   ✓ Submit button disabled until email and full name filled
   ✓ On submit, user account created via Supabase auth
   ✓ User added to organization_members table
   ✓ Profile created with role and KPIs stored

2. ROLE-BASED KPI DEFAULTS
   ✓ When "Profile Role" = "executive", KPI fields pre-populate with:
     - KPI 1: "win rate"
     - KPI 2: "revenue"
     - KPI 3: "pipeline value"
   ✓ When "Profile Role" = "manager", KPI fields pre-populate with:
     - KPI 1: "team performance"
     - KPI 2: "leads per month"
     - KPI 3: empty
   ✓ Admin can override pre-populated values

3. CREATE LOCUMATE'S 3 USERS
   Test case: Admin creates these exact 3 users:
   
   User 1:
   - Email: surge@locumate.com (or test email)
   - Full Name: Surge Singh
   - Org Role: admin
   - Profile Role: executive
   - KPI 1: "win rate"
   - KPI 2: "sales"
   - KPI 3: "pipeline value"
   
   User 2:
   - Email: csmanager@locumate.com
   - Full Name: CS Manager
   - Org Role: read-only
   - Profile Role: manager
   - KPI 1: "ticket resolution"
   - KPI 2: "customer satisfaction"
   - KPI 3: empty
   
   User 3:
   - Email: opsmanager@locumate.com
   - Full Name: Operations Manager
   - Org Role: read-only
   - Profile Role: manager
   - KPI 1: "leads per month"
   - KPI 2: "operational efficiency"
   - KPI 3: empty
   
   ✓ All 3 users created successfully
   ✓ Each has a temporary password (shown once to admin)
   ✓ Each marked as must_change_password = true

4. KPIS STORED IN DATABASE
   ✓ After creation, query profiles table:
     SELECT id, email, role, kpi_1, kpi_2, kpi_3 FROM profiles WHERE organization_id = 'locumate-org-id'
   ✓ Verify Surge has kpi_1='win rate', kpi_2='sales', kpi_3='pipeline value'
   ✓ Verify CS Manager has kpi_1='ticket resolution', kpi_2='customer satisfaction', kpi_3=NULL
   ✓ Verify Ops Manager has kpi_1='leads per month', kpi_2='operational efficiency', kpi_3=NULL

5. USER LIST SHOWS CREATED USERS
   ✓ Navigate to /admin/organisations/[orgId]/users
   ✓ Table shows all 3 users with:
     - Full name
     - Email
     - Profile role (executive / manager)
     - Org role (admin / read-only)
     - KPIs (comma-separated or pills)
   ✓ Can click user row to edit

6. ERROR HANDLING
   ✓ If email already exists, show error: "User with this email already exists"
   ✓ If org doesn't exist, show error: "Organization not found"
   ✓ If Supabase auth fails, show clear error message
   ✓ Form validation prevents empty email/name submission

7. TEMP PASSWORD SHOWN ONCE
   ✓ After creation, modal shows: "User created successfully. Temporary password: [password]. Share this with the user. They will be prompted to change it on first login."
   ✓ Password is random, 16+ chars, includes special chars
   ✓ Closing modal hides password forever (not stored anywhere readable)


DATABASE SCHEMA
---------------
Table: profiles (already exists, add columns if missing)
- id (uuid, FK to auth.users)
- email (text)
- full_name (text)
- organization_id (uuid, FK to organizations)
- role (text: 'executive' | 'manager')
- kpi_1 (text, nullable)
- kpi_2 (text, nullable)
- kpi_3 (text, nullable)
- must_change_password (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)

Table: organization_members (already exists)
- organization_id (uuid)
- user_id (uuid)
- role (text: 'admin' | 'read-only')
- joined_at (timestamp)


CODE CHANGES REQUIRED
---------------------
1. Update /app/admin/actions.ts - createUserAndAddToOrgAction()
   - Add kpi_1, kpi_2, kpi_3 parameters
   - Pass to profiles.upsert()

2. Create /app/admin/organisations/[id]/users/new/page.tsx
   - User creation form
   - Role dropdowns with defaults
   - KPI text fields
   - Calls createUserAndAddToOrgAction()

3. Update /components/admin/user-form.tsx (or create if missing)
   - Form fields for email, name, roles, KPIs
   - Pre-population logic based on role
   - Validation

4. Update /scripts/013_neon_profiles_kpi_columns.sql (already exists)
   - Ensure kpi_1, kpi_2, kpi_3 columns exist (already done)


TESTING CHECKLIST
-----------------
[ ] Run script to add kpi columns if missing: scripts/013_neon_profiles_kpi_columns.sql
[ ] Create Surge Singh (CEO) with 3 KPIs
[ ] Create CS Manager with 2 KPIs
[ ] Create Ops Manager with 2 KPIs
[ ] Query database to verify KPIs stored correctly
[ ] View user list, see all 3 users
[ ] Try creating duplicate email, see error
[ ] Try submitting empty form, validation prevents it
[ ] Verify temp password shown once and is strong


TIME ESTIMATE
-------------
4-6 hours


DEFINITION OF DONE
------------------
✓ All 3 Locumate users created via admin UI
✓ Each user has correct role and KPIs in database
✓ KPIs visible in admin user list
✓ Temp passwords generated and shown to admin
✓ Users can log in and are prompted to change password
✓ Code committed and tested in production


================================================================================


USER STORY 2: Universal Ticket Filtering Pattern Detector
==========================================================

CONTEXT
-------
Locumate's Zoho Desk data has 4,100 tickets but 21 are automated "Policy acknowledgment required" messages, not real customer support tickets. Including these inflates ticket volume and skews resolution time. We need a universal pattern detector that filters out automated tickets across any help desk tool (Zoho, Zendesk, Freshdesk, HubSpot).

WHO: System (runs during signal generation)
WHAT: Detect and filter non-real tickets using common patterns
WHY: Accurate ticket metrics are critical for CS Manager. Wrong numbers kill trust.


ACCEPTANCE CRITERIA
-------------------

1. UNIVERSAL PATTERN DETECTOR EXISTS
   ✓ Create function: isNonRealTicket(ticket: Row, allTickets: Row[]): boolean
   ✓ Detects 4 universal patterns:
     a) Automated subject keywords
     b) Bulk creation timestamps (>5 tickets in 60 seconds)
     c) Zero customer threads + instant close (<5 min)
     d) Known system channels (if column exists)

2. PATTERN 1: AUTOMATED SUBJECT KEYWORDS
   Keywords to detect (case-insensitive):
   - "policy acknowledgment"
   - "auto-reply"
   - "out of office"
   - "automatic reply"
   - "survey reminder"
   - "noreply"
   - "do not reply"
   - "system notification"
   - "password reset"
   - "welcome email"
   
   ✓ Test: Ticket with Subject = "Policy acknowledgment required" → filtered
   ✓ Test: Ticket with Subject = "Auto-reply: Out of office" → filtered
   ✓ Test: Ticket with Subject = "Issue with app" → NOT filtered

3. PATTERN 2: BULK CREATION TIMESTAMPS
   ✓ If >5 tickets created within 60 seconds of each other → all filtered
   ✓ Test with Locumate data:
     - 21 "Policy acknowledgment required" tickets all created 2024-10-10 within minutes
     - All 21 should be flagged as bulk creation
   ✓ Test: Single ticket created alone → NOT filtered

4. PATTERN 3: ZERO THREADS + INSTANT CLOSE
   ✓ If ticket has:
     - Number of Threads = 0 (or column missing)
     - AND closed within 5 minutes of creation
     → filtered
   ✓ Test: Ticket with 0 threads closed in 2 minutes → filtered
   ✓ Test: Ticket with 3 threads closed in 2 minutes → NOT filtered
   ✓ Test: Ticket with 0 threads closed in 2 hours → NOT filtered

5. FILTER APPLIED BEFORE SIGNAL CALCULATION
   ✓ In /app/api/upload/generate/route.ts, before calculateSignal() is called:
     \`\`\`
     if (tab.name.toLowerCase().includes('ticket')) {
       const originalCount = rows.length
       rows = rows.filter(ticket => !isNonRealTicket(ticket, rows))
       const filteredCount = originalCount - rows.length
       console.log(`[v0] Filtered ${filteredCount} non-real tickets`)
     }
     \`\`\`
   ✓ Filtered rows never reach signal calculations

6. LOCUMATE DATA TEST CASES
   Upload zoho-desk-tickets.csv and verify:
   
   ✓ Total rows in CSV: 4,100
   ✓ Rows after filtering: 4,079 (removes 21)
   ✓ Filtered tickets:
     - All 21 "Policy acknowledgment required" tickets (lines 25-45+)
     - Created 2024-10-10 in bulk
     - All have identical resolution time (306 days 01:29 hrs)
   
   ✓ NOT filtered:
     - Line 4: "Issue with app" (real ticket, has threads)
     - Line 2: Real customer tickets with genuine subjects
   
   ✓ Signal: "Tickets This Month" shows correct count (excluding 21)
   ✓ Signal: "Avg Resolution Time" excludes the 306-day bulk tickets

7. METADATA LOGGING
   ✓ After filtering, store in metadata:
     \`\`\`
     metadata.ticketsFiltered = filteredCount
     metadata.ticketsTotal = originalCount
     metadata.filterReasons = [
       { reason: "automated_subject", count: 21 },
       { reason: "bulk_creation", count: 21 },
       { reason: "instant_close_zero_threads", count: 0 }
     ]
     \`\`\`
   ✓ This data shown to admin during verification

8. ADMIN VERIFICATION SCREEN
   ✓ After signal generation, admin sees:
     "Tickets This Month: 4,079 tickets"
     "(Filtered 21 automated tickets)"
   ✓ Click to expand shows:
     "Filtered tickets:
      - 21 tickets: Policy acknowledgment required (bulk created Oct 10, 2024)"
   ✓ Admin can flag false positives (Goal 2 feature, not in sprint)

9. NO FALSE POSITIVES
   ✓ Review 50 random real tickets from CSV
   ✓ Verify 0 are incorrectly filtered
   ✓ Target: 95%+ precision (no false positives)
   ✓ Target: 80%+ recall (catches most noise)

10. CONFIDENCE SCORING (Nice to have, not blocking)
    Each filtered ticket gets a confidence score:
    - High: Matches 2+ patterns (automated subject + bulk creation)
    - Medium: Matches 1 pattern only
    - Low: Edge case
    
    ✓ Log confidence in metadata
    ✓ Only auto-filter "high" confidence (for Goal 1)


CODE CHANGES REQUIRED
---------------------
1. Create /lib/ticket-filter.ts
   - isNonRealTicket() function
   - Pattern detection logic
   - Confidence scoring

2. Update /app/api/upload/generate/route.ts
   - Import ticket filter
   - Apply filter before calculateSignal() if row type is tickets
   - Log filtered count and reasons

3. Update signal metadata schema (if needed)
   - Add ticketsFiltered, ticketsTotal, filterReasons fields

4. Update admin verification UI
   - Show filtered ticket summary
   - Expandable details of what was filtered


TESTING CHECKLIST
-----------------
[ ] Upload zoho-desk-tickets.csv (4,100 rows)
[ ] Verify 21 "Policy acknowledgment" tickets filtered
[ ] Check console logs show: "[v0] Filtered 21 non-real tickets"
[ ] Signal "Tickets This Month" = 4,079 (not 4,100)
[ ] Signal "Avg Resolution Time" excludes 306-day bulk tickets
[ ] Admin verification screen shows "Filtered 21 automated tickets"
[ ] Review 50 random real tickets, verify 0 false positives
[ ] Test with edge case: single ticket with automated subject → filtered
[ ] Test with edge case: real ticket with 0 threads but long resolution → NOT filtered


TIME ESTIMATE
-------------
3-4 hours


DEFINITION OF DONE
------------------
✓ isNonRealTicket() function created and tested
✓ Filter applied before signal calculations
✓ Locumate's 21 policy tickets filtered correctly
✓ 0 false positives on real tickets
✓ Filtered count visible to admin
✓ Console logs show filtering activity
✓ Code committed and tested with real data


================================================================================

SPRINT SUMMARY
==============

Story 1: Admin Creates User Accounts (4-6 hours)
Story 2: Universal Ticket Filtering (3-4 hours)

Total estimate: 7-10 hours
Target completion: Friday Feb 21, 2026

After completion, Locumate will have:
- 3 user accounts (CEO, CS Manager, Ops Manager) with role-based KPIs
- Accurate ticket metrics with automated tickets filtered out
- Foundation for Week 2: personalised AI interpretation using stored KPIs
