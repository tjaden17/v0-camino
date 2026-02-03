# Zoho Integration Roadmap: Desk & CRM

## Overview

This document outlines the high-level steps to integrate with Zoho Desk and Zoho CRM to extract:
- **Path A**: Pre-built signals (analytics/KPIs from Zoho's analytics APIs)
- **Path B**: Raw data (detailed records for custom signal calculation)

---

## High-Level Integration Steps

### Phase 1: Authentication & Authorization Setup

**Step 1.1: Create Zoho API Credentials**
- Go to Zoho API Console (https://api-console.zoho.com/)
- Create a new "Self Client" or "Server-based Application"
- Configure OAuth 2.0 scopes:
  - **Zoho Desk**: `Desk.tickets.READ`, `Desk.basic.READ`, `Desk.settings.READ`, `Desk.reports.READ`
  - **Zoho CRM**: `ZohoCRM.modules.READ`, `ZohoCRM.settings.READ`, `ZohoCRM.coql.READ`, `ZohoCRM.bulk.READ`
- Note: Client ID, Client Secret, Redirect URI

**Step 1.2: Implement OAuth 2.0 Flow**
```
User clicks "Connect Zoho" 
  → Redirect to Zoho authorization URL
  → User grants permissions
  → Zoho redirects back with authorization code
  → Exchange code for access token + refresh token
  → Store tokens securely (encrypted in database)
```

**Step 1.3: Token Management**
- Access tokens expire in 1 hour
- Implement automatic refresh token mechanism
- Handle token expiration gracefully with retry logic

---

### Phase 2: Path A - Extract Pre-Built Signals (Analytics APIs)

**Step 2.1: Zoho Desk - Analytics API**

Zoho Desk provides pre-calculated metrics via their Analytics API:

**Available Pre-Built Signals:**
- Average First Response Time
- Average Resolution Time
- Ticket Volume by Status/Priority
- Agent Performance Metrics
- Customer Satisfaction (CSAT) scores
- SLA Compliance rates

**API Endpoints:**
```
GET /api/v1/reports
GET /api/v1/reports/{reportId}
GET /api/v1/dashboards
```

**Implementation:**
1. List available reports via `/reports` endpoint
2. Identify reports matching your signals (e.g., "Ticket Volume Report", "Resolution Time Report")
3. Fetch report data with date range filters
4. Map Zoho metrics to your signal schema
5. Store in `signals` and `data_points` tables

**Pros:**
- ✅ Fast - metrics pre-calculated by Zoho
- ✅ No complex calculations needed
- ✅ Efficient API usage

**Cons:**
- ❌ Limited to Zoho's pre-defined metrics
- ❌ Cannot create custom signals
- ❌ Less flexibility in time periods

---

**Step 2.2: Zoho CRM - Analytics API**

Zoho CRM provides analytics through:
- **Analytics API**: Pre-built reports and dashboards
- **COQL (CRM Object Query Language)**: SQL-like queries for aggregations

**Available Pre-Built Signals:**
- Pipeline Value by Stage
- Conversion Rates
- Deal Velocity
- Win/Loss Ratios
- Activity Metrics
- Revenue Forecasts

**API Endpoints:**
```
GET /crm/v2/analytics
GET /crm/v2/reports
POST /crm/v2/coql (for custom aggregations)
```

**Implementation:**
1. Fetch available analytics reports
2. Use COQL to run aggregations:
   ```sql
   SELECT Stage, SUM(Amount) as pipeline_value 
   FROM Deals 
   WHERE Stage != 'Closed Lost' 
   GROUP BY Stage
   ```
3. Map results to your signals
4. Schedule periodic sync (hourly/daily)

**Pros:**
- ✅ COQL allows custom aggregations
- ✅ Real-time or near-real-time data
- ✅ Rich analytics capabilities

**Cons:**
- ❌ COQL has rate limits (100 queries/day for free tier)
- ❌ Complex queries may timeout

---

### Phase 3: Path B - Extract Raw Data (Bulk Export)

**Step 3.1: Zoho Desk - Bulk Data Export**

**Use Case:** When you need ALL ticket details for custom signal calculation

**API Approach:**
```
GET /api/v1/tickets (paginated, max 100 per page)
GET /api/v1/tickets/search (with filters)
```

**Bulk Export Approach (Recommended for >10K records):**
```
POST /api/v1/bulkExport
{
  "module": "tickets",
  "criteria": "(createdTime >= '2024-01-01T00:00:00Z')",
  "fileType": "csv"
}
→ Returns job ID
→ Poll for completion
→ Download CSV file
```

**Implementation:**
1. Schedule daily/weekly bulk exports
2. Download CSV files
3. Process with your dual-path storage system
4. Calculate custom signals from raw data
5. Store raw data in `raw_data_rows` table

**Data Fields to Extract:**
- Ticket ID, Status, Priority, Category
- Created Time, Closed Time, Modified Time
- Assignee, Department, Channel
- Customer ID, Contact Email
- CSAT Rating, Sentiment
- Custom Fields (if any)

**Pros:**
- ✅ Complete control over signal calculations
- ✅ Can create any custom metric
- ✅ Handles large datasets efficiently
- ✅ Full audit trail with raw data

**Cons:**
- ❌ Higher API usage
- ❌ Requires storage for raw data
- ❌ Processing overhead

---

**Step 3.2: Zoho CRM - Bulk Data Export**

**API Approach (Paginated):**
```
GET /crm/v2/Deals (max 200 per page)
GET /crm/v2/Contacts
GET /crm/v2/Accounts
```

**Bulk Export Approach:**
```
POST /crm/bulk/v2/read
{
  "query": {
    "module": "Deals",
    "fields": ["Deal_Name", "Amount", "Stage", "Close_Date"],
    "criteria": "(Created_Time > '2024-01-01')"
  }
}
→ Returns bulk read job ID
→ Poll for status
→ Download result CSV
```

**Implementation:**
1. Export Deals, Contacts, Accounts modules
2. Include all relevant fields for signal calculation
3. Handle incremental updates (fetch only changed records)
4. Store in `raw_data_rows` with module type tagging
5. Run signal calculations across datasets

**Data Fields to Extract:**

*Deals:*
- Deal Name, Amount, Stage, Probability
- Owner, Created Time, Modified Time, Closed Time
- Account Name, Contact Name
- Custom Fields (Product, Source, etc.)

*Contacts:*
- Name, Email, Account
- Created Date, Last Activity Date
- Lead Source, Status
- Custom Fields (Product Usage, Engagement Score)

*Accounts:*
- Account Name, Industry, Annual Revenue
- Created Date, Last Contact Date
- Number of Employees
- Custom Fields

**Pros:**
- ✅ Complete dataset for complex calculations
- ✅ Cross-module analysis (link Deals to Contacts)
- ✅ Historical data for trends
- ✅ Supports retention/activation scoring

**Cons:**
- ❌ Large data volumes
- ❌ Need relationship mapping between modules
- ❌ Higher storage requirements

---

### Phase 4: Integration Architecture

**4.1: Database Schema Extensions**

Add integration tracking tables:

```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  provider TEXT, -- 'zoho_desk', 'zoho_crm'
  access_token TEXT ENCRYPTED,
  refresh_token TEXT ENCRYPTED,
  token_expires_at TIMESTAMP,
  config JSONB, -- API domain, org ID, etc.
  status TEXT, -- 'active', 'expired', 'error'
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP
);

CREATE TABLE integration_sync_jobs (
  id UUID PRIMARY KEY,
  integration_id UUID REFERENCES integrations(id),
  sync_type TEXT, -- 'analytics', 'bulk_export', 'incremental'
  status TEXT, -- 'pending', 'running', 'completed', 'failed'
  records_synced INTEGER,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT
);
```

**4.2: Sync Strategy**

**Real-Time Sync (Webhooks):**
- Zoho supports webhooks for real-time updates
- Set up webhook endpoints for ticket/deal changes
- Instantly update signals when data changes
- Best for: High-priority signals requiring immediate updates

**Scheduled Sync (Polling):**
- Hourly: Analytics APIs for pre-built signals
- Daily: Bulk export for comprehensive raw data
- Weekly: Full refresh to catch any missed updates
- Best for: Historical trends, batch processing

**Incremental Sync:**
- Use `modifiedTime` filters to fetch only changed records
- Reduces API calls and processing time
- Best for: Large datasets with frequent updates

---

### Phase 5: Signal Mapping & Calculation

**5.1: Pre-Built Signal Mapping**

Create mapping configurations:

```typescript
const ZOHO_SIGNAL_MAPPINGS = {
  'zoho_desk': {
    'avg_resolution_time': {
      api_path: '/api/v1/reports/resolution-time',
      field: 'averageResolutionTime',
      signal_name: 'Average Resolution Time',
      unit: 'hours'
    },
    'ticket_volume': {
      api_path: '/api/v1/reports/ticket-volume',
      field: 'totalTickets',
      signal_name: 'Total Support Tickets',
      unit: 'count'
    }
  },
  'zoho_crm': {
    'pipeline_value': {
      coql: "SELECT SUM(Amount) FROM Deals WHERE Stage != 'Closed Lost'",
      signal_name: '$ Sales Pipeline',
      unit: 'currency'
    }
  }
}
```

**5.2: Custom Signal Calculation**

For signals requiring raw data:

```typescript
// Example: Calculate Bug Impact Score
async function calculateBugImpact(tickets: RawDataRow[]) {
  const bugs = tickets.filter(t => t.data.Category === 'Bug');
  
  const impact = bugs.map(bug => {
    let score = 0;
    if (bug.data.Priority === 'Critical') score += 10;
    if (bug.data.Priority === 'High') score += 7;
    if (bug.data.Sentiment === 'Negative') score += 3;
    if (bug.data.CustomerRevenue > 100000) score += 5;
    return score;
  }).reduce((a, b) => a + b, 0);
  
  return {
    signal_name: 'Bug Impact Score',
    value: impact,
    date: new Date().toISOString().split('T')[0]
  };
}
```

---

### Phase 6: Implementation Roadmap

**Week 1-2: Foundation**
- [ ] Set up Zoho OAuth flow
- [ ] Create integration tables in database
- [ ] Build token management service
- [ ] Test authentication with both Desk & CRM

**Week 3-4: Path A Implementation**
- [ ] Connect to Zoho Desk Analytics API
- [ ] Fetch pre-built signals (Resolution Time, Ticket Volume)
- [ ] Connect to Zoho CRM Analytics API
- [ ] Fetch pre-built signals (Pipeline Value, Conversion Rate)
- [ ] Map to internal signal schema
- [ ] Create sync scheduler (hourly)

**Week 5-6: Path B Implementation**
- [ ] Implement bulk export for Zoho Desk tickets
- [ ] Implement bulk export for Zoho CRM deals/contacts
- [ ] Process CSVs through dual-path storage
- [ ] Build custom signal calculators
- [ ] Test with 90 days of historical data

**Week 7-8: Polish & Optimization**
- [ ] Add incremental sync logic
- [ ] Implement webhook handlers for real-time updates
- [ ] Build sync monitoring dashboard
- [ ] Add error handling & retry logic
- [ ] Performance optimization for large datasets

---

## API Rate Limits & Considerations

**Zoho Desk:**
- Free: 2,000 API calls/day
- Standard: 5,000 API calls/day
- Professional: 10,000 API calls/day
- Enterprise: Custom limits

**Zoho CRM:**
- Free: 1,000 API calls/day
- Standard: 5,000 API calls/day
- Professional: 10,000 API calls/day
- Enterprise: 50,000+ API calls/day

**Best Practices:**
1. Use bulk APIs for large datasets (1 call vs. 1000s)
2. Implement exponential backoff for rate limit errors
3. Cache pre-built signals (update hourly, not every request)
4. Use webhooks to reduce polling frequency
5. Monitor API usage in integration dashboard

---

## Decision Matrix: When to Use Which Path

| Scenario | Path A (Analytics) | Path B (Raw Data) |
|----------|-------------------|-------------------|
| Standard KPIs (e.g., Avg Resolution Time) | ✅ Recommended | ❌ Overkill |
| Custom metrics (e.g., High-Value Customer Bug Impact) | ❌ Not possible | ✅ Required |
| Real-time updates needed | ✅ Fast | ⚠️ Batch processing delay |
| Cross-dataset analysis (CRM + Desk) | ❌ Separate APIs | ✅ Join raw data |
| Historical trend analysis | ✅ Good | ✅ Better (more control) |
| API rate limits are a concern | ✅ Fewer calls | ⚠️ More calls |
| Storage costs are a concern | ✅ Minimal | ⚠️ Higher |

---

## Recommended Hybrid Approach

**Use Both Paths:**

1. **Path A for standard signals** (80% of signals)
   - Average Resolution Time
   - Ticket Volume
   - Pipeline Value
   - Conversion Rate
   - Update frequency: Hourly

2. **Path B for custom signals** (20% of signals)
   - Bug Impact Score (requires customer revenue + sentiment)
   - Retention Score (requires activity tracking across modules)
   - Activation Score (requires product usage + engagement)
   - Update frequency: Daily

**Benefits:**
- ✅ Fast performance for standard metrics
- ✅ Flexibility for custom business logic
- ✅ Optimized API usage
- ✅ Rich data for AI-powered insights later

---

## Security Considerations

1. **Token Storage**: Encrypt access/refresh tokens at rest
2. **API Credentials**: Store Client ID/Secret in environment variables
3. **Data Privacy**: Respect customer data permissions from Zoho
4. **Audit Logging**: Log all API calls for compliance
5. **Rate Limiting**: Implement client-side rate limiting to avoid bans
6. **Error Handling**: Never expose Zoho API errors to end users

---

## Next Steps

1. Review this roadmap with stakeholders
2. Get Zoho API credentials from pilot customer
3. Set up sandbox environment for testing
4. Implement Phase 1 (Authentication) first
5. Test with pilot customer's real data
6. Iterate based on feedback

---

## Resources

- [Zoho Desk API Documentation](https://desk.zoho.com/support/APIDocument.do)
- [Zoho CRM API Documentation](https://www.zoho.com/crm/developer/docs/api/v2/)
- [Zoho OAuth Documentation](https://www.zoho.com/accounts/protocol/oauth.html)
- [Zoho COQL Guide](https://www.zoho.com/crm/developer/docs/api/v2/COQL.html)
