-- Camino Database Setup Script
-- Run this script in your Supabase SQL Editor to set up all required tables
-- Go to: Supabase Dashboard > SQL Editor > New Query > Paste this script > Run

-- FORCE DROP ALL TABLES - More aggressive approach
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all tables in public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- ============================================
-- 1. PROFILES TABLE (without organization_id FK initially)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  organization text,
  industry text,
  role text,
  business_context text,
  organization_id uuid,
  company_stage text,
  team_size text,
  market text,
  competitors text,
  business_model text,
  kpi_1 text,
  kpi_2 text,
  kpi_3 text,
  must_change_password boolean DEFAULT false,
  password_changed_at timestamptz,
  demo_mode boolean DEFAULT false,
  demo_integrations text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 2. ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 3. ORGANIZATION MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'read-only')),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at timestamptz DEFAULT now(),
  joined_at timestamptz,
  UNIQUE(organization_id, user_id)
);

-- Add foreign key constraint for profiles.organization_id after organizations table exists
-- Drop constraint if it exists first, then add it
DO $$ 
BEGIN
  -- Drop the constraint if it exists
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_organization_id_fkey;
  
  -- Add the constraint
  ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;
EXCEPTION
  WHEN undefined_column THEN
    -- If column doesn't exist, do nothing
    NULL;
  WHEN others THEN
    -- Re-raise other errors
    RAISE;
END $$;

-- ============================================
-- 4. SIGNALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text,
  unit text,
  current_value numeric,
  previous_value numeric,
  change_percent numeric,
  trend text CHECK (trend IN ('up', 'down', 'stable', 'increasing', 'decreasing')),
  status text CHECK (status IN ('good', 'warning', 'critical')),
  benchmark_type text CHECK (benchmark_type IN ('internal', 'industry', 'user_defined')),
  benchmark_value numeric,
  owner_id uuid REFERENCES auth.users(id),
  is_demo boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- ============================================
-- 5. DATA POINTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.data_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid REFERENCES public.signals(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  value numeric NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE(signal_id, date)
);

-- ============================================
-- 6. KPI OWNERSHIP TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.kpi_ownership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  signal_id uuid REFERENCES public.signals(id) ON DELETE CASCADE NOT NULL,
  is_primary boolean DEFAULT false,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, signal_id)
);

-- ============================================
-- 7. DECISIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  description text,
  context text,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'decided', 'implemented')),
  target_date date,
  review_date date,
  decided_at timestamptz,
  implemented_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- ============================================
-- 8. DECISION SIGNALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.decision_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id uuid REFERENCES public.decisions(id) ON DELETE CASCADE NOT NULL,
  signal_id uuid REFERENCES public.signals(id) ON DELETE CASCADE NOT NULL,
  snapshot_value numeric,
  snapshot_benchmark numeric,
  snapshot_date date,
  created_at timestamptz DEFAULT now(),
  UNIQUE(decision_id, signal_id)
);

-- ============================================
-- 9. BENCHMARK HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.benchmark_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid REFERENCES public.signals(id) ON DELETE CASCADE NOT NULL,
  benchmark_value numeric NOT NULL,
  benchmark_type text NOT NULL,
  effective_date date NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  notes text
);

-- ============================================
-- 10. DATA QUALITY METRICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.data_quality_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid REFERENCES public.signals(id) ON DELETE CASCADE NOT NULL,
  metric_date date NOT NULL,
  completeness_score numeric CHECK (completeness_score >= 0 AND completeness_score <= 100),
  timeliness_score numeric CHECK (timeliness_score >= 0 AND timeliness_score <= 100),
  accuracy_score numeric CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
  last_update_date date,
  data_point_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(signal_id, metric_date)
);

-- ============================================
-- 11. SIGNAL ANALYTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.signal_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid REFERENCES public.signals(id) ON DELETE CASCADE NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  period_type text CHECK (period_type IN ('day', 'week', 'month', 'quarter', 'year')) NOT NULL,
  avg_value numeric,
  min_value numeric,
  max_value numeric,
  std_dev numeric,
  data_point_count integer DEFAULT 0,
  trend_direction text CHECK (trend_direction IN ('increasing', 'decreasing', 'stable')),
  trend_strength numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(signal_id, period_start, period_end, period_type)
);

-- ============================================
-- 12. SIGNAL ALERTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.signal_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid REFERENCES public.signals(id) ON DELETE CASCADE NOT NULL,
  alert_type text CHECK (alert_type IN ('threshold_breach', 'missing_data', 'quality_issue', 'benchmark_miss')) NOT NULL,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  title text NOT NULL,
  description text,
  is_read boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- ============================================
-- 13. UPLOAD HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.upload_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  filename text,
  uploaded_by uuid REFERENCES auth.users(id),
  status text DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'success', 'partial')),
  signals_created integer DEFAULT 0,
  signals_updated integer DEFAULT 0,
  data_points_added integer DEFAULT 0,
  error_message text,
  errors text[],
  warnings text[],
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 14. INTEGRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('zoho-crm', 'zoho-desk', 'hubspot')),
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamptz,
  account_info jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disconnected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- ============================================
-- 15. SYNC HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.sync_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid REFERENCES public.integrations(id) ON DELETE CASCADE,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  records_synced integer DEFAULT 0,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmark_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Organizations policies
DROP POLICY IF EXISTS "orgs_select_all" ON public.organizations;
DROP POLICY IF EXISTS "orgs_select_members" ON public.organizations;
CREATE POLICY "orgs_select_members"
  ON public.organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = organizations.id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "orgs_insert_own" ON public.organizations;
CREATE POLICY "orgs_insert_own"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "orgs_update_admin" ON public.organizations;
CREATE POLICY "orgs_update_admin"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = organizations.id AND user_id = auth.uid() AND role = 'admin'
    )
  );

-- Signals policies
DROP POLICY IF EXISTS "signals_select_all" ON public.signals;
CREATE POLICY "signals_select_all"
  ON public.signals FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "signals_insert_authenticated" ON public.signals;
CREATE POLICY "signals_insert_authenticated"
  ON public.signals FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "signals_update_authenticated" ON public.signals;
CREATE POLICY "signals_update_authenticated"
  ON public.signals FOR UPDATE
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "signals_delete_authenticated" ON public.signals;
CREATE POLICY "signals_delete_authenticated"
  ON public.signals FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Data points policies
DROP POLICY IF EXISTS "data_points_select_all" ON public.data_points;
CREATE POLICY "data_points_select_all"
  ON public.data_points FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "data_points_insert_authenticated" ON public.data_points;
CREATE POLICY "data_points_insert_authenticated"
  ON public.data_points FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- KPI ownership policies
DROP POLICY IF EXISTS "kpi_ownership_select_all" ON public.kpi_ownership;
CREATE POLICY "kpi_ownership_select_all"
  ON public.kpi_ownership FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "kpi_ownership_manage_own" ON public.kpi_ownership;
CREATE POLICY "kpi_ownership_manage_own"
  ON public.kpi_ownership FOR ALL
  USING (auth.uid() = user_id);

-- Decisions policies
DROP POLICY IF EXISTS "decisions_select_all" ON public.decisions;
CREATE POLICY "decisions_select_all"
  ON public.decisions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "decisions_manage_own" ON public.decisions;
CREATE POLICY "decisions_manage_own"
  ON public.decisions FOR ALL
  USING (auth.uid() = COALESCE(user_id, owner_id));

-- Upload history policies
DROP POLICY IF EXISTS "upload_history_select_own" ON public.upload_history;
CREATE POLICY "upload_history_select_own"
  ON public.upload_history FOR SELECT
  USING (auth.uid() = COALESCE(user_id, uploaded_by));

DROP POLICY IF EXISTS "upload_history_insert_own" ON public.upload_history;
CREATE POLICY "upload_history_insert_own"
  ON public.upload_history FOR INSERT
  WITH CHECK (auth.uid() = COALESCE(user_id, uploaded_by));

-- Integrations policies
DROP POLICY IF EXISTS "integrations_select_own" ON public.integrations;
CREATE POLICY "integrations_select_own"
  ON public.integrations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "integrations_manage_own" ON public.integrations;
CREATE POLICY "integrations_manage_own"
  ON public.integrations FOR ALL
  USING (auth.uid() = user_id);

-- Sync history policies
DROP POLICY IF EXISTS "sync_history_select_own" ON public.sync_history;
CREATE POLICY "sync_history_select_own"
  ON public.sync_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.integrations
      WHERE integrations.id = sync_history.integration_id
      AND integrations.user_id = auth.uid()
    )
  );

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_signals_user_id ON public.signals(user_id);
CREATE INDEX IF NOT EXISTS idx_signals_name ON public.signals(name);
CREATE INDEX IF NOT EXISTS idx_signals_owner ON public.signals(owner_id);
CREATE INDEX IF NOT EXISTS idx_data_points_signal_id ON public.data_points(signal_id);
CREATE INDEX IF NOT EXISTS idx_data_points_date ON public.data_points(date);
CREATE INDEX IF NOT EXISTS idx_data_points_signal ON public.data_points(signal_id, date);
CREATE INDEX IF NOT EXISTS idx_kpi_ownership_user ON public.kpi_ownership(user_id);
CREATE INDEX IF NOT EXISTS idx_kpi_ownership_signal ON public.kpi_ownership(signal_id);
CREATE INDEX IF NOT EXISTS idx_decisions_user_id ON public.decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_decisions_owner ON public.decisions(owner_id);
CREATE INDEX IF NOT EXISTS idx_decisions_status ON public.decisions(status);
CREATE INDEX IF NOT EXISTS idx_decision_signals_decision ON public.decision_signals(decision_id);
CREATE INDEX IF NOT EXISTS idx_decision_signals_signal ON public.decision_signals(signal_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_history_signal ON public.benchmark_history(signal_id, effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_data_quality_signal ON public.data_quality_metrics(signal_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_signal_analytics_signal ON public.signal_analytics(signal_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_signal_alerts_user ON public.signal_alerts(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_upload_history_user_id ON public.upload_history(user_id);
CREATE INDEX IF NOT EXISTS idx_upload_history_user ON public.upload_history(uploaded_by);

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- All tables created successfully!
-- You can now use the Camino app.
