# Dual-Path Storage System - User Guide

## What is Dual-Path Storage?

When you upload data (like Zoho Desk tickets or CRM data), the system uses a **dual-path approach** to give you both **immediate value** and **future flexibility**:

### Path 1: Immediate Signals ⚡
- **What happens:** System generates signals from your mapped columns right away
- **Benefit:** You see insights instantly - no waiting for processing
- **Example:** Upload 1000 Zoho tickets → Get 10 support KPIs immediately

### Path 2: Raw Data Preservation 💾
- **What happens:** ALL original columns are preserved in the database
- **Benefit:** Future AI analysis can discover insights you didn't initially map
- **Example:** Later ask "What's the correlation between ticket priority and customer revenue?" even if you didn't map those initially

---

## How It Works

```
Your CSV Upload
   ↓
┌──────────────────────────────────────────────┐
│  DUAL-PATH PROCESSING                        │
├──────────────────────────────────────────────┤
│                                              │
│  PATH 1: Mapped Columns → Immediate Signals │
│  ✓ You map: Ticket #, Status, Dates         │
│  ✓ System generates: Volume, Avg Time, etc  │
│  ✓ Available instantly in dashboard          │
│                                              │
│  PATH 2: All Columns → Raw Storage          │
│  ✓ Preserves: Priority, Category, Revenue   │
│  ✓ Preserves: Assignee, Department, etc     │
│  ✓ Available for future AI queries          │
│                                              │
└──────────────────────────────────────────────┘
```

---

## Real-World Example: Zoho Desk Upload

### Your CSV Has These Columns:
```
Ticket Number, Subject, Status, Priority, Created Date, 
Closed Date, Assignee, Department, Customer Name, 
Customer Revenue, CSAT Rating, Resolution Notes
```

### You Map (Path 1):
```
✓ Ticket Number → unique_id
✓ Status → status
✓ Created Date → created_at
✓ Closed Date → closed_at
```

### System Immediately Generates:
```
✓ Total Ticket Volume
✓ Open Tickets
✓ Average Resolution Time
✓ Ticket Backlog (7+ days)
```

### System Also Preserves (Path 2):
```
✓ Priority (not mapped, but preserved)
✓ Customer Revenue (not mapped, but preserved)
✓ Department (not mapped, but preserved)
✓ CSAT Rating (not mapped, but preserved)
✓ Resolution Notes (not mapped, but preserved)
```

### Future AI Queries (Enabled by Path 2):
```
"Show me high-priority tickets from high-revenue customers"
"What's the average resolution time by department?"
"Correlate CSAT ratings with resolution time"
"Which assignees handle the most urgent tickets?"
```

**All of this is possible because the original data was preserved!**

---

## Benefits

### For You Today:
- ⚡ **Instant gratification**: See signals immediately
- 🎯 **Focused insights**: Only track what you care about now
- 📊 **Clean dashboard**: No clutter from unmapped columns

### For You Tomorrow:
- 🔮 **Future flexibility**: Add new signals without re-uploading
- 🤖 **AI-powered analysis**: Ask questions across all your data
- 🔗 **Cross-dataset insights**: Correlate data from multiple sources
- 💰 **Cost-effective**: No need to store and manage multiple versions

---

## How to Use It

### Step 1: Upload Your Data
```
1. Click "Upload Data" in your organization admin
2. Select your CSV file (Zoho Desk, CRM, etc.)
3. System parses and shows preview
```

### Step 2: Map Key Columns
```
1. Signal Discovery shows available signals
2. Map the columns you need NOW:
   - Ticket ID → unique_id
   - Status → status
   - Created Date → created_at
3. Skip columns you don't need yet
```

### Step 3: Confirmation
```
✓ Signals Created: 10
✓ Data Points Added: 1,000
✓ Raw Rows Stored: 1,000
✓ Columns Preserved: 12
```

**All 12 original columns are now stored for future use!**

---

## Database Structure

### Immediate Signals (Path 1)
```sql
signals table:
- id
- name: "Total Tickets"
- value: 1000
- trend: "increasing"
- source_upload_id: [links to upload]

data_points table:
- signal_id
- value: 450
- date: "2025-01-15"
```

### Raw Data Storage (Path 2)
```sql
raw_data_uploads table:
- id
- upload_name: "Zoho Desk Tickets Jan 2025"
- total_rows: 1000
- column_names: ["Ticket Number", "Status", ...]
- column_mappings: {"Ticket Number": "unique_id"}
- signals_created: 10

raw_data_rows table:
- upload_id
- row_index: 0
- original_data: { COMPLETE original row with ALL columns }
- normalized_data: { only mapped columns }
- generated_signal_ids: ["signal-1", "signal-2"]
```

---

## FAQ

**Q: Does this double my storage costs?**
A: No significant increase. JSONB storage is highly compressed. A 1000-row CSV with 12 columns is only ~1-2MB.

**Q: Can I query the raw data myself?**
A: Yes! Use the admin panel to view original uploads and download raw data anytime.

**Q: What if I want to map more columns later?**
A: Easy! Just go to your upload history, select the upload, and add new signal mappings. No need to re-upload.

**Q: Does AI analysis cost extra?**
A: AI analysis only runs when you explicitly request it (future feature). Most insights use deterministic logic (free).

**Q: Can I delete raw data if I don't need it?**
A: Yes, you can delete uploads from the admin panel. Signals remain unless you delete them too.

---

## Best Practices

### ✅ Do This:
- Map only the columns you need NOW
- Use descriptive upload names ("Q1 Support Tickets", "Jan CRM Deals")
- Upload regularly to build historical trends
- Keep raw uploads for at least 90 days

### ❌ Avoid This:
- Don't try to map every single column (unnecessary work)
- Don't delete uploads immediately after creating signals
- Don't worry about "missing" columns - they're preserved!

---

## Technical Details

### Storage Overhead:
- **Signals + Data Points**: 100KB per 1000 rows (normalized)
- **Raw Data Storage**: 1-2MB per 1000 rows (complete)
- **Total**: ~2MB for 1000 rows with full preservation

### Query Performance:
- Signal queries: <50ms (indexed, optimized)
- Raw data queries: 100-500ms (JSONB indexed)
- AI analysis: 2-5 seconds (when requested)

### Data Retention:
- Signals: Permanent (until manually deleted)
- Raw uploads: Permanent (until manually deleted)
- Policy: You control all data retention

---

## Next Steps

1. **Upload your first dataset** with dual-path storage enabled
2. **Generate immediate signals** from key columns
3. **Explore your dashboard** with new insights
4. **Come back later** to add new signal mappings from preserved data

**Remember: Every column you upload is preserved for future analysis!**
