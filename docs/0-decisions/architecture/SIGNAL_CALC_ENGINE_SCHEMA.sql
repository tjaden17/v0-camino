-- ============================================================
-- SIGNAL CALCULATION ENGINE — DATABASE SCHEMA
-- Date: February 25, 2026
-- Related doc: SIGNAL_CALC_ENGINE.md
-- ============================================================


-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE signal_operation AS ENUM (
  'COUNT',
  'SUM',
  'AVERAGE',
  'RATIO',
  'DURATION'
);

CREATE TYPE signal_format AS ENUM (
  'number',
  'currency',
  'percentage',
  'days',
  'hours'
);

CREATE TYPE trend_direction AS ENUM (
  'up_is_good',
  'down_is_good',
  'neutral'
);

CREATE TYPE schema_type AS ENUM (
  'crm',
  'ticket',
  'financial',
  'usage'
);


-- ============================================================
-- TABLE 1: signal_definitions
-- What each signal is and how it is calculated.
-- Lives in the database — never hardcoded in application code.
-- ============================================================

CREATE TABLE signal_definitions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  key                  TEXT NOT NULL UNIQUE,   -- e.g. 'win_rate'
  label                TEXT NOT NULL,          -- e.g. 'Win Rate'
  description          TEXT,                   -- plain english explanation

  -- Scope
  schema_type          schema_type NOT NULL,   -- which data type this applies to

  -- Calculation
  operation            signal_operation NOT NULL,
  primary_field        TEXT,                   -- field the operation runs on
  value_field          TEXT,                   -- for SUM / AVERAGE operations
  numerator_filter     TEXT,                   -- for COUNT / RATIO: the top condition
  denominator_filter   TEXT,                   -- for RATIO only: the bottom condition
  start_date_field     TEXT,                   -- for DURATION: start timestamp
  end_date_field       TEXT,                   -- for DURATION: end timestamp
  exclude_filter       TEXT,                   -- rows to always exclude (test data, etc)

  -- Display
  format               signal_format NOT NULL DEFAULT 'number',
  trend_direction      trend_direction NOT NULL DEFAULT 'up_is_good',
  urgency_threshold    TEXT,                   -- e.g. '< 20' — triggers red status
  warning_threshold    TEXT,                   -- e.g. '< 30' — triggers amber status

  -- Control
  is_active            BOOLEAN NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed: example CRM signals
INSERT INTO signal_definitions
  (key, label, description, schema_type, operation, primary_field, numerator_filter, denominator_filter, format, trend_direction, urgency_threshold, warning_threshold)
VALUES
  ('win_rate',        'Win Rate',        'Percentage of closed deals that were won',         'crm', 'RATIO',    'stage',       'stage = ''Closed Won''',                        'stage IN (''Closed Won'',''Closed Lost'')', 'percentage', 'up_is_good',   '< 20', '< 30'),
  ('pipeline_value',  'Pipeline Value',  'Total value of all open deals',                    'crm', 'SUM',      'deal_value',  'stage NOT IN (''Closed Won'',''Closed Lost'')', null,                                       'currency',   'up_is_good',   null,   null),
  ('open_deals',      'Open Deals',      'Number of active deals in the pipeline',            'crm', 'COUNT',    'stage',       'stage NOT IN (''Closed Won'',''Closed Lost'')', null,                                       'number',     'up_is_good',   null,   null),
  ('avg_deal_size',   'Avg Deal Size',   'Average value of closed won deals',                 'crm', 'AVERAGE',  'deal_value',  'stage = ''Closed Won''',                        null,                                       'currency',   'up_is_good',   null,   null),
  ('sales_cycle',     'Sales Cycle',     'Average days from deal created to closed won',      'crm', 'DURATION', null,          'stage = ''Closed Won''',                        null,                                       'days',       'down_is_good', '> 90', '> 60'),
  ('open_tickets',    'Open Tickets',    'Number of currently open support tickets',          'ticket', 'COUNT',  'status',     'status = ''Open''',                             null,                                       'number',     'down_is_good', '> 50', '> 30'),
  ('avg_resolution',  'Avg Resolution',  'Average days from ticket open to ticket resolved',  'ticket', 'DURATION', null,       'status = ''Resolved''',                         null,                                       'days',       'down_is_good', '> 3',  '> 2');


-- ============================================================
-- TABLE 2: field_aliases
-- How raw column names from each source tool map to
-- universal field names. One row per tool per column.
-- Adding a new tool = inserting rows here. Zero code changes.
-- ============================================================

CREATE TABLE field_aliases (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  schema_type      schema_type NOT NULL,
  source_tool      TEXT NOT NULL,        -- e.g. 'hubspot', 'zoho', 'zendesk'
  raw_column       TEXT NOT NULL,        -- exactly as it appears in the CSV/API
  universal_field  TEXT NOT NULL,        -- the field name signal_definitions uses
  transform        TEXT,                 -- optional: 'multiply:0.65', 'uppercase', 'trim'
  confidence       INTEGER DEFAULT 95,   -- 0-100, used during auto-mapping

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (source_tool, raw_column)
);

-- Seed: common CRM aliases
INSERT INTO field_aliases (schema_type, source_tool, raw_column, universal_field, confidence) VALUES
  ('crm', 'zoho',       'Amount',           'deal_value', 99),
  ('crm', 'zoho',       'Stage',            'stage',      99),
  ('crm', 'zoho',       'Closing Date',     'close_date', 99),
  ('crm', 'zoho',       'Deal Name',        'deal_name',  99),
  ('crm', 'zoho',       'Account Name',     'account',    99),
  ('crm', 'zoho',       'Owner',            'owner',      99),
  ('crm', 'zoho',       'Created Time',     'created_at', 99),
  ('crm', 'hubspot',    'Amount',           'deal_value', 99),
  ('crm', 'hubspot',    'Deal Stage',       'stage',      99),
  ('crm', 'hubspot',    'Close Date',       'close_date', 99),
  ('crm', 'hubspot',    'Deal Name',        'deal_name',  99),
  ('crm', 'hubspot',    'hs_deal_stage',    'stage',      95),
  ('crm', 'hubspot',    'hs_acv',           'deal_value', 90),
  ('crm', 'salesforce', 'Amount',           'deal_value', 99),
  ('crm', 'salesforce', 'StageName',        'stage',      99),
  ('crm', 'salesforce', 'CloseDate',        'close_date', 99),
  ('crm', 'salesforce', 'Name',             'deal_name',  95),
  ('crm', 'salesforce', 'AccountName',      'account',    99),
  ('ticket', 'zoho',    'Status',           'status',     99),
  ('ticket', 'zoho',    'Created Time',     'created_at', 99),
  ('ticket', 'zoho',    'Closed Time',      'resolved_at',99),
  ('ticket', 'zoho',    'Priority',         'priority',   99),
  ('ticket', 'zoho',    'Category',         'category',   95),
  ('ticket', 'zendesk', 'status',           'status',     99),
  ('ticket', 'zendesk', 'created_at',       'created_at', 99),
  ('ticket', 'zendesk', 'solved_at',        'resolved_at',99),
  ('ticket', 'zendesk', 'priority',         'priority',   99);


-- ============================================================
-- TABLE 3: value_mappings
-- What each tool calls standard values.
-- e.g. HubSpot calls 'Closed Won' as 'closedwon'
-- ============================================================

CREATE TABLE value_mappings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  schema_type      schema_type NOT NULL,
  source_tool      TEXT NOT NULL,
  universal_field  TEXT NOT NULL,        -- which field this applies to
  raw_value        TEXT NOT NULL,        -- as it appears in the data
  universal_value  TEXT NOT NULL,        -- the standard value signal_definitions uses

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (source_tool, universal_field, raw_value)
);

-- Seed: stage name mappings
INSERT INTO value_mappings (schema_type, source_tool, universal_field, raw_value, universal_value) VALUES
  ('crm', 'hubspot',    'stage', 'closedwon',        'Closed Won'),
  ('crm', 'hubspot',    'stage', 'closedlost',       'Closed Lost'),
  ('crm', 'hubspot',    'stage', 'appointmentscheduled', 'Qualified'),
  ('crm', 'hubspot',    'stage', 'qualifiedtobuy',   'Qualified'),
  ('crm', 'hubspot',    'stage', 'presentationscheduled', 'Proposal'),
  ('crm', 'hubspot',    'stage', 'decisionmakerboughtin', 'Negotiation'),
  ('crm', 'hubspot',    'stage', 'contractsent',     'Negotiation'),
  ('crm', 'salesforce', 'stage', 'Closed Won',       'Closed Won'),
  ('crm', 'salesforce', 'stage', 'Closed Lost',      'Closed Lost'),
  ('crm', 'salesforce', 'stage', 'Prospecting',      'Prospecting'),
  ('crm', 'salesforce', 'stage', 'Qualification',    'Qualified'),
  ('crm', 'salesforce', 'stage', 'Proposal/Price Quote', 'Proposal'),
  ('crm', 'salesforce', 'stage', 'Negotiation/Review', 'Negotiation'),
  ('ticket', 'zendesk', 'status', 'new',             'Open'),
  ('ticket', 'zendesk', 'status', 'open',            'Open'),
  ('ticket', 'zendesk', 'status', 'pending',         'Pending'),
  ('ticket', 'zendesk', 'status', 'hold',            'On Hold'),
  ('ticket', 'zendesk', 'status', 'solved',          'Resolved'),
  ('ticket', 'zendesk', 'status', 'closed',          'Resolved');


-- ============================================================
-- TABLE 4: signal_overrides
-- Per-org overrides for thresholds, labels, filters.
-- Never modifies the base signal_definition.
-- ============================================================

CREATE TABLE signal_overrides (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  org_id               UUID NOT NULL,          -- references your orgs/tenants table
  signal_key           TEXT NOT NULL,          -- matches signal_definitions.key

  -- Optional overrides — null means use the base definition value
  custom_label         TEXT,                   -- rename the signal for this org
  urgency_threshold    TEXT,                   -- override red threshold
  warning_threshold    TEXT,                   -- override amber threshold
  exclude_filter       TEXT,                   -- add org-specific exclusions
  is_active            BOOLEAN DEFAULT true,   -- hide a signal for this org

  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (org_id, signal_key)
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_signal_definitions_schema   ON signal_definitions (schema_type);
CREATE INDEX idx_signal_definitions_active   ON signal_definitions (is_active);
CREATE INDEX idx_field_aliases_tool          ON field_aliases (source_tool);
CREATE INDEX idx_field_aliases_schema        ON field_aliases (schema_type);
CREATE INDEX idx_value_mappings_tool_field   ON value_mappings (source_tool, universal_field);
CREATE INDEX idx_signal_overrides_org        ON signal_overrides (org_id);
CREATE INDEX idx_signal_overrides_key        ON signal_overrides (signal_key);


-- ============================================================
-- EXECUTION QUERY PATTERN (reference)
-- How the engine resolves a signal for a given org.
-- 
-- 1. Load signal_definition for the signal key
-- 2. Check signal_overrides for this org — apply any overrides
-- 3. Use field_aliases to translate uploaded column names → universal fields
-- 4. Use value_mappings to translate raw values → universal values  
-- 5. Execute the operation using the resolved filters
-- 6. Apply format and threshold to produce: value + status (urgent/warning/stable)
-- ============================================================
