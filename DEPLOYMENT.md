# Camino Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Supabase project created
- [ ] All environment variables set in v0
- [ ] Database migrations completed
- [ ] Test user account created

### 2. Database Setup

Run these SQL scripts in order in your Supabase SQL Editor:

\`\`\`sql
-- 1. Create profiles table
-- Copy content from scripts/001_create_profiles.sql

-- 2. Create signals tables
-- Copy content from scripts/002_create_signals.sql

-- 3. Create KPIs and decisions tables
-- Copy content from scripts/003_create_kpis_and_decisions.sql

-- 4. Create benchmarks and data foundations
-- Copy content from scripts/004_data_foundations_and_benchmarks.sql
\`\`\`

### 3. Verify RLS Policies

Test that users can only see their organization's data:

\`\`\`sql
-- Test as different users
SELECT * FROM signals; -- Should only show own org
SELECT * FROM profiles; -- Should only show own org
\`\`\`

## Deployment Steps

### Option 1: Deploy from v0 (Recommended)

1. Click "Publish" button in v0 chat
2. Vercel automatically:
   - Creates new project
   - Imports environment variables
   - Deploys to production URL
   - Configures SSL
3. Takes ~2 minutes total

### Option 2: Deploy via GitHub

1. **Export code from v0**
   \`\`\`bash
   # Download ZIP from v0
   # Extract to local folder
   \`\`\`

2. **Initialize Git**
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial Camino deployment"
   \`\`\`

3. **Push to GitHub**
   \`\`\`bash
   git remote add origin https://github.com/YOUR_USERNAME/camino.git
   git push -u origin main
   \`\`\`

4. **Deploy on Vercel**
   - Go to vercel.com
   - Click "New Project"
   - Import from GitHub
   - Add environment variables manually:
     \`\`\`
     NEXT_PUBLIC_SUPABASE_URL=your_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_key
     \`\`\`
   - Click Deploy

## Post-Deployment

### 1. Test Core Flows

**Authentication**
- [ ] Sign up new user
- [ ] Receive verification email
- [ ] Verify email and login
- [ ] Logout and login again
- [ ] Test password reset

**Data Upload**
- [ ] Navigate to /upload
- [ ] Upload sample CSV
- [ ] Map columns correctly
- [ ] Verify preview shows data
- [ ] Import and check signals appear

**Signals**
- [ ] View signals dashboard
- [ ] Filter by category
- [ ] Search for signal
- [ ] Click into signal detail
- [ ] Verify chart shows historical data

**Decisions**
- [ ] Create new decision
- [ ] Tag signals to decision
- [ ] Mark as decided
- [ ] Mark as implemented
- [ ] Review before/after comparison

**Mission**
- [ ] View personal mission
- [ ] See owned KPIs
- [ ] Check upcoming decisions
- [ ] Visit team directory

### 2. Configure Custom Domain

1. **Buy Domain**
   - Namecheap, Google Domains, etc.
   - Cost: ~$12/year

2. **Add to Vercel**
   - Project Settings → Domains
   - Add domain (e.g., app.camino.com)
   - Copy DNS records

3. **Update DNS**
   - Add A record: `76.76.21.21`
   - Add CNAME: `cname.vercel-dns.com`
   - Wait 5-60 minutes for propagation

4. **Verify SSL**
   - Vercel auto-issues SSL certificate
   - Force HTTPS in Vercel settings

### 3. Set Up Monitoring (Optional but Recommended)

**Sentry (Error Tracking)**
\`\`\`bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
\`\`\`

Add to environment variables:
\`\`\`
NEXT_PUBLIC_SENTRY_DSN=your_dsn
SENTRY_ORG=your_org
SENTRY_PROJECT=camino
\`\`\`

**Vercel Analytics** (Already Included)
- Automatically tracks page views
- View in Vercel dashboard → Analytics

**Uptime Monitoring**
- Use UptimeRobot (free tier)
- Monitor https://your-domain.com
- Alert via email if down

### 4. Legal Pages (Required for Production)

Create these pages:

**Terms of Service** (`/terms`)
- Use template from termly.io or iubenda
- Customize for your business

**Privacy Policy** (`/privacy`)
- GDPR compliance if EU users
- Explain data collection and usage
- Detail third-party services (Supabase, Vercel)

**Cookie Consent**
- Add banner component
- Store consent in localStorage
- Required for EU users

### 5. Email Configuration

**For MVP**: Supabase default emails work

**For Production**:
1. Configure custom SMTP in Supabase
2. Options:
   - SendGrid (99¢/month for 40K emails)
   - AWS SES ($0.10 per 1,000 emails)
   - Mailgun (free tier 5K emails/month)
3. Update email templates in Supabase dashboard
4. Test all email flows

### 6. Backup Strategy

**Supabase Backups** (Automatic)
- Daily backups on Pro plan
- Point-in-time recovery available
- Export manually via SQL

**Additional Safety**
\`\`\`bash
# Weekly database export (run as cron job)
pg_dump YOUR_DATABASE_URL > backup_$(date +%Y%m%d).sql
\`\`\`

Store backups in:
- AWS S3
- Google Cloud Storage
- Dropbox Business

### 7. Performance Optimization

**Already Optimized**
- Edge functions via Vercel
- Next.js automatic code splitting
- Image optimization
- Static generation where possible

**Monitor**
- Vercel Analytics → Web Vitals
- Target: LCP < 2.5s, FID < 100ms, CLS < 0.1

### 8. Team Onboarding

**Create Admin Accounts**
\`\`\`sql
-- In Supabase SQL editor
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@camino.com';
\`\`\`

**First Users**
1. Invite 5-10 beta users
2. Walk through onboarding
3. Upload their data manually
4. Collect feedback
5. Iterate before wider launch

## Production URLs

After deployment, you'll have:
- **Production**: `https://camino-[random].vercel.app`
- **Custom Domain**: `https://app.camino.com` (if configured)
- **Preview**: Each PR gets preview URL automatically

## Scaling Considerations

### When to Upgrade

**Supabase**
- Free tier: 500MB database, 2GB bandwidth
- Pro tier ($25/mo): When you hit 50+ users
- Includes: Daily backups, enhanced security

**Vercel**
- Hobby tier: Free for personal projects
- Pro tier ($20/mo): Required for team > 1 person
- Includes: Advanced analytics, priority support

### Expected Costs (First Year)

| Service | Cost |
|---------|------|
| Domain | $12/year |
| Supabase Pro | $300/year |
| Vercel Pro | $240/year |
| Sentry | $0 (free tier) |
| Email (SendGrid) | $12/year |
| **Total** | **~$564/year** |

For 100+ users, budget $50-100/month total.

## Rollback Plan

If something goes wrong:

1. **Vercel Instant Rollback**
   - Go to Deployments
   - Find previous working deployment
   - Click "Promote to Production"
   - Takes 30 seconds

2. **Database Rollback**
   - Restore from Supabase backup
   - Or re-run migrations

3. **Emergency**
   - Disable signups: Remove signup link
   - Show maintenance page
   - Fix issue offline
   - Redeploy when ready

## Support Channels

**Technical Issues**
- Vercel: vercel.com/help
- Supabase: supabase.com/support
- Next.js: github.com/vercel/next.js/discussions

**Deployment Help**
- Vercel Discord: vercel.com/discord
- Deploy logs in Vercel dashboard

## Next Steps After Launch

1. **Week 1**: Monitor errors, fix critical bugs
2. **Week 2**: Collect user feedback, prioritize features
3. **Month 1**: Add most-requested features
4. **Month 2**: Optimize performance, add analytics
5. **Quarter 1**: Scale infrastructure, add automations

---

You're ready to launch Camino! The app is production-ready and can handle real users today.
