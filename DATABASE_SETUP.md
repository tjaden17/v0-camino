# Camino Database Setup Guide

## Quick Setup (5 minutes)

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Setup Script

1. Open the file: `scripts/00_SETUP_DATABASE.sql`
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 3: Verify Setup

After running the script, you should see:
- ✅ 10 tables created
- ✅ Row Level Security enabled
- ✅ Indexes created

To verify, go to **Database > Tables** in Supabase and you should see:
- profiles
- signals
- signal_data_points
- kpi_ownership
- decisions
- decision_signals
- benchmarks
- upload_history
- integrations
- sync_history

### Step 4: Disable Email Confirmation (Development Only)

For testing/development, disable email confirmation:

1. Go to **Authentication > Providers** in Supabase
2. Find **Email** provider
3. Toggle **Confirm email** to OFF
4. Save changes

This allows you to sign up and log in immediately without waiting for confirmation emails.

## What Each Table Does

| Table | Purpose |
|-------|---------|
| **profiles** | User profile information (name, organization, role) |
| **signals** | Business metrics being tracked |
| **signal_data_points** | Historical data points for each signal |
| **kpi_ownership** | Which KPIs each user owns |
| **decisions** | Decisions users are tracking |
| **decision_signals** | Links signals to decisions |
| **benchmarks** | Industry benchmarks for metrics |
| **upload_history** | Track of CSV file uploads |
| **integrations** | OAuth connections to Zoho, HubSpot |
| **sync_history** | History of data syncs from integrations |

## Security

All tables have Row Level Security (RLS) enabled, which means:
- Users can only see their own data
- No cross-user data leakage
- Secure by default

## Troubleshooting

### "relation already exists"
If you see this error, the table is already created. You can safely ignore it or drop the table first.

### "permission denied"
Make sure you're using the Supabase SQL Editor as an authenticated project owner.

### Need to reset everything?
Run this to drop all tables (⚠️ WARNING: deletes all data):

\`\`\`sql
DROP TABLE IF EXISTS sync_history CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS upload_history CASCADE;
DROP TABLE IF EXISTS benchmarks CASCADE;
DROP TABLE IF EXISTS decision_signals CASCADE;
DROP TABLE IF EXISTS decisions CASCADE;
DROP TABLE IF EXISTS kpi_ownership CASCADE;
DROP TABLE IF EXISTS signal_data_points CASCADE;
DROP TABLE IF EXISTS signals CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
\`\`\`

Then run the setup script again.

## Next Steps

After setup:
1. Create an account at `/auth/signup`
2. Create the admin account: `admin@admin.com` / `password`
3. Start uploading data or connecting integrations!
