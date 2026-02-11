# Camino - Metric Specifications
# Last updated: 11 Feb 2026
# Purpose: Single source of truth for every signal calculation.
# Every signal the system generates MUST match these specs exactly.
# If the code doesn't match the spec, the code is wrong.


## How to Use This Doc

1. Pick a signal type below
2. Upload a known test dataset (where you can manually verify the answer)
3. Compare the system output to the "Expected Output" in the spec
4. If they don't match, the bug is in the code, not the data


## Architecture Issues Identified

Before the specs, here are the structural problems causing incorrect numbers:

### Issue 1: Client-Side Preview vs Server-Side Calculation Divergence

The `generateSignals()` function in `upload-proto-client.tsx` computes a **preview value**
from `tab.sampleRows` (client side). The server-side `calculateSignal()` in
`/api/upload/generate/route.ts` recomputes from `tab.rows` (full dataset). These can
diverge because:

- `sampleRows` may be a subset of `rows` (e.g. first 100 rows only)
- Client preview of monthly_rate uses sampleRows date range, server uses full rows date range
- Client preview of sum/average uses sampleRows, server uses all rows

**Recommendation:** The client preview should be labeled "estimate" or "preview based on
sample." Only the server-side value should be stored as the signal's `absolute_value`.
Alternatively, send ALL rows to both and ensure they use the same function.


### Issue 2: No Row Filtering

The current pipeline has NO row filtering. Every row in the tab is included in every
calculation. This means:

- Pipeline Value includes Closed Won AND Closed Lost deals (should only include open)
- Win Rate cannot be calculated (needs to filter by Closed Won vs all closed)
- Ticket Resolution Time includes open tickets (should only include resolved)

**Recommendation:** Add a `filters` field to the signal definition. The 3-question flow
should auto-detect common filters based on row type:
- deals: exclude Closed Lost for pipeline signals
- tickets: filter by status for resolution signals

This is the biggest accuracy problem. See Issue 5 for the recommended fix.


### Issue 3: Date Parsing Inconsistency

`parseDate()` in the generate route accepts ISO dates and common formats but may fail on:
- DD/MM/YYYY (Australian format) vs MM/DD/YYYY (US format) -- ambiguous for dates like 02/03/2026
- Dates with timezone offsets
- Dates formatted as "11 Feb 2026" or "February 11, 2026"

**Recommendation:** Add a date format detection step during the 3-question flow. When the
user selects a date column, sample 5 values and show them: "Is this date March 2 or
February 3?" Let the user confirm the format. Store the format with the tab answers.


### Issue 4: Trend Calculation Uses Halves, Not Periods

`determineTrend()` splits ALL data points into two halves and compares averages. This means:
- A dataset spanning 12 months compares months 1-6 vs months 7-12 (sensible)
- A dataset spanning 2 months compares weeks 1-2 vs weeks 3-4 (less sensible)
- A dataset with 3 data points returns "stable" (minimum is 4)

**Recommendation:** Use a proper period comparison: current month vs previous month, or
current quarter vs previous quarter. The period should match the data density.


### Issue 5: No Signal Subtypes (The Root Cause)

The current system generates one signal per operation type (count, sum, average, monthly_rate,
group_by). But business metrics often need COMBINATIONS:

- "Pipeline Value" = SUM(Amount) WHERE Stage NOT IN ('Closed Won', 'Closed Lost')
- "Win Rate" = COUNT(WHERE Stage = 'Closed Won') / COUNT(WHERE Stage IN ('Closed Won', 'Closed Lost'))
- "Average Resolution Time" = AVG(Resolution_Time) WHERE Status = 'Resolved'

The 3-question flow only asks what, how much, and when. It doesn't ask "which rows to include."

**Recommendation:** Add signal templates per row type. When user selects "deals" as the row
type and a stage/status column exists, auto-generate:
- Total Deals (count, no filter)
- Pipeline Value (sum of amount, WHERE stage is open)
- Closed Won Value (sum of amount, WHERE stage = Closed Won)
- Win Rate (rate: Closed Won / (Closed Won + Closed Lost))
- Average Deal Size (average of amount, all deals)

These templates encode the filter logic that the 3-question flow currently misses.

---

## Signal Specifications by Row Type


### DEALS / OPPORTUNITIES

#### Signal: Total Deals
- Operation: COUNT
- Formula: COUNT(all rows)
- Filters: None
- Date column: Used for trend only (count per month)
- Expected: If file has 150 rows, value = 150
- Edge cases: Includes all statuses (open, won, lost)

#### Signal: Total [Amount Column]
- Operation: SUM
- Formula: SUM(metricColumn) for all rows
- Filters: None
- Date column: Used for trend (sum per month)
- Expected: If 5 deals with amounts $10K, $20K, $30K, $40K, $50K → value = $150K
- Edge cases:
  - Nulls/blanks in amount column are EXCLUDED (not treated as 0)
  - Currency symbols ($, commas) are stripped before parsing
  - If a value like "$1,234.56" fails to parse, it's excluded and logged

#### Signal: Average [Amount Column]
- Operation: AVERAGE
- Formula: SUM(metricColumn) / COUNT(non-null metricColumn values)
- Filters: None
- Date column: Used for trend (average per month)
- Expected: If 5 deals with amounts $10K, $20K, $30K, $40K, $50K → value = $30K
- Edge cases: Same as Total above. Denominator is count of PARSEABLE values, not total rows.

#### Signal: Deals per Month
- Operation: MONTHLY_RATE
- Formula: COUNT(all rows) / COUNT(distinct months in date range)
- Filters: None
- Date column: REQUIRED
- Expected: If 120 deals over 12 months → value = 10/mo
- Edge cases:
  - Months with 0 deals are NOT counted in denominator (current behavior)
  - Actually they SHOULD be: if data spans Jan-Dec but no deals in March, denominator = 12 not 11
  - BUG: Current code calculates months as (newest - oldest + 1), which is correct calendar months.
    But if dates are sparse, this may give misleading rate.

#### Signal: Deals by [Stage/Status/Owner]
- Operation: GROUP_BY
- Formula: COUNT(rows) GROUP BY groupByColumn
- Filters: None
- Date column: Used for trend of total count
- Expected: If 50 deals with stages: Qualification (20), Proposal (15), Closed Won (10), Closed Lost (5) → value = 4 groups, top: Qualification: 20, Proposal: 15, Closed Won: 10
- Edge cases: Blank/null group values are excluded

#### Signal: Pipeline Value (NOT YET IMPLEMENTED)
- Operation: SUM with FILTER
- Formula: SUM(Amount) WHERE Stage NOT IN ('Closed Won', 'Closed Lost', 'Lost', 'Won')
- Filters: Exclude closed stages
- Requires: Status/Stage column detection
- Expected: If 5 deals ($10K open, $20K open, $30K won, $40K lost, $50K open) → value = $80K

#### Signal: Win Rate (NOT YET IMPLEMENTED)
- Operation: RATE
- Formula: COUNT(WHERE Stage = 'Closed Won') / COUNT(WHERE Stage IN ('Closed Won', 'Closed Lost'))
- Filters: Only include closed deals
- Requires: Status/Stage column with recognizable win/loss values
- Expected: If 10 Closed Won and 5 Closed Lost → value = 66.7%
- Note: Deals still in pipeline are EXCLUDED from denominator


### LEADS / CONTACTS

#### Signal: Total Leads / Contacts
- Operation: COUNT
- Formula: COUNT(all rows)
- Filters: None
- Expected: Straightforward row count

#### Signal: Leads per Month
- Operation: MONTHLY_RATE
- Formula: COUNT(all rows) / COUNT(distinct months)
- Filters: None
- Date column: REQUIRED

#### Signal: Leads by [Source/Status/Owner]
- Operation: GROUP_BY
- Formula: COUNT(rows) GROUP BY groupByColumn
- Expected: e.g. Web: 40, Referral: 30, Cold: 20

#### Signal: Lead Conversion Rate (NOT YET IMPLEMENTED)
- Operation: RATE
- Formula: COUNT(WHERE is_converted = true) / COUNT(all leads)
- Filters: Needs "is_converted" or similar boolean/status column
- Expected: If 100 leads and 15 converted → value = 15%


### SUPPORT TICKETS

#### Signal: Total Tickets
- Operation: COUNT
- Formula: COUNT(all rows)
- Filters: None

#### Signal: Tickets per Month
- Operation: MONTHLY_RATE
- Formula: COUNT(all rows) / COUNT(distinct months)
- Date column: REQUIRED

#### Signal: Tickets by [Status/Priority/Channel/Agent]
- Operation: GROUP_BY
- Formula: COUNT(rows) GROUP BY groupByColumn

#### Signal: Average Resolution Time (NOT YET IMPLEMENTED)
- Operation: AVERAGE with FILTER
- Formula: AVG(resolution_time_hours) WHERE Status = 'Resolved' or 'Closed'
- Filters: Only resolved/closed tickets
- Requires: Resolution time column OR (resolved_date - created_date) calculation

#### Signal: First Response Time (NOT YET IMPLEMENTED)
- Operation: AVERAGE
- Formula: AVG(first_response_time) WHERE first_response_time IS NOT NULL
- Requires: First response time column


### CUSTOMERS / ACCOUNTS

#### Signal: Total Customers
- Operation: COUNT
- Formula: COUNT(all rows)

#### Signal: Customers per Month
- Operation: MONTHLY_RATE
- Formula: COUNT(all rows) / COUNT(distinct months)
- Date column: REQUIRED

#### Signal: Customers by [Type/Industry/Tier]
- Operation: GROUP_BY
- Formula: COUNT(rows) GROUP BY groupByColumn


### EVENTS / ACTIVITIES

#### Signal: Total Events
- Operation: COUNT
- Formula: COUNT(all rows)

#### Signal: Events per Month
- Operation: MONTHLY_RATE
- Formula: COUNT(all rows) / COUNT(distinct months)

#### Signal: Events by [Type/Category]
- Operation: GROUP_BY
- Formula: COUNT(rows) GROUP BY groupByColumn


### AGENTS / TEAM

#### Signal: Total Agents
- Operation: COUNT
- Formula: COUNT(all rows)

#### Signal: Agents by [Status/Department/Role]
- Operation: GROUP_BY
- Formula: COUNT(rows) GROUP BY groupByColumn

---

## Recommended Architecture Changes (Priority Order)

### 1. Add Signal Templates per Row Type (HIGH - fixes Issue 5)

Replace the generic signal generation with row-type-specific templates that encode
the correct formula, filters, and column expectations.

```
const DEAL_TEMPLATES = [
  { name: "Total Deals", op: "count", filter: null },
  { name: "Pipeline Value", op: "sum", column: "amount", filter: { field: "stage", op: "excludes", values: ["closed won", "closed lost"] } },
  { name: "Closed Won Value", op: "sum", column: "amount", filter: { field: "stage", op: "includes", values: ["closed won"] } },
  { name: "Win Rate", op: "rate", positiveFilter: { field: "stage", op: "includes", values: ["closed won"] }, totalFilter: { field: "stage", op: "includes", values: ["closed won", "closed lost"] } },
  { name: "Average Deal Size", op: "average", column: "amount", filter: null },
  { name: "Deals per Month", op: "monthly_rate", filter: null },
]
```

The 3-question answers determine WHICH templates to use. The templates determine HOW
to calculate.

### 2. Add Row Filtering to the Generate Pipeline (HIGH - fixes Issue 2)

The `calculateSignal()` function needs to accept and apply filters before aggregating.
Currently it operates on all rows. Add:

```
function applyFilters(rows, filters) {
  return rows.filter(row => {
    return filters.every(f => {
      const val = (row[f.field] || "").toLowerCase()
      if (f.op === "includes") return f.values.some(v => val.includes(v.toLowerCase()))
      if (f.op === "excludes") return !f.values.some(v => val.includes(v.toLowerCase()))
      return true
    })
  })
}
```

### 3. Add a 4th Question: Status/Stage Column (MEDIUM - enables filtering)

After "what does each row represent?" and before generating signals, ask:
"Which column shows the status or stage?" (dropdown of text columns with 2-20 unique values)

This enables the template system to apply the right filters. For deals, it detects
the stage column. For tickets, the status column.

### 4. Add Date Format Detection (MEDIUM - fixes Issue 3)

When user selects a date column, sample 5 values and detect the format:
- If all dates match YYYY-MM-DD → ISO, no ambiguity
- If dates match DD/MM/YYYY or MM/DD/YYYY → show user a sample and ask which

### 5. Fix Trend to Use Period Comparison (LOW - fixes Issue 4)

Replace the "split in half" approach with:
- If data spans 3+ months: compare last full month vs previous full month
- If data spans 2 months: compare month 1 vs month 2
- If data spans < 2 months: show "insufficient data for trend"

### 6. Add Test Fixtures (LOW - ongoing quality)

For each signal spec above, create a small JSON test dataset (10-20 rows) with
known expected outputs. Run assertions in a test script:

```
assert(calculateSignal("Total Deals", testDealsData) === 15)
assert(calculateSignal("Pipeline Value", testDealsData) === 80000)
assert(calculateSignal("Win Rate", testDealsData) === 0.667)
```

This catches regressions when the calculation code changes.

---

## Validation Checklist (Use Before Billing Demo)

For each signal shown to the customer, manually verify:

- [ ] Open the source CSV/XLSX in a spreadsheet
- [ ] Apply the formula from this spec manually (e.g. SUMIF in Excel)
- [ ] Compare the manual result to Camino's displayed value
- [ ] Check the trend direction matches your manual assessment
- [ ] Confirm the signal name accurately describes what's being calculated
- [ ] Confirm nulls/blanks are handled correctly (excluded, not zero)
