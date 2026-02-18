CAMINO MVP - SOURCE OF TRUTH DOCUMENTS
==========================================

Last updated: Feb 19, 2026

## Primary Planning Documents

These two documents are the definitive source for what we're building and when:

### 1. Plan: CAMINO Roadmap (Final)
**Location:** `user_read_only_context/text_attachments/Plan_-CAMINO-Roadmap-(Final)-9CQmG.pdf`

**Purpose:** Strategic roadmap defining the 4 monthly goals and decision moments

**Contains:**
- User problems we're solving (4 core problems)
- Tech architecture overview (modular monolith)
- 5 modular areas (Understanding, Data In, Signal Calcs, Interpretation, Presentation)
- 4 monthly goals with decision moments:
  - Goal 1: Will Surge pay by Mar 14? (Month 1)
  - Goal 2: Will Surge pay for 3 months? (Month 2-3)
  - Goal 3: Will customers 2-5 commit? (Month 3-4)
  - Goal 4: Will strangers self-serve? (Month 5-8)
- Critical path Gantt view
- Backlog tradeoffs
- Panel questions

**When to reference:** When planning monthly milestones, understanding the big picture, making feature prioritization decisions, or questioning whether something should be built now vs later.

---

### 2. Do: Weekly Sprint Plan + AC
**Location:** `user_read_only_context/text_attachments/Do_-Weekly-Sprint-plan-+-AC-YhG08.pdf`

**Purpose:** Tactical execution plan for the current sprint (Feb 16-22)

**Contains:**
- 3-5 user stories for the week
- Acceptance criteria for each story
- Three columns: Backlog, In Progress, Done (tested in staging)
- Current sprint user stories:
  1. Understanding: Admin create 2 user accounts with role-based profiles
  2. Data In: Universal pattern detector (catch non-real tickets)
  3. Data In: Pre-built column mapping templates per tool

**When to reference:** When implementing features, writing code, testing, or checking what's in scope for this week.

---

## How These Documents Work Together

**Roadmap → Sprint → Code**

```
Plan: CAMINO Roadmap (Final)
    ↓
Defines Goal 1: Will Surge pay by Mar 14?
    ↓
Week 1 critical path items
    ↓
Do: Weekly Sprint Plan + AC
    ↓
3-5 user stories with acceptance criteria
    ↓
Code implementation (what you're building now)
```

---

## Weekly Planning Process

**Sunday:**
1. Read "Plan: CAMINO Roadmap (Final)" to understand Goal 1 and Week 1 critical path
2. Read "Do: Weekly Sprint Plan + AC" to see the 3-5 user stories for this week
3. Confirm each story has acceptance criteria
4. Identify the critical path items (what MUST be done)

**Monday-Thursday:**
- Build only what's in the sprint plan
- Reference acceptance criteria to know when "done" is done
- Test in staging before moving to "Done" column

**Friday:**
- Demo or validate with real data
- Update sprint plan: move completed items to "Done"
- Reflect: did we achieve the weekly goal?

**Saturday:**
- Plan next week based on critical path

---

## Key Principles from the Roadmap

**Decision-focused goals:**
Every goal = ONE decision by ONE person at ONE moment. Not "build features" but "reach a decision point."

**Critical path thinking:**
If it's not on the critical path to the next decision, defer it. Week 1 example: column mapping is critical (can't upload without it), email notifications are not (parallel, non-critical).

**70% rule:**
Ship when 70% done. Last 30% is polish for later. Exception: don't ship broken trust items (wrong calculations, missing data quality).

**Trade-off test:**
1. Does this enable the next goal decision? (Yes = build, No = defer)
2. Can a human do this manually for 5 customers? (Yes = keep manual)
3. Will wrong answer break trust? (Yes = must be correct)
4. Does it take <2 hours? (Yes = just build it)

---

## Supporting Documentation

These local docs provide deeper context but should align with the two source documents:

- `/docs/MSS_BUILD_PLAN_LOCKED.md` - Detailed Week 1-4 build plan for Goal 1
- `/docs/CAMINO_PRODUCT_ROADMAP.md` - Panel recommendations organized by 5 modules
- `/docs/GOAL_DECISION_FRAMEWORK.md` - How to think about decision-focused goals
- `/docs/CRITICAL_PATH_ROADMAP_PLANNING.md` - Critical path methodology
- `/docs/SPRINT_ACCEPTANCE_CRITERIA_WEEK1.md` - Detailed AC for Week 1 user stories
- `/docs/AI_EXPERT_PANEL.md` - The 11-person expert panel for consultations
- `/docs/AI_PANEL_CONSULTATION_*.md` - Expert panel answers to specific questions

**If there's a conflict:** The two source documents (Roadmap Final + Weekly Sprint Plan) take precedence.

---

## How to Use This System

**When planning:**
→ Read the Roadmap to understand the goal and critical path

**When building:**
→ Read the Sprint Plan to see this week's user stories and AC

**When deciding:**
→ Ask: "Does this help reach Surge's Mar 14 decision?" If no, defer.

**When stuck:**
→ Consult the AI Expert Panel docs for specific technical or product questions

---

## Current Sprint Status (Feb 16-22)

**Goal:** Foundation week - Column mapping, ticket filtering, user accounts with KPIs

**Critical path items:**
- ✅ Admin create user accounts with KPI fields (DONE - implemented Feb 19)
- ⏳ Universal pattern detector for ticket filtering (IN PROGRESS)
- ⏳ Column mapping template system (BACKLOG)

**By Friday Feb 22, this must be true:**
"Surge's 3 Zoho CSVs can be uploaded, non-real tickets filtered out, and 3 user accounts exist with correct KPIs."

If this isn't true by Friday, we're off the critical path to the Mar 14 decision.
