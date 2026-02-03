-- User Context Service Tables
-- Stores user preferences, goals, and context for personalized signal recommendations

-- User context/preferences table
CREATE TABLE IF NOT EXISTS user_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Role & Position
  role TEXT, -- CEO, VP Sales, CFO, etc.
  department TEXT, -- Sales, Marketing, Finance, Product, etc.
  seniority_level TEXT, -- Executive, Director, Manager, Individual Contributor
  
  -- Business Context
  business_stage TEXT, -- Pre-PMF, Post-PMF, Scaling, Enterprise
  company_size TEXT, -- 1-10, 11-50, 51-200, 201-500, 500+
  industry TEXT,
  
  -- Priorities (JSON array of priority areas)
  priority_areas JSONB DEFAULT '[]'::jsonb, -- ["revenue_growth", "customer_retention", "operational_efficiency"]
  
  -- Goals (specific measurable goals)
  goals JSONB DEFAULT '[]'::jsonb,
  
  -- Preferences
  preferred_signal_categories JSONB DEFAULT '[]'::jsonb, -- ["Revenue", "Sales", "Support"]
  hidden_signals JSONB DEFAULT '[]'::jsonb, -- signals user has dismissed
  pinned_signals JSONB DEFAULT '[]'::jsonb, -- signals user has pinned
  
  -- Notification preferences
  alert_threshold TEXT DEFAULT 'medium', -- low, medium, high, critical_only
  digest_frequency TEXT DEFAULT 'daily', -- realtime, daily, weekly
  
  -- Onboarding state
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- User goals with tracking
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Goal definition
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL, -- metric_target, trend, comparison, threshold
  
  -- Target signal
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
  signal_name TEXT, -- for goals without specific signal
  
  -- Target values
  target_value DECIMAL,
  target_direction TEXT, -- increase, decrease, maintain
  target_percentage DECIMAL, -- for percentage-based goals
  baseline_value DECIMAL,
  current_value DECIMAL,
  
  -- Timeframe
  start_date DATE,
  target_date DATE,
  
  -- Status
  status TEXT DEFAULT 'active', -- active, achieved, missed, paused
  progress_percentage DECIMAL DEFAULT 0,
  
  -- Priority
  priority INTEGER DEFAULT 1, -- 1 = highest
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signal recommendations (AI-generated)
CREATE TABLE IF NOT EXISTS signal_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- The recommended signal
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
  signal_name TEXT NOT NULL,
  signal_category TEXT,
  
  -- Recommendation details
  recommendation_type TEXT NOT NULL, -- role_based, goal_aligned, trending, anomaly, peer_popular, gap_fill
  reason TEXT NOT NULL, -- Human-readable explanation
  relevance_score DECIMAL NOT NULL, -- 0-100
  
  -- Context that triggered recommendation
  context_factors JSONB DEFAULT '{}'::jsonb,
  
  -- User response
  status TEXT DEFAULT 'pending', -- pending, accepted, dismissed, snoozed
  dismissed_reason TEXT,
  snoozed_until TIMESTAMPTZ,
  
  -- Validity
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proactive exploration suggestions
CREATE TABLE IF NOT EXISTS exploration_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Suggestion type
  suggestion_type TEXT NOT NULL, -- new_signal, data_source, relationship, insight, goal
  
  -- Content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action_label TEXT, -- "Connect Zoho", "Track this signal", etc.
  action_url TEXT,
  action_data JSONB DEFAULT '{}'::jsonb,
  
  -- Priority & Relevance
  priority INTEGER DEFAULT 1,
  relevance_score DECIMAL,
  
  -- Reasoning
  reasoning TEXT, -- Why we're suggesting this
  expected_value TEXT, -- What value this will provide
  
  -- Status
  status TEXT DEFAULT 'active', -- active, completed, dismissed, expired
  
  -- Validity
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User activity log (for learning preferences)
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Activity details
  activity_type TEXT NOT NULL, -- view_signal, view_dashboard, set_goal, dismiss_recommendation, etc.
  entity_type TEXT, -- signal, dashboard, goal, recommendation
  entity_id UUID,
  entity_name TEXT,
  
  -- Context
  context JSONB DEFAULT '{}'::jsonb,
  
  -- Session info
  session_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role-based signal mappings (which signals matter for which roles)
CREATE TABLE IF NOT EXISTS role_signal_relevance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  role TEXT NOT NULL,
  signal_category TEXT NOT NULL,
  signal_id_pattern TEXT, -- regex or specific signal IDs
  
  relevance_score INTEGER NOT NULL, -- 1-10
  is_core_metric BOOLEAN DEFAULT false, -- Must-have for this role
  
  rationale TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed role-signal relevance data
INSERT INTO role_signal_relevance (role, signal_category, signal_id_pattern, relevance_score, is_core_metric, rationale) VALUES
-- CEO
('CEO', 'Revenue', '%', 10, true, 'Revenue metrics are the primary concern for CEOs'),
('CEO', 'Sales', 'pipeline%', 9, true, 'Pipeline indicates future revenue'),
('CEO', 'Customer Success', 'churn%', 9, true, 'Churn directly impacts growth'),
('CEO', 'Finance', 'burn%', 8, true, 'Cash management is critical'),
('CEO', 'People', 'headcount%', 7, false, 'Team growth indicates company health'),

-- CFO
('CFO', 'Revenue', '%', 10, true, 'All revenue metrics are core to CFO role'),
('CFO', 'Finance', '%', 10, true, 'Finance metrics are primary responsibility'),
('CFO', 'Marketing', 'cac%', 9, true, 'Unit economics are critical'),
('CFO', 'Customer Success', '%ltv%', 9, true, 'LTV impacts financial planning'),
('CFO', 'People', '%cost%', 8, false, 'Headcount costs impact burn'),

-- VP Sales
('VP Sales', 'Sales', '%', 10, true, 'All sales metrics are core'),
('VP Sales', 'Revenue', 'mrr%', 9, true, 'Revenue is the outcome of sales'),
('VP Sales', 'Marketing', 'lead%', 8, true, 'Lead volume impacts pipeline'),
('VP Sales', 'Customer Success', 'expansion%', 7, false, 'Expansion is often sales-driven'),

-- VP Marketing / CMO
('CMO', 'Marketing', '%', 10, true, 'All marketing metrics are core'),
('CMO', 'Sales', 'lead%', 9, true, 'Lead generation is marketing output'),
('CMO', 'Revenue', '%', 7, false, 'Marketing contributes to revenue'),

-- VP Customer Success
('VP Customer Success', 'Customer Success', '%', 10, true, 'All CS metrics are core'),
('VP Customer Success', 'Support', '%', 9, true, 'Support impacts customer health'),
('VP Customer Success', 'Revenue', 'retention%', 9, true, 'Retention is CS responsibility'),
('VP Customer Success', 'Revenue', 'expansion%', 8, true, 'Expansion often comes through CS'),

-- Head of Support
('Head of Support', 'Support', '%', 10, true, 'All support metrics are core'),
('Head of Support', 'Customer Success', 'csat%', 9, true, 'CSAT is support outcome'),
('Head of Support', 'Customer Success', 'nps%', 8, false, 'NPS is influenced by support'),

-- CPO / Head of Product
('CPO', 'Product', '%', 10, true, 'All product metrics are core'),
('CPO', 'Customer Success', 'nps%', 8, true, 'NPS reflects product quality'),
('CPO', 'Support', 'ticket%bug%', 8, false, 'Bug tickets indicate product issues'),

-- VP People / HR
('VP People', 'People', '%', 10, true, 'All people metrics are core'),
('VP People', 'Finance', '%employee%', 7, false, 'Cost per employee matters')

ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_context_user_id ON user_context(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON user_goals(status);
CREATE INDEX IF NOT EXISTS idx_signal_recommendations_user_id ON signal_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_signal_recommendations_status ON signal_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_exploration_suggestions_user_id ON exploration_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity_type ON user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_role_signal_relevance_role ON role_signal_relevance(role);
