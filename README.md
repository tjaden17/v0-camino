# Camino - Business Intelligence Platform

Camino is a production-ready business intelligence platform that helps executives and managers track key metrics, make data-driven decisions, and understand what matters most to their business.

## Features

### Core Functionality
- **Authentication & User Profiles** - Secure Supabase authentication with email/password
- **Signals Dashboard** - View and analyze key business metrics with trends and benchmarks
- **Mission & KPI Views** - Track personal KPIs and view team priorities
- **Decision Tracking** - Create, track, and review business decisions with signal snapshots
- **Data Upload** - Manual CSV/Excel upload with column mapping and validation
- **Insights & Analytics** - Data quality reports, benchmarks, and alerts
- **Team Directory** - See what KPIs everyone owns and their focus areas

### Technical Stack
- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth
- **UI**: React 19, Tailwind CSS v4, shadcn/ui
- **AI**: Vercel AI SDK with OpenAI GPT-4
- **Deployment**: Vercel (optimized for production)

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)
- Vercel account (for deployment)

### Local Development

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Setup Supabase**
   - Create a new Supabase project at https://supabase.com
   - Environment variables are already configured in v0
   - Run the database migrations in order:

3. **Run Database Migrations**
   Execute these SQL scripts in your Supabase SQL Editor:
   - `scripts/001_create_profiles.sql` - User profiles table
   - `scripts/002_create_signals.sql` - Signals and data points tables
   - `scripts/003_create_kpis_and_decisions.sql` - KPI ownership and decisions
   - `scripts/004_data_foundations_and_benchmarks.sql` - Benchmarks and alerts

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open the App**
   Navigate to `http://localhost:3000`

### First User Setup

1. Go to `/auth/signup`
2. Create an account with your email
3. Check your email for verification link
4. Complete onboarding with your organization details
5. Start uploading data from `/upload`

## Deployment to Production

### Deploy with Vercel

1. **From v0**
   - Click the "Publish" button in v0
   - This automatically deploys to Vercel
   - Environment variables are carried over

2. **From GitHub**
   ```bash
   # Push to GitHub
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main

   # Deploy from Vercel dashboard
   - Import GitHub repository
   - Environment variables auto-imported
   - Deploy
   ```

3. **Custom Domain**
   - Buy domain (e.g., camino.com)
   - Add to Vercel project settings
   - Update DNS records as instructed
   - SSL automatically configured

### Post-Deployment Checklist

#### Required
- [ ] Run all database migrations in Supabase
- [ ] Test user signup flow end-to-end
- [ ] Upload sample data to verify CSV parsing
- [ ] Test authentication (login, logout, password reset)
- [ ] Verify Supabase RLS policies are active

#### Recommended
- [ ] Add custom domain and SSL
- [ ] Set up Sentry for error tracking
- [ ] Configure email provider (beyond Supabase default)
- [ ] Add Terms of Service and Privacy Policy pages
- [ ] Set up database backups (Neon includes this)
- [ ] Create admin accounts for Camino team
- [ ] Test on mobile devices
- [ ] Set up monitoring/uptime checks

#### Optional for MVP
- [ ] Configure email-to-upload (Zapier integration)
- [ ] Add industry benchmarks data
- [ ] Set up analytics dashboard
- [ ] Create onboarding video/tutorial

## User Roles

### Regular Users
- View their owned signals
- Create and track decisions
- Upload data (if given permission)
- View team KPIs
- Receive alerts

### Camino Admins
- Upload data on behalf of any user
- View all organizations
- Manage benchmarks
- Access admin dashboard

## Data Upload Process

### For MVP (Manual)
1. Users email CSV files to data@camino.com
2. Camino team downloads attachments
3. Team uploads via `/upload` admin interface
4. Select organization and map columns
5. Data appears in user's dashboard

### For Production (Automated)
1. Set up Zapier Email Parser
2. Configure webhook to `/api/upload`
3. Automatic extraction and processing
4. Users notified when data is ready

## Database Schema

### Key Tables
- **profiles** - User accounts with organization context
- **signals** - Business metrics (CSAT, Revenue, etc.)
- **signal_data_points** - Historical values for each signal
- **kpi_ownership** - Which users own which signals
- **decisions** - Tracked business decisions
- **decision_signals** - Signals linked to decisions with snapshots
- **benchmarks** - Target values (internal, industry, user-defined)
- **upload_history** - Track all data imports

## API Routes

- `POST /api/upload` - Upload and process CSV/Excel files
- `GET /api/signals` - Get all signals with filtering
- `GET /api/benchmarks` - Get benchmarks for a signal
- `POST /api/benchmarks` - Create new benchmark
- `POST /api/decisions` - Create new decision
- `POST /api/kpis` - Update user's KPI ownership

## Security

### Authentication
- Supabase Auth with email verification
- HTTP-only cookies for sessions
- Secure password hashing (bcrypt)
- Token refresh handled automatically

### Database Security
- Row Level Security (RLS) enabled on all tables
- Users can only see their organization's data
- Admins have elevated permissions via RLS policies
- Prepared statements prevent SQL injection

### Best Practices
- Environment variables never exposed to client
- API routes validate authentication on every request
- File uploads validated and sanitized
- CORS properly configured

## Troubleshooting

### Users Can't Sign Up
- Check Supabase email settings
- Verify SMTP configuration
- Check email deliverability

### Data Not Appearing After Upload
- Verify CSV column mapping was correct
- Check upload_history table for errors
- Ensure signal_data_points were inserted

### Signals Not Showing
- Verify user's organization matches signal organization
- Check RLS policies in Supabase
- Ensure user is authenticated

### Authentication Issues
- Clear cookies and try again
- Check Supabase project status
- Verify environment variables

## Support

For issues or questions:
- Open a support ticket at vercel.com/help
- Check Supabase documentation at supabase.com/docs
- Review Next.js docs at nextjs.org/docs

## What's Next

### Phase 2 Features (Post-MVP)
- Email-to-upload automation
- AI-suggested relevant signals for decisions
- Decision quality scoring
- Timeline view of decision impact
- Automated alerts and notifications
- Slack integration
- Mobile app (React Native)

### Phase 3 Features
- Peer network benchmarks (cross-customer)
- Decomposition analysis (metric formulas)
- Constraint analysis and bottleneck detection
- Pattern learning from past decisions
- Multi-source signal aggregation
- Advanced AI features

## License

Proprietary - Camino © 2025

---

Built with v0 by Vercel
