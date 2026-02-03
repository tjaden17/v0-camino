# Signal Intelligence System - Test Plan

## Overview

This test plan validates the Signal Intelligence System works correctly with real-world data and edge cases. Tests are organized by component and include both automated test cases and manual validation procedures.

---

## Test Environment Setup

### Prerequisites

```bash
# 1. Database with schema
# Run: scripts/008_user_context_and_intelligence.sql

# 2. Sample data sources
# - Zoho Desk tickets CSV (30-90 days)
# - HubSpot deals export
# - Custom CSV with metrics

# 3. Test users with different contexts
# - CXO with high-level KPIs
# - Sales Manager with pipeline KPIs
# - Support Lead with CSAT KPIs
```

### Test Data Preparation

```sql
-- Create test users with different contexts
INSERT INTO user_context (user_id, role_level, function, business_stage, kpi_1, kpi_2, kpi_3)
VALUES 
  ('test-cxo', 'CXO', 'business', 'scale', 'Revenue', 'Churn Rate', 'Gross Margin'),
  ('test-sales-mgr', 'manager', 'sales', 'scale', 'Pipeline Value', 'Win Rate', 'Sales Cycle'),
  ('test-support', 'manager', 'support', 'PMF', 'CSAT Score', 'Resolution Time', 'First Response Time'),
  ('test-ic', 'IC', 'product', 'pre-product', 'DAU', 'Retention', 'Feature Adoption');
```

---

## Component Tests

### 1. Universal Schema Transformation

#### Test 1.1: Zoho Desk Tickets → Signals

**Objective**: Validate ticket data transforms into support KPIs correctly.

**Test Data**: `test-data/zoho-desk-tickets.csv`
```csv
Ticket ID,Subject,Status,Priority,Created Time,Closed Time,Assignee
12345,Login issue,Closed,High,2025-01-01 09:00,2025-01-03 14:00,john@company.com
12346,Billing question,Closed,Medium,2025-01-01 10:00,2025-01-02 11:00,jane@company.com
12347,Feature request,Open,Low,2025-01-04 15:00,,john@company.com
```

**Expected Signals**:
| Signal Name | Value | Category | Trend |
|------------|-------|----------|-------|
| Total Support Tickets | 3 | support | N/A |
| Closed Tickets | 2 | support | N/A |
| Open Tickets | 1 | support | N/A |
| Avg Resolution Time | 1.5 days | support | stable |
| High Priority Tickets | 1 | support | N/A |

**Validation**:
```typescript
// Test code
const processor = new ZohoDeskProcessor()
const signals = await processor.processTickets(tickets)

assert.equal(signals.length, 5)
assert.equal(signals.find(s => s.name === "Total Support Tickets").value, 3)
assert.equal(signals.find(s => s.name === "Avg Resolution Time").value, 1.5)
```

**Pass Criteria**:
- ✅ All 5 KPIs generated
- ✅ Values calculated correctly
- ✅ Category set to "support"
- ✅ Date set to latest ticket date

---

#### Test 1.2: HubSpot Deals → Signals

**Test Data**: `test-data/hubspot-deals.json`
```json
[
  {"dealname": "Acme Corp", "amount": 50000, "dealstage": "closedwon", "closedate": "2025-01-15"},
  {"dealname": "TechCo", "amount": 75000, "dealstage": "closedwon", "closedate": "2025-01-20"},
  {"dealname": "StartupXYZ", "amount": 25000, "dealstage": "closedlost", "closedate": "2025-01-18"}
]
```

**Expected Signals**:
| Signal Name | Value | Category | Trend |
|------------|-------|----------|-------|
| Total Deal Value | $150,000 | sales | N/A |
| Won Deals | 2 | sales | N/A |
| Lost Deals | 1 | sales | N/A |
| Win Rate | 66.7% | sales | N/A |
| Avg Deal Size | $75,000 | sales | N/A |

**Pass Criteria**:
- ✅ Currency formatted correctly
- ✅ Percentages calculated accurately
- ✅ Category set to "sales"

---

#### Test 1.3: CSV with Time Series Data

**Test Data**: `test-data/revenue-time-series.csv`
```csv
Date,Revenue
2024-11-01,50000
2024-12-01,55000
2025-01-01,52000
```

**Expected Result**:
- Signal: "Revenue"
- Latest value: $52,000
- Previous value: $55,000
- Trend: "decreasing"
- Change: -5.5%

**Validation**:
```typescript
const signal = await transformCSV(csvData, { name: "Revenue", category: "finance" })

assert.equal(signal.latest_value, 52000)
assert.equal(signal.trend, "decreasing")
assert.equal(signal.change_percent, -5.5)
```

**Pass Criteria**:
- ✅ Trend detected correctly
- ✅ Change percentage calculated
- ✅ Time series preserved

---

### 2. Signal Intelligence Scoring

#### Test 2.1: Relevance Scoring - Direct KPI Match

**Scenario**: User has KPI "Revenue". Signal is "Monthly Recurring Revenue".

**Expected**:
- Relevance Score: ≥85 (direct match)
- Reason: "Directly matches your KPI: Revenue"

**Test Code**:
```typescript
const userKPIs = ["Revenue"]
const signal = { name: "Monthly Recurring Revenue", category: "finance" }
const score = signalIntelligence.calculateSignalImportance(signal, userKPIs)

assert.isAtLeast(score.relevanceScore, 85)
assert.include(score.reasons, "Directly matches your KPI: Revenue")
```

---

#### Test 2.2: Urgency Scoring - Below Benchmark

**Scenario**: Signal is 65% of benchmark and declining.

**Expected**:
- Urgency Score: 70+ (40 for below 70% + 30 for declining)
- Reason: "Significantly below target (65%)"
- Reason: "Declining trend detected"

**Test Code**:
```typescript
const signal = {
  name: "Customer Satisfaction",
  current_value: 65,
  benchmark_value: 100,
  trend: "decreasing"
}
const score = signalIntelligence.calculateSignalImportance(signal, [])

assert.isAtLeast(score.urgencyScore, 70)
assert.include(score.reasons, "below target")
assert.include(score.reasons, "Declining trend")
```

---

#### Test 2.3: Impact Scoring - High Value Metric

**Scenario**: Signal is "Revenue" with value $500,000.

**Expected**:
- Impact Score: ≥65 (35 for "revenue" keyword + 30 for high value)
- Reason: "High-impact business metric"
- Reason: "High monetary value"

**Test Code**:
```typescript
const signal = {
  name: "Monthly Revenue",
  current_value: 500000,
  metadata: { unit: "$" }
}
const score = signalIntelligence.calculateSignalImportance(signal, [])

assert.isAtLeast(score.impactScore, 65)
```

---

#### Test 2.4: Overall Scoring - Combined

**Scenario**: High-priority revenue signal, declining, below benchmark.

**Test Data**:
```typescript
const signal = {
  name: "Monthly Recurring Revenue",
  current_value: 50000,
  benchmark_value: 75000,
  trend: "decreasing",
  priority: "high",
  category: "sales",
  metadata: { unit: "$" }
}
const userKPIs = ["Revenue", "Growth"]
```

**Expected Overall Score Breakdown**:
- Relevance: ~85 (direct KPI match)
- Urgency: ~100 (high priority + declining + below 70%)
- Impact: ~55 (revenue keyword + monetary value)
- Overall: (85×0.3) + (100×0.35) + (55×0.35) = **79.75**

**Pass Criteria**:
- ✅ Overall score 75-85 range
- ✅ All three dimensions calculated
- ✅ Reasons array populated

---

### 3. User Context Personalization

#### Test 3.1: Role-Based Signal Filtering

**Scenario**: Sales Manager vs. Support Lead see different top signals.

**Test Data**: Same set of 20 mixed signals (sales, support, product).

**Expected for Sales Manager**:
- Top 5 signals: Sales-related (Pipeline Value, Win Rate, etc.)
- Bottom 5: Support/Product signals

**Expected for Support Lead**:
- Top 5 signals: Support-related (CSAT, Resolution Time, etc.)
- Bottom 5: Sales/Product signals

**Validation**:
```typescript
const signals = await getSignals()

// Sales Manager context
const salesScores = signals.map(s => 
  calculateRelevanceForUser(s, "test-sales-mgr")
)
const topForSales = salesScores.sort((a,b) => b.score - a.score)[0]
assert.equal(topForSales.signal.category, "sales")

// Support Lead context
const supportScores = signals.map(s => 
  calculateRelevanceForUser(s, "test-support")
)
const topForSupport = supportScores.sort((a,b) => b.score - a.score)[0]
assert.equal(topForSupport.signal.category, "support")
```

**Pass Criteria**:
- ✅ Different users see different top signals
- ✅ Relevance scores vary by context
- ✅ Category alignment with function

---

#### Test 3.2: Business Stage Impact

**Scenario**: Pre-product startup vs. Scale-up company.

**Expected for Pre-Product**:
- High relevance: Product adoption, user feedback
- Low relevance: Operational efficiency, scale metrics

**Expected for Scale**:
- High relevance: Unit economics, operational efficiency
- Low relevance: Early traction metrics

**Pass Criteria**:
- ✅ Stage-appropriate signals ranked higher

---

### 4. Data Quality Scoring

#### Test 4.1: Zero Data State

**Scenario**: New user, no signals uploaded.

**Expected**:
- Overall quality: 0
- State: "zero"
- Recommendations: "Connect data sources", "Upload CSV"

**Validation**:
```typescript
const quality = await assessDataQuality("new-user")

assert.equal(quality.state, "zero")
assert.equal(quality.overall_score, 0)
assert.isNotEmpty(quality.recommendations)
```

---

#### Test 4.2: Low Data Quality

**Scenario**: 10 days of data, last updated 5 days ago, irregular updates.

**Expected**:
- Completeness: ~25 (10 days < 30 days)
- Freshness: ~60 (updated this month)
- Consistency: ~30 (irregular)
- Overall: ~38 (weighted average)
- State: "low"

**Pass Criteria**:
- ✅ Quality score 30-50
- ✅ Correct state classification
- ✅ Actionable recommendations

---

#### Test 4.3: Excellent Data Quality

**Scenario**: 120 days of daily data, last updated today.

**Expected**:
- Completeness: 100 (>90 days)
- Freshness: 100 (today)
- Consistency: 100 (daily)
- Overall: 100
- State: "rich"

**Pass Criteria**:
- ✅ Quality score 95-100
- ✅ No warnings or gaps

---

### 5. Signal Relationships Detection

#### Test 5.1: Causal Relationship

**Scenario**: Marketing Spend → Inbound Leads (3 day lag).

**Test Data**:
```typescript
const marketingSpend = [1000, 1500, 2000, 1800, 2200]
const leads = [50, 52, 75, 90, 88, 110]  // 3 day lag
```

**Expected**:
- Relationship detected: ✅
- Type: "causes"
- Confidence: >0.80
- Time lag: 3 days
- Correlation: >0.75

**Validation**:
```typescript
const relationships = await detectRelationships([
  { signal_id: "marketing-spend", data: marketingSpend },
  { signal_id: "inbound-leads", data: leads }
])

const rel = relationships.find(r => 
  r.signal_a_id === "marketing-spend" && 
  r.signal_b_id === "inbound-leads"
)

assert.isNotNull(rel)
assert.equal(rel.relationship_type, "causes")
assert.isAtLeast(rel.confidence_score, 0.80)
assert.equal(rel.time_lag_days, 3)
```

---

#### Test 5.2: Correlation (No Causation)

**Scenario**: Two signals move together but no causal link.

**Test Data**:
```typescript
const signalA = [100, 110, 105, 115, 120]
const signalB = [50, 55, 52, 58, 60]  // Perfectly correlated
```

**Expected**:
- Relationship detected: ✅
- Type: "correlates" (not "causes")
- Confidence: >0.90
- Time lag: 0 days

**Pass Criteria**:
- ✅ Distinguishes correlation from causation
- ✅ Correct relationship type

---

#### Test 5.3: Multi-Step Chain

**Scenario**: Marketing → Leads → Opportunities → Revenue.

**Expected**:
- Direct relationships: 3 (Marketing→Leads, Leads→Opps, Opps→Revenue)
- Chain detected: Marketing → Leads → Opportunities → Revenue
- End-to-end confidence: Product of individual confidences

**Validation**:
```typescript
const chains = await detectRelationshipChains()

const chain = chains.find(c => 
  c.start === "marketing-spend" && 
  c.end === "revenue"
)

assert.equal(chain.steps.length, 3)
assert.deepEqual(chain.path, [
  "marketing-spend",
  "inbound-leads", 
  "qualified-opportunities",
  "revenue"
])
```

---

#### Test 5.4: No Spurious Correlations

**Scenario**: Two unrelated signals with random correlation.

**Test Data**:
```typescript
const signalA = [1, 2, 3, 4, 5]  // Linear growth
const signalB = [5, 4, 3, 2, 1]  // Linear decline
// Correlation: -1.0 (perfect inverse)
```

**Expected**:
- Relationship NOT detected (no plausible causal link)
- Reason: "Inverse correlation but no domain logic support"

**Pass Criteria**:
- ✅ Domain knowledge prevents spurious correlations

---

### 6. AI Analysis Service

#### Test 6.1: Cache Hit

**Scenario**: Request analysis for same signal twice within 7 days.

**Expected**:
- First request: Cache miss → Generate new analysis
- Second request: Cache hit → Return cached result
- Cache hit rate: 50%

**Validation**:
```typescript
// First call
const result1 = await analyzeSignal(signalId, "why_analysis")
assert.equal(result1.cached, false)

// Second call (immediate)
const result2 = await analyzeSignal(signalId, "why_analysis")
assert.equal(result2.cached, true)
assert.deepEqual(result1.analysis, result2.analysis)
```

**Pass Criteria**:
- ✅ Second call uses cache
- ✅ Results identical
- ✅ No additional AI cost

---

#### Test 6.2: Cache Expiry

**Scenario**: Request analysis after 7 days.

**Expected**:
- First request: Cache miss
- After 7 days: Cache expired → Generate new analysis

**Validation**:
```typescript
// First call
await analyzeSignal(signalId, "why_analysis")

// Simulate 7 days passing
await updateTimestamp(signalId, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))

// Second call
const result = await analyzeSignal(signalId, "why_analysis")
assert.equal(result.cached, false)
```

---

#### Test 6.3: Analysis Quality

**Scenario**: Declining revenue signal.

**Test Data**:
```typescript
const signal = {
  name: "Monthly Recurring Revenue",
  current_value: 50000,
  previous_value: 60000,
  trend: "decreasing",
  change_percent: -16.7
}
```

**Expected Analysis Contains**:
- Quantitative summary: "-16.7% decrease"
- Possible causes: "churn", "cancellations", "downgrades"
- Actionable recommendations
- 2-3 sentences max

**Validation**:
```typescript
const analysis = await analyzeSignal(signal.id, "why_analysis")

assert.include(analysis.result.toLowerCase(), "decrease")
assert.include(analysis.result.toLowerCase(), "churn")
assert.isBelow(analysis.result.split(".").length, 5)  // Max 4 sentences
```

---

### 7. Impact Prediction Engine

#### Test 7.1: Single-Step Impact

**Scenario**: Increase marketing spend by 20% → Impact on leads.

**Expected**:
```javascript
{
  target: "Inbound Leads",
  predicted_change: "+25%",
  confidence: 0.85,
  explanation: "Historical data shows strong correlation"
}
```

**Validation**:
```typescript
const impacts = await predictImpact("marketing-spend", 20)  // 20% increase

const leadImpact = impacts.find(i => i.target === "inbound-leads")
assert.isNotNull(leadImpact)
assert.isAtLeast(leadImpact.predicted_change, 20)  // At least 20%
assert.isAtLeast(leadImpact.confidence, 0.80)
```

---

#### Test 7.2: Multi-Step Impact

**Scenario**: Increase marketing → Leads → Opportunities → Revenue.

**Expected**: Cascading impact predictions for all downstream signals.

**Validation**:
```typescript
const impacts = await predictImpact("marketing-spend", 20)

// Should predict impact on all 3 downstream signals
assert.isNotNull(impacts.find(i => i.target === "inbound-leads"))
assert.isNotNull(impacts.find(i => i.target === "qualified-opportunities"))
assert.isNotNull(impacts.find(i => i.target === "revenue"))

// Confidence decreases with distance
const leadConfidence = impacts.find(i => i.target === "inbound-leads").confidence
const revenueConfidence = impacts.find(i => i.target === "revenue").confidence
assert.isBelow(revenueConfidence, leadConfidence)
```

---

#### Test 7.3: KPI Impact Matrix

**Scenario**: Show which signals influence "Revenue" KPI.

**Expected**:
```javascript
{
  kpi: "Revenue",
  influencers: [
    { signal: "New Customers", weight: 0.85 },
    { signal: "Churn Rate", weight: -0.78 },
    { signal: "Average Deal Size", weight: 0.62 }
  ]
}
```

**Validation**:
```typescript
const matrix = await generateKPIImpactMatrix("revenue")

assert.isAtLeast(matrix.influencers.length, 3)
const topInfluencer = matrix.influencers[0]
assert.isAtLeast(Math.abs(topInfluencer.weight), 0.70)
```

---

## Integration Tests

### Test 8: End-to-End Upload Flow

**Scenario**: Upload Zoho Desk tickets → See prioritized signals.

**Steps**:
1. User uploads `zoho-desk-tickets.csv`
2. System processes and creates signals
3. User navigates to dashboard
4. Signals displayed with scores

**Expected**:
- 10 support KPIs created
- Data quality badge shown
- Top 3 signals prioritized
- AI insights available (cached or generated)

**Validation**:
```typescript
// 1. Upload
const uploadResult = await uploadCSV(csvFile, "zoho-desk")
assert.equal(uploadResult.signals_created, 10)

// 2. Fetch signals
const signals = await getSignals(userId)
assert.isAtLeast(signals.length, 10)

// 3. Check scores
const scores = signals.map(s => s.intelligence_score)
assert.isTrue(scores.every(s => s >= 0 && s <= 100))

// 4. Verify quality badges
const qualities = signals.map(s => s.data_quality)
assert.isTrue(qualities.every(q => 
  ["zero", "low", "fair", "good", "excellent"].includes(q.state)
))
```

---

### Test 9: Cross-Dataset Analysis

**Scenario**: Upload both sales (HubSpot) and support (Zoho) data.

**Expected**:
- Relationship detected: "Customer Churn" correlates with "Support Ticket Volume"
- Multi-source insights
- Combined KPI impact

**Validation**:
```typescript
// Upload both datasets
await uploadCSV(hubspotDeals, "hubspot")
await uploadCSV(zohoDeskTickets, "zoho-desk")

// Wait for relationship detection (background job)
await sleep(5000)

// Check relationships
const relationships = await getSignalRelationships(userId)
const crossSource = relationships.find(r => 
  r.signal_a.source === "hubspot" && 
  r.signal_b.source === "zoho_desk"
)
assert.isNotNull(crossSource)
```

---

## Performance Tests

### Test 10: Query Performance

**Scenario**: Load 100 signals with 90 days of data each.

**Expected**:
- Dashboard load: <2 seconds
- Signal detail view: <1 second
- Relationship detection: <30 seconds (background)

**Validation**:
```typescript
const start = Date.now()
const signals = await getSignals(userId)
const loadTime = Date.now() - start

assert.isBelow(loadTime, 2000)  // 2 seconds
assert.equal(signals.length, 100)
```

---

### Test 11: AI Cost Optimization

**Scenario**: 100 signals, 10 analyses requested per signal over 30 days.

**Expected**:
- Total AI calls: ~130 (100 initial + ~30 for cache misses)
- Cache hit rate: >80%
- Total token cost: <$5

**Validation**:
```typescript
const analytics = await getAIAnalyticsReport(30)  // 30 days

assert.isAtLeast(analytics.cache_hit_rate, 0.80)
assert.isBelow(analytics.total_cost, 5.00)
assert.isAtLeast(analytics.total_analyses, 1000)  // 100 × 10
assert.isBelow(analytics.ai_calls, 150)
```

---

## Edge Cases & Error Handling

### Test 12: Missing Data

**Scenario**: CSV with missing required columns.

**Expected**:
- Error message: "Missing required column: value"
- No partial signal creation
- Rollback transaction

---

### Test 13: Invalid Data Types

**Scenario**: Non-numeric value in numeric column.

**Expected**:
- Skip invalid row
- Log warning
- Continue processing valid rows

---

### Test 14: Duplicate Signal Names

**Scenario**: Upload creates signal that already exists.

**Expected**:
- Merge data points (don't duplicate signal)
- Update signal metadata
- Recalculate trends

---

### Test 15: Large Dataset

**Scenario**: Upload 10,000 data points.

**Expected**:
- Batch processing
- Progress indicator
- Complete within 30 seconds

---

## Manual Validation Checklist

### Visual Inspection

- [ ] Signal cards display correctly
- [ ] Quality badges render properly
- [ ] Charts show accurate trends
- [ ] Colors match design system
- [ ] Mobile responsive

### Business Logic

- [ ] High-priority signals appear at top
- [ ] Low-quality signals show warnings
- [ ] Relationships make business sense
- [ ] AI insights are relevant
- [ ] Recommendations are actionable

### User Experience

- [ ] Upload flow is intuitive
- [ ] Error messages are helpful
- [ ] Loading states are clear
- [ ] Empty states guide users
- [ ] Settings persist correctly

---

## Automated Test Execution

### Setup

```bash
# Install dependencies
npm install --save-dev vitest @vitest/ui

# Create test database
npm run db:setup:test

# Seed test data
npm run db:seed:test
```

### Run Tests

```bash
# All tests
npm test

# Component tests only
npm test -- --grep "Component Tests"

# Integration tests
npm test -- --grep "Integration Tests"

# With coverage
npm test -- --coverage
```

### CI/CD Pipeline

```yaml
name: Test Signal Intelligence

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run db:setup:test
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v2
```

---

## Success Criteria

### Phase 1: Foundation
- ✅ All component tests pass
- ✅ Data transformation accuracy >99%
- ✅ Scoring algorithm validated

### Phase 2: Intelligence
- ✅ User context personalization working
- ✅ Data quality tracking accurate
- ✅ Relationship detection >85% accuracy

### Phase 3: Advanced
- ✅ AI analysis quality approved by users
- ✅ Impact predictions within 20% of actuals
- ✅ Cache hit rate >80%

### Overall
- ✅ 100% of automated tests pass
- ✅ Manual checklist completed
- ✅ Performance benchmarks met
- ✅ Edge cases handled gracefully
- ✅ User acceptance testing passed

---

## Reporting

### Test Report Template

```markdown
# Test Execution Report - [Date]

## Summary
- Total Tests: X
- Passed: Y
- Failed: Z
- Coverage: %

## Failed Tests
1. Test Name
   - Expected: ...
   - Actual: ...
   - Root Cause: ...
   - Fix: ...

## Performance Metrics
- Avg Dashboard Load: Xs
- Avg Signal Detail: Xs
- AI Cache Hit Rate: %
- Database Query Time: Xms

## Recommendations
- [ ] Fix failed tests
- [ ] Optimize slow queries
- [ ] Add test for edge case X
```

---

## Conclusion

This test plan ensures the Signal Intelligence System:
- Correctly transforms data from multiple sources
- Accurately scores and prioritizes signals
- Personalizes insights based on user context
- Detects meaningful relationships
- Generates high-quality AI insights cost-effectively
- Predicts business impact reliably
- Performs well under real-world conditions
- Handles edge cases gracefully

Execute tests in order: Component → Integration → Performance → Manual.
