# AI Expert Panel Consultation: Lead Magnet Restrictions & Edge Cases

**Question:** Would a lead magnet need restrictions to work reliably? What types of data, tools, or data shapes? How would it handle data uploads that are unfamiliar?

**Panel Members:** Jordan (Data Engineer), Alex (BI Analyst), Sam (Management Consultant), UX Designer

**Date:** Feb 16, 2026

---

## Jordan (Data Engineer) - Technical Boundaries

The short answer: **Yes, you need restrictions. But they should be invisible to 80% of users.**

### What Data Shapes Can We Handle Today?

**Already Supported (Zero Changes Needed):**
- CSV or XLSX files with a header row + data rows
- Any delimiter (comma, semicolon, tab, pipe) - auto-detected
- Quoted fields with delimiters inside
- Common CRM exports: Zoho, HubSpot, Salesforce, Pipedrive
- Common support tool exports: Zoho Desk, Zendesk, Freshdesk
- 3 row types: Deals, Leads, Tickets

**Column Names We Can Auto-Map:**
Looking at the `FIELD_ALIASES` dictionary, we already handle:
- 300+ column name variations
- Currency codes (AUD, USD, EUR, GBP, CAD, etc.)
- Date formats (ISO, US, AU, UK)
- Number formats (commas, decimals, K/M/B suffixes, percentages)

**Example:** If someone uploads a HubSpot deals CSV with columns `dealstage`, `amount`, `closedate`, `hubspot_owner`, the system auto-maps these to our universal schema and calculates signals.

### What Would Break Today?

**Hard Failures (can't calculate anything):**

1. **No header row.** If the file starts with data instead of column names, the parser fails. But this is extremely rare in 2026 - every export tool adds headers.

2. **Non-tabular data.** If someone uploads a JSON file, an XML file, or a PDF, it won't parse. This is a clear upfront restriction.

3. **Empty files.** No rows = no signals. We show a clear error.

**Soft Failures (some signals work, some don't):**

4. **Unknown row type.** If someone uploads "contracts" data instead of deals/leads/tickets, the 3-question flow asks "what does each row represent?" but we don't have pre-built signals for contracts. The user would need to manually describe the signals they want, which breaks the self-service flow.

5. **Missing critical columns.** If a deals file has no Amount column and no Stage column, we can't calculate Pipeline Value or Win Rate. We'd calculate what we can (e.g., total deal count, deals per owner) but the high-value signals would be missing.

6. **Corrupted data.** If 80% of rows have blank Amount fields, Win Rate might be calculable but Pipeline Value would be meaningless.

### The Restrictions I'd Enforce

**Upfront (before upload):**
- **File format:** CSV or XLSX only
- **File size:** Max 10MB (about 100K rows, way more than any SMB needs)
- **Row types:** Choose from: Deals/Opportunities, Leads/Prospects, Tickets/Cases

**During upload (soft validation):**
- **Minimum row count:** At least 5 data rows (excluding headers). If fewer, show: "This file looks too small to generate insights. Most businesses need at least 5-10 records."
- **Required columns:** Depends on row type:
  - Deals: Need Amount OR Stage OR Date. If none exist, show: "We couldn't find key deal columns like Amount, Stage, or Closing Date. Try exporting from your CRM's Deals section."
  - Leads: Need Status OR Date. If neither, show: "We couldn't find key lead columns. Try exporting from your CRM's Leads section."
  - Tickets: Need Status OR Created Date. If neither, show similar message.

**After calculation (quality checks):**
- **Confidence thresholds:** (Alex will detail these below)
- Don't show Win Rate if there are fewer than 10 closed deals
- Don't show Lead Conversion if there are fewer than 20 leads
- Don't show Avg Resolution Time if there are fewer than 10 closed tickets

### How to Handle Unfamiliar Data

**The 3-Question Flow Already Handles This:**

1. "What does each row represent?" → If they choose "deals" but upload a contracts file, it still works. The system treats contracts as deals.

2. "Which column is the main metric?" → If the Amount column is called "Contract Value" or "Annual Recurring Revenue", it appears in the dropdown because we detect numeric columns.

3. "Which column is the date?" → Same for date detection.

**What happens when columns don't auto-map?**

Example: A custom spreadsheet with columns: "Client", "Revenue", "Signed Date", "Deal Status"

- "Client" → doesn't match any alias, but it's text, so it's offered for grouping
- "Revenue" → matches `deal_value` alias (already in the dictionary)
- "Signed Date" → matches `close_date` alias
- "Deal Status" → matches `stage` alias

**All 7 signals would calculate successfully without any manual mapping.**

Now a harder example: A spreadsheet with columns: "Customer Name", "$ Booked", "When Closed", "Outcome"

- "Customer Name" → text, offered for grouping
- "$ Booked" → contains "$" and is numeric, auto-detected as amount
- "When Closed" → contains "Closed" and has dates, auto-detected as close_date
- "Outcome" → doesn't match stage aliases, but if it contains values like "Won" or "Lost", the Win Rate calculation will still find those keywords

**Still works. Maybe 90% reliability instead of 95%, but enough for a lead magnet.**

### The One Edge Case That Would Break

**Multi-table uploads.** If someone tries to upload 3 separate CSVs (deals + accounts + contacts) expecting them to be joined, that doesn't work in the current architecture. The 3-question flow is per-file. Each file is independent.

**Solution for MSS:** Don't allow multi-file uploads in the lead magnet. Restrict to one file at a time. "Upload your Deals file OR your Tickets file."

**Solution for Scale (month 3-4):** Add a "multi-source analysis" feature where admin can upload multiple files per org and we correlate them. Not needed for lead magnet.

---

## Alex (BI Analyst) - Data Quality & Confidence Thresholds

Jordan's right that we can handle most data shapes. But handling data technically is different from producing reliable numbers.

### Confidence Levels I'd Enforce

Every signal should have a `confidence` score: `high`, `medium`, `low`, or `insufficient`.

**High Confidence (show prominently):**
- Sample size ≥ 30 data points
- Data coverage ≥ 90% (e.g., 90% of deals have an Amount value)
- Time span ≥ 2 months (for trend signals)
- Clear data quality (no mixed formats, no parsing errors)

**Medium Confidence (show with a flag):**
- Sample size 10-29 data points
- Data coverage 70-89%
- Time span 1-2 months
- Minor data quality issues (e.g., 10% of dates are ambiguous)
- **Label:** "Limited data. This metric may be less reliable."

**Low Confidence (show with warning):**
- Sample size 5-9 data points
- Data coverage 50-69%
- Time span < 1 month
- Major data quality issues
- **Label:** "Very limited data. Consider this a directional estimate only."

**Insufficient (don't show):**
- Sample size < 5 data points
- Data coverage < 50%
- **Show instead:** "Not enough data to calculate [Signal Name]. Upload more records or try a different data export."

### Examples with Real Numbers

Using Locumate's data:

| Signal | Data Points | Coverage | Time Span | Confidence |
|--------|-------------|----------|-----------|------------|
| Pipeline Value | 23 open deals | 97% have Amount | 18 months | **High** |
| Win Rate | 12 closed deals | 100% have Stage | 18 months | **High** |
| Avg Sales Cycle | 11 closed won deals | 100% have duration | 18 months | **Medium** (small sample) |
| Leads per Month | 67 leads | 100% have Created Time | 15 months | **High** |
| Lead Conversion | 10 converted of 67 | 100% have Is Converted | 15 months | **High** |
| Ticket Volume | ~4,079 real tickets | 100% have Created Time | Unknown span | **High** (assuming >2 months) |
| Avg Resolution Time | ~4,079 tickets | 85% have Resolution Time | Unknown span | **High** |

All 7 signals would show as high or medium confidence. This is a good data set for a lead magnet.

### What About Bad Data?

**Scenario 1: Someone uploads 3 deals.**
- Show: "You've uploaded 3 deals. We need at least 10 closed deals to calculate Win Rate, and at least 5 open deals to show Pipeline Value. Upload a larger export to see your signals."
- Still calculate: Total deal count (3), but with a message: "This is a very small data set. Most useful insights require at least 20-30 deals."

**Scenario 2: Someone uploads 100 deals but 70% have blank Amount fields.**
- Pipeline Value: Don't show (coverage too low)
- Win Rate: Show (doesn't depend on Amount)
- Avg Deal Size: Don't show (coverage too low)
- Deals by Owner: Show (doesn't depend on Amount)
- **Message:** "30% of your deals are missing Amount values, which limits some calculations. Check your CRM export settings to include all fields."

**Scenario 3: Someone uploads leads from 2 weeks ago.**
- Lead Volume: Show (7 in 2 weeks = ~14/month)
- Lead Conversion: Don't show (not enough time has passed for leads to convert)
- **Message:** "Your data only covers 2 weeks. Upload at least 2-3 months of lead data to see conversion metrics."

### The Rule

**Never show a number you can't defend.** If a CEO asks "how did you calculate this?" and you can't give a clear, confident answer backed by sufficient data, don't show it.

---

## Sam (Management Consultant) - Business Constraints

Jordan and Alex are right about the technical and statistical boundaries. But there's a third constraint: **business fit.**

### Not All Data Types Are Equal for a Lead Magnet

**High-Value Row Types (show these in the lead magnet):**
1. **Deals/Opportunities** - Every B2B SaaS CEO cares about pipeline and win rate. This is the highest-value upload for a lead magnet.
2. **Leads/Prospects** - Slightly less valuable, but still relevant for head of sales or marketing.
3. **Tickets/Support Cases** - High value for customer success managers, less so for CEOs.

**Medium-Value Row Types (add later, not MSS):**
4. **Customers/Accounts** - Useful for retention/churn analysis, but requires more complex calculations (lifetime value, churn cohorts).
5. **Activities (calls, meetings, emails)** - Interesting for sales ops, but not executive-level.

**Low-Value Row Types (don't support):**
6. **Invoices** - Finance data, not executive insights.
7. **Inventory** - Only relevant for e-commerce, not B2B SaaS.
8. **Custom objects** - Too niche.

### The Restriction I'd Enforce

**For the lead magnet, support exactly 3 row types:**
- Deals (for sales-focused prospects)
- Leads (for marketing-focused prospects)
- Tickets (for CS-focused prospects)

**Why restrict?** Because each additional row type adds:
- New signal definitions
- New edge cases
- New failure modes
- Diluted positioning

The value prop of the lead magnet is: "Upload your deals or tickets, see your key metrics in 60 seconds." If you support 10 row types, you become "upload anything and maybe we'll find something useful" which is less compelling.

### The Exception

**If 20% of prospects ask for a specific row type** (e.g., "Can I upload my customer list?"), add it. But don't preemptively support everything.

---

## UX Designer - How to Communicate Restrictions Without Killing Conversion

The worst thing you can do is surprise the user with a restriction after they've uploaded their file. Here's how to frame restrictions as guidance, not barriers.

### At the Landing Page (Before Upload)

**Don't say:** "Supported file types: CSV, XLSX. Max 10MB. Deals, Leads, or Tickets only."

**Do say:**
> **Get instant insights from your CRM data**
> Upload your Deals, Leads, or Tickets export from Zoho, HubSpot, Salesforce, or any CRM. We'll analyze your data and show you key metrics in 60 seconds.
>
> [Button: Upload Your Data]
>
> _(Supports CSV and Excel files up to 10MB)_

**Frame it as capability, not restriction.** "We support deals, leads, and tickets" sounds positive. "CSV only, max 10MB" sounds limiting.

### At the Upload Screen

**Show a dropdown first:**
```
What data are you uploading?
○ Deals / Opportunities (Win rate, pipeline value, sales cycle)
○ Leads / Prospects (Lead volume, conversion rate)
○ Support Tickets (Resolution time, ticket volume, SLA compliance)
```

This primes the user for which file to upload. If they're a sales leader, they'll choose "Deals" and go export their Zoho deals.

**Then show the file picker:**
```
[Drop your CSV or Excel file here, or click to browse]

Need help? → "How to export from Zoho CRM" | "How to export from HubSpot"
```

### During Processing (If Edge Cases Occur)

**Scenario: File is too small (3 rows)**

Don't say: ❌ "Error: Minimum 5 rows required"

Do say:
> **Hmm, this file only has 3 deals.**
> 
> Most useful insights require at least 10-20 records. Try exporting a larger date range from your CRM.
> 
> [Try Another File]

**Scenario: Missing key columns (no Amount, no Stage)**

Don't say: ❌ "Error: Required columns not found"

Do say:
> **We couldn't find key deal columns like Amount or Stage.**
> 
> Make sure you're exporting from your CRM's Deals or Opportunities section, not Accounts or Contacts. Most CRMs have an "Export Deals" option.
> 
> [Try Another File] | [View Sample File]

**Scenario: Unfamiliar column names**

If the 3-question flow runs and doesn't auto-map any columns:

> **We need a bit more info about your data.**
> 
> [Show the 3-question flow]

This makes it feel like a clarification, not a failure.

### After Calculation (If Low Confidence)

If a signal has medium or low confidence, show it but with context:

```
Win Rate: 75% ⚠️

Calculated from 8 closed deals. For more reliable insights, we recommend at least 20 closed deals. Try exporting a longer date range.
```

This says "we gave you a number, but you'd get better value if you gave us more data" which is a retention hook.

---

## Summary: The Restrictions for Lead Magnet

### Hard Restrictions (Enforced Upfront)

1. **File format:** CSV or XLSX only
2. **File size:** Max 10MB (~100K rows)
3. **Row types:** Deals, Leads, or Tickets only (user chooses before upload)
4. **Minimum rows:** At least 5 data rows (excluding headers)

### Soft Restrictions (Graceful Degradation)

5. **Column requirements:** File must have at least one of: numeric column, date column, or status column. If completely missing, show a helpful error.
6. **Data quality:** If coverage < 70% on critical columns, warn the user but still show what we can calculate.
7. **Sample size:** If < 10 data points for a ratio/rate signal, don't show that signal but show alternatives.

### No Restrictions (Handled Automatically)

- Column names (300+ aliases cover most CRMs)
- Currency codes (AUD, USD, EUR, etc. auto-detected)
- Date formats (ISO, US, AU, UK auto-detected)
- Number formats (commas, decimals, K/M/B suffixes)
- Delimiters (comma, semicolon, tab auto-detected)

### What This Means Practically

**80% of users:** Upload a Zoho/HubSpot/Salesforce export → All 7 signals calculate → High confidence → Perfect lead magnet experience.

**15% of users:** Upload a custom spreadsheet or small data set → 4-5 signals calculate → Medium confidence → Still valuable, with prompts to upload more data.

**5% of users:** Upload something broken (wrong file type, wrong row type, empty file) → Clear error message with guidance → Conversion loss, but unavoidable.

**The goal:** Never surprise the user. Every restriction should be communicated before or during upload, never after they've invested time.

---

## Recommendation

**Jordan (Data Engineer):** Build the confidence scoring system during Week 1 of MSS. It's a half-day of work and protects the lead magnet from showing bad numbers.

**Alex (BI Analyst):** Test the lead magnet with 5 different data sets: perfect Zoho export, messy custom spreadsheet, tiny file (5 rows), missing Amount column, and missing dates. Make sure all 5 degrade gracefully.

**Sam (Management Consultant):** Stick to 3 row types (deals, leads, tickets) for the lead magnet. Don't add more until you have data showing demand.

**UX Designer:** Write the error messages and warnings now, before you build the lead magnet. Every edge case should have a helpful, non-technical explanation ready.

---

**Bottom line:** The lead magnet doesn't need many restrictions. The FIELD_ALIASES dictionary and CSV parser already handle 90% of edge cases. The 3-question flow handles another 5%. The remaining 5% are genuine failures (wrong file type, empty file, completely unfamiliar structure) which should fail fast with helpful guidance.
