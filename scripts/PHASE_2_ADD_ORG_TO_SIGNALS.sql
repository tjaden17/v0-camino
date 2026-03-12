-- Phase 2: Add organization tracking to signals and uploads

-- Add organization_id to signals table
ALTER TABLE public.signals ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to upload_history
ALTER TABLE public.upload_history ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Add metadata column to signals for KPI tags
ALTER TABLE public.signals ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add priority column to signals
ALTER TABLE public.signals ADD COLUMN IF NOT EXISTS priority text CHECK (priority IN ('high', 'medium', 'low'));

-- Create index for organization-based queries
CREATE INDEX IF NOT EXISTS idx_signals_org_id ON public.signals(organization_id);
CREATE INDEX IF NOT EXISTS idx_upload_history_org_id ON public.upload_history(organization_id);

-- Update RLS policies to consider organization membership
DROP POLICY IF EXISTS "signals_select_all" ON public.signals;
CREATE POLICY "signals_select_org_members"
  ON public.signals FOR SELECT
  USING (
    organization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = signals.organization_id AND user_id = auth.uid()
    )
  );

-- Allow inserting signals for your organization
DROP POLICY IF EXISTS "signals_insert_authenticated" ON public.signals;
CREATE POLICY "signals_insert_org_members"
  ON public.signals FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      organization_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = signals.organization_id AND user_id = auth.uid()
      )
    )
  );
