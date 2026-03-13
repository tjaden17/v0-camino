DATABASE ARCHITECTURE: CONSOLIDATED TO SUPABASE

Decision Date: February 2026 (consolidated Feb 27, 2026)

---

HISTORY

The app originally used a dual-database architecture: Supabase for auth and Neon for application data.
This was consolidated into a single Supabase database to fix critical write/read mismatch bugs
and eliminate cross-database sync issues.

See git history for the original DUAL_DATABASE_REASONING.md.

---

CURRENT ARCHITECTURE

Single database: Supabase PostgreSQL

- Auth: Supabase Auth (JWT, sessions, RLS policies)
- Application data: Supabase with Admin client (bypasses RLS for server-side operations)
- Connection pooling: Supabase PgBouncer for serverless workloads

---

WHY WE CONSOLIDATED

1. The dual-path storage service wrote signals to Supabase, but signals-service read from Neon — data was invisible
2. No cross-database referential integrity — orphaned records possible
3. Profiles table duplicated with different columns across databases
4. The Supabase Admin client already bypasses RLS for bulk operations (the original reason Neon was chosen)
5. Eliminating Neon removed 3 env vars, a dependency, and an entire class of sync bugs

---

DATA ACCESS PATTERN

- Auth: `createClient()` from `lib/supabase/server.ts` (user sessions, RLS-aware)
- Data queries: `createAdminClient()` from `lib/supabase/admin.ts` (service role, bypasses RLS)
- Client-side: `createBrowserClient()` from `lib/supabase/client.ts`

---

RELATED DOCS

DUAL_PATH_STORAGE.md — storage flow for file uploads (may reference Neon historically)
USER_FLOW_DATA.md — end-to-end data flow from upload to signal display
