# User Problems, Use Cases, Tech - 11 Feb 2026


## Problem 1: Too Slow + Hard to Integrate

Current workflow is too slow to surface valuable information. Team members struggle to connect and update data without IT.

### MSS Use Cases:
- Manager sends CSV/XLSX samples from all tools to Camino Admin during onboarding
- Admin uploads and classifies data via 3-question flow (what does each row represent, main metric, date column)
- Admin connects customer's Zoho CRM/Desk via OAuth, triggers sync manually
- Zoho data auto-classified (pre-filled answers for deals, leads, tickets)
- System generates 3+ signals with correct values within hours of onboarding
- Admin re-syncs Zoho or re-uploads CSV when customer wants updated data

### Key Tech Required:
- CSV/XLSX parser (csv-parser.ts, xlsx-parser.ts)
- 3-question classification flow (POST /api/upload/generate)
- Field alias system (~500 aliases for Zoho, HubSpot, Salesforce, Zendesk column names)
- Zoho OAuth (zoho-oauth-service.ts, /api/integrations/oauth/zoho-crm, /api/integrations/oauth/zoho-desk)
- Zoho API client (zoho-api-client.ts, zoho-desk-processor.ts)
- Virtual tab formatter (converts API data to same shape as CSV upload)
- Signal generation pipeline (POST /api/upload/generate)
- Neon database (signals table, org data storage)


## Problem 2: So What?

Lacking "so what" from managers providing data and reporting. Execs get raw numbers but no insight.

### MSS Use Cases:
- Admin inputs discovery call notes into user profile (role, upcoming priorities, signal preferences, business context)
- Each signal gets a 5-section AI interpretation personalised to the user and org
- AI references the user's role, priorities, and org KPIs in its commentary
- Exec reads expanded signal view and gets actionable insight, not just a number

### Key Tech Required:
- User profiles with context fields (upcoming_priorities, signal_preferences in Neon profiles table)
- Admin CP form to input discovery notes into any user's profile
- AI interpretation service (interpretation-service.ts, buildInterpretationPrompt)
- User/org context injection into AI prompt (role, priorities, industry, stage, team size)
- Supabase Auth (user identity, role-based access)


## Problem 3: Overwhelm

Execs find current tools difficult to use. Tools are analyst-first, not exec-first.

### MSS Use Cases:
- Exec sees a simple list of signal cards (name, value, trend direction + percentage)
- Exec taps a signal to read AI analysis in expanded view
- No dashboards, no filters, no configuration required
- Read-only profile -- admin manages everything on their behalf
- Admin creates user accounts and assigns them to orgs

### Key Tech Required:
- Signals page (app/signals/page.tsx) with card-based browse UI
- Signal detail/expanded view with AI interpretation display
- Supabase Auth with role-based access (admin vs exec)
- Admin panel (create user, create org, assign user to org)
- Read-only profile page for non-admin users
- Mobile-first responsive design (exec likely on phone)
