WEEKLY SPRINT PLAN
Week of 16 - 22 February 2026

================================================================================

SPRINT PRINCIPLES
-----------------
- 3-5 user stories per sprint. Tested.
- Focus: a few stories done and tested, versus many undone.
- Each user story must have acceptance criteria before work begins.

================================================================================

BOARD
================================================================================

BACKLOG
-------

Story: Data In — Pre-built column mapping templates per tool

Context:
Build a column mapping template system with a proper database table. Store
Locumate's Zoho mappings as the first three templates. This removes the need
for admins to manually re-map columns on every upload.

Acceptance Criteria:
- Builds the column mapping template system with a proper database table
- Stores Locumate's Zoho CRM, Zoho Desk, and Zoho Leads mappings as the
  first three templates
- Templates auto-apply on re-upload for matching source tools
- Admin can view, edit, and override saved templates

Related docs:
- 00_DECISIONS/architecture/DUAL_PATH_STORAGE.md
- 00_DECISIONS/sprint/ADMIN_UPLOAD_AC.md

--------------------------------------------------------------------------------

IN PROGRESS
-----------

Story: Understanding — Admin creates 2 user accounts with role-based profiles

Context:
Admin needs to create user accounts for Locumate with role-based KPI profiles.
Each user role (executive, manager) has different default KPIs that drive
which signals they see first.

Acceptance Criteria:
- Admin can create a user account with email, name, org role, profile role,
  and up to 3 KPIs
- Role selection pre-populates default KPIs (executive: win rate, revenue,
  pipeline value)
- All 3 Locumate users created: Surge Singh (CEO), CS Manager, Ops Manager
- KPIs stored in profiles table and visible in user list
- Temporary password generated and shown once to admin

Related docs:
- 00_DECISIONS/sprint/WEEK1_ACCEPTANCE_CRITERIA.md (Story 1)

--------------------------------------------------------------------------------

Story: Data In — Universal pattern detector to catch non-real tickets

Context:
Locumate's Zoho Desk export contains 21 automated "Policy acknowledgment
required" tickets that are not real customer support tickets. A universal
pattern detector filters these out before signal calculation, ensuring
accurate ticket metrics.

Acceptance Criteria:
- Filter tickets before signal calculation using isNonRealTicket() function
- Detects 4 patterns: automated subject keywords, bulk creation timestamps,
  zero-thread instant-close tickets, known system channels
- Locumate test: 4,100 rows in → 4,079 rows used (21 filtered)
- Filtered count visible to admin in verification screen
- Zero false positives on real customer tickets
- See ai-panel-consultations/TICKET_FILTERING.md for full pattern spec

Related docs:
- 00_DECISIONS/sprint/WEEK1_ACCEPTANCE_CRITERIA.md (Story 2)
- 01_EXPLORATION/ai-panel-consultations/TICKET_FILTERING.md

--------------------------------------------------------------------------------

DONE (Tested in Staging)
------------------------

[ No stories marked done yet this sprint ]

================================================================================

SPRINT STATUS
================================================================================

Week:        16 - 22 February 2026
Stories:     3 total (1 backlog, 2 in progress, 0 done)
Focus:       Data in + user account foundation for Locumate pilot

Next actions:
1. Complete and test "Admin creates 2 user accounts" story
2. Complete and test "Universal pattern detector" story
3. Move "Pre-built column mapping templates" from backlog to in-progress

================================================================================

RELATED SPRINT DOCS
================================================================================

- WEEK1_ACCEPTANCE_CRITERIA.md  — Detailed AC for stories 1 and 2
- ADMIN_UPLOAD_AC.md            — Full upload flow acceptance criteria
- CAMINO_ROADMAP_FINAL.md       — Parent roadmap this sprint sits within
