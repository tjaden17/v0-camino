-- Fix for missing profiles and RLS policy issues
-- Run this script in Supabase SQL Editor

-- ============================================
-- 1. CREATE TRIGGER TO AUTO-CREATE PROFILES
-- ============================================

-- Function to create profile on user signup
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. CREATE PROFILE FOR EXISTING ADMIN USER
-- ============================================

-- Insert profile for admin@admin.com if it doesn't exist
INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email),
  created_at,
  NOW()
FROM auth.users
WHERE email = 'admin@admin.com'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. FIX RLS POLICIES FOR ORGANIZATIONS
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "orgs_insert_own" ON public.organizations;
DROP POLICY IF EXISTS "orgs_select_members" ON public.organizations;
DROP POLICY IF EXISTS "orgs_update_admin" ON public.organizations;

-- Allow any authenticated user to view all organizations (admin needs this)
CREATE POLICY "orgs_select_all"
  ON public.organizations FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow any authenticated user to create organizations
CREATE POLICY "orgs_insert_authenticated"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow creators and org admins to update organizations
CREATE POLICY "orgs_update_creator_or_admin"
  ON public.organizations FOR UPDATE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = organizations.id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow creators and org admins to delete organizations
CREATE POLICY "orgs_delete_creator_or_admin"
  ON public.organizations FOR DELETE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = organizations.id 
      AND user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- 4. FIX RLS POLICIES FOR ORGANIZATION MEMBERS
-- ============================================

DROP POLICY IF EXISTS "org_members_select" ON public.organization_members;
DROP POLICY IF EXISTS "org_members_insert" ON public.organization_members;
DROP POLICY IF EXISTS "org_members_update" ON public.organization_members;
DROP POLICY IF EXISTS "org_members_delete" ON public.organization_members;

-- Allow users to view members of their organizations
CREATE POLICY "org_members_select"
  ON public.organization_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.organization_members AS om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
    )
  );

-- Allow org creators and admins to add members
CREATE POLICY "org_members_insert"
  ON public.organization_members FOR INSERT
  WITH CHECK (
    auth.uid() = invited_by
    AND (
      EXISTS (
        SELECT 1 FROM public.organizations
        WHERE id = organization_id AND created_by = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = organization_members.organization_id
        AND user_id = auth.uid()
        AND role = 'admin'
      )
    )
  );

-- Allow org admins to update members
CREATE POLICY "org_members_update"
  ON public.organization_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations
      WHERE id = organization_id AND created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.organization_members AS om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'admin'
    )
  );

-- Allow org admins to remove members
CREATE POLICY "org_members_delete"
  ON public.organization_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations
      WHERE id = organization_id AND created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.organization_members AS om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'admin'
    )
  );

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Profiles will now be created automatically for new users
-- Admin user profile has been created
-- RLS policies have been fixed to allow organization creation
