# CAMINO PRODUCT SPECIFICATION

**Version:** 1.3 (MVP)
**Last Updated:** February 3, 2026
**Status:** Draft for Review

**Changelog:**
- v1.3 (Feb 3, 2026): Added comprehensive onboarding flow with organization join/create, role taxonomy, and org-aware signup
- v1.2 (Feb 2026): Added signal-calculation-service with column resolution, calculation types, trend analysis, and formatting
- v1.1 (Feb 2026): Added detailed service layer documentation with debug queries, cross-source signal discovery, staging layer
- v1.0 (Jan 2026): Initial MVP specification

---

**Mission: Unlock revenue with faster, better decisions.**

---

## TABLE OF CONTENTS

**A. CONTEXT**
- Our Insight
- How We'll Win
- The Challenge
- The Opportunity
- Target Market

**B. CAMINO GOAL**
- Mission
- Vision Statement
- Product Thesis
- Core Value Proposition

**C. SUCCESS METRICS**
- North Star Metric
- Primary Metrics (MVP)
- Secondary Metrics
- Guardrail Metrics

**D. USER STORIES**
- User Types
- Prospect User Stories (US-L1 to US-L6)
- Manager User Stories (US-M1 to US-M6)
- Executive User Stories (US-E1 to US-E8)
- User Profile Stories (US-P1 to US-P5)
- Master Admin User Stories (US-A1 to US-A8)

**E. PRODUCT SPECIFICATIONS**
- Information Architecture
- Screen Specifications
- Signal Interpretation Framework
- Signal Definition Types
- Signal Status Logic

**F. TECHNICAL SPECIFICATIONS**
- Architecture Overview
- Database Schema (MVP)
- API Endpoints
- Service Layer
  - signals-service.ts
  - upload-service.ts
  - interpretation-service.ts
  - share-service.ts
- AI Integration
- Component Structure

**G. MVP SCOPE**
- In Scope (Build First)
- MVP Build Status (with gaps)
- Out of Scope (Post-MVP)
- MVP Timeline Estimate

**H. DECISIONS**
- Data Source Flexibility
- Interpretation Quality
- Benchmark Data
- Sharing
- Organization Size
- Retention Mechanics

**I. APPENDIX**
- User Workflow Diagrams
- Competitive Landscape
- Glossary
- Retention Behaviors (Hypothesis)
- Retention Plan

**J. END-TO-END TEST SCENARIOS**
- Core User Flows (E2E-1 to E2E-6)
- Authentication & Authorization (E2E-7 to E2E-8)
- Data Persistence (E2E-9)
- Filters & Navigation (E2E-10)
- Quick Smoke Test Checklist
- Test Data Requirements

**K. OPEN QUESTIONS**
- User Experience (OQ-1 to OQ-4)
- Data & Signals (OQ-5 to OQ-8)
- Signal Definitions & Calculations (OQ-20 to OQ-24)
- Interpretation & AI (OQ-9 to OQ-11)
- Sharing & Collaboration (OQ-12 to OQ-14)
- Technical & Admin (OQ-15 to OQ-17)
- Pricing & Packaging (OQ-18 to OQ-19)

---

## A. CONTEXT

### Our Insight

A company's value is based on the speed and quality of its decision making.

BUT, decision making can be hampered by low quality, slow information.

The gap between data and decisions is where companies lose money, miss opportunities, and fall behind competitors. Most businesses have the data they need - they just can't get to it fast enough, or in a form that's useful.


### How We'll Win

**1. Speed to Surface Valuable Information**
- Speedy via mobile-first design
- Simplified signals to show what's important
- Valuable from being based on understanding user's context (their role, goals, decisions)

**2. Exec-First vs Analyst-First**
- Help build intuition to make decisions (not just display data)
- Justify decisions to others with shareable insights
- Easy to connect signals to business goals
- Designed for decision-makers, not data analysts

**3. Team-Led, Easy Data Integrations**
- Optimised to make it easy for team members to connect and update data
- Like Stripe: managers can set up in minutes, not days
- No IT department required
- Works with data they already have (spreadsheets, exports)


### The Challenge

Small and medium businesses (SMBs) generate operational data across many tools - Zoho Desk, HubSpot, spreadsheets - but the path from data to decision is too slow:

1. **Time gap** - Manual analysis takes hours, opportunities pass
2. **Expertise gap** - Teams don't know what "good" looks like or what to prioritize
3. **Tool gap** - Enterprise BI is overkill; spreadsheets don't tell you what matters

The cost: Missed opportunities, delayed decisions, and revenue left on the table.


### The Opportunity

Every data point contains a potential decision. Every decision is an opportunity to unlock revenue.

SMBs need a tool that:

- Surfaces opportunities and risks from data they already have
- Shows what matters right now - in seconds, not hours
- Explains what it means and what to do about it
- Connects insights directly to business goals and revenue
- Enables the whole team to contribute (not just analysts)


### Target Market

**Primary:** B2B SaaS companies, 20-200 employees

**Initial Users:**
- Customer Service Managers (using Zoho Desk) - spotting retention opportunities
- Sales Managers (using HubSpot/Zoho CRM) - finding revenue accelerators
- Operations/Finance Managers (using spreadsheets) - identifying efficiency gains

**Buyers:**
- VPs of Operations, COOs, CEOs who want to move fast on opportunities without waiting for reports

---

## B. CAMINO GOAL

### Mission

**Unlock revenue with faster, better decisions.**


### Vision Statement

Camino transforms raw business data into decisions - automatically. We close the gap between information and action, giving every business leader the clarity they need to move fast and win.


### Product Thesis

We believe that if we make it effortless to:

1. **Upload** weekly data (30 seconds) - team-led, like Stripe
2. **See** opportunities and risks immediately (1 minute) - speed to value
3. **Understand** what to do about it (1 minute) - exec-first, builds intuition
4. **Share** and align with stakeholders (30 seconds) - justify decisions easily

Then organizations will make faster, better decisions - and unlock more revenue.


### Core Value Proposition

**For Managers:** Camino is a weekly opportunity-finder that turns data into shareable insights in 5 minutes, helping you spot what matters and look prepared - unlike manual reporting that takes hours and still misses the point.

**For Executives:** Camino gives you instant clarity on opportunities and risks, building your intuition about the business - unlike dashboards that show everything but tell you nothing.

---

## C. SUCCESS METRICS

### North Star Metric

**Weekly Active Organizations (WAO):** Organizations where at least one user uploads data AND at least one user views signals in a given week.

This measures the core loop: team contributes data, leadership gains clarity, decisions get made.


### Primary Metrics (MVP)

| Metric | Definition | Target (90 days) | Why It Matters |
|--------|------------|------------------|----------------|
| Upload Retention | % of managers who upload 4+ weeks in a row | Greater than 60% | Team-led data flow working |
| Signal Engagement | % of weekly users who explore at least 1 signal | Greater than 70% | Users finding valuable opportunities |
| Share Rate | % of managers who share at least 1 signal per week | Greater than 30% | Insights driving conversations |
| Exec Return Rate | % of execs who return weekly to check signals | Greater than 50% | Building exec intuition |


### Secondary Metrics

| Metric | Definition | Why It Matters |
|--------|------------|----------------|
| Time to First Signal | Minutes from signup to seeing first insight | Activation speed |
| Signals Saved (Exec) | Average signals saved per exec user | Engagement depth |
| Interpretation Usefulness | % of interpretations rated helpful | AI quality |
| Share Completion Rate | % of share sheet opens that complete | UX friction |


### Guardrail Metrics

- **False Positives:** % of "Needs Attention" flags that users dismiss as not important (target: less than 20%)
- **Upload Errors:** % of uploads that fail to parse (target: less than 5%)
- **AI Hallucinations:** % of interpretations with factual errors (target: less than 1%)

---

## D. USER STORIES

### User Types

| Type | Role Examples | Primary Behavior | Key Motivation |
|------|---------------|------------------|----------------|
| Prospect | Potential customer | Views landing page, watches demo, signs up | Understand value, see if it fits their needs |
| Manager | CS Manager, Sales Manager | Uploads data weekly, explores signals, shares to leadership | Spot opportunities early, look prepared, drive action |
| Executive | VP Ops, COO, CEO | Views saved signals, drills into opportunities and risks | Fast pulse on what matters, build intuition, move quickly |


### Prospect User Stories

**US-L1: Landing Page**

As a Prospective User, I want a product landing page, so that I can understand what Camino does and decide if it's right for me.

Acceptance Criteria:
- Clear value proposition visible above the fold
- Main actions prominently displayed: View Demo, Sign Up, Sign In
- Overview of key features and benefits
- Social proof (testimonials, logos, metrics)
- Mobile-responsive design


**US-L2: Manager Demo**

As a Manager, I want a quick demo of the product workflow from my perspective, so that I can see how Camino would fit into my weekly routine.

Acceptance Criteria:
- Accessible from landing page (View Demo > Manager perspective)
- Show how to upload data (drag-drop or email)
- Show user seeing key signals with status grouping
- Show user exploring a signal detail
- Show user sharing signals with their manager
- Interactive or video walkthrough (under 2 minutes)


**US-L3: Executive Demo**

As an Executive, I want a quick demo of the product workflow from my perspective, so that I can see how Camino would help me stay informed.

Acceptance Criteria:
- Accessible from landing page (View Demo > Executive perspective)
- Show signals home page with opportunities and risks highlighted
- Show signal exploration with What We Found, What It Means, So What
- Show who owns the signal and how to save for follow-up
- Show how to share or act on signals
- Interactive or video walkthrough (under 2 minutes)


**US-L4: Sign Up and Join Organization (NEW - v1.3)**

As a Prospect, I want to sign up quickly and either join an organization or create a new one, so that I can get started with my team immediately.

Acceptance Criteria:
- Can sign up with email and password
- After signup, system checks for pending organization invites
- If invited: Show "Accept Organization Invite" screen with org name and invited role
  - Can accept (joins org) or skip (creates default org)
- If not invited: Proceed directly to role selection onboarding
- Invite acceptance is one-click, then continues to role selection
- Org context persists through entire onboarding


**US-L5: Select Role During Onboarding (NEW - v1.3)**

As a User, I want to select my role (department + specific role) during onboarding, so that Camino can personalize signals and recommendations for my job.

Acceptance Criteria:
- Step 1: Select department from 8 options (Sales, Marketing, Customer Success, etc.)
- Step 2: Select specific role from 2-4 options in that department
- Each role shows description and responsibilities
- If joining organization via invite: Shows org name and context
- Can skip role selection
- Role selection directly influences signals recommended after first upload
- Mapped to signal catalog for personalized recommendations


**US-L6: Complete Onboarding Welcome (NEW - v1.3)**

As a User, I want to see a welcome screen explaining how Camino works, so that I understand what to do next and get started with my first upload.

Acceptance Criteria:
- See 4 educational sections: How Signals Work, Getting Started, Key Features, Pro Tips
- Clear explanation of upload workflow (upload → see signals → save/share)
- Friendly tone, no form input required
- "Get Started" button sends to dashboard
- Can go back to role selection if needed
- Screen takes 30 seconds to read and understand


### Manager User Stories

**US-M1: First Upload**

As a Manager, I want to upload my first data file in under a minute, so that I can immediately see trends and opportunities Camino surfaces.

Acceptance Criteria:
- Can drag/drop or browse for XLSX/CSV file (no setup required)
- File contains data across a date range (e.g., weeks or months)
- See upload progress indicator
- Within 30 seconds, see list of detected signals with trends
- Each signal shows: name, current value, trend direction, change %
- Trends detected from date range in file (not baseline-only)


**US-M2: Explore First Signal**

As a Manager, I want to tap on a signal to understand what the number means, so that I can build intuition about what matters.

Acceptance Criteria:
- Signal detail page shows value prominently
- "What We Found" section shows breakdown (by category, by day, etc.)
- "What It Means" section explains significance in plain language
- Can navigate back to signal list easily


**US-M3: Weekly Upload**

As a Manager, I want to upload this week's data in 30 seconds, so that I can quickly see new opportunities and risks.

Acceptance Criteria:
- Two upload options: Email file to upload@camino.app OR use desktop web upload
- Desktop upload has large drag-drop zone optimized for desktop workflow
- Upload recognizes returning user/format (no re-configuration)
- Processing shows "Comparing to previous data..."
- Results grouped by: Opportunities/Risks, Improved, Steady
- Each signal shows: value, change %, trend direction
- Can view recent upload history


**US-M4: Explore Flagged Signal**

As a Manager, I want to drill into a flagged signal, so that I can understand the opportunity or risk and its impact on our goals.

Acceptance Criteria:
- Signal detail shows trend visualization (4+ weeks)
- "What We Found" shows: absolute value, trend, data sources, sample size, time period, signal consistency
- "What It Means" shows: why the change happened, benchmark comparison, AI-powered Why analysis, scope of customers/revenue affected
- "So What" shows: direction (good/bad), expected vs unexpected, impact on company KPIs with causal relationship


**US-M5: Share Signal to Manager**

As a Manager, I want to share a signal insight with my VP, so that they have context for decisions and I look prepared.

Acceptance Criteria:
- Tap "Share" button on signal detail
- See preview of shareable summary
- Can toggle: include metric, include meaning, include KPI impact
- Copy to clipboard with one tap
- Option to send via email (pre-filled recipient from org)


**US-M6: Share Opportunity with Team**

As a Manager, I want to share a positive signal with my team, so that we can align on momentum and next steps.

Acceptance Criteria:
- Share sheet allows posting to Slack channel
- Summary highlights the opportunity and what drove it
- Team channel shows formatted message with metric + context


### Executive User Stories

**US-E1: View Available Signals**

As an Executive, I want to see all signals my team has surfaced, so that I can choose which opportunities and risks to track.

Acceptance Criteria:
- See list of all signals in my organization
- Each shows: name, current value, trend indicator
- Signals flagged as opportunities or risks are highlighted


**US-E2: Save Key Signals**

As an Executive, I want to save the 3-5 signals that matter most to my goals, so that I can build intuition over time.

Acceptance Criteria:
- Tap star icon to save/unsave a signal
- Visual confirmation when saved
- Can save up to 10 signals


**US-E3: Weekly Check-in**

As an Executive, I want to open Camino and immediately see my key signals, so that I get a pulse on opportunities in 60 seconds.

Acceptance Criteria:
- App opens to "My Signals" view by default
- Shows only saved signals
- Grouped by: Needs Attention, On Track
- Most important opportunity or risk is visually prominent


**US-E4: Drill into Opportunity or Risk**

As an Executive, I want to tap a flagged signal to understand what's happening, so that I can make faster decisions and ask informed questions.

Acceptance Criteria:
- See same detail view as Manager
- "So What" section shows KPI impact with causal relationship
- Can see who uploaded the data and when


**US-E5: See Missing Signals I Need**

As an Executive, I want to see signals I need (e.g., discussed during onboarding) but don't have because we don't have the right data, so that I understand what needs to be done to see them.

Acceptance Criteria:
- See desired signals that were identified during onboarding
- See what's missing for each (e.g., specific data point, or data source type)
- Understand the gap clearly (what we have vs what we need)
- Invite/notify a team member to provide the missing data or connect the data source


**US-E6: See How Signals Connect to My Goals**

As an Executive, I want to see how signals connect to my role goals and KPIs, so that I understand which leading indicators drive my lagging indicators.

Acceptance Criteria:
- See signals (leading indicators) mapped to KPIs they influence (lagging indicators)
- Understand the causal/correlation relationship between signals and KPIs
- Visual representation of signal-to-KPI funnel or connection
- Filter or group signals by which KPI they impact


**US-E7: Discover Signals I Should Have**

As an Executive, I want to know what signals I should have but don't, that others in my similar position use, so that I can get where I want to go faster.

Acceptance Criteria:
- See "Signals to Consider" as cards with signal name and description
- Each card explains why this signal should be considered (industry standard, peer usage, goal alignment)
- Share "Signals to Consider" with a manager so they can implement
- Dismiss signals that are not relevant


**US-E8: See Signal Owner for Accountability**

As an Executive, I want to see who is responsible for a signal, especially when it's an opportunity or a risk, so that I can follow up with them.

Acceptance Criteria:
- See signal owner (the manager who uploads/maintains this data)
- Owner displayed prominently on signal detail, especially for flagged signals
- Act on signal: save to track, share with owner or others
- One-tap to message or notify the signal owner


### User Profile Stories (All Users)

**US-P1: View My Profile**

As a User, I want to see my profile including my organization and role context, so that I understand how Camino is personalized for me.

Acceptance Criteria:
- See my name, email, and organization
- See my role (Executive or Manager)
- See my goals and KPIs that signals are mapped to
- See my preferences and settings


**US-P2: Edit My Role Context**

As a User, I want to edit my goals, KPIs, and role context, so that Camino can better personalize signals and insights for me.

Acceptance Criteria:
- Edit my role title and description
- Add, edit, or remove my goals (what I'm trying to achieve)
- Add, edit, or remove my KPIs (how I measure success)
- Changes immediately reflect in signal interpretations (KPI impact section)


**US-P3: View My Organization**

As a User, I want to see my organization details, so that I understand the company context Camino uses.

Acceptance Criteria:
- See organization name and industry
- See company-level KPIs and goals
- See team members in my organization
- See connected data sources


**US-P4: Edit My Preferences**

As a User, I want to edit my notification and display preferences, so that Camino works the way I want.

Acceptance Criteria:
- Set notification preferences (email frequency, alert thresholds)
- Set display preferences (default view, theme)
- Changes saved immediately


**US-P5: View Organization Focus**

As a User, I want to see what my organization is focused on, so that I understand how my work connects to company priorities.

Acceptance Criteria:
- See executive KPIs (what leadership is measuring)
- See other team members' KPIs (what peers are focused on)
- Understand how different KPIs relate to each other (hierarchy or connections)
- See which signals feed into which KPIs across the organization


### Master Admin User Stories

**US-A1: Manage Organizations**

As a Master Admin, I want to create, view, and manage organizations, so that I can onboard and support clients.

Acceptance Criteria:
- Create new organization with name and slug
- View list of all organizations
- Edit organization details
- Delete or deactivate organization


**US-A2: View Users in Organizations**

As a Master Admin, I want to view all users within an organization, so that I can understand the team structure.

Acceptance Criteria:
- Select an organization
- See list of all users in that org
- See user role (executive/manager) and status


**US-A3: Add Members to Organizations**

As a Master Admin, I want to add new members to an organization, so that I can help clients onboard their team.

Acceptance Criteria:
- Select an organization
- Add new user with email and role
- Send invite or create account directly


**US-A4: Manage User Profiles**

As a Master Admin, I want to view and manage user profiles in an organization, so that I can configure personalization settings.

Acceptance Criteria:
- View user profile details
- Edit personalization info (goals, KPIs, preferences)
- Change user role
- Remove user from organization


**US-A5: Upload Data Files for Organizations**

As a Master Admin, I want to upload data files on behalf of an organization, so that I can help clients get started with their signals.

Acceptance Criteria:
- Select an organization
- Upload XLSX/CSV file
- Attribute upload to a specific user in the org
- See upload results (signals detected)


**US-A6: Manage Data Files for Organizations**

As a Master Admin, I want to view and delete data files for an organization, so that I can help clients manage their data.

Acceptance Criteria:
- View list of uploaded files per organization
- See file metadata (date, uploader, signals generated)
- Delete file and associated data if needed


**US-A7: QA Signal Cards**

As a Master Admin, I want to see signals for an organization including Layer 1, Layer 2, and Layer 3 content, so that I can QA the signal cards before clients see them.

Acceptance Criteria:
- Select an organization
- View all signals for that org
- See full signal detail: What We Found, What It Means, So What
- Verify AI-generated content is accurate and appropriate


**US-A8: AI Review**

As a Master Admin, I want to review a sample of AI-generated interpretations across organizations, so that I can ensure interpretation quality before clients see them.

Acceptance Criteria:
- Dedicated "AI Review" section in admin panel
- See recent interpretations across all orgs (filterable by org)
- View full interpretation: Layer 1, Layer 2, Layer 3 content
- Mark interpretations as "Approved", "Needs Edit", or "Regenerate"
- Edit interpretation text directly if needed
- Trigger regeneration for specific signals
- See quality metrics: % approved, common issues

---

## E. PRODUCT SPECIFICATIONS

### Information Architecture

**Onboarding**
- Sign Up
  - Email/password registration
  - Auto-detection of pending organization invites
- Accept Organization Invite (if applicable)
  - Shows organization name and invited role
  - User can accept invite and join organization
- Role Selection
  - Two-step: Department selection (8 functions) → Specific role (25+ roles)
  - Roles mapped to signal catalog for personalized signal recommendations
  - Displays which organization user is joining (if applicable)
- Welcome Screen
  - Educational walkthrough: How Signals Work, Getting Started, Key Features
  - Guides user to first data upload
- Organization Join/Create
  - Users invited to organization → Auto-join after role selection
  - Users not invited → Default organization created automatically

**Signals List (Home)**
- All Signals view
- My Signals view (saved only)
- Grouped by status (Needs Attention / Improved / Steady)

**Signal Detail**
- Header (name, value, change, trend)
- Trend visualization
- What We Found (Layer 1)
- What It Means (Layer 2)
- So What (Layer 3)
- Actions (Save, Share, Add Learning)

**Upload (Dedicated Page)**
- Accessible from: Main nav (desktop), Settings menu (mobile), "Upload" CTA when no recent data
- Two upload methods: Email-to-upload OR Desktop web upload
- Processing indicator
- Results (grouped signals)
- Recent uploads history

**Profile (Dedicated Page)**
- Accessible from: Profile icon/avatar in header, Settings menu
- View and edit: Personal info, role, goals, KPIs
- View: Organization details, team members, data sources
- Edit: Notification and display preferences

**Share Sheet**
- Summary preview
- Include options (toggles)
- Destination (Copy / Slack / Email)


### Screen Specifications

**1. Onboarding Screens**

**Sign Up** (`/auth/signup`)
- Email and password registration form
- After signup: Auto-checks for pending organization invites
- If invite found: Redirects to accept-invite screen
- If no invite: Redirects to onboarding (role selection)

**Accept Organization Invite** (`/auth/accept-invite`)
- Shows organization name and invited role
- Display: Organization context, role being invited for, invite expiration
- Actions: Accept (joins org, continues to role selection) or Skip (creates default org)
- After accept: Auto-fills role in next screen

**Role Selection** (`/auth/onboarding` - Screen 1)
- **Step 1: Department Selection**
  - 8 department buttons: Revenue & Finance, Sales, Marketing, Product, Customer Success, Support, Operations, Finance
  - User selects their department
  
- **Step 2: Specific Role Selection**
  - Shows 2-4 role options based on selected department
  - Each role card shows: Role title, description, seniority level
  - Examples: VP Customer Success, CSM, CSM Manager, Onboarding Specialist
  - Role taxonomy mapped to signal catalog (ensuring personalized signal recommendations)
  - If user was invited: Shows which organization they're joining with a context banner
  
- User can skip this step (marks as not selected)

**Welcome Screen** (`/auth/onboarding` - Screen 2)
- **Content Sections:**
  - How Signals Work: Explains what signals are, how they track metrics, identify changes and flag opportunities
  - Getting Started: 3-step process (upload data → see signals → save and share)
  - Key Features: Smart Discovery, AI Insights, Role-Based Signals
  - Pro Tip: Start with recent data for better patterns
  
- All informational (no form input)
- "Get Started" button redirects to mission/dashboard
- User can go back to role selection

**2. Signals List**

| Element | Specification |
|---------|---------------|
| Header | "Signals" title, filter toggle (All / My Signals) |
| Filter Toggle | Executive users default to "My Signals"; Manager users default to "All" |
| Grouping | Dynamic groups: "Needs Attention" (red), "Improved" (green), "Steady" (gray) |
| Signal Card | Name, Value, Change %, Trend arrow, Star (saved) indicator |
| Empty State | "No signals yet" + CTA based on role |


**3. Signal Detail**

| Section | Content |
|---------|---------|
| Header | Signal name, Star toggle, Back button |
| Metric Display | Large value, Change badge (up 12% or down 5%), Trend label |
| Trend Chart | Sparkline or bar chart, last 4-6 periods |
| What We Found | Absolute value, trend, data sources (connected + recommended), sample size, time period, signal consistency |
| What It Means | Why the change happened, benchmark comparison, AI-powered Why analysis, scope of customers/revenue affected |
| So What | Direction (good/bad), expected vs unexpected, KPI impact with causal relationship |
| Actions | Share and Add Learning buttons |


**3. Upload Page**

| Element | Specification |
|---------|---------------|
| Location | Dedicated /upload page |
| Access (Desktop) | Main navigation link |
| Access (Mobile) | Settings/profile menu, or "Upload" CTA when no recent data |

**Upload Methods:**

| Method | How It Works |
|--------|--------------|
| Email-to-Upload | Send file to upload@camino.app (or upload+orgslug@camino.app). Receive confirmation email with link to view signals. |
| Desktop Web Upload | Large drag-drop zone optimized for desktop. Drag file directly from Downloads folder or click to browse. |

**Desktop Upload Layout:**

| Section | Content |
|---------|---------|
| Header | "Upload Your Weekly Data" title |
| Drop Zone | Large drag-drop area (not a modal), "Browse Files" button, supported formats note (.xlsx, .csv) |
| Processing | Progress bar, "Analyzing..." then "Comparing to previous data..." |
| Results | Redirect to Signals List showing grouped results |
| Recent Uploads | List of previous uploads with date, file name, signals count, and "View" link |


**4. Share Sheet**

| Element | Specification |
|---------|---------------|
| Preview | Formatted summary in card (simulates how recipient sees it) |
| Toggles | Include: Key metric, What it means, KPI impact |
| Destinations | Copy Text, Share to Slack, Email to recipient |
| Confirmation | Toast: "Copied to clipboard" or "Sent to #channel" |


**5. Profile Page**

| Element | Specification |
|---------|---------------|
| Location | Dedicated /profile page |
| Access | Profile icon/avatar in header, Settings menu |

**Profile Sections:**

| Section | Content |
|---------|---------|
| Personal Info | Name, email, profile photo (view and edit) |
| Role Context | Role title, role description (view and edit) |
| My Goals | List of goals user is trying to achieve, with add/edit/remove |
| My KPIs | List of KPIs user measures success by, with add/edit/remove (these are used in "So What" KPI impact) |
| Organization | Org name, industry, company KPIs (view only, links to org details) |
| Team | List of team members in organization (view only) |
| Data Sources | Connected data sources for the org (view only) |
| Preferences | Notification settings (email frequency, alert thresholds), display settings (default view, theme) |


### Signal Interpretation Framework

Each signal interpretation follows this structure, designed to build executive intuition and enable faster decisions:

**WHAT WE FOUND (Layer 1)** - Speed to information

| Element | Description |
|---------|-------------|
| Absolute Value | Current metric value with units |
| Trend | Direction and duration (e.g., "down for 3 weeks") |
| Data Sources (Connected) | Which data sources are currently informing this signal |
| Data Sources (Recommended) | Industry-standard sources that could enrich this signal but are not yet connected |
| Sample Size | Number of records/transactions in the calculation |
| Time Period | Date range covered by current data |
| Signal Consistency | How stable/noisy the signal is (high variance vs steady) |


**WHAT IT MEANS (Layer 2)** - Build intuition

| Element | Description |
|---------|-------------|
| Why the Change Happened | Correlation with other signals that changed (e.g., "Response Time increased as Ticket Volume increased 15%") |
| Benchmark Comparison | How this compares to industry standards or past performance |
| AI-Powered Why Analysis | Deeper analysis of potential root causes using pattern recognition across signals |
| Scope of Customers | How many / what % of customers are affected by this signal |
| Scope of Revenue | Revenue at risk or revenue opportunity associated with this signal |


**SO WHAT (Layer 3)** - Enable decisions (no recommendations)

| Element | Description |
|---------|-------------|
| Direction | Is this good or bad? Positive or negative for the business? |
| Expected vs Unexpected | Was this change anticipated based on seasonality, initiatives, or trends? What was our expectation? |
| KPI Impact | A [direction/change] in this signal could impact [Company KPI] (Role KPIs) (Other Team KPIs). Shows causal relationship between signal and business outcomes across the organization. |


### Signal Definition Types

Signals can be sourced and calculated in multiple ways to support flexibility across data sources:

| Type | Description | Example |
|------|-------------|---------|
| Direct | Value comes directly from a single column in a single file | "CSAT Score" = column "csat" from Zoho export |
| Calculated (Single Source) | Derived from multiple columns within one file | "Resolution Rate" = resolved_tickets / total_tickets from same file |
| Calculated (Multi-Source) | Derived from columns across multiple files or integrations | "Revenue per Ticket" = revenue (from HubSpot) / tickets (from Zoho) |
| Manual | User enters value directly, no file upload | "Team Size" entered manually each period |

**Signal Definition Schema:**

```
signal_definitions {
    id: UUID
    organization_id: UUID
    signal_id: UUID (FK to signals)
    definition_type: 'direct' | 'calculated_single' | 'calculated_multi' | 'manual'
    
    // For direct signals
    source_column: string | null        // Column name in source file
    
    // For calculated signals
    formula: string | null              // e.g., "SUM(column_a) / COUNT(column_b)"
    formula_components: JSONB | null    // Structured formula definition
    
    // Data lineage
    source_mappings: JSONB              // Array of { source_id, column_name, role }
    
    created_at: timestamp
    updated_at: timestamp
}
```

**Formula Components Structure:**

```
formula_components: {
    operation: 'sum' | 'avg' | 'count' | 'ratio' | 'custom',
    inputs: [
        { source_id: 'abc', column: 'resolved_tickets', aggregation: 'sum' },
        { source_id: 'abc', column: 'total_tickets', aggregation: 'sum' }
    ],
    expression: 'inputs[0] / inputs[1] * 100'  // For custom operations
}
```

**Source Mappings Structure:**

```
source_mappings: [
    { 
        source_id: 'zoho-desk-export',
        source_type: 'file_upload',
        column: 'csat_score',
        role: 'primary_value'
    },
    {
        source_id: 'hubspot-deals',
        source_type: 'integration',
        column: 'deal_amount',
        role: 'denominator'
    }
]
```

**Integration-Agnostic Data Source Model:**

The system should support any data source through a unified interface:

| Source Type | Examples | Connection Method |
|-------------|----------|-------------------|
| File Upload | CSV, XLSX exports from any system | Manual upload or email-to-upload |
| Native Integration | Zoho, HubSpot, Salesforce, Stripe | OAuth connection, API sync |
| Database Connection | PostgreSQL, MySQL, BigQuery | Direct connection string |
| Webhook | Custom systems pushing data | Incoming webhook endpoint |
| Manual Entry | User-entered values | Form input in UI |

**Data Source Registry:**

```
data_sources {
    id: UUID
    organization_id: UUID
    name: string                    // "Zoho Desk Export", "HubSpot CRM"
    source_type: 'file_upload' | 'integration' | 'database' | 'webhook' | 'manual'
    
    // For integrations
    integration_type: string | null // 'zoho', 'hubspot', 'salesforce', etc.
    connection_config: JSONB | null // Encrypted credentials, API keys
    
    // Schema discovery
    detected_schema: JSONB          // { columns: [{ name, type, sample_values }] }
    last_schema_update: timestamp
    
    // Sync settings
    sync_frequency: 'manual' | 'daily' | 'weekly' | 'realtime'
    last_sync_at: timestamp
    
    created_at: timestamp
}
```

**Signal Calculation Flow:**

```
calculateSignalValue(signal, period)
    |
    ├── 1. GET DEFINITION
    |   └── Query signal_definitions for this signal
    |
    ├── 2. GATHER SOURCE DATA
    |   ├── For each source in source_mappings:
    |   |   ├── If file_upload: query raw_data for period
    |   |   ├── If integration: fetch from API or cached data
    |   |   └── If manual: query manual_entries
    |   └── Return: Map<source_id, rows[]>
    |
    ├── 3. APPLY FORMULA
    |   ├── If direct: extract value from single column
    |   ├── If calculated: evaluate formula_components
    |   |   ├── Apply aggregations (sum, avg, count) per input
    |   |   └── Evaluate expression with aggregated values
    |   └── Return: calculated value
    |
    ├── 4. STORE RESULT
    |   └── Upsert into signal_values with lineage metadata
    |
    └── Return: SignalValue { value, period, sources_used }
```


### Signal Status Logic

Signals are categorized to help users quickly identify opportunities and risks:

| Status | Criteria | Visual | User Action |
|--------|----------|--------|-------------|
| Needs Attention | Trend is wrong direction for 3+ weeks OR change greater than 20% negative | Red accent, top of list | Investigate risk, decide on action |
| Opportunity | Change greater than 10% in good direction | Green accent, highlighted | Capitalize, share with team |
| Improved | Change 5-10% in good direction | Green accent | Monitor, celebrate progress |
| Steady | Change less than 5% either direction | Gray/neutral | No action needed |
| New | First data point, no comparison available | Blue accent, "Baseline" label | Track for next week |

"Good direction" is defined per signal type:
- CSAT, Win Rate, Resolution Rate: higher is better (revenue enablers)
- Response Time, Churn, Cost: lower is better (efficiency gains)

---

## F. TECHNICAL SPECIFICATIONS

### Architecture Overview

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 App Router + React 19 + Tailwind CSS + shadcn/ui |
| API Layer | Next.js API Routes (Server Actions for mutations) |
| Services | signals-service, upload-service, interpretation-service, share-service |
| Database | Supabase (Auth + Postgres) or Neon (Postgres) |
| External | AI Gateway (OpenAI), Slack API, Email (Resend) |


### Database Schema (MVP)

**Core Tables (Existing)**

*profiles*
- id (UUID, Primary Key)
- email
- full_name
- role ('executive' or 'manager') - NEW
- organization_id (Foreign Key)
- created_at

*organizations*
- id (UUID, Primary Key)
- name
- slug
- created_at

*signals*
- id (UUID, Primary Key)
- organization_id (Foreign Key)
- name
- description
- category
- good_direction ('up' or 'down')
- unit (string: '%', 'hrs', '$', etc.)
- definition_type ('direct', 'calculated_single', 'calculated_multi', 'manual')
- formula (text, nullable) - for calculated signals
- formula_components (JSONB, nullable) - structured formula definition
- source_mappings (JSONB) - array of source/column mappings

*signal_values*
- id (UUID, Primary Key)
- signal_id (Foreign Key)
- period (string: '2026-01-W4')
- value (numeric)
- previous_value (numeric, nullable)
- change_percent (numeric, nullable)
- trend ('up', 'down', 'stable', or 'new')
- needs_attention (boolean)
- created_at

*data_sources*
- id (UUID, Primary Key)
- organization_id (Foreign Key)
- name
- source_type ('file_upload', 'integration', 'database', 'webhook', 'manual')
- integration_type (string, nullable) - 'zoho', 'hubspot', 'salesforce', etc.
- connection_config (JSONB, nullable) - encrypted credentials
- detected_schema (JSONB) - discovered columns with types
- sync_frequency ('manual', 'daily', 'weekly', 'realtime')
- last_sync_at (timestamp)
- uploaded_by (Foreign Key)
- created_at

*raw_data*
- id (UUID, Primary Key)
- source_id (Foreign Key)
- period
- row_data (JSONB)
- created_at


**New Tables (MVP)**

*saved_signals*
- id (UUID, Primary Key)
- user_id (Foreign Key to profiles)
- signal_id (Foreign Key to signals)
- created_at

*organization_invites* (NEW - v1.3)
- id (UUID, Primary Key)
- organization_id (Foreign Key to organizations)
- email (text) - invited email address
- role (text) - 'admin' or 'read-only'
- invited_by (uuid, nullable) - user who sent invite
- status (text) - 'pending', 'accepted', 'declined', 'expired'
- token (text, unique) - for invite links
- expires_at (timestamp)
- accepted_at (timestamp, nullable)
- created_at
- updated_at
- UNIQUE constraint on (user_id, signal_id)

*signal_interpretations*
- id (UUID, Primary Key)
- signal_id (Foreign Key to signals)
- period (string)
- what_we_found (JSONB: absolute_value, trend, data_sources_connected, data_sources_recommended, sample_size, time_period, signal_consistency)
- what_it_means (JSONB: why_change_happened, benchmark, why_analysis, scope_customers, scope_revenue)
- so_what (JSONB: direction, expected_vs_unexpected, kpi_impact)
- generated_at
- stale (boolean, default false)

*signal_shares*
- id (UUID, Primary Key)
- signal_id (Foreign Key)
- shared_by (Foreign Key to profiles)
- share_type ('copy', 'slack', or 'email')
- destination (string, nullable)
- summary_text (text)
- created_at


### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/signals | GET | List signals (supports ?saved=true filter) |
| /api/signals/[id] | GET | Get signal detail |
| /api/signals/[id]/save | POST | Save signal |
| /api/signals/[id]/save | DELETE | Unsave signal |
| /api/signals/[id]/interpret | GET | Get interpretation |
| /api/signals/[id]/share | POST | Generate share summary |
| /api/signals/[id]/share/send | POST | Send share |
| /api/upload | POST | Upload file |


### Service Layer

| Service | Location | Responsibility | Database |
|---------|----------|----------------|----------|
| signals-service.ts | `/lib/signals-service.ts` | Query and manage signals | Neon |
| signal-discovery-service.ts | `/lib/signal-discovery-service.ts` | Auto-detect signals from uploaded data | In-memory |
| signal-calculation-service.ts | `/lib/signal-calculation-service.ts` | Calculate signal values from raw data | In-memory |
| signal-intelligence-service.ts | `/lib/signal-intelligence-service.ts` | Rank and prioritize signals by user context | Neon |
| staging-service.ts | `/lib/staging-service.ts` | Stage uploads for cross-source signal discovery | Neon |
| interpretation-service.ts | `/lib/interpretation-service.ts` | Generate AI interpretations (L3) | Neon + AI Gateway |
| user-context-service.ts | `/lib/user-context-service.ts` | Manage user preferences, goals, KPIs | Neon |
| share-service.ts | `/lib/share-service.ts` | Create and send share summaries | Neon |
| role-taxonomy.ts (NEW) | `/lib/role-taxonomy.ts` | Define roles, functions, and default signals by role | In-memory |


#### signals-service.ts

**Location:** `/lib/signals-service.ts`
**Database:** Neon (signals table)

**Purpose:** Query signals for list and detail views. Manage saved signals. Uses Neon directly via `@neondatabase/serverless`.

**Key Functions:**

| Function | Description |
|----------|-------------|
| getSignals(organizationId) | Get all signals for org with deduplication (DISTINCT ON name) |
| getSignalById(signalId) | Get signal detail with latest value |
| getSavedSignalIds(userId) | Get user's saved signal IDs |
| saveSignal(userId, signalId) | Add to user's saved list |
| unsaveSignal(userId, signalId) | Remove from saved list |

**How it works:**
1. Query signals from Neon with `DISTINCT ON (name)` to deduplicate
2. Filter by organization_id (from user_context, set during onboarding)
3. Parse absolute_value as latest_value
4. Return SignalWithData[] array

**Debug Query:**
```sql
SELECT DISTINCT ON (name) * FROM signals 
WHERE organization_id = 'your-org-id' ORDER BY name, updated_at DESC
```


#### signal-calculation-service.ts

**Location:** `/lib/signal-calculation-service.ts`
**Database:** In-memory (runs at upload time, results stored in signals table)

**Purpose:** Calculate actual signal values from raw uploaded data. Handles column name resolution, calculation type detection, value computation, trend analysis, and formatting.

**Key Functions:**

| Function | Description |
|----------|-------------|
| calculateSignal(signalDef, rows, matchedFields) | Main entry - returns CalculationResult with value, trend, metadata |
| detectCalculationType(signalId, signalName) | Auto-detect: count, sum, average, rate, or latest |
| resolveColumnName(rows, canonicalName) | Map canonical field name to actual column in data |
| findNumericColumn(rows) | Find first column with numeric values |
| findColumnByPattern(rows, patterns) | Find column matching any of the patterns |
| calculateTrend(values) | Compare first/second half to determine trend direction |
| formatSignalValue(value, type) | Format as currency ($1.2M), percentage (45.2%), or number |

**Calculation Types:**

| Type | Signals | Formula | Example |
|------|---------|---------|---------|
| COUNT | tickets, leads, deals | Count of rows | 53 deals |
| SUM | revenue, pipeline, value | Sum of numeric column | $1,234,567 |
| AVERAGE | CSAT, NPS, resolution time | Mean of values | 4.2 score |
| RATE | win rate, conversion, churn | (positive / total) * 100 | 32.5% |
| LATEST | MRR, headcount, ARR | Most recent value | $45,000 |

**How it works:**
1. Receive signal definition, raw rows, and matched field names
2. Detect calculation type from signal ID/name patterns
3. Resolve canonical field names to actual column names in data
4. Find appropriate numeric column (matched or fallback)
5. Apply calculation method (count/sum/avg/rate/latest)
6. Calculate trend by comparing first vs second half of values
7. Format value based on signal type (currency/percent/number)
8. Return result with full metadata for "How is this calculated?" UI

**Column Resolution:**
The key challenge is that `matchedFields` contains canonical names (e.g., "deal_value") but `rows` contains original column names (e.g., "Deal Amount"). Resolution works by:
1. Direct match check
2. Normalized comparison (lowercase, remove spaces/underscores)
3. Substring matching for partial matches

**Debug Points:**
- Log `resolveColumnName()` output to verify column mapping
- Check `detectCalculationType()` returns expected type
- Verify numeric values are being parsed with `parseFormattedNumber()`

**Example Usage:**
```typescript
import { calculateSignal } from "@/lib/signal-calculation-service"

const result = calculateSignal(signalDef, rows, matchedFields)
// result = {
//   value: 1234567,
//   formattedValue: "$1.23M",
//   trend: "increasing",
//   trendPercentage: 12.5,
//   dataPoints: 53,
//   calculationType: "sum",
//   calculationMethod: "Sum (Monetary)",
//   formula: "Sum of all amount/value fields",
//   usedColumn: "Deal Amount"
// }
```


#### signal-discovery-service.ts

**Location:** `/lib/signal-discovery-service.ts`
**Database:** In-memory (no persistence, runs at upload time)

**Purpose:** Auto-detect which signals can be calculated from uploaded data by matching column names to a comprehensive signal library.

**Key Functions:**

| Function | Description |
|----------|-------------|
| discoverSignals(columns, rows) | Main entry - returns SignalDiscoveryResult |
| normalizeFieldName(columnName) | Map column to canonical field name via FIELD_ALIASES |
| detectColumnType(values) | Infer type: number, date, boolean, string |
| detectColumns(rows) | Analyze parsed data, return DetectedColumn[] |
| detectSourceType(fileName, columns) | Identify source: zoho_crm, hubspot, salesforce, etc. |

**How it works:**
1. Parse uploaded file columns
2. Normalize column names using FIELD_ALIASES (e.g., "Close Date" → "close_date")
3. Match normalized names against SIGNAL_DEFINITIONS (200+ signal types)
4. Return calculable signals with confidence scores
5. Group into categories: Sales, Customer Success, Support, Marketing, etc.

**Signal Library:** SIGNAL_DEFINITIONS contains 200+ B2B SaaS signals organized by category with required fields, formulas, and benchmarks.

**Debug Points:**
- Check column name normalization: `normalizeFieldName("Deal Amount")` should return "deal_value"
- Check field matching: Look at `matchedFields` in SignalRequirement


#### signal-intelligence-service.ts

**Location:** `/lib/signal-intelligence-service.ts`
**Database:** Neon (signals, user_context tables)

**Purpose:** Rank and prioritize signals based on user context (role, goals, KPIs). Makes signals personalized.

**Key Functions:**

| Function | Description |
|----------|-------------|
| getRankedSignals(userId, limit?) | Get signals ranked by relevance to user |
| calculateSignalScore(signal, userContext) | Score 0-100 based on alignment |
| getSignalRecommendations(userId) | Suggest signals user should track |

**How it works:**
1. Fetch user_context (role, seniority, goals, tracked_kpis)
2. Fetch signals for user's organization
3. Score each signal: goal alignment (40%), KPI relevance (30%), trend significance (20%), recency (10%)
4. Return sorted by score descending

**Debug Query:**
```sql
SELECT * FROM user_context WHERE user_id = 'your-user-id'
```


#### staging-service.ts

**Location:** `/lib/staging-service.ts`
**Database:** Neon (staged_uploads, staged_fields, signal_opportunities, field_availability)

**Purpose:** Stage uploaded data to enable cross-source signal discovery. When you upload file A with "leads" and file B with "revenue", the staging layer can find signals that require BOTH sources.

**Key Functions:**

| Function | Description |
|----------|-------------|
| stageUpload(file, userId, orgId) | Create staged_upload record |
| stageFields(uploadId, columns, rows) | Normalize and store field mappings |
| discoverCrossSourceSignals(userId) | Find signals calculable from multiple sources |
| getFieldAvailability(userId) | Get all available fields across uploads |

**How it works:**
1. When file uploaded, create `staged_uploads` record
2. Normalize columns → `staged_fields` with canonical names
3. Update `field_availability` index (which fields exist across all uploads)
4. Check SIGNAL_DEFINITIONS for signals requiring fields from multiple sources
5. Create `signal_opportunities` for calculable and "unlockable" signals

**Cross-Source Discovery:**
- Example: CAC = Marketing Spend (file A) ÷ New Customers (file B)
- Staging layer tracks which fields exist and surfaces "unlockable" signals

**Debug Queries:**
```sql
-- What fields are available for this user?
SELECT * FROM field_availability WHERE user_id = 'your-user-id'

-- What signal opportunities exist?
SELECT * FROM signal_opportunities WHERE user_id = 'your-user-id' AND is_calculable = true
```


#### interpretation-service.ts

**Location:** `/lib/interpretation-service.ts`
**Database:** Neon (signal_interpretations) + AI Gateway (openai/gpt-4o-mini)

**Purpose:** Generate AI-powered interpretations (L3 - Synthesis layer) with What We Found, What It Means, So What.

**Key Functions:**

| Function | Description |
|----------|-------------|
| getInterpretation(signalId) | Return cached interpretation or null |
| generateInterpretation(signalId, context) | Call AI to generate new interpretation |
| buildPrompt(signal, userContext) | Create prompt with signal data and user goals |

**How it works:**
1. Check cache (signal_interpretations table)
2. If miss: gather context (signal data, user goals, org KPIs)
3. Build prompt with structured output schema
4. Call AI Gateway: `openai/gpt-4o-mini`
5. Parse response into: what_we_found, what_it_means, so_what
6. Cache in database

**API Endpoint:** `GET /api/signals/[id]/interpretation`

**Debug Points:**
- Check interpretation cache: `SELECT * FROM signal_interpretations WHERE signal_id = 'xxx'`
- Check AI Gateway response in network tab


#### user-context-service.ts

**Location:** `/lib/user-context-service.ts`
**Database:** Neon (user_context table)

**Purpose:** Manage user preferences, role, goals, and KPIs. Set during onboarding, used by intelligence service for ranking.

**Key Functions:**

| Function | Description |
|----------|-------------|
| getUserContext(userId) | Get user's context (role, goals, preferences) |
| updateUserContext(userId, data) | Update context fields |
| getUserGoals(userId) | Get user's tracked goals |
| updateUserGoals(userId, goals) | Update goals array |

**How it works:**
1. user_context created during onboarding with: role, department, seniority, goals, onboarding_completed
2. organization_id links user to their org
3. Intelligence service reads context to personalize signal ranking

**Debug Query:**
```sql
SELECT * FROM user_context WHERE user_id = 'your-user-id'
```


#### upload-service.ts

**Purpose:** Parse uploaded files, register data sources, calculate signal values (including derived signals).

**Key Functions:**

| Function | Description |
|----------|-------------|
| processUpload(file, userId, orgId) | Main entry point - orchestrates full flow |
| parseFile(file) | Read .xlsx or .csv, return rows with schema |
| registerDataSource(file, orgId) | Create/update data source with detected schema |
| detectSignalMappings(schema, existingSignals) | Suggest which columns map to which signals |
| calculateSignalValues(orgId, period) | Recalculate all signals for period (handles derived signals) |
| calculateStatus(signal, history) | Determine signal status from changes |

**How it works:**
1. Parse file (SheetJS for xlsx, PapaParse for csv), detect schema
2. Register as data source with detected columns and types
3. Store raw data in raw_data table (preserves original for recalculation)
4. For direct signals: extract values from mapped columns
5. For calculated signals: gather inputs from all sources, apply formula
6. Calculate status based on change % and trend direction
7. Mark existing interpretations as stale, trigger regeneration

**Signal Calculation Modes:**

| Mode | When Used | Process |
|------|-----------|---------|
| Direct | Signal maps to single column | Extract value directly from column |
| Calculated (Single) | Signal derived from multiple columns in one file | Apply formula to columns in same file |
| Calculated (Multi) | Signal derived from multiple sources | Gather data from all sources, then apply formula |
| Auto-detect | New upload, no existing signal definition | Infer signal names from column headers |

**Status Logic:**

| Condition | Status |
|-----------|--------|
| >20% change in bad direction OR bad trend 3+ periods | needs_attention |
| >10% change in good direction | opportunity |
| 5-10% change in good direction | improved |
| <5% change either direction | steady |
| No previous data | new |


#### interpretation-service.ts

**Purpose:** Generate AI interpretations (What It Means, So What) and cache them.

**Key Functions:**

| Function | Description |
|----------|-------------|
| getInterpretation(signalId) | Return cached interpretation or null |
| generateInterpretation(signalId) | Call AI to generate new interpretation |
| markInterpretationsStale(signalIds) | Flag for regeneration after upload |
| regenerateStaleInterpretations(orgId) | Background job to regenerate |

**How it works:**
1. Gather context: signal data, 6-period history, related signals that changed, org KPIs
2. Build prompt with signal values, history, correlations, and KPI context
3. Call AI (gpt-4o-mini) with structured output schema
4. Store interpretation in database (JSONB for each layer)
5. Return structured interpretation with what_we_found, what_it_means, so_what

**Regeneration Triggers:**
- New data uploaded (immediate)
- Weekly cron if no upload
- Admin force regenerate
- User KPI changes

**Cost Controls:** Batch processing (5 at a time), 200ms delay, weekly cap of 100 per org


#### share-service.ts

**Purpose:** Generate shareable summaries and send via email or in-app.

**Key Functions:**

| Function | Description |
|----------|-------------|
| generateShareSummary(signalId, options) | Create formatted text/html |
| shareToUser(signalId, fromUserId, toUserId) | In-app notification |
| shareViaEmail(signalId, fromUserId, email) | Send via Resend |
| copyToClipboard(signalId, options) | Return text for clipboard |

**Share Options:**
- include_metric: value and change %
- include_meaning: "What It Means" summary
- include_kpi_impact: "So What" KPI impact
- format: 'short' (clipboard) or 'detailed' (email)

**How it works:**
1. Fetch signal data and interpretation
2. Build summary text based on options (short or detailed format)
3. For in-app: create notification record
4. For email: send via Resend with HTML template
5. Log share to signal_shares table


#### role-taxonomy.ts (NEW - v1.3)

**Location:** `/lib/role-taxonomy.ts`
**Database:** In-memory (static role definitions)

**Purpose:** Define role taxonomy with 8 functions, 25+ specific roles, and associated signals based on SIGNAL_CATALOG.

**Structure:**
```
Functions (8):
  ├── Revenue & Finance (CEO, CFO, Controller, Analyst) 
  ├── Sales (VP Sales, Sales Manager, Account Executive, Sales Ops)
  ├── Marketing (VP Marketing, Demand Gen, Product Marketing, Growth)
  ├── Product (VP Product, PM, Designer, CTO)
  ├── Customer Success (VP CS, CSM, CSM Manager, Onboarding)
  ├── Support (Support Lead, Support Agent, Support Engineer)
  ├── Operations (COO, Revenue Ops, HR)
  └── Finance (Controller, Analyst)
```

**Each Role Includes:**
- label (e.g., "VP Customer Success")
- description (e.g., "Responsible for retention, NPS, growth")
- seniority_level ('executive', 'manager', 'individual_contributor')
- signals: Array of signal IDs/names prioritized for this role by urgency level
- responsibilities: Key job functions

**Key Functions:**
| Function | Description |
|----------|-------------|
| getRolesByFunction(function) | Get all roles in a department |
| getSignalsByRole(role) | Get signals prioritized for a role |
| getFunctionLabel(function) | Get human-readable function name |
| getAllFunctions() | Get all 8 business functions |

**How it works:**
1. Used during onboarding to present role choices
2. Helps pre-populate role-specific signals after signup
3. Ensures signal recommendations match user context
4. Tied to SIGNAL_CATALOG for consistency


### Onboarding & Organization API Endpoints (NEW - v1.3)

**Endpoint: POST /api/organization/check-pending-invites**
- **Purpose:** Check if user has pending invitations
- **Auth:** Requires valid user session
- **Response:**
  ```json
  {
    "hasPendingInvite": boolean,
    "invite": {
      "id": uuid,
      "token": string,
      "organizationId": uuid,
      "organizationName": string,
      "invitedRole": string,
      "expiresAt": timestamp
    }
  }
  ```
- **Usage:** Called after signup to auto-detect organization join flow

**Endpoint: POST /api/organization/accept-invite**
- **Purpose:** Accept organization invite and add user to org
- **Auth:** Requires valid user session
- **Request:**
  ```json
  {
    "token": string,
    "role": string (optional, can override)
  }
  ```
- **Response:**
  ```json
  {
    "success": boolean,
    "organizationId": uuid,
    "organizationName": string
  }
  ```
- **Side effects:** 
  - Updates organization_invites.status = 'accepted'
  - Adds user to organization_members
  - Creates user_context record with organization_id

**Endpoint: POST /api/user/complete-onboarding**
- **Purpose:** Complete onboarding (role selection + welcome)
- **Auth:** Requires valid user session
- **Request:**
  ```json
  {
    "role": string,
    "function": string,
    "seniority_level": string
  }
  ```
- **Response:**
  ```json
  {
    "success": boolean,
    "organizationId": uuid,
    "message": string
  }
  ```
- **Side effects:**
  - Creates/updates user_context with role, department, seniority_level
  - Sets onboarding_completed = true
  - Auto-creates default organization if not part of invited org
  - Creates profiles record if doesn't exist

**Endpoint: GET /api/user/onboarding-status**
- **Purpose:** Check if user has completed onboarding
- **Auth:** Requires valid user session
- **Response:**
  ```json
  {
    "onboardingCompleted": boolean,
    "onboardingStep": number,
    "organizationId": uuid,
    "organizationName": string,
    "role": string,
    "department": string
  }
  ```
- **Usage:** Called on login/signup to determine redirect path




**Model:** openai/gpt-4o-mini via Vercel AI Gateway

**Regeneration Strategy (MVP - Cost Optimized):**
- Regenerate interpretations ONLY when:
  1. New data is uploaded (triggered by upload completion)
  2. Weekly scheduled refresh (if no upload that week)
- Do NOT regenerate on-demand or per-view
- Cache interpretations in signal_interpretations table
- Mark stale = true on new upload, regenerate in background
- No TTL-based expiration for MVP


### Component Structure

**signals/**
- signals-list.tsx - Main list view
- signal-card.tsx - Individual signal in list
- signal-filter.tsx - All / My Signals toggle
- signal-status-group.tsx - Grouped section (Needs Attention, etc.)

**signal-detail/**
- signal-detail-page.tsx - Full detail view
- signal-header.tsx - Name, value, save button
- signal-trend-chart.tsx - Sparkline visualization
- signal-layer.tsx - Reusable section (What/Means/So What)
- signal-actions.tsx - Share, Add Learning buttons

**upload/**
- upload-modal.tsx - Upload flow container
- upload-dropzone.tsx - File picker
- upload-results.tsx - Post-upload signal list

**share/**
- share-sheet.tsx - Share modal
- share-preview.tsx - Summary preview
- share-options.tsx - Destination buttons

**common/**
- trend-badge.tsx - Styled change badge
- status-indicator.tsx - Red/green/gray dot
- empty-state.tsx - No data states


### Dev-Only Test Page

**Purpose:** Allow testing of services (upload, signals, interpretation) without authentication overhead. For internal QA and rapid iteration.

**Location:** `/app/test/page.tsx` - Only renders when `NODE_ENV === 'development'`

**Access:** Direct URL `localhost:3000/test` (no nav link, dev-only)

**Sections:**

| Section | Features |
|---------|----------|
| Organization Selector | Dropdown to select any org for testing |
| Upload Tester | Upload real client data files (drag-drop or browse), see parsed columns, see detected signals, see raw upload result, data saved to selected org |
| Signals Viewer | View all signals for selected org, see status grouping, click to view detail |
| Interpretation Tester | Select a signal, trigger interpretation generation, see raw AI prompt, see raw AI output, see formatted interpretation |
| Full Flow Simulator | Upload real file or use sample → view signals → generate interpretations → see results |

**Upload Tester Details:**

| Feature | Description |
|---------|-------------|
| File Input | Drag-drop zone OR file browser, accepts .xlsx and .csv |
| Real Data Support | Upload actual client files (e.g., Zoho exports, HubSpot reports) |
| Organization Target | Data saved to selected org in database (not ephemeral) |
| User Attribution | Select which user to attribute the upload to |
| Column Preview | Shows detected columns and auto-mapped fields |
| Signal Preview | Shows signals that will be created/updated before saving |
| Raw Output | Shows full upload result JSON for debugging |
| Upload History | Shows recent test uploads with option to delete/rollback |

**Test Page Layout:**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  DEV TEST PAGE                                     [Org: Acme Corp ▼]        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │  UPLOAD TESTER      │  │  SIGNALS VIEWER     │  │  INTERPRETATION     │  │
│  │                     │  │                     │  │                     │  │
│  │  [Drop file here]   │  │  Needs Attention (2)│  │  Signal: [Select ▼] │  │
│  │                     │  │  • CSAT Score       │  │                     │  │
│  │  Parsed columns:    │  │  • Response Time    │  │  [Generate]         │  │
│  │  • date             │  │                     │  │                     │  │
│  │  • metric           │  │  Improved (1)       │  │  Raw Prompt:        │  │
│  │  • value            │  │  • Resolution Rate  │  │  ┌───────────────┐  │  │
│  │                     │  │                     │  │  │ You are...    │  │  │
│  │  Detected signals:  │  │  Steady (3)         │  │  └───────────────┘  │  │
│  │  • CSAT (87%)       │  │  • NPS              │  │                     │  │
│  │  • Response (4.2h)  │  │  • Ticket Volume    │  │  Raw Output:        │  │
│  │                     │  │  • Escalation Rate  │  │  ┌───────────────┐  │  │
│  │  [Process Upload]   │  │                     │  │  │ { "what_we... │  │  │
│  │                     │  │  [Refresh]          │  │  └───────────────┘  │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  FULL FLOW SIMULATOR                                                  │  │
│  │                                                                       │  │
│  │  [Run Full Flow with Sample Data]                                     │  │
│  │                                                                       │  │
│  │  Steps:                                   Status:                     │  │
│  │  1. Upload sample.xlsx                    ✓ Complete (6 signals)      │  │
│  │  2. Calculate signal status               ✓ Complete                  │  │
│  │  3. Generate interpretations              ⏳ In progress (3/6)        │  │
│  │  4. Display results                       ○ Pending                   │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Security:**
- Route returns 404 in production (`NODE_ENV !== 'development'`)
- No authentication required in dev mode
- All database operations use real data (test orgs recommended)

**Test Data Options:**

| Option | Description |
|--------|-------------|
| Real Client Files | Upload actual .xlsx/.csv exports from Zoho, HubSpot, etc. Data is saved to the selected org. |
| Sample Files | Pre-built test files for quick testing |

**Sample Test Files (for convenience):**
- `/test-data/sample.xlsx` - 6 signals, 4 weeks of data
- `/test-data/sample-large.xlsx` - 20 signals, 12 weeks of data
- `/test-data/sample-errors.xlsx` - File with intentional errors for testing

**Data Management:**
- All uploads persist to database (real operations)
- Upload history shows all test uploads
- Delete option removes signals and data points created by that upload
- Recommended: Create a "Test Org" for safe experimentation

---

## G. MVP SCOPE

### In Scope (Build First)

Core features that enable the three "How We'll Win" pillars:

| Feature | Priority | User | Pillar |
|---------|----------|------|--------|
| Upload file and detect signals | P0 | Manager | Team-led, easy integrations |
| View signal list (grouped by status) | P0 | Both | Speed to surface opportunities |
| Signal detail with What/Means/So What | P0 | Both | Exec-first, build intuition |
| Save/unsave signals | P0 | Executive | Exec-first, personalized view |
| "My Signals" filter | P0 | Executive | Speed to what matters |
| Share via copy | P0 | Manager | Justify decisions to others |
| Role selection (exec/manager) | P0 | Both | Context-aware experience |


### MVP Build Status

**Last Updated:** January 2026

| Feature | Status | Location | Notes |
|---------|--------|----------|-------|
| **Core Infrastructure** | | | |
| Database schema (signals, data_points, profiles, orgs) | BUILT | Supabase | Tables exist, need RLS review |
| Authentication (Supabase Auth) | BUILT | `/app/auth/*` | Login, signup, password reset |
| Protected routes | BUILT | `/app/(protected)/*` | Auth middleware working |
| **Upload Flow** | | | |
| Upload page UI | BUILT | `/app/(protected)/upload/page.tsx` | Drag-drop, file picker |
| CSV/XLSX parsing | BUILT | `/lib/csv-parser.ts`, `/lib/upload-service.ts` | SheetJS + PapaParse |
| Column auto-detection | BUILT | `/lib/upload-service.ts` | Detects date, name, value columns |
| Signal creation from upload | BUILT | `/lib/upload-service.ts` | Creates/updates signals |
| Upload history | BUILT | `upload_history` table | Logged per upload |
| **Signals List** | | | |
| Signal list page | BUILT | `/app/(protected)/signals/page.tsx` | Card-based swipe UI |
| Signal filtering (category, trend) | BUILT | `/components/signals-page-client.tsx` | Dropdowns working |
| Status grouping (needs_attention, etc.) | BUILT | `/components/signals-page-client.tsx` | Grouped view with toggle |
| "Focus on most important" button | BUILT | `/components/signals-page-client.tsx` | Sorts by change magnitude |
| View mode toggle (card/grouped) | BUILT | `/components/signals-page-client.tsx` | Switch between swipe and list views |
| **Signal Detail** | | | |
| Signal detail page | BUILT | `/app/(protected)/signals/[id]/page.tsx` | Shows value, trend, chart |
| Trend chart (90-day) | BUILT | `/components/signal-detail-client.tsx` | Recharts line chart |
| 90-day average calculation | BUILT | `/lib/signals-service.ts` | `calculate90DayAverage()` |
| AI interpretation (What/Means/So What) | BUILT | `/components/signal-detail-card.tsx` | Displays in synthesis layer |
| Interpretation API | BUILT | `/app/api/signals/[id]/interpretation/route.ts` | GET endpoint |
| **Save/Unsave** | | | |
| Save signal API | BUILT | `/app/api/signals/save/route.ts` | POST/DELETE endpoints |
| Unsave signal API | BUILT | `/app/api/signals/save/route.ts` | DELETE endpoint |
| "My Signals" filter | BUILT | `/components/signals-page-client.tsx` | Toggle button in filter bar |
| saved_signals table | BUILT | `/scripts/create-saved-signals.sql` | DB table with indexes |
| **Sharing** | | | |
| Share via copy (clipboard) | BUILT | `/components/share-dialog.tsx` | Copy link working |
| Share summary generation | BUILT | `/lib/share-service.ts` | Generates formatted text |
| Share via email | PARTIAL | `/lib/share-service.ts` | Service built, needs Resend setup |
| **Profile & Role** | | | |
| Profile page | BUILT | `/app/(protected)/profile/page.tsx` | Full profile editing |
| Role selection | BUILT | `/app/(protected)/profile/page.tsx` | Dropdown with exec/manager roles |
| KPI selection per role | BUILT | `/lib/kpi-templates.ts` | Role-based KPI suggestions |
| Organization management | BUILT | `/lib/organization-service.ts` | Create org, invite users |
| **Admin** | | | |
| Admin dashboard | BUILT | `/app/admin/*` | Multiple admin pages |
| Master admin role check | BUILT | `/lib/admin-roles.ts` | Email-based check |
| **Dev Tools** | | | |
| Dev test page | BUILT | `/app/test/page.tsx` | Upload, signals, interpretation testing |
| Test API endpoints | BUILT | `/app/api/test/*` | Org, user, signal, upload APIs |

**Legend:**
- BUILT = Feature is implemented and functional
- PARTIAL = Core functionality exists but needs completion
- NOT BUILT = Feature not yet implemented

**Priority Gaps (Completed):**

| Gap | Status | Notes |
|-----|--------|-------|
| Save/unsave signals | DONE | API + UI complete |
| "My Signals" filter | DONE | Toggle in filter bar |
| AI interpretation in UI | DONE | Displays in synthesis layer |
| Status grouping in list UI | DONE | Grouped view with toggle |

**Remaining Gaps:**

| Gap | Priority | Effort | Blocker? |
|-----|----------|--------|----------|
| Resend email setup | P2 | 1-2 hours | No - copy works for MVP |
| Signal detail page interpretation | P2 | 1-2 hours | No - works in card view |


### Out of Scope (Post-MVP)

| Feature | Reason |
|---------|--------|
| Slack integration for sharing | Adds OAuth complexity; copy works for MVP |
| Email delivery for sharing | Adds infrastructure; users can paste into email |
| Goals and Decisions tracking | Valuable but adds onboarding friction |
| Team/organization management | Admin features can wait |
| Multiple data source types | Start with generic spreadsheet (like Stripe starts simple) |
| Historical data import | Start fresh with weekly rhythm |
| Mobile native app | Web-first, responsive design for speed |


### MVP Timeline Estimate

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1: Database + Backend | 3-4 days | New tables, services, API routes |
| Phase 2: Frontend (Core) | 4-5 days | Signal list, detail, save |
| Phase 3: Frontend (Upload + Share) | 3-4 days | Upload flow, share sheet |
| Phase 4: Polish + Testing | 2-3 days | Edge cases, error states |
| **Total** | **Approximately 2 weeks** | Functional MVP |

---

## H. DECISIONS (Formerly Open Questions)

1. **Data source flexibility:** MVP uses manual CSV/XLSX upload as a workaround. Goal is to integrate with Zoho, HubSpot, and other platforms as soon as practically possible.

2. **Interpretation quality:** Master Admin reviews AI interpretations via "AI Review" section in admin panel. Sample interpretations displayed for QA before clients see them.

3. **Benchmark data:** Benchmarks come from AI analysis (industry knowledge baked into prompts). No separate benchmark data source for MVP.

4. **Sharing without Slack:** Copy-to-clipboard is sufficient for MVP. Slack integration is post-MVP.

5. **Organization size:** Max team size for MVP is approximately 100 users. Sharing is to individual users or to whoever has saved the signal (not broadcast to channels).

6. **Retention mechanics:** In-app and email prompts, personalized based on key valuable behaviors. See Retention Plan below.

---

## I. APPENDIX

### User Workflow Diagrams

**Executive Weekly Flow:**
Open App > My Signals (3-5 saved) > See "Needs Attention" > Tap to explore > Understand context > Prepared for 1:1

**Manager Weekly Flow:**
Export from tool > Upload to Camino > See what changed > Explore problems > Share to VP > Share win to team


### Competitive Landscape

| Competitor | Strength | Weakness | Camino Differentiation |
|------------|----------|----------|------------------------|
| Tableau/PowerBI | Powerful visualization | Complex, expensive, analyst-first | Exec-first, builds intuition, no setup |
| Google Sheets | Familiar, flexible | Manual analysis, slow to insight | Speed to opportunities in seconds |
| Databox | Dashboard aggregation | Pull-based, still requires interpretation | Surfaces opportunities, explains "so what" |
| Geckoboard | Simple dashboards | Display only, no analysis | Drives decisions, connects to goals |

**Our edge:** Team-led setup (like Stripe) + Exec-first insights (unlike analyst tools) + Speed to opportunities (mobile-first, simplified signals)


### Glossary

| Term | Definition |
|------|------------|
| Signal | A metric or KPI extracted from uploaded data that indicates an opportunity or risk |
| Interpretation | AI-generated explanation of what a signal means and its impact on KPIs |
| Period | Time range for a data upload (typically weekly) |
| Saved Signal | A signal marked by a user for quick access to build intuition over time |
| Needs Attention | Status indicating a risk that may require action |
| Opportunity | Status indicating a positive trend worth capitalizing on |


### Retention Behaviors (Hypothesis)

**Executive:**
1. Save signals (first time) - personalize for speed
2. Explore signal (ongoing) - build intuition, find opportunities

**Manager:**
1. Upload file (ongoing) - team-led data contribution
2. View signals (ongoing) - speed to see what changed
3. Explore signal (ongoing) - understand opportunities and risks
4. Share signal to manager and team (ongoing) - justify decisions, align team

The retention loop is: **Data in (team) > Opportunities surfaced (speed) > Decisions made (exec intuition) > Results shared (justification) > Repeat**


### Retention Plan

**Goal:** Drive weekly active usage through personalized prompts that reinforce valuable behaviors.

**Prompt Channels:**

| Channel | Use Case | Timing |
|---------|----------|--------|
| In-App | Contextual nudges during active session | Real-time |
| Email | Re-engagement and weekly summaries | Scheduled |

**Key Valuable Behaviors to Drive:**

| User Type | Behavior | Why It Matters |
|-----------|----------|----------------|
| Manager | Upload weekly data | Keeps signals fresh, creates habit |
| Manager | Share signal to exec | Demonstrates value, creates exec dependency |
| Manager | Explore flagged signals | Deepens understanding, finds insights |
| Executive | Save signals | Personalizes experience, speeds future visits |
| Executive | Check My Signals weekly | Builds intuition, creates habit |
| Executive | Drill into flagged signals | Engages with depth, validates usefulness |

**In-App Prompts:**

| Trigger | Prompt | Target User |
|---------|--------|-------------|
| First login | "Save 3-5 signals you care about to build your personal view" | Executive |
| No saved signals | "Star signals to see them first when you return" | Executive |
| Signal flagged | "Response Time needs attention - tap to understand why" | Both |
| After upload | "Great! 2 signals need attention this week" | Manager |
| 7 days since upload | "Your signals are getting stale - upload this week's data" | Manager |
| Signal improved | "CSAT is up 12% - share this win with your team?" | Manager |
| New user in org | "Welcome! Your team has uploaded 6 signals - explore them" | Both |

**Email Prompts:**

| Trigger | Subject | Content | Target User |
|---------|---------|---------|-------------|
| Weekly (Monday AM) | "Your weekly signals summary" | Top 3 signals needing attention, top improvement | Executive |
| Weekly (Monday AM) | "Time to upload this week's data" | Reminder with one-click link to upload | Manager |
| 3 days no login | "2 signals need your attention" | Personalized based on saved signals | Executive |
| 7 days no upload | "Your signals are 7 days old" | Reminder that data is stale | Manager |
| Signal shared | "{Manager} shared a signal with you" | Link directly to signal | Executive |
| First signal flagged | "Your first alert: {Signal} needs attention" | Explain what flagged means, CTA to view | Both |

**Personalization Rules:**

1. Only prompt about signals user has saved (exec) or uploaded (manager)
2. Frequency cap: Max 2 emails per week, max 3 in-app prompts per session
3. Time optimization: Send emails based on user's typical active hours
4. Progress messaging: Celebrate streaks ("4 weeks of uploads!")
5. Silence when active: No prompts if user is already engaged that week

**Measurement:**

| Metric | Definition | Target |
|--------|------------|--------|
| Prompt open rate (email) | % of emails opened | >40% |
| Prompt action rate | % of prompts that lead to target behavior | >20% |
| Weekly return rate | % of users who return within 7 days | >60% |
| Upload streak | Average consecutive weeks of uploads | >4 weeks |

---

## J. END-TO-END TEST SCENARIOS

Automated E2E tests to validate MVP user stories from an end-user perspective.

### Core User Flows

#### E2E-1: Manager First Upload Flow (US-M1)
**Goal:** Manager can upload data and see signals in under 1 minute

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as manager user | Redirect to /signals or /upload |
| 2 | Navigate to /upload | Drag-drop zone visible |
| 3 | Upload CSV with date + metric columns | Upload progress indicator appears |
| 4 | Wait for processing | Signals detected within 30 seconds |
| 5 | Navigate to /signals | New signals visible in list |
| 6 | Verify signal data | Each signal shows: name, value, trend, change % |

**Assert:** At least 1 signal created with valid data points

---

#### E2E-2: Manager Signal Detail & Interpretation (US-M2, US-M4)
**Goal:** Manager can view signal detail with AI interpretation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as manager | Auth successful |
| 2 | Navigate to /signals | Signals list loads |
| 3 | Click on a signal card | Signal detail view opens |
| 4 | View Data layer | Shows value, unit, trend indicator |
| 5 | Switch to Analysis layer | Shows trend chart with 4+ data points |
| 6 | Switch to Synthesis layer | Loading indicator, then interpretation |
| 7 | Verify "What We Found" | Absolute value + trend statement visible |
| 8 | Verify "What It Means" | Contextual explanation visible |
| 9 | Verify "So What" | KPI impact statement visible |

**Assert:** All 3 interpretation sections render without error

---

#### E2E-3: Manager Share Signal (US-M5)
**Goal:** Manager can share signal summary via clipboard

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to signal detail | Detail view loads |
| 2 | Click Share button | Share dialog opens |
| 3 | Toggle "Include metric" | Checkbox toggles |
| 4 | Toggle "Include meaning" | Checkbox toggles |
| 5 | Toggle "Include impact" | Checkbox toggles |
| 6 | Click "Copy to clipboard" | Success toast appears |
| 7 | Paste clipboard content | Contains formatted signal summary |

**Assert:** Clipboard contains signal name, value, and selected sections

---

#### E2E-4: Executive Save/Unsave Signals (US-E2)
**Goal:** Executive can save and unsave signals for quick access

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as executive user | Auth successful |
| 2 | Navigate to /signals | Signals list loads |
| 3 | Click Save button on signal | Button changes to "Saved" state |
| 4 | Verify bookmark icon | Filled bookmark icon visible |
| 5 | Click Save button again | Button changes to "Save" state |
| 6 | Verify bookmark icon | Outline bookmark icon visible |

**Assert:** saved_signals table reflects save/unsave operations

---

#### E2E-5: Executive My Signals Filter (US-E3)
**Goal:** Executive sees only saved signals when filtering

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as executive | Auth successful |
| 2 | Save 2-3 different signals | All show as saved |
| 3 | Click "My Signals" toggle | Button becomes active |
| 4 | Verify filtered list | Only saved signals displayed |
| 5 | Verify count | Count matches saved signals count |
| 6 | Click toggle again | All signals displayed again |

**Assert:** Filtered list length equals saved signals count

---

#### E2E-6: Status Grouping View (US-E1)
**Goal:** Signals display grouped by status for quick scanning

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /signals | Card view loads by default |
| 2 | Click view mode toggle | Switches to grouped view |
| 3 | Verify "Needs Attention" group | Shows signals with red indicator |
| 4 | Verify "Opportunity" group | Shows signals with amber indicator |
| 5 | Verify "Improved" group | Shows signals with green indicator |
| 6 | Verify "Steady" group | Shows signals with gray indicator |
| 7 | Verify count badges | Each group shows correct count |
| 8 | Click signal in grouped list | Navigates to signal detail |

**Assert:** All status groups render with correct signals

---

### Authentication & Authorization

#### E2E-7: User Registration Flow
**Goal:** New user can create account and access app

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /auth/sign-up | Sign up form renders |
| 2 | Enter email and password | Form accepts input |
| 3 | Submit form | Success message or redirect |
| 4 | Check email (if required) | Confirmation email received |
| 5 | Click confirmation link | Account activated |
| 6 | Login with credentials | Access to protected routes |

**Assert:** User can access /signals after registration

---

#### E2E-8: Protected Routes
**Goal:** Unauthenticated users cannot access protected pages

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Clear auth state | Logged out |
| 2 | Navigate to /signals | Redirect to /auth/login |
| 3 | Navigate to /upload | Redirect to /auth/login |
| 4 | Navigate to /profile | Redirect to /auth/login |
| 5 | Login | Redirect to originally requested page |

**Assert:** All protected routes redirect when unauthenticated

---

### Data Persistence

#### E2E-9: Upload Persistence (US-M3)
**Goal:** Uploaded data persists across sessions

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Upload file with 3 metrics | 3 signals created |
| 2 | Navigate away from upload | Different page loads |
| 3 | Navigate to /signals | All 3 signals visible |
| 4 | Logout | Session cleared |
| 5 | Login again | Auth successful |
| 6 | Navigate to /signals | Same 3 signals still visible |
| 7 | Verify data points | Values match uploaded data |

**Assert:** Data persists in database across sessions

---

### Filters & Navigation

#### E2E-10: Filter Combinations
**Goal:** Multiple filters work together correctly

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /signals | All signals displayed |
| 2 | Select "Needs Attention" status | Only needs_attention signals |
| 3 | Add category filter | Intersection of both filters |
| 4 | Add "My Signals" filter | Only saved + status + category |
| 5 | Clear status filter | Saved + category signals |
| 6 | Clear all filters | All signals displayed again |

**Assert:** Filter count updates correctly with each change

---

### Quick Smoke Test Checklist

| ID | Route | Action | Expected |
|----|-------|--------|----------|
| S1 | `/` | Load page | Landing renders, CTA visible |
| S2 | `/auth/login` | Load page | Form renders, can type |
| S3 | `/auth/sign-up` | Load page | Form renders, can type |
| S4 | `/signals` | Load (authed) | Signals list or empty state |
| S5 | `/signals` | Toggle view | Switches card/grouped |
| S6 | `/signals` | Filter by status | List filters correctly |
| S7 | `/signals` | Toggle My Signals | Shows only saved |
| S8 | `/signals/[id]` | Load detail | Value, chart, actions render |
| S9 | `/signals/[id]` | Switch layers | Data/Analysis/Synthesis toggle |
| S10 | `/upload` | Load page | Drag-drop zone visible |
| S11 | `/upload` | Upload CSV | Processing indicator, success |
| S12 | `/profile` | Load page | Profile form renders |
| S13 | `/profile` | Save changes | Success toast, data persists |

---

### Test Data Requirements

**Sample CSV for Upload Tests:**
```csv
date,CSAT Score,Response Time (hrs),Resolution Rate (%)
2026-01-01,85,4.2,78
2026-01-08,87,3.9,80
2026-01-15,84,4.5,76
2026-01-22,89,3.6,82
2026-01-29,91,3.2,85
```

**Test Users:**
| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Manager | manager@test.com | Test123! | Upload, share tests |
| Executive | exec@test.com | Test123! | Save, filter tests |
| Admin | admin@test.com | Test123! | Admin panel tests |

---

## K. OPEN QUESTIONS

The following questions need answers to move forward with implementation. Please provide your input on each:

### User Experience

**OQ-1: Signal Grouping on Mobile**
Should the mobile view show signals grouped by status (Needs Attention / Opportunity / Steady) with collapsible sections, or as a flat list with status badges? Grouped feels more organized but adds taps. Flat is faster to scan but may overwhelm.

**OQ-2: Default Signal Sort Order**
Within each status group, how should signals be sorted by default?
- A) Alphabetically by name
- B) By magnitude of change (biggest movers first)
- C) By recency of data update
- D) By user's past engagement (most-viewed first)

**OQ-3: First-Time User Onboarding**
What should the first-time executive user experience look like?
- A) Guided tour showing key features
- B) Pre-populated demo signals to explore
- C) Prompt to save signals immediately
- D) Skip onboarding, let them explore

**OQ-4: Empty States**
When there are no signals yet (new organization), what should the user see?
- A) Upload prompt with sample file download
- B) Demo mode with fake data to explore
- C) Setup checklist (connect data, invite team, etc.)

### Data & Signals

**OQ-5: Signal Ownership**
Can a signal have multiple owners, or always exactly one? What happens when the owner leaves the organization?

**OQ-6: Historical Data Import**
If a user uploads 6 months of historical data at once, should we:
- A) Create one signal with 6 months of history
- B) Create weekly signals for each period
- C) Only accept the most recent period

**OQ-7: Duplicate Signal Handling**
If a user uploads a file with a signal name that already exists, should we:
- A) Append new data points to existing signal
- B) Create a new signal with "(2)" suffix
- C) Show conflict resolution UI
- D) Overwrite existing data

**OQ-8: Data Freshness Indicator**
How prominently should we show when data was last updated? Some options:
- A) Subtle timestamp on signal card
- B) "Stale" badge after 7 days
- C) Both, plus email reminder to uploaders

### Signal Definitions & Calculations

**OQ-20: Derived Signal UI**
For signals calculated from multiple columns/sources, how should we let users define the formula?
- A) Simple UI with dropdowns (Column A / Column B)
- B) Excel-like formula editor (=SUM(A)/COUNT(B))
- C) Pre-built templates for common calculations (Rate, Ratio, Average)
- D) Admin-only configuration (not self-service for MVP)

**OQ-21: Multi-Source Signal Timing**
When a signal is derived from multiple data sources and they upload at different times:
- A) Wait until all sources have data for the period before calculating
- B) Calculate with available data, mark as "partial"
- C) Use last known value for missing sources
- D) Show error/warning to user

**OQ-22: Column Mapping Persistence**
When a user uploads a new file, should we:
- A) Remember their last column mappings and auto-apply
- B) Always show mapping UI for confirmation
- C) Auto-apply if schema matches exactly, show UI if different

**OQ-23: Integration Priority**
Which integrations should we prioritize after manual upload?
- A) CRM-first: HubSpot, Salesforce, Zoho CRM
- B) Support-first: Zendesk, Intercom, Freshdesk
- C) Revenue-first: Stripe, ChartMogul, Baremetrics
- D) User's choice (survey/waitlist)

**OQ-24: Signal Definition Versioning**
If a signal's formula or source mapping changes:
- A) Recalculate all historical values
- B) Keep old values, new formula applies going forward
- C) Archive old signal, create new one
- D) Let user choose per change

### Interpretation & AI

**OQ-9: Interpretation Depth**
How much detail should the "What It Means" section include?
- A) 1-2 sentences (quick read)
- B) 3-4 sentences with bullet points (moderate depth)
- C) Full paragraph with supporting data (detailed)

**OQ-10: AI Hallucination Guardrails**
When AI makes a claim about "why" something changed, should we:
- A) Present as fact ("This happened because...")
- B) Hedge with language ("This may be due to...")
- C) Require human review before showing to users

**OQ-11: Related Signals Display**
How should we show related/correlated signals on the signal detail page?
- A) Inline within the interpretation text
- B) Separate "Related Signals" section below
- C) Side panel or expandable drawer
- D) Don't show for MVP

### Sharing & Collaboration

**OQ-12: Share Link Expiration**
If someone copies a link to share a signal, should that link:
- A) Work forever (anyone with link can view)
- B) Expire after 7 days
- C) Require recipient to be in same org
- D) Generate a static snapshot (doesn't update)

**OQ-13: Share Notification**
When someone shares a signal, should the recipient get:
- A) Just the shared text/email (no tracking)
- B) In-app notification + email
- C) In-app notification only
- D) User's choice per share

**OQ-14: Team Visibility**
Should users be able to see which signals their teammates have saved, or is this private?

### Technical & Admin

**OQ-15: Rate Limiting**
What limits should we set on:
- Uploads per day per user: ___
- AI interpretations generated per day: ___
- Emails sent per user per day: ___

**OQ-16: Data Retention**
How long should we keep:
- Raw uploaded files: ___
- Historical data points: ___
- Share history: ___

**OQ-17: Admin Visibility**
What should Master Admin be able to see about user activity?
- A) Everything (full audit log)
- B) Aggregated metrics only (no individual tracking)
- C) Per-user stats without content details

### Pricing & Packaging

**OQ-18: Usage Tiers**
What usage dimensions should we track for potential future monetization?
- Signals created
- Team members
- AI interpretations generated
- Data sources connected
- Something else?

**OQ-19: Trial Experience**
If we have a free trial, what should be limited?
- A) Time-based (14 days full access)
- B) Usage-based (10 signals, 3 users)
- C) Feature-based (no sharing, no AI)

---

**END OF DOCUMENT**
