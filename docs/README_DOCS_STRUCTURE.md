# Documentation Organization Guide

**Last Updated:** Feb 21, 2026

This guide explains how documentation is organized in the `/docs` folder to separate **decided truth** from **ideas and exploration**.

---

## Folder Structure

\`\`\`
/docs
├── README_DOCS_STRUCTURE.md          ← You are here
├── SOURCE_OF_TRUTH.md                ← Master navigation to current decisions
│
├── 00_DECISIONS/                     ← ✅ DECIDED - Current source of truth
│   ├── roadmap/
│   ├── architecture/
│   ├── sprint/
│   └── customer/
│
├── 01_EXPLORATION/                   ← 💭 IDEAS - Brainstorming & research
│   ├── ai-panel-consultations/
│   ├── future-features/
│   └── learning/
│
└── 02_ARCHIVE/                       ← 📦 OLD - Superseded or outdated
    ├── deprecated-specs/
    └── old-plans/
\`\`\`

---

## 📁 Folder Purposes

### `00_DECISIONS/` - Source of Truth ✅
**Status:** LOCKED. These are active decisions that drive current work.

**What goes here:**
- Active roadmap and sprint plans
- Current architecture decisions
- Live customer agreements
- Active acceptance criteria
- Current technical specs

**Rules:**
- ✅ Files here are **the truth** - reference these when building
- ✅ Update files in place when decisions evolve
- ✅ Add a "Last Updated" date at the top of each file
- ❌ Don't delete - move to archive instead
- ❌ Don't add "draft" or exploratory docs here

**Examples:**
- `roadmap/MSS_BUILD_PLAN_LOCKED.md` - Current 8-month plan
- `sprint/SPRINT_ACCEPTANCE_CRITERIA_WEEK1.md` - This week's AC
- `architecture/DUAL_PATH_STORAGE_GUIDE.md` - How we store data
- `customer/CUSTOMER_AGREEMENT.md` - What we promised Locumate

---

### `01_EXPLORATION/` - Ideas & Research 💭
**Status:** FLEXIBLE. Brainstorming, research, future planning.

**What goes here:**
- AI panel consultations (exploring options)
- Future feature explorations
- Learning materials and references
- "What if" scenarios
- Technical research

**Rules:**
- ✅ Safe to experiment and add freely
- ✅ Can contradict each other - these are explorations
- ✅ Add dates and context to file names
- ✅ Reference these when planning future work
- ❌ Don't reference these when building current features

**Examples:**
- `ai-panel-consultations/DATA_CRAWLER_2026-02.md` - Exploring automation
- `future-features/CUSTOM_SIGNALS_EXPLORATION.md` - Goal 3 ideas
- `learning/LEARNING_CURRICULUM_12_WEEKS.txt` - Educational content

---

### `02_ARCHIVE/` - Outdated & Superseded 📦
**Status:** READ-ONLY. Historical reference only.

**What goes here:**
- Superseded specs and plans
- Old roadmap versions
- Deprecated architecture docs
- Replaced decisions

**Rules:**
- ✅ Files moved here when replaced by newer versions
- ✅ Keep for historical context
- ✅ Add `_ARCHIVED_YYYY-MM-DD` to filename
- ❌ Never reference these in new work
- ❌ Don't edit - they're historical snapshots

**Examples:**
- `deprecated-specs/PRODUCT_SPEC_DOC_ARCHIVED_2026-01.md`
- `old-plans/DELIVERY_PLAN_MVP_ARCHIVED_2026-02.md`

---

## 🔄 Workflow: Idea → Decision → Archive

### 1. Brainstorming a New Feature
\`\`\`
Create: /docs/01_EXPLORATION/future-features/my-idea-2026-02.md
→ Explore, research, consult AI panel
→ Iterate freely
\`\`\`

### 2. Making a Decision
\`\`\`
Move to: /docs/00_DECISIONS/architecture/my-feature-design.md
→ Lock down the approach
→ Update SOURCE_OF_TRUTH.md to reference it
→ Build against this document
\`\`\`

### 3. Replacing a Decision
\`\`\`
Old file: /docs/00_DECISIONS/architecture/old-design.md
→ Move to: /docs/02_ARCHIVE/deprecated-specs/old-design_ARCHIVED_2026-02.md
New file: /docs/00_DECISIONS/architecture/new-design.md
→ Update SOURCE_OF_TRUTH.md to point to new file
\`\`\`

---

## 🎯 Quick Reference: "Where Does This Go?"

| Document Type | Folder | Example |
|--------------|--------|---------|
| Current roadmap | `00_DECISIONS/roadmap/` | MSS_BUILD_PLAN_LOCKED.md |
| This week's sprint AC | `00_DECISIONS/sprint/` | SPRINT_AC_WEEK1.md |
| Active architecture | `00_DECISIONS/architecture/` | DUAL_PATH_STORAGE_GUIDE.md |
| Customer contract | `00_DECISIONS/customer/` | CUSTOMER_AGREEMENT.md |
| Technical spec (live) | `00_DECISIONS/specs/` | SIGNAL_CATALOG.md |
| AI consultation | `01_EXPLORATION/ai-panel/` | DATA_CRAWLER_CONSULT.md |
| Future feature idea | `01_EXPLORATION/future/` | CUSTOM_SIGNALS_IDEA.md |
| Learning content | `01_EXPLORATION/learning/` | LEARNING_CURRICULUM.txt |
| Old roadmap | `02_ARCHIVE/old-plans/` | DELIVERY_PLAN_ARCHIVED.md |
| Replaced spec | `02_ARCHIVE/deprecated/` | OLD_SPEC_ARCHIVED.md |

---

## 🚨 Critical Rule: SOURCE_OF_TRUTH.md

**Always keep `/docs/SOURCE_OF_TRUTH.md` updated.**

This file is your master index. It points to:
- The current roadmap
- The current sprint
- Key architecture decisions
- Active customer agreements

When you're about to build something, start with `SOURCE_OF_TRUTH.md` to find the right decision document.

---

## 📋 Checklist: Adding a New Document

- [ ] Determine status: Decision, Exploration, or Archive?
- [ ] Place in correct folder
- [ ] Add "Last Updated" date at top
- [ ] Update `SOURCE_OF_TRUTH.md` if it's a decision
- [ ] Use descriptive filename with context/date if needed
- [ ] Archive any superseded documents

---

## 🔧 Migration Plan

We'll migrate existing docs in phases:

**Phase 1 (Now):** Create folder structure
**Phase 2 (This week):** Move decision docs to `00_DECISIONS/`
**Phase 3 (Next week):** Move exploration docs to `01_EXPLORATION/`
**Phase 4 (As needed):** Archive old docs to `02_ARCHIVE/`

---

## ❓ FAQ

**Q: What if a document is both a decision AND exploration?**
A: Split it. Put the decided parts in `00_DECISIONS/` and the exploratory parts in `01_EXPLORATION/`.

**Q: Can I delete old documents?**
A: No - move them to `02_ARCHIVE/` instead. They provide historical context.

**Q: What if I'm not sure if something is decided yet?**
A: Keep it in `01_EXPLORATION/` until the decision is locked. Only move to `00_DECISIONS/` when it's driving current work.

**Q: How do I know what's the "current" version of something?**
A: Check `SOURCE_OF_TRUTH.md` first. It always points to current decisions.

**Q: Should I update files in `00_DECISIONS/` or create new versions?**
A: Update in place for small changes. For major revisions, archive the old version and create a new file.

---

**Remember:** When building features, always start with `/docs/SOURCE_OF_TRUTH.md` → find the relevant decision doc → build to that spec. Never build from exploration or archived docs.
