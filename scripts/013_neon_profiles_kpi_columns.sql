-- Add KPI columns to profiles (Neon) for "my KPIs at top" on Signals page
-- Run in Neon SQL Editor or via psql. Safe to run multiple times (IF NOT EXISTS).

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kpi_1 TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kpi_2 TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kpi_3 TEXT;

COMMENT ON COLUMN public.profiles.kpi_1 IS 'User-selected KPI 1; signals matching this appear at top of list';
COMMENT ON COLUMN public.profiles.kpi_2 IS 'User-selected KPI 2';
COMMENT ON COLUMN public.profiles.kpi_3 IS 'User-selected KPI 3';
