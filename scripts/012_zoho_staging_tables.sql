-- Zoho Data Staging Tables
-- For multi-source signal calculation

-- =====================================================
-- STAGING TABLES - Raw imported data from Zoho exports
-- =====================================================

-- Zoho CRM Deals
CREATE TABLE IF NOT EXISTS zoho_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  import_id UUID NOT NULL,
  
  -- Zoho fields
  deal_name TEXT,
  deal_owner TEXT,
  account_name TEXT,
  account_id TEXT,
  contact_name TEXT,
  amount DECIMAL(15,2),
  closing_date DATE,
  stage TEXT,
  probability INTEGER,
  expected_revenue DECIMAL(15,2),
  lead_source TEXT,
  campaign_source TEXT,
  sales_cycle_duration INTEGER,
  created_time TIMESTAMP WITH TIME ZONE,
  modified_time TIMESTAMP WITH TIME ZONE,
  
  -- Raw data for additional fields
  raw_data JSONB,
  
  -- Metadata
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, import_id, deal_name, created_time)
);

-- Zoho Desk Tickets
CREATE TABLE IF NOT EXISTS zoho_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  import_id UUID NOT NULL,
  
  -- Zoho fields
  ticket_id TEXT,
  ticket_number TEXT,
  subject TEXT,
  status TEXT,
  priority TEXT,
  channel TEXT,
  department TEXT,
  account_name TEXT,
  account_id TEXT,
  contact_name TEXT,
  contact_email TEXT,
  ticket_owner TEXT,
  classification TEXT,
  category TEXT,
  sub_category TEXT,
  resolution_time_hours DECIMAL(10,2),
  first_response_time_hours DECIMAL(10,2),
  sla_violation_type TEXT,
  is_escalated BOOLEAN,
  is_first_call_resolution BOOLEAN,
  happiness_rating TEXT,
  sentiment TEXT,
  number_of_threads INTEGER,
  number_of_comments INTEGER,
  number_of_reopen INTEGER,
  created_time TIMESTAMP WITH TIME ZONE,
  closed_time TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  
  -- Raw data for additional fields
  raw_data JSONB,
  
  -- Metadata
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, import_id, ticket_id)
);

-- Zoho CRM/Desk Accounts (Companies)
CREATE TABLE IF NOT EXISTS zoho_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  import_id UUID NOT NULL,
  
  -- Zoho fields
  account_name TEXT NOT NULL,
  account_id TEXT,
  account_owner TEXT,
  industry TEXT,
  account_type TEXT,
  annual_revenue DECIMAL(15,2),
  employees INTEGER,
  phone TEXT,
  email TEXT,
  website TEXT,
  billing_country TEXT,
  created_time TIMESTAMP WITH TIME ZONE,
  modified_time TIMESTAMP WITH TIME ZONE,
  
  -- Raw data for additional fields
  raw_data JSONB,
  
  -- Metadata
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, import_id, account_name)
);

-- Zoho CRM Contacts
CREATE TABLE IF NOT EXISTS zoho_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  import_id UUID NOT NULL,
  
  -- Zoho fields
  contact_name TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  account_name TEXT,
  account_id TEXT,
  contact_owner TEXT,
  lead_source TEXT,
  created_time TIMESTAMP WITH TIME ZONE,
  modified_time TIMESTAMP WITH TIME ZONE,
  
  -- Raw data for additional fields
  raw_data JSONB,
  
  -- Metadata
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, import_id, email)
);

-- =====================================================
-- IMPORT TRACKING
-- =====================================================

-- Track each import session
CREATE TABLE IF NOT EXISTS zoho_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  imported_by UUID NOT NULL,
  
  -- File info
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'csv', 'xlsx'
  source_type TEXT NOT NULL, -- 'zoho_crm', 'zoho_desk'
  data_type TEXT NOT NULL, -- 'deals', 'tickets', 'accounts', 'contacts'
  
  -- Stats
  record_count INTEGER DEFAULT 0,
  date_range_start DATE,
  date_range_end DATE,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- DATA SOURCE AVAILABILITY TRACKING
-- =====================================================

-- Track which data sources are available per organization
CREATE TABLE IF NOT EXISTS zoho_data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  
  -- Source info
  source_type TEXT NOT NULL, -- 'zoho_crm', 'zoho_desk'
  data_type TEXT NOT NULL, -- 'deals', 'tickets', 'accounts', 'contacts'
  
  -- Latest import info
  latest_import_id UUID REFERENCES zoho_imports(id),
  latest_import_at TIMESTAMP WITH TIME ZONE,
  record_count INTEGER DEFAULT 0,
  date_range_start DATE,
  date_range_end DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, source_type, data_type)
);

-- =====================================================
-- SIGNAL DEFINITIONS WITH DATA REQUIREMENTS
-- =====================================================

-- Extended signal definitions with multi-source requirements
CREATE TABLE IF NOT EXISTS signal_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Signal info
  signal_key TEXT NOT NULL UNIQUE, -- e.g., 'customer_health_score'
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'sales', 'support', 'customer', 'operations'
  
  -- Data requirements (array of required data types)
  required_sources TEXT[] NOT NULL, -- e.g., ['deals', 'tickets']
  
  -- Calculation info
  calculation_type TEXT NOT NULL, -- 'single_source', 'multi_source', 'composite'
  calculation_formula TEXT, -- Description or reference to calculation logic
  
  -- Display
  unit TEXT, -- '$', '%', 'count', 'hours', 'score'
  format TEXT, -- 'currency', 'percentage', 'number', 'decimal'
  trend_direction TEXT DEFAULT 'up_is_good', -- 'up_is_good', 'down_is_good', 'neutral'
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SEED SIGNAL DEFINITIONS
-- =====================================================

INSERT INTO signal_definitions (signal_key, name, description, category, required_sources, calculation_type, unit, format, trend_direction) VALUES
-- Single-source Sales Signals (CRM only)
('sales_pipeline_value', 'Sales Pipeline Value', 'Total value of open deals in pipeline', 'sales', ARRAY['deals'], 'single_source', '$', 'currency', 'up_is_good'),
('sales_conversion_rate', 'Sales Conversion Rate', 'Percentage of deals won vs total closed', 'sales', ARRAY['deals'], 'single_source', '%', 'percentage', 'up_is_good'),
('average_deal_size', 'Average Deal Size', 'Average value of closed won deals', 'sales', ARRAY['deals'], 'single_source', '$', 'currency', 'up_is_good'),
('sales_cycle_duration', 'Sales Cycle Duration', 'Average days to close a deal', 'sales', ARRAY['deals'], 'single_source', 'days', 'number', 'down_is_good'),
('win_rate', 'Win Rate', 'Percentage of deals won', 'sales', ARRAY['deals'], 'single_source', '%', 'percentage', 'up_is_good'),
('pipeline_by_stage', 'Pipeline by Stage', 'Deal count and value by sales stage', 'sales', ARRAY['deals'], 'single_source', '$', 'currency', 'neutral'),

-- Single-source Support Signals (Desk only)
('ticket_volume', 'Ticket Volume', 'Total number of support tickets', 'support', ARRAY['tickets'], 'single_source', 'count', 'number', 'neutral'),
('avg_resolution_time', 'Avg Resolution Time', 'Average time to resolve tickets in hours', 'support', ARRAY['tickets'], 'single_source', 'hours', 'decimal', 'down_is_good'),
('first_response_time', 'First Response Time', 'Average first response time in hours', 'support', ARRAY['tickets'], 'single_source', 'hours', 'decimal', 'down_is_good'),
('sla_compliance_rate', 'SLA Compliance Rate', 'Percentage of tickets meeting SLA', 'support', ARRAY['tickets'], 'single_source', '%', 'percentage', 'up_is_good'),
('first_call_resolution', 'First Call Resolution', 'Percentage resolved on first contact', 'support', ARRAY['tickets'], 'single_source', '%', 'percentage', 'up_is_good'),
('escalation_rate', 'Escalation Rate', 'Percentage of tickets escalated', 'support', ARRAY['tickets'], 'single_source', '%', 'percentage', 'down_is_good'),
('ticket_reopen_rate', 'Ticket Reopen Rate', 'Percentage of tickets reopened', 'support', ARRAY['tickets'], 'single_source', '%', 'percentage', 'down_is_good'),
('customer_sentiment', 'Customer Sentiment', 'Distribution of ticket sentiments', 'support', ARRAY['tickets'], 'single_source', 'score', 'number', 'up_is_good'),

-- Multi-source Signals (requires both CRM + Desk)
('customer_health_score', 'Customer Health Score', 'Combined score based on deal activity and support patterns', 'customer', ARRAY['deals', 'tickets'], 'multi_source', 'score', 'number', 'up_is_good'),
('revenue_at_risk', 'Revenue at Risk', 'Value of deals from accounts with high support issues', 'customer', ARRAY['deals', 'tickets'], 'multi_source', '$', 'currency', 'down_is_good'),
('support_cost_per_account', 'Support Cost per Account', 'Estimated support cost relative to account value', 'operations', ARRAY['deals', 'tickets', 'accounts'], 'multi_source', '$', 'currency', 'down_is_good'),
('churn_risk_score', 'Churn Risk Score', 'Likelihood of customer churn based on patterns', 'customer', ARRAY['deals', 'tickets'], 'multi_source', 'score', 'number', 'down_is_good'),
('high_value_at_risk', 'High-Value Accounts at Risk', 'High-value accounts with negative support trends', 'customer', ARRAY['deals', 'tickets'], 'multi_source', 'count', 'number', 'down_is_good'),
('net_revenue_retention', 'Net Revenue Retention', 'Revenue retained from existing customers', 'sales', ARRAY['deals', 'accounts'], 'multi_source', '%', 'percentage', 'up_is_good')

ON CONFLICT (signal_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  required_sources = EXCLUDED.required_sources,
  calculation_type = EXCLUDED.calculation_type,
  updated_at = NOW();

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_zoho_deals_org ON zoho_deals(organization_id);
CREATE INDEX IF NOT EXISTS idx_zoho_deals_account ON zoho_deals(organization_id, account_name);
CREATE INDEX IF NOT EXISTS idx_zoho_deals_import ON zoho_deals(import_id);
CREATE INDEX IF NOT EXISTS idx_zoho_deals_created ON zoho_deals(created_time);

CREATE INDEX IF NOT EXISTS idx_zoho_tickets_org ON zoho_tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_zoho_tickets_account ON zoho_tickets(organization_id, account_name);
CREATE INDEX IF NOT EXISTS idx_zoho_tickets_import ON zoho_tickets(import_id);
CREATE INDEX IF NOT EXISTS idx_zoho_tickets_created ON zoho_tickets(created_time);

CREATE INDEX IF NOT EXISTS idx_zoho_accounts_org ON zoho_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_zoho_accounts_name ON zoho_accounts(organization_id, account_name);

CREATE INDEX IF NOT EXISTS idx_zoho_contacts_org ON zoho_contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_zoho_contacts_account ON zoho_contacts(organization_id, account_name);

CREATE INDEX IF NOT EXISTS idx_zoho_imports_org ON zoho_imports(organization_id);
CREATE INDEX IF NOT EXISTS idx_zoho_data_sources_org ON zoho_data_sources(organization_id);

-- =====================================================
-- PERMISSIONS
-- =====================================================

ALTER TABLE zoho_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoho_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoho_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoho_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoho_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoho_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_definitions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read signal definitions
CREATE POLICY "Anyone can read signal definitions" ON signal_definitions FOR SELECT USING (true);

-- For other tables, allow based on organization (simplified for now)
CREATE POLICY "Users can access their org data" ON zoho_deals FOR ALL USING (true);
CREATE POLICY "Users can access their org tickets" ON zoho_tickets FOR ALL USING (true);
CREATE POLICY "Users can access their org accounts" ON zoho_accounts FOR ALL USING (true);
CREATE POLICY "Users can access their org contacts" ON zoho_contacts FOR ALL USING (true);
CREATE POLICY "Users can access their org imports" ON zoho_imports FOR ALL USING (true);
CREATE POLICY "Users can access their org data sources" ON zoho_data_sources FOR ALL USING (true);

GRANT ALL ON zoho_deals TO authenticated;
GRANT ALL ON zoho_tickets TO authenticated;
GRANT ALL ON zoho_accounts TO authenticated;
GRANT ALL ON zoho_contacts TO authenticated;
GRANT ALL ON zoho_imports TO authenticated;
GRANT ALL ON zoho_data_sources TO authenticated;
GRANT SELECT ON signal_definitions TO authenticated;
