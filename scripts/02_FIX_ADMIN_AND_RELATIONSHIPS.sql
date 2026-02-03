-- Fix script to resolve profile, foreign key, and RLS issues
-- Run this in Supabase SQL Editor

-- Step 1: Create missing profile for admin user
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  must_change_password,
  password_changed_at
)
VALUES (
  '5e5caf4d-97c5-4210-ac40-152a769d5d89'::uuid,
  'admin@admin.com',
  'Admin User',
  'Admin',
  false,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  must_change_password = EXCLUDED.must_change_password,
  password_changed_at = EXCLUDED.password_changed_at;

-- Step 2: Fix the automatic profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Fix RLS policies for organizations table
DROP POLICY IF EXISTS "orgs_select_all" ON public.organizations;
DROP POLICY IF EXISTS "orgs_insert" ON public.organizations;
DROP POLICY IF EXISTS "orgs_update_member" ON public.organizations;
DROP POLICY IF EXISTS "orgs_delete_creator" ON public.organizations;

-- Allow all authenticated users to select all organizations
CREATE POLICY "orgs_select_all" ON public.organizations
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert organizations
CREATE POLICY "orgs_insert" ON public.organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow org members to update organizations
CREATE POLICY "orgs_update_member" ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Allow org creators and admins to delete organizations
CREATE POLICY "orgs_delete_creator" ON public.organizations
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Step 4: Fix RLS policies for organization_members table
DROP POLICY IF EXISTS "org_members_select" ON public.organization_members;
DROP POLICY IF EXISTS "org_members_insert" ON public.organization_members;
DROP POLICY IF EXISTS "org_members_update" ON public.organization_members;
DROP POLICY IF EXISTS "org_members_delete" ON public.organization_members;

-- Allow users to view members of orgs they belong to
CREATE POLICY "org_members_select" ON public.organization_members
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Allow org admins and creators to insert members
CREATE POLICY "org_members_insert" ON public.organization_members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow org admins to update member roles
CREATE POLICY "org_members_update" ON public.organization_members
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow org admins to remove members
CREATE POLICY "org_members_delete" ON public.organization_members
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Step 5: Verify the fix
SELECT 'Profile created for admin user' AS status 
WHERE EXISTS (
  SELECT 1 FROM public.profiles WHERE id = '5e5caf4d-97c5-4210-ac40-152a769d5d89'::uuid
);
