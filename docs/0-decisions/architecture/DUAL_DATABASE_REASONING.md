DUAL DATABASE ARCHITECTURE: SUPABASE + NEON

Decision Date: February 2026

---

THE SPLIT

Supabase — Auth, users, user_context, sessions, organizations, RLS policies
Neon — Signals, raw_data_uploads, raw_data_rows, data_points, signal_interpretations

---

THE CORE LOGIC

Separation of concerns drives this decision.

Supabase was chosen for auth because it handles the entire auth lifecycle out of the box — JWT tokens, RLS policies, magic links, session management. Building this from scratch on Neon would have required significant custom auth work.

Neon was chosen for data because the raw data ingestion — 1000+ row CSV uploads, bulk signal calculations, JSONB storage of original rows — is high-volume and does not need to sit behind Supabase's auth layer. Neon's serverless Postgres scales for this kind of workload without auth overhead on every query.

---

THE EXECUTION FLOW

1. User session is established via Supabase Auth (JWT)
2. Session contains the user's organization_id
3. Signals page reads organization_id from Supabase
4. All signal data is fetched from Neon using organization_id as the key
5. The two databases are joined at the application layer — not at the database level

---

DATA OWNERSHIP BY DATABASE

Supabase:
- users (id, email, role, org_id, kpis)
- organizations (id, name, industry, stage)
- user_context (business goals, priorities, upcoming events)
- sessions (managed by Supabase Auth natively)

Neon:
- raw_data_uploads (file metadata, org_id, upload timestamp)
- raw_data_rows (original CSV rows as JSONB, linked to upload)
- data_points (normalized signal values per org per period)
- signal_interpretations (AI-generated analysis per signal per org)
- column_mappings (saved field alias mappings per org)

---

RELATED DOCS

DUAL_PATH_STORAGE.md — storage flow for file uploads
USER_FLOW_DATA.md — end-to-end data flow from upload to signal display
INTEGRATION_ARCHITECTURE.md — how external tools connect to this structure
