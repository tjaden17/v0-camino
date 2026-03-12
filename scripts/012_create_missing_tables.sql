-- Migration: Create missing tables referenced in code but not yet in database
-- Tables: organization_members, integrations

-- 1. organization_members - Links users to orgs with roles
CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);

-- 2. integrations - Third-party integrations per org
CREATE TABLE IF NOT EXISTS public.integrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_type text NOT NULL DEFAULT 'crm',
  status text NOT NULL DEFAULT 'disconnected',
  config jsonb DEFAULT '{}',
  credentials jsonb DEFAULT '{}',
  last_sync_at timestamp with time zone,
  last_sync_status text,
  last_sync_error text,
  sync_frequency text DEFAULT 'daily',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(organization_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_integrations_org ON public.integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON public.integrations(provider);

-- Verify
SELECT 'organization_members' as table_name, COUNT(*) as row_count FROM public.organization_members
UNION ALL
SELECT 'integrations', COUNT(*) FROM public.integrations;
