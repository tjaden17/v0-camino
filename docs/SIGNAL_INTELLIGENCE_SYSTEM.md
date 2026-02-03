# Signal Intelligence System Documentation

## Overview

The Signal Intelligence System is a sophisticated data analysis platform that transforms raw business data into actionable insights. It uses a three-tier architecture to process data from multiple sources, analyze patterns, and provide context-aware recommendations to users.

## Architecture

### Three-Tier System

```
┌─────────────────────────────────────────────────────────────┐
│                    TIER 3: Action Layer                      │
│  "So What?" - Impact prediction, recommendations, decisions  │
└─────────────────────────────────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────────────────────┐
│                   TIER 2: Analysis Layer                     │
│   "Why & Who" - Causal analysis, relationships, patterns    │
└─────────────────────────────────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────────────────────┐
│                    TIER 1: Data Layer                        │
│       "What" - Raw data, normalization, aggregation         │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Universal Data Schema (`lib/universal-schema.ts`)

**Purpose**: Normalize data from different sources into a consistent format.

**Key Interface**:
```typescript
interface UniversalDataPoint {
  name: string           // Signal/metric name
  value: number          // Current value
  date: Date             // Measurement date
  category: string       // sales, support, marketing, etc.
  source: string         // zoho_crm, hubspot, csv, etc.
  benchmark?: number     // Target/goal value
  trend?: string         // increasing, decreasing, stable
  ownerId?: string       // User responsible
  metadata?: any         // Source-specific data
}
```

**How it works**:
1. **Mapping**: Each data source has predefined field mappings (e.g., `ZOHO_CRM_MAPPINGS`, `HUBSPOT_MAPPINGS`)
2. **Transformation**: Source fields are transformed using custom functions (e.g., string → number, date parsing)
3. **Aggregation**: Multiple data points with the same name are grouped and the latest value is used
4. **Trend Calculation**: Automatic trend detection by comparing current vs previous values

**Example**:
```typescript
// Raw Zoho Desk ticket data
const tickets = [{
  ticketNumber: "12345",
  status: "closed",
  createdTime: "2025-01-01",
  closedTime: "2025-01-05"
}]

// Transformed to universal schema
const dataPoint = {
  name: "Avg Ticket Resolution Time",
  value: 4,  // days
  date: new Date("2025-01-05"),
  category: "support",
  source: "zoho_desk",
  trend: "stable"
}
```

---

### 2. Signal Intelligence Engine (`lib/signal-intelligence.ts`)

**Purpose**: Score and prioritize signals based on relevance, urgency, and impact.

**Scoring Algorithm**:
```
Overall Score = (Relevance × 30%) + (Urgency × 35%) + (Impact × 35%)
```

#### Relevance Score (0-100)
Measures how relevant the signal is to the user's KPIs.

**With User KPIs**:
- Direct match in signal name: +35 points
- Match in related KPIs: +25 points
- Match in tags: +20 points

**Without User KPIs** (default category importance):
- Sales: 90 points
- Finance: 85 points
- Support: 75 points
- Operations: 70 points
- Marketing: 65 points
- Product: 60 points
- Custom: 50 points

#### Urgency Score (0-100)
Measures how time-sensitive the signal is.

- High priority flag: +40 points
- Declining trend: +30 points
- <70% of benchmark: +40 points
- 70-90% of benchmark: +25 points
- Updated in last 7 days: +15 points

#### Impact Score (0-100)
Measures potential business impact.

- High-value keywords (revenue, profit, cost): +35 points
- Monetary value >$100k: +30 points
- Affects >100 users/customers: +25 points
- Critical function (payment, security): +20 points

**Example**:
```typescript
const signal = {
  name: "Monthly Recurring Revenue",
  current_value: 50000,
  benchmark_value: 75000,  // 67% of target
  trend: "decreasing",
  priority: "high",
  category: "sales"
}

// Scores:
// Relevance: 90 (sales category)
// Urgency: 40 (high priority) + 30 (declining) + 40 (below 70%) = 110 → 100
// Impact: 35 (revenue keyword) + 20 (monetary value) = 55
// Overall: (90 × 0.3) + (100 × 0.35) + (55 × 0.35) = 81.25
```

---

### 3. User Context Service (`lib/user-context-service.ts`)

**Purpose**: Personalize signal relevance based on user role, function, and business stage.

**User Context Factors**:
```typescript
interface UserContext {
  role_level: "CXO" | "manager" | "IC"
  function: "business" | "product" | "tech" | "sales" | "support"
  business_stage: "pre-product" | "PMF" | "scale" | "mature"
  kpi_1: string
  kpi_2: string
  kpi_3: string
  upcoming_decisions: Decision[]
}
```

**Context-Aware Relevance**:
```
Signal Relevance = (KPI Alignment × 40%) + 
                   (Role Relevance × 25%) + 
                   (Urgency × 20%) + 
                   (Decision Support × 15%)
```

**Example**:
```typescript
// For a Sales Manager at a scaling company
const context = {
  role_level: "manager",
  function: "sales",
  business_stage: "scale",
  kpi_1: "Pipeline Value",
  kpi_2: "Win Rate",
  kpi_3: "Sales Cycle Length"
}

// High relevance signals:
// - "Pipeline Value" (direct KPI match)
// - "Average Deal Size" (sales function + affects win rate)
// - "Lead Response Time" (affects pipeline + sales cycle)

// Low relevance signals:
// - "Support Ticket Volume" (different function)
// - "Code Deployment Frequency" (not relevant to sales)
```

---

### 4. Data Quality Scoring (`lib/progressive-data-service.ts`)

**Purpose**: Track data completeness and guide users to improve data quality.

**Quality Dimensions**:

1. **Completeness** (40% weight)
   - Has data points: 25 points
   - >30 days of data: 50 points
   - >90 days of data: 100 points

2. **Freshness** (30% weight)
   - Updated today: 100 points
   - Updated this week: 80 points
   - Updated this month: 60 points
   - Older: 30 points

3. **Consistency** (30% weight)
   - Daily updates: 100 points
   - Weekly updates: 70 points
   - Monthly updates: 50 points
   - Irregular: 30 points

**Data States**:

| State | Score | Description | What to Show |
|-------|-------|-------------|--------------|
| Zero | 0 | No data | Industry benchmarks, templates |
| Low | 1-50 | Some data | Partial signals with warnings |
| Medium | 51-75 | Good data | Full signals, some gaps noted |
| Rich | 76-100 | Complete data | Full analysis, predictions |

**Example**:
```typescript
const signal = {
  data_points: 45,  // 90 days
  last_updated: "2025-01-04",  // Yesterday
  update_frequency: "daily"
}

// Scores:
// Completeness: 100 (>90 days)
// Freshness: 80 (updated this week)
// Consistency: 100 (daily updates)
// Overall: (100 × 0.4) + (80 × 0.3) + (100 × 0.3) = 94
// Quality: "Excellent"
```

---

### 5. Signal Relationships (`lib/signal-relationships-service.ts`)

**Purpose**: Detect correlations and causal relationships between signals.

**Detection Methods**:

1. **Time Series Correlation**
   - Pearson correlation coefficient (r)
   - Threshold: |r| > 0.7 for strong correlation
   - Detects if two signals move together

2. **Time Lag Analysis**
   - Tests lags from 0-14 days
   - Finds if Signal A predicts Signal B
   - Example: Marketing Spend → Leads (3 day lag)

3. **Causal Plausibility**
   - Domain knowledge rules
   - Example: Revenue can't cause Marketing Spend
   - Prevents spurious correlations

**Relationship Types**:
- `causes`: A directly causes B (lag < 7 days, r > 0.8)
- `correlates`: A and B move together (r > 0.7)
- `leads`: A predicts B (lag > 0 days)
- `impacts`: A affects B indirectly

**Confidence Scoring**:
```
Confidence = (Correlation Strength × 50%) + 
             (Statistical Significance × 30%) + 
             (Domain Plausibility × 20%)
```

**Example**:
```typescript
// Detected relationship
{
  signal_a: "Marketing Spend",
  signal_b: "Inbound Leads",
  relationship_type: "causes",
  confidence: 0.89,
  time_lag_days: 3,
  correlation: 0.92,
  explanation: "Marketing spend increases lead to higher inbound leads after 3 days"
}

// Chain detection
Marketing Spend → Leads → Qualified Opportunities → Revenue
```

---

### 6. AI Analysis Service (`lib/ai-analysis-service.ts`)

**Purpose**: Generate human-readable insights using AI while minimizing costs.

**Cost Optimization Strategy**:
1. **Rule-based first**: 80% of analysis uses deterministic logic
2. **Batch processing**: Analyze top 10 signals weekly
3. **7-day caching**: Reuse insights for similar patterns
4. **Lightweight model**: Use GPT-4o-mini (cheapest option)

**Analysis Types**:

#### Why Analysis
Explains what caused a signal change.

**Prompt Template**:
```
Signal: [name]
Change: [value] to [new_value] ([change]%)
Trend: [trend]
Context: [related signals, events]

Explain why this changed in 2-3 sentences for a business user.
```

**Example Output**:
> "Customer satisfaction decreased by 15% this month likely due to increased support ticket volume (+30%) and longer resolution times. The engineering team shipped a major release on Jan 15th which introduced several bugs, driving ticket volume up."

#### Trend Explanation
Describes the pattern and what to expect.

**Example Output**:
> "Revenue has been growing steadily at 8% month-over-month for the past quarter. This is above your target of 5% and suggests your pricing changes in Q4 are working. If this continues, you'll hit your $1M ARR goal by March."

#### Recommendations
Actionable next steps.

**Example Output**:
> "Based on declining win rate, consider: 1) Review lost deals to identify common objections, 2) Provide additional sales training on handling pricing questions, 3) Adjust qualification criteria to focus on higher-intent leads."

**Caching Logic**:
```typescript
// Check cache first
const cached = await getCachedAnalysis(signal.id, "why_analysis")
if (cached && !isExpired(cached, 7)) {
  return cached.result  // Cache hit
}

// Generate new analysis
const result = await generateAIAnalysis(signal)
await cacheAnalysis(signal.id, "why_analysis", result, 7)
return result
```

---

### 7. Impact Prediction Engine (`lib/impact-prediction-service.ts`)

**Purpose**: Forecast how signal changes will affect KPIs and related signals.

**Prediction Method**:
```
Predicted Impact = Δ Signal × Relationship Weight × Confidence
```

**Weight Sources**:
1. Historical correlations (learned from data)
2. Domain knowledge rules
3. User-defined relationships

**Example**:
```typescript
// Scenario: Marketing Spend increases by 20%
const predictions = await predictImpact("marketing_spend", 20)

// Results:
[
  {
    target: "Inbound Leads",
    predicted_change: +25,  // 25 more leads
    confidence: 0.89,
    explanation: "Historical data shows marketing spend strongly predicts lead volume"
  },
  {
    target: "Customer Acquisition Cost",
    predicted_change: -8%,  // 8% lower CAC
    confidence: 0.72,
    explanation: "More leads at same sales cost reduces CAC"
  },
  {
    target: "Revenue",
    predicted_change: +$15k,
    confidence: 0.65,
    explanation: "Additional leads convert at historical 12% rate"
  }
]
```

**KPI Impact Matrix**:
Shows which signals influence each KPI.

```
KPI: Monthly Recurring Revenue

Top Influencers:
1. New Customers (+0.85)
2. Churn Rate (-0.78)
3. Average Deal Size (+0.62)
4. Expansion Revenue (+0.54)
```

---

## Data Flow

### End-to-End Example: Zoho Desk Upload

```
1. USER UPLOADS CSV
   ↓
2. CSV PARSER (lib/csv-parser.ts)
   - Detects columns: ticket_id, status, created_date, closed_date
   - Validates data types
   ↓
3. ZOHO DESK PROCESSOR (lib/zoho-desk-processor.ts)
   - Calculates aggregate KPIs:
     • Total Tickets: 1,250
     • Avg Resolution Time: 4.2 days
     • First Response Time: 2.1 hours
   ↓
4. UNIVERSAL SCHEMA TRANSFORM
   - Creates UniversalDataPoints for each KPI
   - Sets category = "support"
   - Adds metadata (date range, source)
   ↓
5. DATA QUALITY SCORING
   - Checks completeness: 30 days of data → 50 points
   - Checks freshness: Updated today → 100 points
   - Overall quality: 75 (Good)
   ↓
6. SIGNAL CREATION (database)
   - Inserts signals table rows
   - Inserts data_points table rows
   - Links to user via owner_id
   ↓
7. SIGNAL INTELLIGENCE SCORING
   - For each signal, calculates:
     • Relevance (based on user KPIs)
     • Urgency (based on trends)
     • Impact (based on business context)
   ↓
8. RELATIONSHIP DETECTION (background job)
   - Finds correlations with existing signals
   - Example: "Support Ticket Volume" correlates with "Customer Churn"
   ↓
9. AI ANALYSIS (on-demand or scheduled)
   - Checks cache for existing insights
   - Generates "why" analysis if needed
   - Provides recommendations
   ↓
10. USER DASHBOARD
    - Shows prioritized signals
    - Displays quality badges
    - Highlights relationships
    - Offers AI insights
```

---

## Key Algorithms

### 1. Trend Detection Algorithm

```typescript
function detectTrend(dataPoints: number[]): TrendType {
  // Linear regression
  const n = dataPoints.length
  const xMean = (n - 1) / 2
  const yMean = dataPoints.reduce((a, b) => a + b) / n
  
  let numerator = 0
  let denominator = 0
  
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (dataPoints[i] - yMean)
    denominator += (i - xMean) ** 2
  }
  
  const slope = numerator / denominator
  const threshold = yMean * 0.01  // 1% of mean
  
  if (Math.abs(slope) < threshold) return "stable"
  return slope > 0 ? "increasing" : "decreasing"
}
```

### 2. Correlation Calculation

```typescript
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length
  const xMean = x.reduce((a, b) => a + b) / n
  const yMean = y.reduce((a, b) => a + b) / n
  
  let numerator = 0
  let xDenom = 0
  let yDenom = 0
  
  for (let i = 0; i < n; i++) {
    const xDiff = x[i] - xMean
    const yDiff = y[i] - yMean
    numerator += xDiff * yDiff
    xDenom += xDiff ** 2
    yDenom += yDiff ** 2
  }
  
  return numerator / Math.sqrt(xDenom * yDenom)
}
```

### 3. Anomaly Detection

```typescript
function detectAnomaly(value: number, historical: number[]): boolean {
  const mean = historical.reduce((a, b) => a + b) / historical.length
  const variance = historical.reduce((sum, val) => 
    sum + (val - mean) ** 2, 0) / historical.length
  const stdDev = Math.sqrt(variance)
  
  // Z-score > 3 is anomaly (99.7% confidence)
  const zScore = Math.abs(value - mean) / stdDev
  return zScore > 3
}
```

---

## Configuration & Tuning

### Adjusting Score Weights

**Location**: `lib/signal-intelligence.ts` → `calculateSignalImportance()`

```typescript
// Current weights
scores.overallScore = 
  scores.relevanceScore * 0.30 +  // 30% relevance
  scores.urgencyScore * 0.35 +    // 35% urgency
  scores.impactScore * 0.35       // 35% impact
```

**Tuning guide**:
- Increase urgency weight for fast-moving businesses
- Increase relevance weight for specialized users with clear KPIs
- Increase impact weight for revenue-focused organizations

### Adjusting Correlation Threshold

**Location**: `lib/signal-relationships-service.ts` → `detectRelationships()`

```typescript
const CORRELATION_THRESHOLD = 0.7  // Strong correlation
```

**Tuning guide**:
- Lower (0.5-0.6): More relationships detected, but more false positives
- Higher (0.8-0.9): Fewer relationships, but higher confidence

### Adjusting Cache Duration

**Location**: `lib/ai-analysis-service.ts`

```typescript
const CACHE_DURATION_DAYS = 7  // Reuse insights for 7 days
```

**Tuning guide**:
- Shorter (1-3 days): More up-to-date insights, higher AI costs
- Longer (14-30 days): Lower AI costs, potentially stale insights

### Adjusting Data Quality Thresholds

**Location**: `lib/progressive-data-service.ts`

```typescript
const QUALITY_THRESHOLDS = {
  excellent: 90,  // 90-100
  good: 75,       // 75-89
  fair: 50,       // 50-74
  poor: 0         // 0-49
}
```

**Tuning guide**:
- Adjust based on your data collection frequency
- Strict thresholds (95, 85, 70) for daily data
- Lenient thresholds (80, 60, 40) for weekly data

---

## Database Schema

### Core Tables

```sql
-- User context
CREATE TABLE user_context (
  user_id UUID PRIMARY KEY,
  role_level TEXT,
  function TEXT,
  business_stage TEXT,
  kpi_1 TEXT,
  kpi_2 TEXT,
  kpi_3 TEXT,
  upcoming_decisions JSONB
);

-- Signals
CREATE TABLE signals (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  owner_id UUID,
  benchmark_value NUMERIC,
  trend TEXT,
  priority TEXT,
  current_value NUMERIC,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Data points (time series)
CREATE TABLE data_points (
  id UUID PRIMARY KEY,
  signal_id UUID REFERENCES signals(id),
  value NUMERIC NOT NULL,
  date DATE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP
);

-- Data quality
CREATE TABLE data_quality_scores (
  signal_id UUID PRIMARY KEY,
  completeness_score INTEGER,
  freshness_score INTEGER,
  consistency_score INTEGER,
  overall_score INTEGER,
  last_calculated TIMESTAMP
);

-- Signal relationships
CREATE TABLE signal_relationships (
  id UUID PRIMARY KEY,
  signal_a_id UUID REFERENCES signals(id),
  signal_b_id UUID REFERENCES signals(id),
  relationship_type TEXT,
  confidence_score NUMERIC,
  time_lag_days INTEGER,
  correlation_coefficient NUMERIC,
  detected_at TIMESTAMP
);

-- AI analysis cache
CREATE TABLE ai_analysis_cache (
  signal_id UUID,
  analysis_type TEXT,
  analysis_result JSONB,
  generated_at TIMESTAMP,
  expires_at TIMESTAMP,
  token_cost INTEGER,
  PRIMARY KEY (signal_id, analysis_type)
);
```

---

## Performance Considerations

### Optimization Strategies

1. **Database Queries**
   - Index on `signals.owner_id` for user filtering
   - Index on `data_points.signal_id, date` for time series queries
   - Use `LIMIT 90` to fetch only recent data points

2. **Caching**
   - Cache signal scores for 5 minutes
   - Cache data quality scores for 1 hour
   - Cache AI analysis for 7 days

3. **Batch Processing**
   - Run relationship detection hourly, not on every signal update
   - Generate AI insights nightly for top signals
   - Update data quality scores daily

4. **Parallel Processing**
   - Fetch multiple signals in parallel
   - Calculate scores concurrently
   - Batch database inserts

### Scalability Limits

| Metric | Limit | Mitigation |
|--------|-------|-----------|
| Signals per user | 1,000 | Pagination, lazy loading |
| Data points per signal | 365 (1 year) | Archive old data, aggregate |
| Relationships per signal | 20 | Top N only |
| AI analyses per day | 100 | Rate limiting, queuing |

---

## Troubleshooting

### Signal Not Showing Up

**Check**:
1. Data quality score too low?
2. No recent data points?
3. Filtered out by category/priority?
4. User context mismatch?

**Fix**:
```typescript
// Debug relevance
const score = signalIntelligence.calculateSignalImportance(signal, userKPIs)
console.log("Score:", score)  // Check reasons array
```

### Incorrect Trend Detection

**Check**:
1. Enough data points? (Minimum 7)
2. Data quality issues? (Missing values)
3. Threshold too sensitive?

**Fix**:
```typescript
// Adjust threshold in universal-schema.ts
const threshold = 0.05  // 5% instead of 1%
```

### No Relationships Detected

**Check**:
1. Enough signals? (Minimum 5)
2. Overlapping time ranges?
3. Correlation threshold too high?

**Fix**:
```typescript
// Lower threshold temporarily
const CORRELATION_THRESHOLD = 0.5
```

### High AI Costs

**Check**:
1. Cache hit rate
2. Analysis frequency
3. Prompt length

**Fix**:
```typescript
// Check cache performance
SELECT 
  COUNT(*) as total_requests,
  SUM(CASE WHEN cached THEN 1 ELSE 0 END) as cache_hits
FROM ai_analysis_cache
// Target: >80% cache hit rate
```

---

## Future Enhancements

### Planned Features

1. **Predictive Alerts**
   - ML-based anomaly detection
   - Forecasting signal values 7-30 days ahead
   - Automatic alert generation

2. **Natural Language Queries**
   - "Show me revenue signals"
   - "Why is churn increasing?"
   - "What affects customer satisfaction?"

3. **Collaborative Features**
   - Share signals between users
   - Comment on signals
   - @mention team members

4. **Advanced Visualizations**
   - Relationship graphs
   - Sankey diagrams for impact flow
   - Heatmaps for correlation matrices

5. **Integration Expansions**
   - Salesforce
   - Zendesk
   - Google Analytics
   - Stripe

---

## Summary

The Signal Intelligence System is a production-ready platform that:
- **Normalizes** data from multiple sources into a universal schema
- **Scores** signals based on relevance, urgency, and impact
- **Personalizes** insights based on user context
- **Detects** relationships and patterns automatically
- **Generates** AI-powered insights cost-effectively
- **Predicts** impact on KPIs and business outcomes

It's designed to work from day one with zero data and progressively enhance as more data becomes available.
