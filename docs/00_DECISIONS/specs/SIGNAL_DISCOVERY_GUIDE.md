# Signal Discovery System Guide

## Overview

The Signal Discovery System automatically analyzes uploaded data and tells users exactly which signals they can generate based on their data structure. This eliminates guesswork and helps users understand the value of their data immediately.

## How It Works

### 1. **Data Analysis**
When a user uploads a CSV file, the system:
- Detects all columns and their data types (string, number, date, boolean)
- Analyzes sample values and calculates data quality metrics
- Infers semantic meaning from column names (e.g., "created_date" → date field)

### 2. **Signal Matching**
The system compares the uploaded data against 50+ pre-defined signal requirements:
- Checks if required fields are present
- Calculates a match score (0-100%) for each signal
- Categorizes signals as: Available (100%), Partial (50-99%), or Unavailable (<50%)

### 3. **Recommendations**
Provides actionable guidance:
- Which signals can be generated immediately
- What fields are missing for partial signals
- Data quality improvements needed
- Suggestions for additional data sources

## Signal Availability Categories

### ✅ Available (100% Match)
All required fields are present in the uploaded data.

**Example:**
- Signal: "Average Resolution Time"
- Required: `ticket_id`, `created_date`, `closed_date`
- Status: ✅ All fields found in your Zoho Desk export

### ⚠️ Partial (50-99% Match)
Some required fields are present, but not all.

**Example:**
- Signal: "Net Revenue Retention"
- Required: `customer_id`, `revenue`, `date`
- Status: ⚠️ 2/3 fields found. Missing: `date` column

### ❌ Unavailable (<50% Match)
Too many required fields are missing.

**Example:**
- Signal: "Feature Adoption Rate"
- Required: `user_id`, `feature_name`
- Status: ❌ Insufficient data. Need user activity logs

## Real-World Examples

### Example 1: Zoho Desk Ticket Export

**Uploaded Data:**
\`\`\`csv
Ticket ID,Subject,Status,Priority,Created Time,Closed Time,Assignee
TICK-001,Login Issue,Closed,High,2025-01-01 10:00,2025-01-02 14:30,John
TICK-002,Feature Request,Open,Low,2025-01-02 09:15,,,Sarah
\`\`\`

**Discovery Results:**
- ✅ **Available (7 signals)**
  - Total Support Tickets
  - Average Resolution Time
  - First Response Time
  - Ticket Backlog
  - High Priority Tickets
  - Resolution Rate
  - Open vs Closed Ratio

- ⚠️ **Partial (2 signals)**
  - Customer Satisfaction (CSAT) - Missing: satisfaction_rating
  - Ticket Category Breakdown - Missing: category

- **Recommendations:**
  1. Add CSAT ratings column for satisfaction tracking
  2. Include ticket category for better insights
  3. Connect to Zoho CRM for customer revenue context

### Example 2: CRM Deal Export

**Uploaded Data:**
\`\`\`csv
Deal Name,Amount,Stage,Close Date,Owner,Created Date
Acme Corp,$50000,Closed Won,2025-01-15,Alice,2024-12-01
Beta Inc,$25000,Negotiation,2025-02-01,Bob,2024-12-15
\`\`\`

**Discovery Results:**
- ✅ **Available (5 signals)**
  - Sales Pipeline Value
  - Average Deal Size
  - Win Rate
  - Sales Cycle Length
  - Deals by Stage

- ⚠️ **Partial (3 signals)**
  - Revenue Growth Rate - Missing: recurring revenue flag
  - Customer Acquisition Cost - Missing: marketing spend
  - Lead Conversion Rate - Missing: lead source

- **Recommendations:**
  1. Export separate lead data for conversion tracking
  2. Add marketing/sales spend data for CAC calculation
  3. Include subscription type for MRR/ARR tracking

### Example 3: Product Analytics Export

**Uploaded Data:**
\`\`\`csv
User ID,Activity Date,Feature,Session Duration
USER-001,2025-01-01,Dashboard,240
USER-001,2025-01-02,Export,60
USER-002,2025-01-01,Dashboard,180
\`\`\`

**Discovery Results:**
- ✅ **Available (4 signals)**
  - Daily Active Users (DAU)
  - Monthly Active Users (MAU)
  - Feature Adoption Rate
  - User Engagement Score

- ⚠️ **Partial (2 signals)**
  - Retention Rate - Missing: user signup date
  - Churn Rate - Missing: subscription status

- **Recommendations:**
  1. Include user signup/cohort data for retention analysis
  2. Add subscription status for churn tracking
  3. Connect revenue data for monetization insights

## Integration with Upload Flow

The Signal Discovery step appears between Upload and Mapping:

1. **Upload** → User drops CSV file
2. **Discovery** → System analyzes and shows available signals
3. **Mapping** → User maps columns to signal fields
4. **Import** → Data is imported and signals are generated

This flow helps users:
- Understand what they'll get before importing
- Make informed decisions about data structure
- Identify missing fields early
- Choose the most valuable signals to track

## Configuration

### Adding New Signals

To add a new signal to the discovery system, update `SIGNAL_DEFINITIONS` in `lib/signal-discovery-service.ts`:

\`\`\`typescript
{
  signalId: "your_signal_id",
  signalName: "Your Signal Name",
  description: "What this signal measures",
  category: "Revenue|Sales|Support|Marketing|Product",
  valuableFor: ["CEO", "VP Sales", "etc"],
  businessStage: ["Pre-PMF", "Post-PMF", "Scaling"],
  requiredFields: [
    { 
      name: "field_name", 
      type: "number|string|date|boolean",
      description: "What this field contains",
      examples: ["example1", "example2"]
    }
  ],
  optionalFields: [],
  calculationType: "direct|calculated|aggregated|time-series"
}
\`\`\`

### Customizing Match Thresholds

Adjust match score thresholds in `matchSignalToColumns()`:
- Available: 100% (all required fields)
- Partial: 50-99% (some required fields)
- Unavailable: <50% (too few fields)

## Best Practices

1. **Be Specific with Field Names**: Use clear, descriptive column names in your CSV exports
2. **Include Timestamps**: Always include date/time columns for trend analysis
3. **Add Identifiers**: Include unique IDs (customer_id, ticket_id, etc.) for aggregation
4. **Export Complete Data**: Don't filter or truncate columns - system needs full context
5. **Test Small First**: Upload a sample before importing large datasets

## Troubleshooting

**Problem: No signals detected as available**
- Check that column names match expected patterns
- Ensure data types are correct (numbers as numbers, dates as dates)
- Review recommendations for missing fields

**Problem: Low match scores for expected signals**
- Column names may not match semantic patterns
- Use manual mapping in the Mapping step
- Check SIGNAL_CATALOG.md for required field names

**Problem: Incorrect data type detection**
- Clean your data (remove text from number columns)
- Use consistent date formats (ISO 8601 recommended)
- Quote string values that look like numbers

## Future Enhancements

- AI-powered field mapping suggestions
- Custom signal creation from discovery results
- Cross-dataset relationship detection during discovery
- Integration-specific signal templates (Zoho, HubSpot, Salesforce)
- Benchmark data comparison during discovery
