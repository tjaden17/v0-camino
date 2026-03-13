-- =====================================================
-- PHASE 1: Database Foundation Fix
-- =====================================================
-- This script fixes RLS policies and creates admin profile
-- Run this AFTER running 00_SETUP_DATABASE.sql

-- Step 1: Drop all existing problematic RLS policies
-- =====================================================

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "orgs_select_all" ON organizations;
DROP POLICY IF EXISTS "orgs_select_members" ON organizations;
DROP POLICY IF EXISTS "orgs_insert_own" ON organizations;
DROP POLICY IF EXISTS "orgs_insert_authenticated" ON organizations;
DROP POLICY IF EXISTS "orgs_update_member" ON organizations;
DROP POLICY IF EXISTS "orgs_update_admin" ON organizations;
DROP POLICY IF EXISTS "orgs_delete_admin" ON organizations;
DROP POLICY IF EXISTS "org_members_select_member" ON organization_members;
DROP POLICY IF EXISTS "org_members_insert_admin" ON organization_members;
DROP POLICY IF EXISTS "org_members_update_admin" ON organization_members;
DROP POLICY IF EXISTS "org_members_delete_admin" ON organization_members;
DROP POLICY IF EXISTS "signals_select_member" ON signals;
DROP POLICY IF EXISTS "signals_select_all" ON signals;
DROP POLICY IF EXISTS "signals_insert_authenticated" ON signals;
DROP POLICY IF EXISTS "signals_update_owner" ON signals;
DROP POLICY IF EXISTS "signals_update_authenticated" ON signals;
DROP POLICY IF EXISTS "signals_delete_authenticated" ON signals;
DROP POLICY IF EXISTS "data_points_select_all" ON data_points;
DROP POLICY IF EXISTS "data_points_insert_authenticated" ON data_points;
DROP POLICY IF EXISTS "kpi_ownership_select_all" ON kpi_ownership;
DROP POLICY IF EXISTS "kpi_ownership_manage_own" ON kpi_ownership;
DROP POLICY IF EXISTS "decisions_select_all" ON decisions;
DROP POLICY IF EXISTS "decisions_insert_authenticated" ON decisions;
DROP POLICY IF EXISTS "decisions_update_all" ON decisions;
DROP POLICY IF EXISTS "decisions_manage_own" ON decisions;
DROP POLICY IF EXISTS "upload_history_select_own" ON upload_history;
DROP POLICY IF EXISTS "upload_history_insert_own" ON upload_history;
DROP POLICY IF EXISTS "integrations_select_own" ON integrations;
DROP POLICY IF EXISTS "integrations_manage_own" ON integrations;

-- Step 2: Create simple, permissive RLS policies for authenticated users
-- =====================================================

-- Profiles: Users can manage their own profile
CREATE POLICY "profiles_select_own" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Organizations: Authenticated users can do everything
CREATE POLICY "orgs_all_authenticated" 
ON organizations FOR ALL
TO authenticated 
USING (true)
WITH CHECK (true);

-- Organization Members: Authenticated users can do everything
CREATE POLICY "org_members_all_authenticated" 
ON organization_members FOR ALL
TO authenticated 
USING (true)
WITH CHECK (true);

-- Signals: Authenticated users can do everything
CREATE POLICY "signals_all_authenticated" 
ON signals FOR ALL
TO authenticated 
USING (true)
WITH CHECK (true);

-- Data Points: Authenticated users can do everything
CREATE POLICY "data_points_all_authenticated" 
ON data_points FOR ALL
TO authenticated 
USING (true)
WITH CHECK (true);

-- KPI Ownership: Authenticated users can do everything
CREATE POLICY "kpi_ownership_all_authenticated" 
ON kpi_ownership FOR ALL
TO authenticated 
USING (true)
WITH CHECK (true);

-- Decisions: Authenticated users can do everything
CREATE POLICY "decisions_all_authenticated" 
ON decisions FOR ALL
TO authenticated 
USING (true)
WITH CHECK (true);

-- Upload History: Authenticated users can view their own uploads
CREATE POLICY "upload_history_select_own" 
ON upload_history FOR SELECT
USING (auth.uid() = COALESCE(user_id, uploaded_by));

CREATE POLICY "upload_history_insert_authenticated" 
ON upload_history FOR INSERT
TO authenticated 
WITH CHECK (true);

-- Integrations: Users can manage their own integrations
CREATE POLICY "integrations_all_own" 
ON integrations FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 3: Create profile auto-creation trigger
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Create admin profile for existing admin user
-- =====================================================

DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Find admin@admin.com user ID
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@admin.com'
  LIMIT 1;

  -- If admin user exists, create their profile
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      role,
      created_at,
      updated_at
    )
    VALUES (
      admin_user_id,
      'admin@admin.com',
      'Camino Admin',
      'Founder/CEO',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      updated_at = NOW();
    
    RAISE NOTICE 'Admin profile created/updated for user ID: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Admin user (admin@admin.com) not found. Please sign up first.';
  END IF;
END $$;

-- Step 5: Verify setup
-- =====================================================

-- Count records
DO $$
DECLARE
  profile_count integer;
  org_count integer;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM profiles;
  SELECT COUNT(*) INTO org_count FROM organizations;
  
  RAISE NOTICE 'Setup Complete!';
  RAISE NOTICE 'Profiles: %', profile_count;
  RAISE NOTICE 'Organizations: %', org_count;
  RAISE NOTICE '';
  RAISE NOTICE 'You can now create organizations in the admin panel!';
END $$;
