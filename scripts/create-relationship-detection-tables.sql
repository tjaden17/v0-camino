-- Migration: Full Setup with Relationship Detection & Multi-Source Intelligence
-- Creates all necessary tables including base tables

-- ============================================
-- BASE TABLES (if not exist)
-- ============================================

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  full_name TEXT,
  role TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signals table
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  summary TEXT,
  trend TEXT CHECK (trend IN ('up', 'down', 'stable')),
  trend_value TEXT,
  absolute_value TEXT,
  benchmark_value TEXT,
  highlighted BOOLEAN DEFAULT false,
  investigating BOOLEAN DEFAULT false,
  timeframe TEXT,
  owner TEXT,
  category TEXT,
  parent_id UUID,
  data_source TEXT[],
  tags TEXT[],
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signal data points table
CREATE TABLE IF NOT EXISTS signal_data_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  value NUMERIC NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SIGNAL RELATIONSHIPS TABLE
-- Stores detected and user-defined relationships between signals
-- ============================================
CREATE TABLE IF NOT EXISTS signal_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Relationship participants
  signal_a_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
  signal_b_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
  
  -- Relationship characteristics
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'causes', 'correlates', 'leads_to', 'impacts', 'affected_by', 
    'precedes', 'follows', 'inversely_correlates', 'amplifies', 'dampens'
  )),
  direction TEXT NOT NULL DEFAULT 'unidirectional' CHECK (direction IN ('unidirectional', 'bidirectional')),
  
  -- Statistical evidence
  confidence_score DECIMAL(5,4) NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  correlation_coefficient DECIMAL(6,4),
  time_lag_days INTEGER DEFAULT 0,
  sample_size INTEGER,
  p_value DECIMAL(10,8),
  
  -- Evidence and verification
  evidence_type TEXT NOT NULL CHECK (evidence_type IN (
    'statistical', 'user_defined', 'ai_detected', 'domain_knowledge', 'historical_pattern'
  )),
  evidence_data JSONB DEFAULT '{}',
  
  -- Verification status
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  
  -- Metadata
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  last_validated_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate relationships
  UNIQUE(signal_a_id, signal_b_id, relationship_type)
);

-- ============================================
-- RELATIONSHIP INSIGHTS TABLE
-- Stores AI-generated insights about relationships
-- ============================================
CREATE TABLE IF NOT EXISTS relationship_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES signal_relationships(id) ON DELETE CASCADE,
  
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'explanation', 'recommendation', 'warning', 'opportunity', 'prediction'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Impact assessment
  impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  affected_signals UUID[] DEFAULT '{}',
  
  -- Action items
  suggested_actions JSONB DEFAULT '[]',
  
  -- Metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_by UUID REFERENCES profiles(id),
  dismissed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DATA SOURCES TABLE
-- Tracks all data sources and their metadata
-- ============================================
CREATE TABLE IF NOT EXISTS data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Source identification
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'zoho_crm', 'zoho_desk', 'hubspot', 'salesforce', 'csv_upload', 
    'excel_upload', 'api_integration', 'manual_entry', 'google_sheets',
    'quickbooks', 'stripe', 'intercom', 'zendesk', 'jira', 'asana'
  )),
  source_category TEXT NOT NULL CHECK (source_category IN (
    'crm', 'support', 'finance', 'marketing', 'product', 'hr', 'operations'
  )),
  
  -- Connection details
  connection_status TEXT DEFAULT 'connected' CHECK (connection_status IN (
    'connected', 'disconnected', 'error', 'pending', 'expired'
  )),
  connection_config JSONB DEFAULT '{}',
  
  -- Data coverage
  data_types TEXT[] DEFAULT '{}',
  record_count INTEGER DEFAULT 0,
  date_range_start DATE,
  date_range_end DATE,
  
  -- Sync metadata
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT CHECK (last_sync_status IN ('success', 'partial', 'failed')),
  last_sync_records INTEGER,
  last_sync_error TEXT,
  sync_frequency TEXT DEFAULT 'daily' CHECK (sync_frequency IN (
    'realtime', 'hourly', 'daily', 'weekly', 'manual'
  )),
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, source_name, source_type)
);

-- ============================================
-- SIGNAL SOURCE MAPPING TABLE
-- Maps signals to their data sources
-- ============================================
CREATE TABLE IF NOT EXISTS signal_source_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
  data_source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
  
  -- Mapping details
  is_primary_source BOOLEAN DEFAULT false,
  contribution_weight DECIMAL(5,4) DEFAULT 1.0,
  field_mappings JSONB DEFAULT '{}',
  
  -- Data quality
  data_quality_score DECIMAL(5,4),
  completeness_score DECIMAL(5,4),
  freshness_score DECIMAL(5,4),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(signal_id, data_source_id)
);

-- ============================================
-- CROSS SOURCE INSIGHTS TABLE
-- Insights derived from combining multiple data sources
-- ============================================
CREATE TABLE IF NOT EXISTS cross_source_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Insight details
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'data_discrepancy', 'correlation_found', 'anomaly_detected', 
    'opportunity_identified', 'risk_detected', 'trend_confirmed',
    'data_quality_issue', 'missing_data_pattern'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Sources involved
  source_ids UUID[] NOT NULL,
  signal_ids UUID[] DEFAULT '{}',
  
  -- Evidence
  evidence JSONB DEFAULT '{}',
  confidence_score DECIMAL(5,4),
  
  -- Impact
  impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  affected_metrics TEXT[],
  
  -- Recommendations
  recommendations JSONB DEFAULT '[]',
  
  -- Status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'investigating', 'resolved', 'dismissed')),
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Metadata
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CAUSAL CHAINS TABLE
-- Stores detected causal chains (A -> B -> C)
-- ============================================
CREATE TABLE IF NOT EXISTS causal_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Chain definition
  chain_name TEXT,
  chain_description TEXT,
  signal_sequence UUID[] NOT NULL,
  relationship_ids UUID[] NOT NULL,
  
  -- Chain metrics
  total_confidence DECIMAL(5,4) NOT NULL,
  total_lag_days INTEGER,
  chain_strength TEXT CHECK (chain_strength IN ('weak', 'moderate', 'strong', 'very_strong')),
  
  -- Business impact
  business_impact TEXT,
  root_cause_signal_id UUID REFERENCES signals(id),
  end_effect_signal_id UUID REFERENCES signals(id),
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  
  -- Metadata
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RELATIONSHIP HISTORY TABLE
-- Tracks how relationships change over time
-- ============================================
CREATE TABLE IF NOT EXISTS relationship_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES signal_relationships(id) ON DELETE CASCADE,
  
  -- Snapshot data
  correlation_coefficient DECIMAL(6,4),
  confidence_score DECIMAL(5,4),
  time_lag_days INTEGER,
  sample_size INTEGER,
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_signals_org ON signals(organization_id);
CREATE INDEX IF NOT EXISTS idx_signals_category ON signals(category);
CREATE INDEX IF NOT EXISTS idx_signal_data_points_signal ON signal_data_points(signal_id);
CREATE INDEX IF NOT EXISTS idx_signal_data_points_date ON signal_data_points(date);

CREATE INDEX IF NOT EXISTS idx_signal_relationships_org ON signal_relationships(organization_id);
CREATE INDEX IF NOT EXISTS idx_signal_relationships_signal_a ON signal_relationships(signal_a_id);
CREATE INDEX IF NOT EXISTS idx_signal_relationships_signal_b ON signal_relationships(signal_b_id);
CREATE INDEX IF NOT EXISTS idx_signal_relationships_type ON signal_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_signal_relationships_confidence ON signal_relationships(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_signal_relationships_active ON signal_relationships(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_relationship_insights_relationship ON relationship_insights(relationship_id);
CREATE INDEX IF NOT EXISTS idx_relationship_insights_type ON relationship_insights(insight_type);

CREATE INDEX IF NOT EXISTS idx_data_sources_org ON data_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_type ON data_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_data_sources_status ON data_sources(connection_status);

CREATE INDEX IF NOT EXISTS idx_signal_source_mapping_signal ON signal_source_mapping(signal_id);
CREATE INDEX IF NOT EXISTS idx_signal_source_mapping_source ON signal_source_mapping(data_source_id);

CREATE INDEX IF NOT EXISTS idx_cross_source_insights_org ON cross_source_insights(organization_id);
CREATE INDEX IF NOT EXISTS idx_cross_source_insights_type ON cross_source_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_cross_source_insights_status ON cross_source_insights(status);

CREATE INDEX IF NOT EXISTS idx_causal_chains_org ON causal_chains(organization_id);
CREATE INDEX IF NOT EXISTS idx_causal_chains_root ON causal_chains(root_cause_signal_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_signal_relationships_updated_at ON signal_relationships;
CREATE TRIGGER update_signal_relationships_updated_at 
  BEFORE UPDATE ON signal_relationships 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_data_sources_updated_at ON data_sources;
CREATE TRIGGER update_data_sources_updated_at 
  BEFORE UPDATE ON data_sources 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cross_source_insights_updated_at ON cross_source_insights;
CREATE TRIGGER update_cross_source_insights_updated_at 
  BEFORE UPDATE ON cross_source_insights 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_causal_chains_updated_at ON causal_chains;
CREATE TRIGGER update_causal_chains_updated_at 
  BEFORE UPDATE ON causal_chains 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ADD SOURCE TRACKING TO SIGNALS TABLE
-- ============================================
ALTER TABLE signals ADD COLUMN IF NOT EXISTS primary_source_id UUID REFERENCES data_sources(id);
ALTER TABLE signals ADD COLUMN IF NOT EXISTS source_type TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS source_metadata JSONB DEFAULT '{}';
