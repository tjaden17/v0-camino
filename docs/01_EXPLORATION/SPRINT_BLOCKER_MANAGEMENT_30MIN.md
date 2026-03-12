# 30-Minute Sprint Blocker Management (80/20 Version)

Last Updated: February 23, 2026

## The 30-Minute Framework

Do this ONCE per sprint, at the start of the week. Total time: 30 minutes.

---

## PART 1: Tech Spikes (15 minutes)

**Goal:** Identify unknown unknowns before they become mid-sprint blockers.

### Minute 0-5: Scan for Red Flags

Look at your sprint tasks and ask:
- "Have I built something like this before?"
- "Does this touch unfamiliar APIs or services?"
- "Am I making assumptions about how something works?"

**Red flags:**
- First time integrating with X (Zoho API, Supabase RLS, etc.)
- Unfamiliar library or pattern
- Unclear data flow or architecture
- Performance concerns ("will this scale?")

**Output:** List of 1-3 unknowns. Example: "Does Zoho API support filtering on custom fields?"


### Minute 5-10: 5-Minute Spike per Unknown

For each unknown, spend 5 minutes to answer: **"Is this possible and roughly how?"**

**What to do:**
1. Check official docs (2 min)
2. Search for code example or Stack Overflow (2 min)
3. Write one-sentence answer (1 min)

**DO NOT:**
- Write production code
- Read entire documentation
- Try multiple approaches

**Example spike:**
- Question: "Can Zoho API filter on custom fields?"
- Search: "Zoho CRM API custom field filter"
- Find: Yes, use criteria parameter with custom field API name
- Answer: "Possible via criteria param. Need API name mapping."
- Confidence: High ✅

**Output:** Simple answers with confidence level (High/Medium/Low)


### Minute 10-15: Document Spike Results

Create a spike doc (or add to sprint notes):

\`\`\`
SPRINT 3 TECH SPIKES

Unknown: Zoho API custom field filtering
Answer: Possible via criteria parameter
Confidence: High
Blocker Risk: Low
Notes: Need to map custom field names first

Unknown: Supabase RLS for org-level data
Answer: Use auth.uid() in policy + orgs table join
Confidence: Medium (need to test)
Blocker Risk: Medium
Notes: Schedule 1hr to build prototype policy
\`\`\`

**Decision Rule:**
- Low confidence + High blocker risk = Schedule spike time in sprint
- Medium confidence = Proceed, but flag as potential blocker
- High confidence = Ship it


---

## PART 2: Dependency Mapping (15 minutes)

**Goal:** Identify what order to build things so you don't get stuck.

### Minute 15-20: List All Sprint Tasks

Write down every task for the sprint. Example:

1. Build Zoho integration service
2. Add signal filtering UI
3. Create data sync scheduler
4. Update dashboard to show synced data
5. Add integration settings page


### Minute 20-25: Draw Dependencies (Visual)

Use simple arrows to show "X needs Y first":

\`\`\`
[Integration Settings Page]
          ↓ (needs endpoint)
[Zoho Integration Service] → [Data Sync Scheduler]
          ↓                          ↓
          ↓                          ↓
    [Dashboard Update] ← [Signal Filtering UI]
\`\`\`

**Simple rule:** If task A reads/uses data from task B, draw arrow from B to A.


### Minute 25-30: Prioritize Build Order

Number tasks in the order you'll build them:

**Build Order:**
1. Zoho Integration Service (nothing depends on this)
2. Data Sync Scheduler (depends on #1)
3. Integration Settings Page (depends on #1)
4. Signal Filtering UI (depends on #2)
5. Dashboard Update (depends on #4)

**Output:** Ordered task list that prevents "I can't do X because Y isn't done yet"


---

## The 80/20 Shortcuts

### What to SKIP (these are 20% activities that give <5% value):

❌ **Don't** write detailed technical specs for spikes
❌ **Don't** build proof-of-concepts unless confidence is LOW
❌ **Don't** map dependencies for single-file changes
❌ **Don't** spike things you've built before
❌ **Don't** create elaborate dependency diagrams

### What to FOCUS ON (these are 80% of blocker prevention):

✅ **Do** spike unfamiliar APIs/integrations
✅ **Do** map dependencies for multi-task sprints
✅ **Do** write one-sentence answers to unknowns
✅ **Do** order tasks so blockers surface early
✅ **Do** timebox spikes to 5 minutes max

---

## When to Expand Beyond 30 Minutes

**Add a 1-hour deep spike if:**
- Low confidence + critical path blocker
- New architecture pattern (first time using RLS, first integration, etc.)
- Performance unknowns on core features

**Schedule the deep spike IN the sprint**, don't do it in the 30-minute session.

---

## Template: Weekly 30-Minute Blocker Check

\`\`\`
SPRINT X - BLOCKER CHECK (30 minutes)
Date: [Date]

TECH SPIKES (15 min)
- Unknown 1: [Question]
  - Answer: [One sentence]
  - Confidence: High/Medium/Low
  - Risk: Low/Medium/High
  
- Unknown 2: [Question]
  - Answer: [One sentence]
  - Confidence: High/Medium/Low
  - Risk: Low/Medium/High

DEPENDENCY MAP (15 min)
Build Order:
1. [Task] - no dependencies
2. [Task] - needs #1
3. [Task] - needs #1
4. [Task] - needs #2, #3
5. [Task] - needs #4

BLOCKERS FLAGGED:
- [Task X]: Low confidence, needs 1hr spike on [date]
- [Task Y]: Depends on external API docs (ping vendor)

GOOD TO GO:
- [All other tasks]: High confidence, clear path
\`\`\`

---

## Real Example: Zoho Integration Sprint

**Tech Spikes (15 min):**

Unknown 1: Can Zoho API handle rate limiting gracefully?
- Answer: Yes, returns 429 with retry-after header
- Confidence: High
- Risk: Low
- Notes: Use exponential backoff

Unknown 2: How to map Zoho custom fields to our signal schema?
- Answer: Use custom field API name + mapping table
- Confidence: Medium (need to test field types)
- Risk: Medium
- Notes: Build mapping prototype first day

Unknown 3: Can we filter out automated tickets in Zoho Desk?
- Answer: Yes, via category or tag filter
- Confidence: High
- Risk: Low

**Dependency Map (15 min):**

Build Order:
1. Custom field mapping service (nothing depends on it)
2. Zoho API client (depends on #1)
3. Data sync job (depends on #2)
4. Filtering UI (depends on #3)
5. Dashboard updates (depends on #4)

**Blockers Flagged:**
- Custom field mapping needs 1hr spike on Day 1 (medium confidence)

**Good to Go:**
- API rate limiting, filtering, dashboard - all clear

**Result:** Sprint runs smoothly, no mid-week "wait, how does this work?" moments.

---

## Success Metrics

You're doing this right if:
- ✅ You spend exactly 30 minutes, not more
- ✅ You catch 1-2 blockers before they bite you
- ✅ You know what to build first
- ✅ You feel confident starting sprint work

You're overthinking it if:
- ❌ You spend 2+ hours on spikes
- ❌ You write detailed technical docs
- ❌ You build prototypes in this session
- ❌ You map dependencies for trivial tasks

---

## Integration with Your Workflow

**When to do this:**
- Monday morning, before sprint kickoff
- Or Friday afternoon, planning next week

**Where to document:**
- Add to sprint notes in your task tracker
- Or create a "SPRINT_X_BLOCKERS.md" file
- Don't create elaborate systems, keep it lightweight

**How to act on it:**
- Reorder tasks based on dependency map
- Schedule deep spikes as calendar blocks
- Share confidence levels with stakeholders if needed

---

## Key Principle

**30 minutes of planning prevents 3 hours of mid-sprint thrashing.**

Don't build anything. Don't read entire docs. Just answer: "Is this possible, and what order should I build it?"

That's the 80/20.
