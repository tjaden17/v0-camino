# Documentation Migration Plan

**Created:** Feb 21, 2026  
**Status:** Ready to Execute

This document maps where your current docs should be moved to organize them properly.

---

## Migration Categories

### ✅ DECISIONS - Move to `/docs/00_DECISIONS/`

These are active decisions driving current work:

#### Roadmap & Planning
- `CRITICAL_PATH_ROADMAP_PLANNING.md` → `00_DECISIONS/roadmap/CRITICAL_PATH_ROADMAP.md`
- `MSS_BUILD_PLAN_LOCKED.md` → `00_DECISIONS/roadmap/MSS_BUILD_PLAN_LOCKED.md`
- `GOAL_DECISION_FRAMEWORK.md` → `00_DECISIONS/roadmap/GOAL_DECISION_FRAMEWORK.md`
- `MSS_KEY_LINKS.md` → `00_DECISIONS/roadmap/MSS_KEY_LINKS.md`
- `CAMINO_PRODUCT_ROADMAP.md` → `00_DECISIONS/roadmap/PRODUCT_ROADMAP.md`

#### Current Sprint
- `SPRINT_ACCEPTANCE_CRITERIA_WEEK1.md` → `00_DECISIONS/sprint/WEEK1_ACCEPTANCE_CRITERIA.md`
- `ADMIN_UPLOAD_FLOW_ACCEPTANCE_CRITERIA.md` → `00_DECISIONS/sprint/ADMIN_UPLOAD_AC.md`

#### Architecture & Technical
- `DUAL_PATH_STORAGE_GUIDE.md` → `00_DECISIONS/architecture/DUAL_PATH_STORAGE.md`
- `INTEGRATION_ARCHITECTURE.md` → `00_DECISIONS/architecture/INTEGRATION_ARCHITECTURE.md`
- `SIGNAL_SERVICE_V2_ARCHITECTURE.md` → `00_DECISIONS/architecture/SIGNAL_SERVICE_V2.md`
- `USER_FLOW_DATA_ARCHITECTURE.md` → `00_DECISIONS/architecture/USER_FLOW_DATA.md`
- `UX_FLOW_UPLOAD_TO_SIGNAL.md` → `00_DECISIONS/architecture/UX_FLOW_UPLOAD.md`
- `INTELLIGENT_MAPPING_GUIDE.md` → `00_DECISIONS/architecture/INTELLIGENT_MAPPING.md`

#### Specifications
- `SIGNAL_CATALOG.md` → `00_DECISIONS/specs/SIGNAL_CATALOG.md`
- `SIGNAL_DISCOVERY_GUIDE.md` → `00_DECISIONS/specs/SIGNAL_DISCOVERY_GUIDE.md`
- `METRIC_SPECIFICATIONS.md` → `00_DECISIONS/specs/METRIC_SPECIFICATIONS.md`
- `signal-service-master.md` → `00_DECISIONS/specs/SIGNAL_SERVICE_MASTER.md`

#### Customer & Integration
- `CUSTOMER_AGREEMENT.md` → `00_DECISIONS/customer/CUSTOMER_AGREEMENT.md`
- `PILOT_CUSTOMER_ZOHO_SETUP.md` → `00_DECISIONS/customer/PILOT_ZOHO_SETUP.md`
- `ZOHO_INTEGRATION_ROADMAP.md` → `00_DECISIONS/integrations/ZOHO_ROADMAP.md`

#### Testing
- `SIGNAL_SYSTEM_TEST_PLAN.md` → `00_DECISIONS/testing/SIGNAL_SYSTEM_TEST_PLAN.md`

---

### 💭 EXPLORATION - Move to `/docs/01_EXPLORATION/`

These are ideas, research, and future planning:

#### AI Panel Consultations
- `AI_EXPERT_PANEL.md` → `01_EXPLORATION/ai-panel-consultations/EXPERT_PANEL_INTRO.md`
- `AI_PANEL_CONSULTATION_API_INTEGRATION.md` → `01_EXPLORATION/ai-panel-consultations/API_INTEGRATION.md`
- `AI_PANEL_CONSULTATION_CUSTOM_SIGNALS.md` → `01_EXPLORATION/ai-panel-consultations/CUSTOM_SIGNALS.md`
- `AI_PANEL_CONSULTATION_DATA_CRAWLER.md` → `01_EXPLORATION/ai-panel-consultations/DATA_CRAWLER.md`
- `AI_PANEL_CONSULTATION_LEAD_MAGNET.md` → `01_EXPLORATION/ai-panel-consultations/LEAD_MAGNET.md`
- `AI_PANEL_CONSULTATION_LEAD_MAGNET_RESTRICTIONS.md` → `01_EXPLORATION/ai-panel-consultations/LEAD_MAGNET_RESTRICTIONS.md`
- `AI_PANEL_CONSULTATION_SCALABILITY.md` → `01_EXPLORATION/ai-panel-consultations/SCALABILITY.md`
- `AI_PANEL_CONSULTATION_TICKET_FILTERING.md` → `01_EXPLORATION/ai-panel-consultations/TICKET_FILTERING.md`

#### Learning & Resources
- `LEARNING_CURRICULUM_12_WEEKS.txt` → `01_EXPLORATION/learning/CURRICULUM_12_WEEKS.txt`
- `LEARNING_AUDIO_CHAPTERS/` → `01_EXPLORATION/learning/audio-chapters/`
- `CAMINO_BUILDER_AUDIOBOOK_COMPLETE.txt` → `01_EXPLORATION/learning/BUILDER_AUDIOBOOK.txt`
- `CAMINO_BUILDER_AUDIOBOOK_COMPLETE_TTS.txt` → `01_EXPLORATION/learning/BUILDER_AUDIOBOOK_TTS.txt`

---

### 📦 ARCHIVE - Move to `/docs/02_ARCHIVE/`

These have been superseded or are outdated:

#### Deprecated Specs
- `PRODUCT-SPEC.md` → `02_ARCHIVE/deprecated-specs/PRODUCT_SPEC_V1_ARCHIVED_2026-02.md`
- `PRODUCT_SPEC.md` → `02_ARCHIVE/deprecated-specs/PRODUCT_SPEC_V2_ARCHIVED_2026-02.md`
- `PRODUCT_SPEC_DOC.md` → `02_ARCHIVE/deprecated-specs/PRODUCT_SPEC_DOC_ARCHIVED_2026-02.md`

#### Old Plans
- `DELIVERY_PLAN_MVP.md` → `02_ARCHIVE/old-plans/DELIVERY_PLAN_MVP_ARCHIVED_2026-02.md`
- `DELIVERY_PLAN_MVP_GDOC.txt` → `02_ARCHIVE/old-plans/DELIVERY_PLAN_MVP_GDOC_ARCHIVED_2026-02.txt`
- `MODULES_3_FEB_2026.md` → `02_ARCHIVE/old-plans/MODULES_3_FEB_ARCHIVED_2026-02.md`
- `MODULES_3_FEB_2026_FRIENDLY.txt` → `02_ARCHIVE/old-plans/MODULES_3_FEB_FRIENDLY_ARCHIVED_2026-02.txt`
- `MSS_SCOPE.txt` → `02_ARCHIVE/old-plans/MSS_SCOPE_ARCHIVED_2026-02.txt`
- `TECH_SPEC_MODULES_MVP.txt` → `02_ARCHIVE/old-plans/TECH_SPEC_MVP_ARCHIVED_2026-02.txt`
- `architecture-modules.md` → `02_ARCHIVE/old-plans/ARCHITECTURE_MODULES_ARCHIVED_2026-02.md`
- `delivery-plan.ts` → `02_ARCHIVE/old-plans/delivery-plan_ARCHIVED_2026-02.ts`

#### Friendly/Duplicate Versions
- `CUSTOMER_AGREEMENT_FRIENDLY.txt` → `02_ARCHIVE/duplicates/CUSTOMER_AGREEMENT_FRIENDLY_ARCHIVED_2026-02.txt`

---

### ✨ KEEP AS-IS (Root Level)

These serve special purposes and stay at root:

- `SOURCE_OF_TRUTH.md` ← Master index
- `README_DOCS_STRUCTURE.md` ← This guide
- `MIGRATION_PLAN.md` ← This file

---

### 📂 SUBFOLDER: customer-data/

Keep this separate - it's sample/test data:
- `customer-data/` ← Leave as-is, it's test fixtures

---

## Execution Steps

### Step 1: Create Folder Structure
```bash
mkdir -p docs/00_DECISIONS/roadmap
mkdir -p docs/00_DECISIONS/sprint
mkdir -p docs/00_DECISIONS/architecture
mkdir -p docs/00_DECISIONS/specs
mkdir -p docs/00_DECISIONS/customer
mkdir -p docs/00_DECISIONS/integrations
mkdir -p docs/00_DECISIONS/testing

mkdir -p docs/01_EXPLORATION/ai-panel-consultations
mkdir -p docs/01_EXPLORATION/future-features
mkdir -p docs/01_EXPLORATION/learning/audio-chapters

mkdir -p docs/02_ARCHIVE/deprecated-specs
mkdir -p docs/02_ARCHIVE/old-plans
mkdir -p docs/02_ARCHIVE/duplicates
```

### Step 2: Move Decision Files (Priority 1)
Move roadmap, sprint, architecture, and spec files first. Update `SOURCE_OF_TRUTH.md` immediately after.

### Step 3: Move Exploration Files (Priority 2)
Move AI consultations and learning materials.

### Step 4: Archive Old Files (Priority 3)
Move superseded and old documents to archive.

### Step 5: Update References
- Update `SOURCE_OF_TRUTH.md` with new paths
- Update `.cursorrules` if it references old paths
- Update any internal links in documents

---

## After Migration

### New Document Workflow

**Adding a new idea:**
```bash
# Create in exploration
touch docs/01_EXPLORATION/future-features/my-idea-2026-02.md
# Iterate and research
```

**Locking down a decision:**
```bash
# Move to decisions
mv docs/01_EXPLORATION/future-features/my-idea-2026-02.md \
   docs/00_DECISIONS/architecture/my-feature.md
# Update SOURCE_OF_TRUTH.md
```

**Replacing a decision:**
```bash
# Archive old version
mv docs/00_DECISIONS/architecture/old-feature.md \
   docs/02_ARCHIVE/deprecated-specs/old-feature_ARCHIVED_2026-02.md
# Create new version
touch docs/00_DECISIONS/architecture/new-feature.md
# Update SOURCE_OF_TRUTH.md
```

---

## Quick Commands

```bash
# See what's decided (what you should build to)
ls docs/00_DECISIONS/**/*

# See what's being explored (future work)
ls docs/01_EXPLORATION/**/*

# See what's archived (historical reference)
ls docs/02_ARCHIVE/**/*
```

---

**Ready to execute? Start with Step 1 above, then migrate decision docs first.**
