-- Seed pre-built column mapping templates (Locumate / Zoho)
-- Run after 014_column_mappings.sql
-- MSS_BUILD_PLAN_LOCKED.md "Exact Column Mappings"

INSERT INTO column_mappings (organization_id, source_tool, row_type, display_name, field_mappings)
SELECT NULL, 'zoho-crm-deals', 'deals', 'Zoho CRM Deals', '{"deal_id": "Id", "deal_name": "Deal Name", "owner": "Deal Owner Name", "deal_value": "Amount", "stage": "Stage", "close_date": "Closing Date", "sales_cycle": "Sales Cycle Duration", "probability": "Probability (%)", "created": "Created Time"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM column_mappings WHERE source_tool = 'zoho-crm-deals' AND organization_id IS NULL);

INSERT INTO column_mappings (organization_id, source_tool, row_type, display_name, field_mappings)
SELECT NULL, 'zoho-desk-tickets', 'tickets', 'Zoho Desk Tickets', '{"ticket_id": "ID", "subject": "Subject", "status": "Status", "priority": "Priority", "channel": "Channel", "created": "Created Time", "resolution_time": "Resolution Time in Business Hours", "first_response": "First Response Time in Business Hours", "sla_violation": "SLA Violation Type", "department": "Department"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM column_mappings WHERE source_tool = 'zoho-desk-tickets' AND organization_id IS NULL);

INSERT INTO column_mappings (organization_id, source_tool, row_type, display_name, field_mappings)
SELECT NULL, 'zoho-crm-leads', 'leads', 'Zoho CRM Leads', '{"lead_id": "Id", "name": "Full Name", "company": "Company", "owner": "Lead Owner Name", "is_converted": "Is Converted", "created": "Created Time"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM column_mappings WHERE source_tool = 'zoho-crm-leads' AND organization_id IS NULL);

-- Custom / Other: no auto-mapping; user fills the 3 questions manually
INSERT INTO column_mappings (organization_id, source_tool, row_type, display_name, field_mappings)
SELECT NULL, 'custom', 'custom', 'Custom / Other', '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM column_mappings WHERE source_tool = 'custom' AND organization_id IS NULL);
