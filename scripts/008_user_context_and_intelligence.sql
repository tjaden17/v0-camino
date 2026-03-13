-- Phase 1: User Context & Signal Intelligence Tables
-- This script adds the foundation for context-aware signal generation

-- ============================================
-- 1. USER CONTEXT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Role & Function
  role_level text CHECK (role_level IN ('cxo', 'manager', 'ic')) DEFAULT 'manager',
  function text CHECK (function IN ('business', 'product', 'tech', 'sales', 'marketing', 'customer_success', 'finance', 'operations', 'other')),
  
  -- Business Stage
  business_stage text CHECK (business_stage IN ('pre_product', 'pre_pmf', 'pmf', 'scale', 'mature')) DEFAULT 'scale',
  
  -- Top 3 KPIs (from profiles but duplicated for performance)
  kpi_1 text,
  kpi_2 text,
  kpi_3 text,
  
  -- Upcoming Decisions (JSONB for flexibility)
  upcoming_decisions jsonb DEFAULT '[]'::jsonb,
  
  -- Preferences
  signal_relevance_threshold numeric DEFAULT 0.6 CHECK (signal_relevance_threshold >= 0 AND signal_relevance_threshold <= 1),
  preferred_comparison_period text DEFAULT 'previous_period' CHECK (preferred_comparison_period IN ('previous_period', 'same_period_last_year', 'custom')),
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 2. SIGNAL RELATIONSHIPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.signal_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_a_id uuid REFERENCES public.signals(id) ON DELETE CASCADE NOT NULL,
  signal_b_id uuid REFERENCES public.signals(id) ON DELETE CASCADE NOT NULL,
  
  -- Relationship metadata
  relationship_type text CHECK (relationship_type IN ('causes', 'correlates', 'impacts', 'leads_to', 'affected_by')) NOT NULL,
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 1) DEFAULT 0.5,
  
  -- Time lag (in days) if applicable
  time_lag_days integer,
  
  -- Evidence
  evidence_type text CHECK (evidence_type IN ('statistical', 'user_defined', 'ai_detected', 'domain_knowledge')),
  evidence_data jsonb,
  
  -- Metadata
  detected_at timestamptz DEFAULT now(),
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  is_active boolean DEFAULT true,
  
  UNIQUE(signal_a_id, signal_b_id, relationship_type)
);

-- ============================================
-- 3. AI ANALYSIS CACHE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_analysis_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid REFERENCES public.signals(id) ON DELETE CASCADE NOT NULL,
  
  -- Analysis metadata
  analysis_type text CHECK (analysis_type IN ('why_analysis', 'impact_prediction', 'action_recommendation', 'trend_explanation')) NOT NULL,
  analysis_version text DEFAULT 'v1',
  
  -- Analysis result
  analysis_result jsonb NOT NULL,
  
  -- Cost tracking
  token_cost integer DEFAULT 0,
  api_provider text DEFAULT 'openai',
  
  -- Cache control
  generated_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  cache_key text NOT NULL,
  
  -- Usage tracking
  hit_count integer DEFAULT 0,
  last_accessed_at timestamptz DEFAULT now(),
  
  UNIQUE(cache_key, analysis_type)
);

-- ============================================
-- 4. DATA QUALITY SCORES TABLE (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS public.data_quality_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid REFERENCES public.signals(id) ON DELETE CASCADE NOT NULL,
  
  -- Quality dimensions
  completeness_score numeric CHECK (completeness_score >= 0 AND completeness_score <= 100),
  freshness_score numeric CHECK (freshness_score >= 0 AND freshness_score <= 100),
  consistency_score numeric CHECK (consistency_score >= 0 AND consistency_score <= 100),
  reliability_score numeric CHECK (reliability_score >= 0 AND reliability_score <= 100),
  
  -- Overall quality
  overall_quality_score numeric CHECK (overall_quality_score >= 0 AND overall_quality_score <= 100),
  quality_tier text CHECK (quality_tier IN ('excellent', 'good', 'fair', 'poor', 'insufficient')) GENERATED ALWAYS AS (
    CASE
      WHEN overall_quality_score >= 90 THEN 'excellent'
      WHEN overall_quality_score >= 75 THEN 'good'
      WHEN overall_quality_score >= 50 THEN 'fair'
      WHEN overall_quality_score >= 25 THEN 'poor'
      ELSE 'insufficient'
    END
  ) STORED,
  
  -- Data characteristics
  data_point_count integer DEFAULT 0,
  date_range_days integer,
  last_update_date date,
  missing_data_points integer DEFAULT 0,
  
  -- Recommendations
  improvement_suggestions text[],
  
  -- Metadata
  calculated_at timestamptz DEFAULT now(),
  
  UNIQUE(signal_id, calculated_at::date)
);

-- ============================================
-- 5. SIGNAL RELEVANCE SCORES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.signal_relevance_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid REFERENCES public.signals(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Relevance components
  kpi_alignment_score numeric CHECK (kpi_alignment_score >= 0 AND kpi_alignment_score <= 1) DEFAULT 0,
  role_relevance_score numeric CHECK (role_relevance_score >= 0 AND role_relevance_score <= 1) DEFAULT 0,
  urgency_score numeric CHECK (urgency_score >= 0 AND urgency_score <= 1) DEFAULT 0,
  decision_support_score numeric CHECK (decision_support_score >= 0 AND decision_support_score <= 1) DEFAULT 0,
  
  -- Overall relevance
  overall_relevance_score numeric CHECK (overall_relevance_score >= 0 AND overall_relevance_score <= 1) DEFAULT 0,
  
  -- Reasoning
  relevance_reasoning jsonb,
  
  -- Metadata
  calculated_at timestamptz DEFAULT now(),
  
  UNIQUE(signal_id, user_id, calculated_at::date)
);

-- ============================================
-- 6. ROLE-BASED SIGNAL TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.signal_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template metadata
  name text NOT NULL,
  description text,
  category text,
  
  -- Target context
  role_level text[] DEFAULT '{}',
  function text[] DEFAULT '{}',
  business_stage text[] DEFAULT '{}',
  industry text[] DEFAULT '{}',
  
  -- Signal definition
  signal_name text NOT NULL,
  signal_description text,
  signal_category text,
  signal_unit text,
  calculation_logic text,
  
  -- Benchmarks
  industry_benchmark numeric,
  best_in_class_benchmark numeric,
  
  -- Priority & Importance
  default_priority integer DEFAULT 5,
  importance_score numeric CHECK (importance_score >= 0 AND importance_score <= 10) DEFAULT 5,
  
  -- Usage tracking
  usage_count integer DEFAULT 0,
  
  -- Metadata
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.user_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_quality_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_relevance_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_templates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- User Context policies
CREATE POLICY "user_context_select_own"
  ON public.user_context FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_context_manage_own"
  ON public.user_context FOR ALL
  USING (auth.uid() = user_id);

-- Signal Relationships policies
CREATE POLICY "signal_relationships_select_all"
  ON public.signal_relationships FOR SELECT
  USING (true);

CREATE POLICY "signal_relationships_manage_authenticated"
  ON public.signal_relationships FOR ALL
  USING (auth.uid() IS NOT NULL);

-- AI Analysis Cache policies (read by all, managed by system)
CREATE POLICY "ai_cache_select_all"
  ON public.ai_analysis_cache FOR SELECT
  USING (true);

CREATE POLICY "ai_cache_manage_system"
  ON public.ai_analysis_cache FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Data Quality Scores policies
CREATE POLICY "data_quality_select_all"
  ON public.data_quality_scores FOR SELECT
  USING (true);

CREATE POLICY "data_quality_manage_system"
  ON public.data_quality_scores FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Signal Relevance Scores policies
CREATE POLICY "relevance_scores_select_own"
  ON public.signal_relevance_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "relevance_scores_manage_system"
  ON public.signal_relevance_scores FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Signal Templates policies
CREATE POLICY "signal_templates_select_all"
  ON public.signal_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "signal_templates_manage_system"
  ON public.signal_templates FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_context_user_id ON public.user_context(user_id);
CREATE INDEX IF NOT EXISTS idx_user_context_role_function ON public.user_context(role_level, function);
CREATE INDEX IF NOT EXISTS idx_user_context_stage ON public.user_context(business_stage);

CREATE INDEX IF NOT EXISTS idx_signal_relationships_signal_a ON public.signal_relationships(signal_a_id);
CREATE INDEX IF NOT EXISTS idx_signal_relationships_signal_b ON public.signal_relationships(signal_b_id);
CREATE INDEX IF NOT EXISTS idx_signal_relationships_type ON public.signal_relationships(relationship_type, is_active);

CREATE INDEX IF NOT EXISTS idx_ai_cache_signal ON public.ai_analysis_cache(signal_id, analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON public.ai_analysis_cache(cache_key, expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expiry ON public.ai_analysis_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_data_quality_signal ON public.data_quality_scores(signal_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_quality_tier ON public.data_quality_scores(quality_tier);

CREATE INDEX IF NOT EXISTS idx_relevance_user_signal ON public.signal_relevance_scores(user_id, signal_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_relevance_score ON public.signal_relevance_scores(overall_relevance_score DESC);

CREATE INDEX IF NOT EXISTS idx_templates_role ON public.signal_templates(role_level);
CREATE INDEX IF NOT EXISTS idx_templates_function ON public.signal_templates(function);
CREATE INDEX IF NOT EXISTS idx_templates_stage ON public.signal_templates(business_stage);
CREATE INDEX IF NOT EXISTS idx_templates_active ON public.signal_templates(is_active);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to auto-expire AI cache
CREATE OR REPLACE FUNCTION cleanup_expired_ai_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.ai_analysis_cache
  WHERE expires_at < now();
END;
$$;

-- Function to calculate overall data quality score
CREATE OR REPLACE FUNCTION calculate_data_quality(
  p_completeness numeric,
  p_freshness numeric,
  p_consistency numeric,
  p_reliability numeric
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Weighted average: completeness 30%, freshness 30%, consistency 20%, reliability 20%
  RETURN (
    COALESCE(p_completeness, 0) * 0.3 +
    COALESCE(p_freshness, 0) * 0.3 +
    COALESCE(p_consistency, 0) * 0.2 +
    COALESCE(p_reliability, 0) * 0.2
  );
END;
$$;

-- ============================================
-- SEED DEFAULT SIGNAL TEMPLATES
-- ============================================

-- Customer Success Signals
INSERT INTO public.signal_templates (name, description, category, role_level, function, business_stage, signal_name, signal_description, signal_category, signal_unit, industry_benchmark, importance_score)
VALUES
  ('Customer Churn Rate', 'Percentage of customers who stop using the product', 'Customer Success', ARRAY['cxo', 'manager', 'ic'], ARRAY['customer_success', 'business'], ARRAY['pmf', 'scale', 'mature'], 'Churn Rate', 'Monthly customer churn rate', 'Retention', '%', 5.0, 9),
  ('Net Revenue Retention', 'Revenue retained from existing customers including expansion', 'Revenue', ARRAY['cxo', 'manager'], ARRAY['business', 'sales', 'customer_success'], ARRAY['pmf', 'scale', 'mature'], 'NRR', 'Net revenue retention rate', 'Revenue', '%', 110.0, 10),
  ('Customer Support Ticket Volume', 'Total number of support tickets received', 'Support', ARRAY['manager', 'ic'], ARRAY['customer_success'], ARRAY['pmf', 'scale', 'mature'], 'Support Ticket Volume', 'Weekly support ticket count', 'Support', 'tickets', NULL, 7);

-- Product Signals
INSERT INTO public.signal_templates (name, description, category, role_level, function, business_stage, signal_name, signal_description, signal_category, signal_unit, industry_benchmark, importance_score)
VALUES
  ('Monthly Active Users', 'Number of unique users active in the past 30 days', 'Engagement', ARRAY['cxo', 'manager', 'ic'], ARRAY['product', 'business'], ARRAY['pre_pmf', 'pmf', 'scale'], 'MAU', 'Monthly active users', 'Engagement', 'users', NULL, 9),
  ('Feature Adoption Rate', 'Percentage of users who use a specific feature', 'Adoption', ARRAY['manager', 'ic'], ARRAY['product'], ARRAY['pmf', 'scale'], 'Feature Adoption', 'New feature adoption rate', 'Product', '%', 40.0, 7),
  ('Time to Value', 'Average time for users to reach their first success milestone', 'Onboarding', ARRAY['manager', 'ic'], ARRAY['product', 'customer_success'], ARRAY['pre_pmf', 'pmf', 'scale'], 'Time to Value', 'Days to first value', 'Onboarding', 'days', 7.0, 8);

-- Sales & Marketing Signals
INSERT INTO public.signal_templates (name, description, category, role_level, function, business_stage, signal_name, signal_description, signal_category, signal_unit, industry_benchmark, importance_score)
VALUES
  ('Lead Conversion Rate', 'Percentage of leads that convert to customers', 'Sales', ARRAY['cxo', 'manager'], ARRAY['sales', 'marketing'], ARRAY['pmf', 'scale', 'mature'], 'Lead Conversion Rate', 'Lead to customer conversion rate', 'Sales', '%', 2.5, 9),
  ('Customer Acquisition Cost', 'Cost to acquire a new customer', 'Marketing', ARRAY['cxo', 'manager'], ARRAY['marketing', 'business'], ARRAY['pmf', 'scale', 'mature'], 'CAC', 'Customer acquisition cost', 'Marketing', '$', NULL, 10),
  ('Sales Cycle Length', 'Average time from first touch to closed deal', 'Sales', ARRAY['manager', 'ic'], ARRAY['sales'], ARRAY['scale', 'mature'], 'Sales Cycle Length', 'Average sales cycle duration', 'Sales', 'days', 45.0, 7);

-- Financial Signals
INSERT INTO public.signal_templates (name, description, category, role_level, function, business_stage, signal_name, signal_description, signal_category, signal_unit, industry_benchmark, importance_score)
VALUES
  ('Monthly Recurring Revenue', 'Predictable revenue generated each month', 'Revenue', ARRAY['cxo', 'manager'], ARRAY['business', 'finance', 'sales'], ARRAY['pmf', 'scale', 'mature'], 'MRR', 'Monthly recurring revenue', 'Revenue', '$', NULL, 10),
  ('Gross Margin', 'Revenue minus cost of goods sold', 'Profitability', ARRAY['cxo', 'manager'], ARRAY['business', 'finance'], ARRAY['scale', 'mature'], 'Gross Margin', 'Gross profit margin', 'Financial', '%', 75.0, 9),
  ('Burn Rate', 'Rate at which company is spending cash', 'Financial Health', ARRAY['cxo'], ARRAY['business', 'finance'], ARRAY['pre_product', 'pre_pmf', 'pmf'], 'Burn Rate', 'Monthly cash burn rate', 'Financial', '$', NULL, 10);

-- ============================================
-- SETUP COMPLETE!
-- ============================================
