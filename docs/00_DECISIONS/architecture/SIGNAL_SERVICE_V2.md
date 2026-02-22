# Signal Service v2 (Surge) - Architecture & Implementation Plan

## Executive Summary

This document explains how the Signal Service v2 will work and how we'll build it to meet the updated requirements. The architecture addresses the three key challenges: immediate signal visibility with AI analysis capability, scalable user-driven data mapping, and intelligent signal ranking.

---

## 1. System Overview

### High-Level Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                         USER UPLOADS DATA                        │
│                    (CSV, API Integration, etc.)                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA INTAKE LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Parse & Type │→ │ Signal       │→ │ Column       │         │
│  │ Detection    │  │ Discovery    │  │ Mapping      │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  UNIVERSAL SCHEMA LAYER                          │
│  Raw Data → Normalized UniversalDataPoints → Stored in DB       │
│  (Preserves original columns + maps to standard schema)         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SIGNAL GENERATION ENGINE                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Pre-existing │→ │ Calculated   │→ │ AI-Derived   │         │
│  │ Signals      │  │ Signals      │  │ Signals      │         │
│  │ (Pull API)   │  │ (Aggregate)  │  │ (OpenAI)     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SIGNAL INTELLIGENCE LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Relevance    │→ │ Quality      │→ │ Ranking      │         │
│  │ Scoring      │  │ Scoring      │  │ (PageRank)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SIGNAL CARD LAYER                             │
│  Front: What (trend, value, benchmark)                          │
│  Level 1: What (detailed sources, quality)                      │
│  Level 2: Why & Who (AI analysis, scope)                        │
│  Level 3: So What? (impact, expectations)                       │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 2. How We'll Address the Key Challenges

### Challenge #1: Upload Data → Immediate Signals + Future AI Analysis

**The Problem:** Users need to see signals immediately when they upload data, but the system also needs to preserve raw data for future AI analysis across datasets.

**Our Solution: Dual-Path Storage Strategy**

\`\`\`typescript
// When user uploads a CSV
{
  // Path 1: IMMEDIATE SIGNALS (for instant gratification)
  immediate: {
    // Extract pre-existing signals from the data source
    preExistingSignals: [
      { name: "Average Resolution Time", value: 24.5, source: "zoho_desk_api" },
      { name: "CSAT Score", value: 4.2, source: "zoho_desk_api" }
    ],
    
    // Calculate basic aggregations immediately
    calculatedSignals: [
      { name: "Total Tickets", value: 450, calculation: "COUNT(ticket_id)" },
      { name: "Open Tickets", value: 120, calculation: "COUNT WHERE status='open'" }
    ]
  },
  
  // Path 2: RAW DATA PRESERVATION (for future AI analysis)
  rawDataStorage: {
    // Store in universal schema BUT preserve original columns
    universalDataPoints: [
      {
        // Normalized fields (mapped to standard schema)
        unique_id: "TKT-001",
        status: "closed",
        created_at: "2025-01-10",
        closed_at: "2025-01-12",
        
        // PRESERVED ORIGINAL COLUMNS (for future AI analysis)
        original_data: {
          "Ticket Number": "TKT-001",
          "Status": "Closed",
          "Created Time": "01/10/2025",
          "Closed Time": "01/12/2025",
          "Assignee": "John Doe",
          "Priority": "High",
          "Department": "Sales",
          "Customer Name": "Acme Corp",
          "Customer Revenue": "$50,000/year"
        },
        
        // Metadata for AI context
        metadata: {
          source: "zoho_desk",
          dataset_id: "upload_123",
          column_mappings: {
            "Ticket Number": "unique_id",
            "Status": "status",
            "Created Time": "created_at"
          }
        }
      }
    ]
  }
}
\`\`\`

**Why This Works:**
- **Immediate Signals:** User sees value instantly (no waiting for AI processing)
- **Future AI Analysis:** All original columns preserved for cross-dataset analysis
- **Flexible Mapping:** Can add new signal mappings later without re-uploading data
- **Low Cost:** Only use AI when user explicitly requests deep analysis

**Implementation Steps:**
1. Parse CSV → Detect column types
2. Run Signal Discovery → Show available signals
3. Map columns → User confirms mapping (or auto-map with high confidence)
4. Dual write:
   - Create immediate signals in `signals` table
   - Store raw data in `universal_data_points` with preserved columns
5. Background job: Index data for future AI queries

---

### Challenge #2: Scalable User-Driven Data Mapping

**The Problem:** In pilot, admin manually maps columns. In production, users must do it themselves without technical knowledge.

**Our Solution: Intelligent 3-Tier Mapping System**

\`\`\`typescript
// Tier 1: Exact Match (Auto-map with 100% confidence)
{
  csvColumn: "ticket_id",
  signalField: "unique_id",
  confidence: 100,
  autoMap: true,
  userAction: "none" // System handles it
}

// Tier 2: Semantic Match (Suggest with 80-95% confidence)
{
  csvColumn: "Ticket Number",
  signalField: "unique_id",
  confidence: 92,
  autoMap: false,
  userAction: "confirm", // Show: "Map 'Ticket Number' to 'Unique ID'? ✓"
  reasoning: "Column name suggests unique identifier"
}

// Tier 3: Fuzzy Match (Show as option with 60-80% confidence)
{
  csvColumn: "Rating",
  signalField: "csat_score",
  confidence: 75,
  autoMap: false,
  userAction: "choose", // Show dropdown with options
  alternatives: [
    { field: "csat_score", confidence: 75 },
    { field: "nps_score", confidence: 65 },
    { field: "custom_metric", confidence: 50 }
  ]
}
\`\`\`

**Smart Mapping Algorithm:**

\`\`\`typescript
function intelligentMapping(csvColumns, availableSignals) {
  const mappings = []
  
  for (const column of csvColumns) {
    // Step 1: Exact match (case-insensitive)
    const exactMatch = findExactMatch(column, availableSignals)
    if (exactMatch) {
      mappings.push({ ...exactMatch, confidence: 100, autoMap: true })
      continue
    }
    
    // Step 2: Semantic similarity (using embeddings or keyword matching)
    const semanticMatches = findSemanticMatches(column, availableSignals)
    if (semanticMatches[0].confidence > 90) {
      mappings.push({ ...semanticMatches[0], autoMap: true, userAction: "none" })
    } else if (semanticMatches[0].confidence > 80) {
      mappings.push({ ...semanticMatches[0], autoMap: false, userAction: "confirm" })
    } else {
      mappings.push({ alternatives: semanticMatches, userAction: "choose" })
    }
  }
  
  return mappings
}
\`\`\`

**User Experience Flow:**

\`\`\`
1. Upload CSV
   ↓
2. System analyzes columns
   ↓
3. Show mapping results:
   ✓ Auto-mapped (8 columns) [collapsed, user can expand to verify]
   ⚠ Need confirmation (3 columns) [expanded, user clicks ✓ or changes]
   ? Need your help (2 columns) [expanded, user selects from dropdown]
   ↓
4. User confirms/adjusts
   ↓
5. Save mapping template: "Zoho Desk Tickets Mapping"
   ↓
6. Next upload: "Use saved mapping? [Zoho Desk Tickets Mapping ▼]"
\`\`\`

**Scalability Features:**
- **Saved Mappings:** User maps once, reuse forever
- **Organization Templates:** Share mappings across team
- **Industry Templates:** Pre-built mappings for common tools (Zoho, HubSpot, etc.)
- **Learning System:** Track user corrections, improve confidence scores over time

---

### Challenge #3: Signal Ranking (Most Valuable First)

**The Problem:** User needs to see the most relevant, high-quality signals at the top, like Google PageRank.

**Our Solution: Multi-Factor Signal Ranking Algorithm**

\`\`\`typescript
function calculateSignalRank(signal, userContext, organizationData) {
  // Factor 1: USER RELEVANCE (40% weight)
  const userRelevance = {
    kpiAlignment: signal.relatesTo(userContext.top3KPIs) ? 40 : 0,
    roleRelevance: signal.typicalFor(userContext.role) ? 30 : 0,
    functionRelevance: signal.appliesTo(userContext.function) ? 20 : 0,
    decisionSupport: signal.helpsDecide(userContext.upcomingDecisions) ? 10 : 0
  }
  const userScore = sum(userRelevance) * 0.40 // 40% of total
  
  // Factor 2: SIGNAL STRENGTH (30% weight)
  const signalStrength = {
    trend: signal.trending ? 30 : 0, // Is it changing?
    magnitude: signal.percentChange > 20 ? 25 : signal.percentChange > 10 ? 15 : 5,
    benchmark: signal.vsIndustry === "below" ? 25 : signal.vsIndustry === "above" ? 15 : 10,
    consistency: signal.dataQuality.consistency * 20 // Reliable pattern?
  }
  const strengthScore = sum(signalStrength) * 0.30 // 30% of total
  
  // Factor 3: DATA QUALITY (20% weight)
  const dataQuality = {
    completeness: signal.dataQuality.completeness * 40, // 0-1 scale
    freshness: signal.dataQuality.freshness * 30, // How recent?
    sampleSize: signal.dataQuality.sampleSize > 100 ? 20 : 10,
    corroboration: signal.dataQuality.multipleSource ? 10 : 0
  }
  const qualityScore = sum(dataQuality) * 0.20 // 20% of total
  
  // Factor 4: URGENCY (10% weight)
  const urgency = {
    declining: signal.direction === "down" && signal.importance === "high" ? 40 : 0,
    unexpected: signal.expected === false ? 30 : 0,
    actionable: signal.hasRecommendation ? 20 : 0,
    timeSensitive: signal.requiresAction === "immediate" ? 10 : 0
  }
  const urgencyScore = sum(urgency) * 0.10 // 10% of total
  
  // FINAL RANK (0-100 scale, like PageRank)
  return userScore + strengthScore + qualityScore + urgencyScore
}
\`\`\`

**Example Signal Ranking:**

| Signal | User Relevance | Strength | Quality | Urgency | **Total Rank** |
|--------|----------------|----------|---------|---------|----------------|
| Churn Rate Increasing | 38 (matches KPI) | 28 (trending down) | 18 (good data) | 9 (urgent) | **93** |
| Sales Pipeline Value | 35 (matches KPI) | 15 (stable) | 20 (excellent data) | 3 (not urgent) | **73** |
| Bug Count | 20 (not key KPI) | 25 (high magnitude) | 16 (ok data) | 7 (actionable) | **68** |
| Email Open Rate | 10 (low relevance) | 10 (no trend) | 14 (ok data) | 0 (not urgent) | **34** |

**Dynamic Ranking:**
- **Updates Hourly:** As data refreshes, rankings change
- **Context-Aware:** Same signal ranks differently for CEO vs Engineer
- **Learning:** Track which signals user clicks → boost similar signals

---

## 3. Three-Level Signal Card Information

### Level 1: WHAT (Front of Card)

**Immediately Visible (No Click Required):**
\`\`\`
┌─────────────────────────────────────────┐
│ 🔴 Churn Rate                      93★  │ ← Signal Rank Badge
│                                          │
│        15.2%  ↗ +3.5%               │ ← Value + Trend
│                                          │
│  vs benchmark: 2.1% higher           │ ← Comparison
│  📊 Medium confidence                   │ ← Quality indicator
└─────────────────────────────────────────┘
\`\`\`

**Expanded WHAT (Click to see details):**
\`\`\`
DATA SOURCES
✓ Zoho CRM (connected, synced 2h ago)
✓ Product Analytics (connected, synced 1d ago)
⚠ Stripe (recommended, not connected) ← Actionable suggestion

CALCULATION
Total churned customers / Total active customers
Sample: 1,250 customers over 30 days

SIGNAL QUALITY
Completeness: ████████░░ 85%
Freshness: ██████████ 100% (2h old)
Consistency: ███████░░░ 70% (some gaps)
Corroboration: ✓ Matches across 2 sources
\`\`\`

### Level 2: WHY & WHO (Swipe/Click)

**Why Analysis - Event Timeline:**
\`\`\`
Jan 5: Marketing campaign ended (-30% new signups)
Jan 7: Price increase announced (+15% cancellations)
Jan 10: Support response time increased to 48h
Jan 12: Competitor launched similar product
\`\`\`

**Why Analysis - AI-Powered (Cached):**
\`\`\`
💡 AI Insight (generated 2d ago):
"Churn increased primarily among SMB customers ($500-2k MRR) 
who joined in Q3 2024. Contributing factors:
1. Recent price increase (25% of churned users cited cost)
2. Onboarding completion rate dropped from 65% to 42%
3. Support response time increased from 12h to 48h

Correlation detected: Users who didn't complete onboarding 
are 3.2x more likely to churn within 60 days."
\`\`\`

**Who Analysis - Scope:**
\`\`\`
CUSTOMER SEGMENTS AFFECTED
🔴 High impact: SMB customers ($500-2k MRR)
   - 45 customers churned
   - $52k MRR lost
   
🟡 Medium impact: Mid-market ($2k-10k MRR)
   - 12 customers churned
   - $38k MRR lost

GEOGRAPHY
Highest churn: US West Coast (8%), EU (6%)
Lowest churn: APAC (2%)
\`\`\`

### Level 3: SO WHAT? (Swipe/Click)

**Direction Assessment:**
\`\`\`
🔴 NEGATIVE & UNEXPECTED
Expected churn: 8-10% (industry benchmark)
Actual churn: 15.2%
This is 5.2 percentage points above expectation
\`\`\`

**KPI Impact Prediction:**
\`\`\`
IMPACT ON YOUR KEY KPIs

📉 Annual Recurring Revenue (Your #1 KPI)
   Current trajectory: -$450k over next 6 months
   If churn continues at 15%, expect -$1.2M ARR by Q2
   
📉 Customer Lifetime Value (Your #2 KPI)
   Decreased from $12k to $8.5k (-29%)
   
📊 Net Revenue Retention (Your #3 KPI)
   Dropped from 110% to 92% (danger zone)
\`\`\`

**Recommended Actions:**
\`\`\`
SUGGESTED NEXT STEPS
1. 🎯 Focus on onboarding completion
   - 58% of churned users never completed setup
   - Deploy onboarding email sequence
   
2. 🛠 Improve support response time
   - Current: 48h avg → Target: <12h
   - Correlation: Every 1h delay = +0.8% churn
   
3. 💰 Create win-back campaign
   - Target: 45 SMB customers who churned this month
   - Offer: 2 months at old pricing + dedicated onboarding

[Create Decision Card from this Signal] ← CTA
\`\`\`

---

## 4. Signal Types & Data Flow

### Type 1: Pre-Existing Signals (Preferred)

**Source:** Pull directly from tool APIs (Zoho, HubSpot, etc.)

**Why Preferred:**
- ✓ Instant availability (no calculation needed)
- ✓ Matches what user sees in source tool (data hygiene)
- ✓ No AI cost
- ✓ High reliability

**Example Flow:**
\`\`\`
User connects Zoho Desk
  ↓
System calls Zoho API: GET /desk/reports/metrics
  ↓
Zoho returns:
  - avg_resolution_time: 24.5h
  - avg_first_response_time: 2.3h
  - csat_score: 4.2/5
  ↓
System creates signals:
  Signal 1: "Average Resolution Time" = 24.5h
  Signal 2: "First Response Time" = 2.3h
  Signal 3: "CSAT Score" = 4.2/5
  ↓
Show on dashboard (within 2 seconds)
\`\`\`

**Implementation:**
\`\`\`typescript
// Adapter pattern for each tool
class ZohoDeskAdapter {
  async getPreExistingSignals() {
    const metrics = await zohoDeskAPI.getMetrics()
    
    return [
      {
        name: "Average Resolution Time",
        value: metrics.avg_resolution_time,
        type: "pre_existing",
        source: "zoho_desk_api",
        cost: 0, // No calculation needed
        reliability: "high"
      },
      // ... more signals
    ]
  }
}
\`\`\`

### Type 2: Calculated Signals

**Source:** Aggregate uploaded data using SQL/backend logic

**When Used:**
- User uploads CSV (no API available)
- Need custom aggregation not provided by tool
- Cross-dataset calculations

**Example Flow:**
\`\`\`
User uploads Zoho Desk tickets CSV
  ↓
System stores in universal_data_points
  ↓
System runs aggregation queries:
  - COUNT(ticket_id) WHERE created_date >= NOW() - 30 days
  - AVG(resolution_time) WHERE status = 'closed'
  ↓
Create calculated signals (within 5 seconds)
\`\`\`

**Cost:** Low (database queries only, no AI)

### Type 3: AI-Derived Signals

**Source:** OpenAI analysis of data patterns

**When Used:**
- User requests "Why did this change?"
- Detecting unexpected patterns
- Cross-dataset insights (e.g., "How does marketing spend affect churn?")
- Monthly synthesis reports

**Example Flow:**
\`\`\`
User clicks "Why did churn increase?"
  ↓
Check cache: Has this been analyzed in last 7 days?
  ↓ No
System gathers context:
  - Churn data (last 90 days)
  - Related signals (marketing spend, support metrics, product usage)
  - User context (role, KPIs, upcoming decisions)
  ↓
Call OpenAI (GPT-4o-mini):
  Prompt: "Analyze why churn increased from 8% to 15%..."
  ↓
Parse AI response:
  - Root causes: [price increase, poor onboarding, support delays]
  - Affected segments: [SMB, $500-2k MRR]
  - Recommendations: [improve onboarding, reduce support time]
  ↓
Cache result for 7 days
Cost: $0.02 per analysis
  ↓
Show in "Why & Who" section
\`\`\`

**Cost Optimization:**
\`\`\`typescript
// Only use AI when:
1. User explicitly requests it (click "Explain")
2. Weekly synthesis for top 10 signals
3. Monthly deep-dive report
4. Unexpected pattern detected (automated)

// Always check cache first
async function getAIAnalysis(signalId) {
  const cached = await checkCache(signalId, maxAge: 7days)
  if (cached) return cached // Cost: $0
  
  const analysis = await openai.analyze(signal) // Cost: $0.02
  await saveToCache(signalId, analysis, ttl: 7days)
  return analysis
}
\`\`\`

---

## 5. Data Quality & Signal Strength

### Signal Quality Indicators

**4 Quality Dimensions:**

1. **Completeness (0-100%)**
   \`\`\`typescript
   completeness = (fields_with_data / total_required_fields) * 100
   
   Example:
   Required: ticket_id, status, created_at, closed_at, csat
   Present: ticket_id, status, created_at, closed_at
   Missing: csat (20% missing)
   Score: 80%
   \`\`\`

2. **Freshness (0-100%)**
   \`\`\`typescript
   freshness = Math.max(0, 100 - (hours_since_update / 24) * 10)
   
   Example:
   Updated 2 hours ago: 100% (excellent)
   Updated 12 hours ago: 95% (good)
   Updated 3 days ago: 70% (ok, getting stale)
   Updated 10 days ago: 0% (too old)
   \`\`\`

3. **Consistency (0-100%)**
   \`\`\`typescript
   consistency = (data_points_in_expected_range / total_data_points) * 100
   
   Example:
   100 tickets, 15 have missing dates, 10 have future dates (invalid)
   Valid: 75/100 = 75% consistent
   \`\`\`

4. **Corroboration (boolean + sources count)**
   \`\`\`typescript
   corroboration = {
     hasMultipleSources: true,
     sourceCount: 2,
     sourcesMatch: "within 5% variance"
   }
   
   Example:
   Churn rate from:
   - Zoho CRM: 15.2%
   - Stripe: 15.8%
   Corroboration: ✓ (within 5%)
   \`\`\`

**Overall Signal Strength:**
\`\`\`typescript
signalStrength = (
  completeness * 0.30 +
  freshness * 0.25 +
  consistency * 0.25 +
  (corroboration ? 20 : 0)
)

Display:
95-100: 🟢 High confidence
80-94: 🟡 Medium confidence
60-79: 🟠 Low confidence
<60: 🔴 Weak signal (show warning)
\`\`\`

---

## 6. Handling Different Data States

### State 1: Zero Data (New User)

**What User Sees:**
\`\`\`
┌─────────────────────────────────────────┐
│ 📊 Recommended Signals for Product Lead │
│                                          │
│ Based on your role and company stage,   │
│ here are signals you should track:      │
│                                          │
│ 🎯 User Activation Rate                 │
│    Connect: Amplitude, Mixpanel          │
│    [Connect Integration]                 │
│                                          │
│ 📈 Weekly Active Users                  │
│    Connect: Amplitude, Google Analytics  │
│    [Connect Integration]                 │
│                                          │
│ 🐛 Critical Bugs                        │
│    Connect: Jira, Linear, GitHub         │
│    [Connect Integration]                 │
│                                          │
│ Or [Upload CSV] to get started           │
└─────────────────────────────────────────┘
\`\`\`

**Implementation:**
\`\`\`typescript
// Show role-based templates
const recommendedSignals = getSignalTemplates({
  role: userContext.role, // "Product Lead"
  businessStage: userContext.businessStage, // "Pre-Scale"
  industry: organization.industry // "SaaS"
})

// Each template shows:
// - Signal name
// - What it measures
// - Recommended data sources
// - How to connect
\`\`\`

### State 2: Low Data (Some Uploads)

**What User Sees:**
\`\`\`
┌─────────────────────────────────────────┐
│ 🟡 Ticket Volume                   65★  │
│                                          │
│        450 tickets  ↗ +12%          │
│                                          │
│  ⚠ Limited data quality                 │
│  Completeness: 60% (improve by          │
│  connecting Zoho Desk API)              │
│                                          │
│  [Connect Zoho Desk] ← CTA              │
└─────────────────────────────────────────┘
\`\`\`

**Strategy:**
- Show partial signals with quality warnings
- Highlight data gaps clearly
- Provide specific actions to improve (connect API, upload more data)
- Use industry benchmarks as comparison

### State 3: Rich Data (Multiple Sources Connected)

**What User Sees:**
\`\`\`
┌─────────────────────────────────────────┐
│ 🟢 Customer Churn Rate             93★  │
│                                          │
│        15.2%  ↗ +3.5%               │
│                                          │
│  vs benchmark: 2.1% higher           │
│  🎯 High confidence (3 sources)         │
│                                          │
│  💡 AI insight available                │
│  [See Why & Who] ← CTA                  │
└─────────────────────────────────────────┘
\`\`\`

**Features Unlocked:**
- Full signal analysis (What, Why & Who, So What?)
- Cross-dataset insights
- Predictive trends
- AI-powered recommendations

---

## 7. Implementation Roadmap

### Phase 1: Core Signal Infrastructure (Week 1-2)
**Already Built:**
- ✓ Universal schema
- ✓ Signal intelligence with scoring
- ✓ User context service
- ✓ Data quality tracking

**Gaps to Fill:**
- Implement pre-existing signal adapters (Zoho Desk, Zoho CRM, Zoho Marketing)
- Build signal ranking algorithm
- Add signal strength indicators to UI

### Phase 2: Three-Level Signal Cards (Week 3-4)
**What to Build:**
- Redesign signal card UI with three levels (What, Why & Who, So What?)
- Add swipe/click navigation between levels
- Implement event timeline for "Why" analysis
- Build impact prediction for "So What?" level
- Add "Create Decision Card" CTA

### Phase 3: Intelligent Mapping UX (Week 5-6)
**What to Build:**
- Build semantic column matching algorithm
- Create mapping UI with confidence levels
- Implement saved mapping templates
- Add organization-wide mapping library
- Build learning system to improve mappings

### Phase 4: Signal Discovery & Recommendations (Week 7-8)
**What to Build:**
- Enhance signal discovery with better UX
- Build zero-data state with role-based templates
- Create signal template browser
- Implement "Recommended for You" section
- Add data source recommendation engine

### Phase 5: AI Integration & Cost Optimization (Week 9-10)
**What to Build:**
- Implement AI analysis with 7-day caching
- Build batch processing for weekly synthesis
- Add "Explain this signal" button
- Create monthly deep-dive reports
- Implement cost tracking dashboard

### Phase 6: Cross-Dataset Intelligence (Week 11-12)
**What to Build:**
- Enhance cross-dataset relationship detection
- Build causal chain visualization
- Implement "Related Signals" section
- Add cross-dataset impact predictions

---

## 8. Technical Architecture Details

### Database Schema (Enhanced)

\`\`\`sql
-- Signals table (enhanced)
CREATE TABLE signals (
  id UUID PRIMARY KEY,
  organization_id UUID,
  name TEXT,
  value NUMERIC,
  trend TEXT, -- "up", "down", "stable"
  percent_change NUMERIC,
  
  -- NEW: Signal type
  signal_type TEXT, -- "pre_existing", "calculated", "ai_derived"
  source_type TEXT, -- "zoho_desk_api", "csv_upload", "openai"
  
  -- NEW: Quality metrics
  quality_completeness NUMERIC, -- 0-100
  quality_freshness NUMERIC, -- 0-100
  quality_consistency NUMERIC, -- 0-100
  quality_corroboration BOOLEAN,
  quality_source_count INT,
  
  -- NEW: Ranking
  rank_score NUMERIC, -- 0-100 (PageRank-style)
  rank_user_relevance NUMERIC,
  rank_signal_strength NUMERIC,
  rank_data_quality NUMERIC,
  rank_urgency NUMERIC,
  
  -- NEW: Expansion levels
  what_data JSONB, -- Data sources, calculation, quality details
  why_data JSONB, -- Event timeline, AI insights, scope
  so_what_data JSONB, -- Direction, expectations, impact predictions
  
  -- Metadata
  last_calculated_at TIMESTAMP,
  ai_analysis_cached_until TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Signal ranking cache
CREATE TABLE signal_rankings (
  user_id UUID,
  signal_id UUID,
  rank_score NUMERIC,
  calculated_at TIMESTAMP,
  PRIMARY KEY (user_id, signal_id)
);

-- Column mappings (for saved templates)
CREATE TABLE column_mappings (
  id UUID PRIMARY KEY,
  organization_id UUID,
  template_name TEXT, -- "Zoho Desk Tickets Mapping"
  source_type TEXT, -- "zoho_desk", "hubspot_deals"
  mappings JSONB, -- { "Ticket Number": { field: "unique_id", confidence: 100 } }
  created_by UUID,
  usage_count INT DEFAULT 0,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP
);

-- Signal templates (role-based recommendations)
CREATE TABLE signal_templates (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  category TEXT, -- "support", "sales", "product"
  roles TEXT[], -- ["product_lead", "cxo"]
  business_stages TEXT[], -- ["pre_scale", "scale"]
  required_data_sources TEXT[], -- ["amplitude", "mixpanel"]
  calculation_method TEXT,
  is_public BOOLEAN DEFAULT true
);
\`\`\`

### API Endpoints

\`\`\`typescript
// Signal CRUD
GET    /api/signals                    // List signals (ranked)
GET    /api/signals/:id                // Get signal details
POST   /api/signals                    // Create signal
PUT    /api/signals/:id                // Update signal
DELETE /api/signals/:id                // Delete signal

// Signal intelligence
GET    /api/signals/:id/analysis       // Get AI analysis (cached)
POST   /api/signals/:id/explain        // Request AI explanation
GET    /api/signals/:id/impact         // Get KPI impact prediction
GET    /api/signals/relationships      // Get cross-signal relationships

// Signal discovery
POST   /api/upload/discover-signals    // Discover available signals
GET    /api/signals/templates          // Get recommended templates
POST   /api/signals/from-templates     // Create signals from templates

// Column mapping
POST   /api/mappings/suggest           // Get mapping suggestions
POST   /api/mappings/save              // Save mapping template
GET    /api/mappings/templates         // Get saved templates

// Pre-existing signals (adapters)
GET    /api/integrations/zoho-desk/signals
GET    /api/integrations/zoho-crm/signals
GET    /api/integrations/hubspot/signals
\`\`\`

---

## 9. Answering the Key Challenges

### Challenge #1: Upload → Immediate Signals + AI Analysis Later

**Answer: Dual-Path Storage**
- ✓ Immediate: Show pre-existing signals + basic calculations (0-5 sec)
- ✓ AI Later: Preserve all original columns in `universal_data_points.original_data`
- ✓ Flexible: Can add new signal mappings without re-upload
- ✓ Cost-Effective: Only use AI when explicitly requested

### Challenge #2: Scalable User-Driven Mapping

**Answer: 3-Tier Intelligent Mapping**
- ✓ Auto-map: 100% confidence matches (no user action)
- ✓ Suggest: 80-95% confidence (user clicks ✓)
- ✓ Choose: 60-80% confidence (user picks from options)
- ✓ Templates: Map once, reuse forever
- ✓ Learning: System improves from user corrections

### Challenge #3: Signal Ranking

**Answer: Multi-Factor PageRank Algorithm**
- ✓ User Relevance: Based on role, KPIs, decisions (40%)
- ✓ Signal Strength: Trend, magnitude, benchmark (30%)
- ✓ Data Quality: Completeness, freshness, consistency (20%)
- ✓ Urgency: Declining, unexpected, actionable (10%)
- ✓ Dynamic: Re-calculates as data updates

---

## 10. What We Already Have vs. What We Need to Build

### Already Built ✓
- Universal schema for data normalization
- Signal intelligence scoring system
- User context service with role/function tracking
- Data quality scoring (completeness, freshness, etc.)
- Signal templates service (role-based)
- AI analysis with 7-day caching
- Cross-dataset relationship detection
- Signal discovery from uploaded data
- Impact prediction engine
- Progressive empty states for zero/low/rich data

### Need to Build 🔨

**High Priority (Core v2 Requirements):**
1. **Pre-Existing Signal Adapters**
   - Zoho Desk API adapter (get avg resolution time, CSAT, etc.)
   - Zoho CRM API adapter (get pipeline, conversion rate, etc.)
   - Zoho Marketing API adapter (get campaign performance, etc.)

2. **Three-Level Signal Card UI**
   - Redesign cards with collapsible levels
   - What → Why & Who → So What? navigation
   - Event timeline visualization
   - Impact prediction display

3. **Signal Ranking System**
   - Implement PageRank-style algorithm
   - Add rank score to database
   - Sort dashboard by rank
   - Show rank badge on cards

4. **Intelligent Column Mapping UX**
   - Semantic matching algorithm
   - Confidence-based UI (auto/suggest/choose)
   - Saved mapping templates
   - Template library

**Medium Priority (Enhanced Experience):**
5. **Zero-Data State Enhancements**
   - Role-based signal recommendations
   - Industry benchmark previews
   - Clear CTAs for data connections

6. **Signal Strength Indicators**
   - Quality badges on cards (🟢🟡🔴)
   - Expand to show quality breakdown
   - Data source status indicators

7. **Cross-Dataset Insights**
   - "Related Signals" section on cards
   - Causal chain visualization
   - "Signals that changed together" view

**Low Priority (Nice to Have):**
8. **Learning System**
   - Track user mapping corrections
   - Improve confidence scores over time
   - A/B test ranking algorithms

9. **Cost Tracking**
   - OpenAI usage dashboard
   - Cost per signal analysis
   - Budget alerts

10. **Advanced Analytics**
    - Signal clustering (find patterns)
    - Anomaly detection (unexpected changes)
    - Predictive forecasting (where is this trending?)

---

## 11. MVP Scope for Pilot Customer

### Pilot Customer Context
- Has: Zoho CRM, Zoho Desk, Zoho Marketing
- Needs: Sales pipeline, conversion rate, bug tracking, churn behavior
- Users: 5-10 (CXO, managers, ICs across functions)

### MVP Features (Launch in 4 weeks)

**Week 1-2: Core Infrastructure**
- Build Zoho adapters for pre-existing signals
- Implement signal ranking algorithm
- Add rank badges to existing card UI

**Week 3-4: Enhanced Signal Cards**
- Add three-level information (What, Why, So What)
- Implement swipe/expand navigation
- Show data quality indicators
- Add "Explain this" button for AI analysis

**MVP Scope (What's In):**
- ✓ Pre-existing signals from Zoho Desk, CRM, Marketing
- ✓ Signal ranking by relevance
- ✓ Three-level signal cards
- ✓ Data quality indicators
- ✓ AI analysis on-demand (with caching)
- ✓ Manual CSV upload with basic mapping
- ✓ Top 10 signals for each user role

**MVP Scope (What's Out / v2):**
- ⏭ Advanced column mapping UX (use admin-assisted mapping)
- ⏭ Saved mapping templates
- ⏭ Signal template browser
- ⏭ Learning system
- ⏭ Cost tracking dashboard
- ⏭ Cross-dataset relationship visualization

### Success Metrics for Pilot
1. **Time to First Signal:** < 5 minutes from signup
2. **Signal Relevance:** 80%+ of top 10 signals are rated "useful"
3. **Data Quality:** 70%+ signals show "medium" or "high" confidence
4. **AI Usage:** < $50/month in OpenAI costs per organization
5. **User Engagement:** 60%+ of users check signals daily

---

## 12. Risk Mitigation

### Risk #1: Poor Signal Quality (Low Confidence Scores)
**Mitigation:**
- Show quality indicators prominently
- Explain what data is missing to improve quality
- Provide clear CTAs to connect more data sources
- Use industry benchmarks when data is limited

### Risk #2: High AI Costs
**Mitigation:**
- 7-day caching for all AI analyses
- Only use AI on user request (not automatic)
- Batch process weekly synthesis reports
- Use GPT-4o-mini (10x cheaper than GPT-4)
- Budget alerts at $50/org/month

### Risk #3: Complex Column Mapping (User Confusion)
**Mitigation:**
- Start with admin-assisted mapping for pilot
- Build auto-mapping with high confidence thresholds
- Provide clear mapping suggestions with examples
- Allow "Map Later" option (store raw data, map in future)

### Risk #4: Signal Overload (Too Many Signals)
**Mitigation:**
- Aggressive ranking/filtering (only show top 20)
- Clear categorization (Sales, Support, Product, etc.)
- Personalized view based on user context
- "Focus Mode" showing only top 5 most urgent

### Risk #5: Slow Performance (Complex Calculations)
**Mitigation:**
- Pre-calculate signal rankings hourly (background job)
- Cache AI analyses for 7 days
- Use database indexes on rank_score, user_relevance
- Lazy load "Why & Who" and "So What?" levels
- Consider Redis cache for frequently accessed signals

---

## 13. Summary: How It All Works

### For the User
1. **Upload/Connect Data** → System discovers available signals
2. **Map Columns** → System suggests mappings, user confirms
3. **See Signals** → Dashboard shows top ranked signals immediately
4. **Explore Signal** → Three levels: What → Why & Who → So What?
5. **Take Action** → Create decision card, connect more data, adjust focus

### For the System
1. **Intake Data** → Parse, detect types, discover signals
2. **Store Dual-Path** → Universal schema + preserved original columns
3. **Generate Signals** → Pre-existing (API) > Calculated (SQL) > AI (OpenAI)
4. **Rank Signals** → Multi-factor algorithm (relevance + strength + quality + urgency)
5. **Present Intelligently** → Show most valuable signals first, lazy-load deep analysis

### Key Innovations
- **Dual-Path Storage:** Immediate signals + future AI analysis capability
- **3-Tier Mapping:** Auto-map where confident, ask user only when needed
- **PageRank for Signals:** Most relevant signals surface to top automatically
- **Progressive Disclosure:** What → Why → So What? (don't overwhelm user)
- **Cost-Optimized AI:** Cache aggressively, use sparingly, batch when possible

---

## Next Steps

1. **Review & Align:** Discuss this architecture with team
2. **Prioritize Gaps:** Decide which "Need to Build" items are MVP vs. v2
3. **Design Review:** Create UI mockups for three-level signal cards
4. **Technical Spec:** Detail API contracts for Zoho adapters
5. **Begin Implementation:** Start with pre-existing signal adapters (highest value)

**Questions to Resolve:**
- What's the priority order for the three Zoho integrations?
- Should we build advanced mapping UX for pilot, or admin-assist?
- What's the threshold rank score for displaying signals? (e.g., only show >50)
- How often should signal rankings recalculate? (hourly, daily?)
- What's the AI budget per organization per month? ($50, $100, $200?)
