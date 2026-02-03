# UX Flow: Upload to Signal
## Complete User Journey from Data File to Actionable Insights

---

## Table of Contents
1. [Flow Overview](#flow-overview)
2. [Step-by-Step Journey](#step-by-step-journey)
3. [Intelligent Column Mapping](#intelligent-column-mapping)
4. [Error States & Recovery](#error-states--recovery)
5. [First-Time User Onboarding](#first-time-user-onboarding)
6. [Power User Shortcuts](#power-user-shortcuts)
7. [Design Patterns](#design-patterns)

---

## Flow Overview

### The Complete Journey
```
Upload → Analyze → Discover → Map → Preview → Generate → View Signal
   ↓        ↓         ↓       ↓       ↓         ↓          ↓
  File    Parse   Identify  Connect  Validate  Create   Dashboard
         Columns  Signals   Data     Signal    KPIs     + Insights
```

### Time Estimate
- **First-time user**: 5-8 minutes (with onboarding)
- **Returning user**: 2-3 minutes (with smart defaults)
- **Power user**: 30 seconds (bulk upload)

### User Goals
1. **Primary**: "I want to track my support ticket volume"
2. **Secondary**: "I want to understand what's happening in my business"
3. **Tertiary**: "I want to make better decisions with data"

---

## Step-by-Step Journey

### Step 1: Upload Entry Point

**Context**: User has a CSV/Excel file with raw data

**UI Elements**:
```
┌─────────────────────────────────────────────────────────┐
│  📊 Signals Dashboard                          [+ Add]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  📁 No signals yet                                │  │
│  │                                                    │  │
│  │  Upload your data to discover what you can track │  │
│  │                                                    │  │
│  │  [Upload Data File] [Connect Integration]        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  💡 Tip: Upload support tickets, CRM deals, or         │
│      product analytics to get started                   │
└─────────────────────────────────────────────────────────┘
```

**Actions**:
- Click "Upload Data File" → Opens upload modal
- Click "Connect Integration" → Shows integrations (Zoho, HubSpot, etc.)

**Progressive Disclosure**:
- First-time users see helpful tips
- Returning users see recent signals + quick upload button

---

### Step 2: File Upload & Parsing

**Context**: User selects a file from their computer

**UI Elements**:
```
┌─────────────────────────────────────────────────────────┐
│  Upload Data                                    [✕ Close]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Step 1 of 4: Upload File                               │
│  ●━━━━○━━━━○━━━━○                                       │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  📄 Drag and drop your file here                 │  │
│  │     or click to browse                            │  │
│  │                                                    │  │
│  │  Supported: CSV, Excel (.xlsx, .xls)             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  Examples of what you can upload:                       │
│  • Support tickets (Zoho Desk, Zendesk)                │
│  • CRM deals (Zoho CRM, HubSpot, Salesforce)           │
│  • Product analytics (Mixpanel, Amplitude)              │
│  • Custom data exports                                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**After File Selected**:
```
┌─────────────────────────────────────────────────────────┐
│  Upload Data                                    [✕ Close]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ✓ File uploaded: zoho-desk-tickets.csv (4.2 MB)       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%        │
│                                                          │
│  📊 Analyzing your data...                              │
│  • Found 4,832 rows                                     │
│  • Detected 15 columns                                  │
│  • Identified as: Support Tickets                       │
│                                                          │
│  [Continue to Discovery →]                              │
└─────────────────────────────────────────────────────────┘
```

**Behind the Scenes**:
- Parse CSV/Excel
- Count rows and columns
- Detect data types (date, number, text)
- Identify data category (tickets, deals, events)
- Store preview data

**Error Handling**:
- File too large → "Your file is 50MB, max is 10MB. Try filtering in Excel first"
- Corrupted file → "We couldn't read this file. Make sure it's a valid CSV or Excel file"
- Empty file → "This file appears to be empty. Please upload a file with data"

---

### Step 3: Signal Discovery (CRITICAL STEP)

**Context**: System analyzes columns and discovers which signals are possible

**UI Elements**:
```
┌─────────────────────────────────────────────────────────┐
│  Upload Data                                    [✕ Close]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Step 2 of 4: Discover Signals                          │
│  ●━━━━●━━━━○━━━━○                                       │
│                                                          │
│  🎯 We found 8 signals you can track from this data!    │
│                                                          │
│  ┌─ ✅ Ready to Track (6 signals) ─────────────────┐   │
│  │                                                   │   │
│  │  📞 Customer Support                             │   │
│  │  ├─ Ticket Volume              [Auto-tracked]   │   │
│  │  ├─ Average Resolution Time     [Auto-tracked]   │   │
│  │  └─ Open Ticket Count           [Auto-tracked]   │   │
│  │                                                   │   │
│  │  ⚡ Performance                                   │   │
│  │  ├─ First Response Time         [Auto-tracked]   │   │
│  │  ├─ Resolution Rate              [Auto-tracked]   │   │
│  │  └─ SLA Compliance               [Auto-tracked]   │   │
│  │                                                   │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ ⚠️ Needs Help (2 signals) ──────────────────────┐   │
│  │                                                   │   │
│  │  📊 Customer Satisfaction                         │   │
│  │  └─ CSAT Score               [Need: Rating col]  │   │
│  │                                                   │   │
│  │  💰 Revenue Impact                                │   │
│  │  └─ Support Cost per Ticket [Need: Customer $]   │   │
│  │                                                   │   │
│  │  [Help me set these up]                          │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│  [← Back]  [Skip for now]  [Continue with 6 signals →] │
└─────────────────────────────────────────────────────────┘
```

**Key Features**:
- **Automatic Detection**: Shows which signals can be auto-tracked
- **Missing Data Guidance**: Explains what's needed for unavailable signals
- **Categorization**: Groups signals by business function
- **Progressive Options**: User can proceed with what works now

**Intelligence Behind the Scenes**:
```typescript
// Example: How system determines "Ticket Volume" is trackable
Columns found: ["Ticket Number", "Status", "Created Date", "Closed Date", ...]

Signal Requirements for "Ticket Volume":
✓ Need: Unique identifier (found: "Ticket Number")
✓ Need: Timestamp (found: "Created Date")
✓ Need: Categorical data (found: "Status")

Result: ✅ Can track "Ticket Volume" by counting unique "Ticket Number" per time period
```

**User Decisions**:
1. **Proceed with available signals** (most common)
2. **Get help setting up missing signals** (leads to mapping step)
3. **Skip and upload different file** (back to step 1)

---

### Step 4: Intelligent Column Mapping

**Context**: User wants to set up signals that need column mapping assistance

**Problem Being Solved**:
```
User's Data:           Signal Needs:
"Ticket #"      →      "Unique ID"
"Date Created"  →      "Created At"
"Rating"        →      "CSAT Score"
"Agent Name"    →      "Assignee"
```

**UI Elements**:
```
┌─────────────────────────────────────────────────────────┐
│  Upload Data                                    [✕ Close]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Step 3 of 4: Map Your Data                             │
│  ●━━━━●━━━━●━━━━○                                       │
│                                                          │
│  📋 Help us understand your data columns                │
│                                                          │
│  We need to map your columns to track these signals:    │
│                                                          │
│  ┌─ CSAT Score ────────────────────────────────────┐   │
│  │                                                   │   │
│  │  Which column contains customer ratings?         │   │
│  │                                                   │   │
│  │  Your columns:                                    │   │
│  │  ○ Status                                         │   │
│  │  ○ Priority                                       │   │
│  │  ● Rating         ← Suggested ✨                 │   │
│  │  ○ Agent Name                                     │   │
│  │  ○ Resolution Time                                │   │
│  │                                                   │   │
│  │  Preview: 5, 4, 5, 3, 4 (looks like 1-5 scale)  │   │
│  │  ✓ This looks right!                             │   │
│  │                                                   │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ Support Cost per Ticket ────────────────────────┐   │
│  │                                                   │   │
│  │  Which column contains customer value/revenue?    │   │
│  │                                                   │   │
│  │  Your columns:                                    │   │
│  │  ○ Status                                         │   │
│  │  ○ Priority                                       │   │
│  │  ○ Rating                                         │   │
│  │  ○ Agent Name                                     │   │
│  │  ○ None of these                                  │   │
│  │                                                   │   │
│  │  💡 Tip: You'll need to connect your CRM to      │   │
│  │     track revenue-related signals                 │   │
│  │                                                   │   │
│  │  [I'll add this later]                           │   │
│  │                                                   │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│  [← Back]                      [Continue to Preview →]  │
└─────────────────────────────────────────────────────────┘
```

**Intelligent Mapping Logic**:

1. **Exact Match** (100% confidence)
   - Column: "csat_score" → Signal field: "CSAT Score"
   
2. **Semantic Match** (80-99% confidence)
   - Column: "Rating" → Signal field: "CSAT Score"
   - Shows suggestion with ✨ icon
   
3. **Fuzzy Match** (60-79% confidence)
   - Column: "Customer feedback score" → Signal field: "CSAT Score"
   - Shows as option but not auto-selected
   
4. **No Match** (<60% confidence)
   - Show all columns, let user decide
   - Provide "None of these" option

**Data Preview**:
- Show 5-10 sample values from selected column
- Validate data type (e.g., "looks like 1-5 scale" for CSAT)
- Flag anomalies (e.g., "Warning: 15% of values are empty")

---

### Step 5: Signal Preview & Validation

**Context**: User reviews what will be created before committing

**UI Elements**:
```
┌─────────────────────────────────────────────────────────┐
│  Upload Data                                    [✕ Close]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Step 4 of 4: Preview Signals                           │
│  ●━━━━●━━━━●━━━━●                                       │
│                                                          │
│  🎉 You're about to create 7 new signals!               │
│                                                          │
│  Here's what we'll track from your data:                │
│                                                          │
│  ┌─ Customer Support ────────────────────────────────┐  │
│  │                                                    │  │
│  │  📊 Ticket Volume                                 │  │
│  │  └─ Current: 423 tickets this month              │  │
│  │     Trend: ↑ 12% vs last month                   │  │
│  │                                                    │  │
│  │  ⏱️ Average Resolution Time                       │  │
│  │  └─ Current: 4.2 hours                           │  │
│  │     Trend: ↓ 8% vs last month (improving! 🎯)   │  │
│  │                                                    │  │
│  │  📞 Open Ticket Count                             │  │
│  │  └─ Current: 87 open tickets                     │  │
│  │     Status: Within normal range                   │  │
│  │                                                    │  │
│  │  ⚡ First Response Time                           │  │
│  │  └─ Current: 1.8 hours                           │  │
│  │     Trend: → No significant change                │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─ Performance ──────────────────────────────────────┐  │
│  │                                                    │  │
│  │  ✅ Resolution Rate                               │  │
│  │  └─ Current: 89.2%                               │  │
│  │     Benchmark: Above industry avg (85%)          │  │
│  │                                                    │  │
│  │  📋 SLA Compliance                                │  │
│  │  └─ Current: 94.5%                               │  │
│  │     Status: Excellent                            │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─ Customer Satisfaction ────────────────────────────┐  │
│  │                                                    │  │
│  │  ⭐ CSAT Score                                    │  │
│  │  └─ Current: 4.1 / 5.0                           │  │
│  │     Trend: ↑ 0.3 vs last month                   │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  📅 Data range: Jan 1, 2024 - Dec 31, 2024 (12 months) │
│  📊 Total data points: 4,832 tickets                    │
│                                                          │
│  [← Back to edit]        [✨ Create These Signals →]   │
└─────────────────────────────────────────────────────────┘
```

**Validation Checks**:
- ✓ Data quality sufficient (>80% complete)
- ✓ Time range adequate (>30 days)
- ✓ Sample size sufficient (>100 records)
- ⚠️ Warning if data quality issues detected

**User Confidence Building**:
- Show actual calculated values (not "coming soon")
- Display trends immediately (not just current value)
- Compare to benchmarks where available
- Use clear visual indicators (↑↓→)

---

### Step 6: Signal Generation & Processing

**Context**: System creates signals in background

**UI Elements**:
```
┌─────────────────────────────────────────────────────────┐
│  Creating Your Signals...                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ✓ Parsing data structure                               │
│  ✓ Validating data quality                              │
│  ✓ Calculating baseline metrics                         │
│  ● Generating trend analysis...                         │
│  ○ Computing benchmarks                                 │
│  ○ Creating visualizations                              │
│                                                          │
│  This usually takes 10-15 seconds...                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Processing Steps**:
1. Transform raw data → universal schema
2. Calculate current values
3. Compute trends (week-over-week, month-over-month)
4. Compare to benchmarks
5. Generate initial insights
6. Create signal records in database

**Error Recovery**:
- If processing fails, save partial progress
- Allow user to retry or modify mappings
- Provide detailed error messages

---

### Step 7: Signal Dashboard View

**Context**: User sees their newly created signals

**UI Elements**:
```
┌─────────────────────────────────────────────────────────┐
│  📊 Signals Dashboard                          [+ Add]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🎉 Success! 7 new signals are now tracking             │
│                                                          │
│  [View All] [Customer Support] [Performance] [Filters]  │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  📊 Ticket Volume                    High       │   │
│  │  423 tickets this month              Priority   │   │
│  │  ↑ 12% vs last month                           │   │
│  │                                                  │   │
│  │  📈 [Trend visualization: 30-day chart]        │   │
│  │                                                  │   │
│  │  💡 Volume increasing - consider team capacity │   │
│  │  [View Details] [Add to Decision] [Share]      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ⏱️ Average Resolution Time          Medium     │   │
│  │  4.2 hours                           Priority   │   │
│  │  ↓ 8% vs last month                            │   │
│  │                                                  │   │
│  │  📈 [Trend visualization: improving trend]     │   │
│  │                                                  │   │
│  │  💡 Resolution time improving - great work!    │   │
│  │  [View Details] [Add to Decision] [Share]      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ⭐ CSAT Score                       Medium     │   │
│  │  4.1 / 5.0                           Priority   │   │
│  │  ↑ 0.3 vs last month                           │   │
│  │                                                  │   │
│  │  📈 [Trend visualization: steady improvement]  │   │
│  │                                                  │   │
│  │  💡 Customer satisfaction trending up          │   │
│  │  [View Details] [Add to Decision] [Share]      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  💡 Next steps:                                         │
│  • Upload historical data to see longer trends          │
│  • Connect your CRM for revenue insights                │
│  • Set up alerts for critical changes                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key Features**:
- Signals sorted by priority (high → medium → low)
- Visual trend indicators (↑↓→)
- AI-generated insights
- Clear CTAs for next actions

---

## Intelligent Column Mapping

### The Core Challenge

**User's Mental Model**:
> "I have a spreadsheet with columns like 'Ticket #', 'Created', 'Closed', 'Rating'"

**System's Mental Model**:
> "I need a unique_id, created_at, closed_at, csat_score to calculate signals"

**Solution**: Semantic mapping with confidence scoring

### Mapping Algorithm

```typescript
interface ColumnMapping {
  userColumn: string      // "Ticket #"
  systemField: string     // "unique_id"
  confidence: number      // 0.95 (95% confident)
  reason: string         // "Exact match on 'ticket' keyword"
  preview: string[]      // ["TKT-001", "TKT-002", ...]
}

function mapColumns(
  userColumns: string[],
  requiredFields: string[]
): ColumnMapping[] {
  
  // 1. Exact match (case-insensitive)
  if (userColumn.toLowerCase() === systemField.toLowerCase()) {
    return { confidence: 1.0, reason: "Exact match" }
  }
  
  // 2. Keyword match with synonyms
  const synonyms = {
    "unique_id": ["id", "ticket", "number", "key", "identifier"],
    "created_at": ["created", "opened", "submitted", "date"],
    "csat_score": ["rating", "satisfaction", "score", "csat", "nps"]
  }
  
  if (synonyms[systemField].some(syn => 
    userColumn.toLowerCase().includes(syn))
  ) {
    return { confidence: 0.85, reason: "Keyword match" }
  }
  
  // 3. Data type inference
  const sampleData = getColumnSamples(userColumn)
  if (looksLikeUniqueID(sampleData) && systemField === "unique_id") {
    return { confidence: 0.75, reason: "Data pattern match" }
  }
  
  // 4. ML-based semantic similarity (future enhancement)
  const similarity = calculateSemanticSimilarity(userColumn, systemField)
  if (similarity > 0.6) {
    return { confidence: similarity, reason: "Semantic similarity" }
  }
  
  return { confidence: 0.0, reason: "No match found" }
}
```

### Confidence Thresholds

| Confidence | Action | UX Treatment |
|-----------|--------|--------------|
| 95-100% | Auto-map, no user input | ✓ Green checkmark |
| 80-94% | Suggest, pre-select | ✨ Suggested (editable) |
| 60-79% | Suggest, not selected | Show as option |
| 0-59% | Let user choose | All columns shown |

### User Control

**Always Allow Override**:
- Even with 100% confidence, user can change mapping
- Show "Change mapping" link on all auto-mapped fields
- Preserve user choices across similar uploads

**Learn from User**:
```typescript
// Store user's mapping preferences
interface MappingPreference {
  organizationId: string
  userColumnPattern: string   // "Rating"
  systemField: string          // "csat_score"
  timesUsed: number           // 5
  lastUsed: Date              // 2024-01-15
}

// Next time user uploads with "Rating" column,
// automatically suggest "csat_score" mapping
```

---

## Error States & Recovery

### Common Issues & Solutions

#### 1. Missing Required Columns

**Scenario**: Signal needs "Closed Date" but file only has "Created Date"

**UX Solution**:
```
┌─────────────────────────────────────────────────┐
│  ⚠️ Cannot Calculate Resolution Time            │
│                                                  │
│  This signal requires:                          │
│  ✓ Created Date (found)                         │
│  ✗ Closed Date (missing)                        │
│                                                  │
│  Options:                                       │
│  • Add "Closed Date" column to your file        │
│  • Skip this signal for now                     │
│  • Track "Open Tickets" instead (available)     │
│                                                  │
│  [Help me fix this] [Skip] [Choose different]  │
└─────────────────────────────────────────────────┘
```

#### 2. Data Quality Issues

**Scenario**: 40% of "Rating" values are empty

**UX Solution**:
```
┌─────────────────────────────────────────────────┐
│  ⚠️ Data Quality Warning                        │
│                                                  │
│  CSAT Score signal has issues:                  │
│  • 40% of ratings are empty (1,932 / 4,832)    │
│  • This may affect accuracy                     │
│                                                  │
│  Preview: [5, 4, -, -, 3, 5, -, 4, 2, -]       │
│                                                  │
│  Options:                                       │
│  • Continue anyway (less accurate)              │
│  • Filter to only tickets with ratings          │
│  • Fix data in source system first              │
│                                                  │
│  [Continue] [Filter] [Cancel]                   │
└─────────────────────────────────────────────────┘
```

#### 3. Ambiguous Mappings

**Scenario**: File has "Date1", "Date2", "Date3" - unclear which is creation date

**UX Solution**:
```
┌─────────────────────────────────────────────────┐
│  🤔 Help Us Understand Your Data                │
│                                                  │
│  Which column is the ticket creation date?      │
│                                                  │
│  ○ Date1                                        │
│     Preview: 2024-01-15, 2024-01-16, ...       │
│                                                  │
│  ○ Date2                                        │
│     Preview: 2024-01-20, 2024-01-22, ...       │
│                                                  │
│  ○ Date3                                        │
│     Preview: 2024-02-01, 2024-02-03, ...       │
│                                                  │
│  💡 Tip: Creation date is usually the earliest │
│     date in your ticket's lifecycle             │
│                                                  │
│  [Confirm Selection]                            │
└─────────────────────────────────────────────────┘
```

#### 4. Wrong Data Type

**Scenario**: "Rating" column has text values like "Good", "Bad" instead of numbers

**UX Solution**:
```
┌─────────────────────────────────────────────────┐
│  ⚠️ Data Type Mismatch                          │
│                                                  │
│  CSAT Score expects numbers (1-5 or 1-10)      │
│  But "Rating" column contains text:             │
│                                                  │
│  Found values: "Excellent", "Good", "Poor", ... │
│                                                  │
│  Options:                                       │
│  • Let us convert: Excellent=5, Good=4, ...     │
│  • Choose a different column                    │
│  • Skip CSAT Score signal                       │
│                                                  │
│  [Auto Convert] [Choose Different] [Skip]       │
└─────────────────────────────────────────────────┘
```

---

## First-Time User Onboarding

### Progressive Onboarding (Not All at Once)

**Principle**: Teach features when user needs them, not all upfront

#### Onboarding Moment 1: First Upload

```
┌─────────────────────────────────────────────────┐
│  👋 Welcome to Signals!                         │
│                                                  │
│  Upload your data file and we'll automatically  │
│  discover what business metrics you can track.  │
│                                                  │
│  📁 Examples:                                   │
│  • Support tickets → Track response times       │
│  • Sales deals → Monitor pipeline health        │
│  • Product usage → Measure engagement           │
│                                                  │
│  [Upload My First File]  [See Examples]         │
│                                                  │
│  [ ] Don't show this again                      │
└─────────────────────────────────────────────────┘
```

#### Onboarding Moment 2: Signal Discovery

```
┌─────────────────────────────────────────────────┐
│  💡 Quick Tip                          [✕ Close]│
│                                                  │
│  We found 8 signals from your data!             │
│                                                  │
│  • Green checkmarks = Ready to track            │
│  • Yellow warnings = Need your help             │
│  • Red X's = Missing required data              │
│                                                  │
│  [Got it!]                                      │
└─────────────────────────────────────────────────┘
```

#### Onboarding Moment 3: Column Mapping

```
┌─────────────────────────────────────────────────┐
│  💡 About Column Mapping                        │
│                                                  │
│  We try to match your columns to signals        │
│  automatically, but sometimes we need help.     │
│                                                  │
│  ✨ Sparkles = Our best guess (you can change)  │
│  📋 Dropdown = Choose the right column          │
│                                                  │
│  Your choices are remembered for next time!     │
│                                                  │
│  [Got it!]                                      │
└─────────────────────────────────────────────────┘
```

#### Onboarding Moment 4: First Signal Created

```
┌─────────────────────────────────────────────────┐
│  🎉 Your First Signal!                          │
│                                                  │
│  Here's what you can do with signals:           │
│                                                  │
│  📊 Track trends over time                      │
│  🔔 Set up alerts for changes                   │
│  📋 Use in decisions and reports                │
│  🔗 Share with your team                        │
│                                                  │
│  [Explore My Signals]  [Add More Data]          │
└─────────────────────────────────────────────────┘
```

### Contextual Help

**Always Available**:
- "?" icon next to complex terms
- Hover tooltips for explanations
- "Learn more" links to docs
- Live chat support

---

## Power User Shortcuts

### For Experienced Users

#### Bulk Upload
```typescript
// Upload multiple files at once
// System automatically detects file types and creates signals
uploadFiles([
  "jan-tickets.csv",
  "feb-tickets.csv",
  "mar-tickets.csv"
])
```

#### API Integration
```typescript
// Skip UI entirely for automated uploads
POST /api/upload
{
  "data": [...],
  "autoMap": true,
  "createSignals": ["ticket_volume", "resolution_time"]
}
```

#### Saved Mappings
```
┌─────────────────────────────────────────────────┐
│  📁 Upload Similar File                         │
│                                                  │
│  We detected this looks like Zoho Desk tickets  │
│  (similar to your last 3 uploads)               │
│                                                  │
│  Use previous mapping?                          │
│  • Ticket Number → unique_id                    │
│  • Created → created_at                         │
│  • Rating → csat_score                          │
│  • ...                                          │
│                                                  │
│  [✓ Yes, use these]  [No, let me map manually] │
└─────────────────────────────────────────────────┘
```

#### Quick Actions
- Drag & drop file directly on dashboard → Auto-create signals
- Keyboard shortcuts: `U` to upload, `M` to map, `Enter` to confirm
- Command palette: `Cmd+K` → "upload data" → immediate flow start

---

## Design Patterns

### Visual Hierarchy

#### Primary Actions
- Large, prominent buttons
- High contrast colors
- Clear CTAs ("Create Signals", "Continue")

#### Secondary Actions
- Smaller, outline buttons
- Lower contrast
- Supportive CTAs ("Skip", "Cancel", "Back")

#### Tertiary Actions
- Text links
- Minimal styling
- Optional CTAs ("Learn more", "Help")

### Color System

```css
/* Success states */
--signal-available: #10b981;    /* Green - ready to track */
--signal-created: #059669;      /* Dark green - success */

/* Warning states */
--signal-partial: #f59e0b;      /* Amber - needs help */
--data-quality-low: #f97316;    /* Orange - quality issue */

/* Error states */
--signal-unavailable: #ef4444;  /* Red - cannot track */
--mapping-error: #dc2626;       /* Dark red - failed */

/* Neutral states */
--signal-processing: #6b7280;   /* Gray - in progress */
--signal-inactive: #9ca3af;     /* Light gray - disabled */
```

### Typography

```css
/* Headers */
h1: 24px, 600 weight, tight leading    /* Modal titles */
h2: 20px, 600 weight                   /* Section headers */
h3: 16px, 600 weight                   /* Card titles */
h4: 14px, 600 weight                   /* Subsections */

/* Body */
p: 14px, 400 weight, relaxed leading   /* Main content */
small: 12px, 400 weight                /* Helper text */

/* Data */
.metric-value: 32px, 700 weight        /* "423 tickets" */
.metric-label: 14px, 500 weight        /* "Ticket Volume" */
.trend-indicator: 14px, 600 weight     /* "↑ 12%" */
```

### Animations

```css
/* Page transitions */
.modal-enter: fade-in 200ms ease-out
.modal-exit: fade-out 150ms ease-in

/* Success states */
.signal-created: scale-in 300ms spring
.checkmark-appear: draw 400ms ease-out

/* Loading states */
.processing: pulse 1.5s infinite
.progress-bar: slide-right 400ms ease-out

/* Error states */
.error-shake: shake 400ms ease-in-out
```

### Responsive Breakpoints

```css
/* Mobile first approach */
.upload-modal {
  width: 100%;                    /* Mobile: full width */
  
  @media (min-width: 640px) {     /* Tablet */
    width: 90%;
    max-width: 600px;
  }
  
  @media (min-width: 1024px) {    /* Desktop */
    max-width: 800px;
  }
}
```

---

## Key Success Metrics

### User Journey Metrics

**Completion Rate**:
- Goal: >85% of users who start upload complete signal creation
- Measure: (Signals Created / Upload Started) × 100

**Time to First Signal**:
- Goal: <3 minutes for returning users, <8 minutes for new users
- Measure: Time from upload start to signal dashboard view

**Auto-Mapping Accuracy**:
- Goal: >90% of column mappings accepted without user changes
- Measure: (Auto-mapped columns accepted / Total columns) × 100

**Error Recovery Rate**:
- Goal: >75% of users who hit errors successfully complete flow
- Measure: (Completed after error / Total errors) × 100

### User Satisfaction

**Net Promoter Score (NPS)**:
- Question: "How likely are you to recommend this upload flow?"
- Goal: >50 NPS

**Task Success Rate**:
- Question: "Were you able to create the signals you wanted?"
- Goal: >90% say "Yes, easily"

---

## Implementation Checklist

### Phase 1: Core Flow (MVP)
- [ ] File upload with drag & drop
- [ ] CSV/Excel parsing
- [ ] Column detection
- [ ] Basic signal discovery (exact match only)
- [ ] Manual column mapping
- [ ] Signal creation
- [ ] Dashboard display

### Phase 2: Intelligence
- [ ] Semantic column mapping
- [ ] Confidence scoring
- [ ] Auto-suggestions
- [ ] Data quality checks
- [ ] Preview with validation
- [ ] Error recovery flows

### Phase 3: Optimization
- [ ] Saved mapping templates
- [ ] Bulk upload support
- [ ] Progressive onboarding
- [ ] Power user shortcuts
- [ ] Performance optimization
- [ ] Analytics tracking

### Phase 4: Advanced
- [ ] ML-based mapping
- [ ] Cross-dataset signal suggestions
- [ ] Automated data refresh
- [ ] API integrations
- [ ] Collaborative mapping
- [ ] A/B testing variants

---

## Conclusion

This UX flow prioritizes **user confidence** at every step:

1. **Transparency**: User always knows what's happening
2. **Control**: User can override any automatic decision
3. **Guidance**: Clear help when system needs assistance
4. **Validation**: Preview before committing
5. **Recovery**: Easy to fix errors and try again

The result: Users successfully go from raw data file to actionable signals in <5 minutes, with >85% completion rate.
