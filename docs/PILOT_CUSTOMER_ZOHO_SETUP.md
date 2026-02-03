# Pilot Customer - Zoho Data Setup Guide

## Overview
This guide explains how to extract the necessary data from Zoho CRM and Zoho Desk to generate the 6 key signals for your pilot customer.

## Quick Reference Table

| Signal | Data Source | Export Frequency | Critical Fields |
|--------|-------------|------------------|-----------------|
| $ Sales Pipeline | Zoho CRM - Deals | Weekly | Amount, Stage, Close Date |
| % Sales Conversion | Zoho CRM - Deals | Weekly | Stage, Created Time, Closed Date |
| No. of Bugs | Zoho Desk - Tickets | Daily | Ticket Number, Type, Status |
| Bug Impact | Zoho Desk - Tickets | Daily | Priority, Severity, Resolution Time |
| Retention Score | Zoho CRM - Accounts | Weekly | Last Activity Time, Account Status |
| Activation Score | Zoho CRM - Contacts | Weekly | Custom onboarding fields |

---

## Signal 1: $ Sales Pipeline

**What it measures:** Total dollar value of all open deals in your sales pipeline

**Data Source:** Zoho CRM - Deals Module

**How to Export:**
1. Go to Zoho CRM → Deals
2. Click the **More (⋮)** icon → **Export**
3. Select these fields:
   - Deal Name
   - Amount
   - Stage
   - Probability
   - Expected Close Date
   - Deal Owner
4. Export as CSV

**Field Mapping:**
- `Amount` → Maps to "value" in signal system
- `Stage` → Maps to "status" in signal system
- `Expected Close Date` → Maps to "date" in signal system

**Calculation:**
```
Pipeline Value = SUM(Amount WHERE Stage NOT IN ['Closed Won', 'Closed Lost'])
```

---

## Signal 2: % Sales Conversion

**What it measures:** Percentage of deals that convert to won deals

**Data Source:** Zoho CRM - Deals Module

**How to Export:**
1. Go to Zoho CRM → Deals
2. Click the **More (⋮)** icon → **Export**
3. Select these fields:
   - Deal Name
   - Amount
   - Stage
   - Created Time
   - Closing Date
   - Deal Owner
4. Filter by date range (e.g., last 90 days)
5. Export as CSV

**Field Mapping:**
- `Stage` → Maps to "status" in signal system
- `Created Time` → Maps to "created_date" in signal system
- `Closing Date` → Maps to "closed_date" in signal system

**Calculation:**
```
Conversion Rate = (COUNT(Stage = 'Closed Won') / COUNT(All Deals)) * 100
```

---

## Signal 3: No. of Bugs

**What it measures:** Total number of bug tickets reported

**Data Source:** Zoho Desk - Tickets Module

**How to Export:**
1. Go to Zoho Desk → Tickets
2. Apply filter: Type = "Bug" OR Category = "Bug"
3. Click **Export** → **Export Tickets**
4. Select these fields:
   - Ticket Number
   - Subject
   - Type
   - Category
   - Status
   - Priority
   - Created Time
   - Department
5. Export as CSV

**Field Mapping:**
- `Ticket Number` → Maps to "unique_id" in signal system
- `Type` or `Category` → Maps to "category" in signal system
- `Created Time` → Maps to "created_date" in signal system
- `Status` → Maps to "status" in signal system

**Calculation:**
```
Bug Count = COUNT(tickets WHERE Type = 'Bug' OR Category = 'Bug' OR Subject CONTAINS 'bug')
```

**Note:** You may need to create a custom field called "Type" if not already configured in Zoho Desk.

---

## Signal 4: Bug Impact

**What it measures:** Weighted impact of bugs based on severity and customer importance

**Data Source:** Zoho Desk - Tickets Module

**How to Export:**
1. Go to Zoho Desk → Tickets
2. Apply filter: Type = "Bug"
3. Click **Export** → **Export Tickets**
4. Select these fields:
   - Ticket Number
   - Priority (Critical/High/Medium/Low)
   - Severity (if custom field exists)
   - Status
   - Created Time
   - Closed Time
   - Account Name
   - Customer Tier (if custom field exists)
5. Export as CSV

**Field Mapping:**
- `Priority` → Maps to "priority" in signal system
- `Severity` → Maps to "severity" in signal system (if available)
- `Account Name` → Maps to "customer_name" in signal system
- `Closed Time` → Maps to "closed_date" in signal system

**Calculation:**
```
Bug Impact Score = 
  (Critical Bugs × 10) + 
  (High Priority Bugs × 5) + 
  (Medium Priority Bugs × 2) + 
  (Low Priority Bugs × 1)
```

**Advanced:** Weight by customer tier if available:
- Enterprise customers: multiply by 2x
- Mid-market: multiply by 1.5x
- SMB: multiply by 1x

---

## Signal 5: Retention Score

**What it measures:** Risk score based on customer engagement and activity

**Data Source:** Zoho CRM - Accounts Module

**How to Export:**
1. Go to Zoho CRM → Accounts
2. Click the **More (⋮)** icon → **Export**
3. Select these fields:
   - Account Name
   - Last Activity Time
   - Modified Time
   - Account Status
   - Contract End Date (if available)
   - Annual Revenue
   - Account Owner
4. Export as CSV

**Field Mapping:**
- `Last Activity Time` → Maps to "last_activity_date" in signal system
- `Account Status` → Maps to "status" in signal system
- `Contract End Date` → Maps to "contract_end_date" in signal system

**Calculation:**
```
Days Since Last Activity = TODAY - Last Activity Time

Retention Status:
- Active: < 30 days
- At Risk: 30-90 days
- Churned: > 90 days

Retention Score = 100 - (Days Since Last Activity / 3.65)
```

**Important Setup:**
Zoho's "Last Activity Time" can update on any field change. For accurate retention tracking:
1. Create a custom Date/Time field: "Last Real Activity"
2. Set up a workflow that updates this field only when:
   - A task is completed
   - A call is logged
   - A meeting occurs
   - An email is sent

**Workflow Example:**
```
Trigger: On Task Complete, Call Logged, or Meeting Scheduled
Action: Update Custom Field "Last Real Activity" = Current Date/Time
```

---

## Signal 6: Activation Score

**What it measures:** How well new customers are completing onboarding

**Data Source:** Zoho CRM - Contacts or Leads Module + Zoho Apptics (optional)

**How to Export:**
1. Go to Zoho CRM → Contacts
2. Click the **More (⋮)** icon → **Export**
3. Select these fields:
   - Contact Name
   - Account Name
   - Created Time
   - Email
   - Onboarding Status (custom field)
   - First Login Date (custom field)
   - Key Actions Completed (custom field)
   - Product Usage Score (from Apptics integration)
4. Filter to customers created in last 90 days
5. Export as CSV

**Required Custom Fields:**
You'll need to create these in Zoho CRM:
- `First Login Date` (Date/Time)
- `Onboarding Status` (Picklist: Not Started, In Progress, Completed)
- `Profile Completed` (Checkbox)
- `First Action Date` (Date/Time)
- `Key Features Used` (Number)

**Field Mapping:**
- `Created Time` → Maps to "signup_date" in signal system
- `First Login Date` → Maps to "first_login_date" in signal system
- `Onboarding Status` → Maps to "onboarding_status" in signal system

**Calculation:**
```
Activation Milestones:
1. First Login (25 points)
2. Profile Completed (25 points)
3. First Key Action (25 points)
4. Used 3+ features (25 points)

Activation Score = (Completed Milestones / Total Milestones) * 100
```

**Advanced Setup with Zoho Apptics:**
For product usage tracking:
1. Integrate Zoho Apptics with your product
2. Connect Apptics to Zoho CRM
3. Create custom fields to sync:
   - Login frequency
   - Feature adoption rate
   - Session duration
   - Drop-off points

---

## Export Checklist

Before exporting data for each signal, ensure:

- [ ] Date range is set correctly (usually last 90 days)
- [ ] All required fields are selected
- [ ] Custom fields are created if needed
- [ ] Filters are applied appropriately
- [ ] Export format is CSV
- [ ] Field names match Zoho's exact naming

---

## Upload to Signal System

Once you have the CSV files:

1. Go to `/admin/organisations/[your-org-id]/upload`
2. Select "Support Tickets (Zoho Desk)" for ticket data
3. Select "General Data" for CRM exports
4. The system will automatically:
   - Detect available columns
   - Suggest signal mappings
   - Show which signals can be generated
5. Review the intelligent mapping suggestions
6. Confirm and import

---

## Automation Recommendations

For continuous signal monitoring, consider:

1. **Zoho CRM → Zoho Analytics Integration**
   - Set up scheduled exports
   - Create custom reports for each signal
   - Use Zoho Flow to automate CSV generation

2. **API Integration** (Future)
   - Use Zoho CRM API to pull data programmatically
   - Use Zoho Desk API for real-time ticket sync
   - Schedule daily/weekly sync jobs

3. **Webhook Setup** (Advanced)
   - Configure webhooks in Zoho for real-time updates
   - Push critical events directly to signal system
   - Instant signal updates for high-priority items

---

## Troubleshooting

**Issue:** "Last Activity Time" not accurate
- **Solution:** Create custom "Last Real Activity" field with workflow

**Issue:** No "Type" field in Zoho Desk
- **Solution:** Create custom picklist field or use "Category" field

**Issue:** Missing customer tier information
- **Solution:** Create custom field in Zoho CRM: Account Tier (Enterprise/Mid-Market/SMB)

**Issue:** Activation data not available
- **Solution:** Set up custom onboarding fields or integrate Zoho Apptics

**Issue:** CSV export missing columns
- **Solution:** Check field permissions and ensure fields are not hidden

---

## Next Steps

1. Review the CSV file attached to understand exact field mappings
2. Export first dataset from Zoho CRM (Deals)
3. Upload to signal system and test mapping
4. Iterate on remaining 5 signals
5. Set up weekly export schedule
6. Consider API integration for automation

Need help? Check the intelligent mapping guide in the signal system for step-by-step column mapping assistance.
