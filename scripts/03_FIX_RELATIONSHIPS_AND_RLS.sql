-- Fix Foreign Key Relationships and RLS Policies
-- Run this script in Supabase SQL Editor

-- First, drop all existing RLS policies to avoid conflicts
DROP POLICY IF EXISTS "orgs_select_all" ON organizations;
DROP POLICY IF EXISTS "organizations_select" ON organizations;
DROP POLICY IF EXISTS "organizations_insert" ON organizations;
DROP POLICY IF EXISTS "organizations_update" ON organizations;
DROP POLICY IF EXISTS "organizations_delete" ON organizations;
DROP POLICY IF EXISTS "org_members_select" ON organization_members;
DROP POLICY IF EXISTS "org_members_insert" ON organization_members;
DROP POLICY IF EXISTS "org_members_update" ON organization_members;
DROP POLICY IF EXISTS "org_members_delete" ON organization_members;

-- Create simplified, non-recursive RLS policies for organizations
-- Allow all authenticated users to read all organizations
CREATE POLICY "organizations_select" ON organizations
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow any authenticated user to create organizations
CREATE POLICY "organizations_insert" ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow organization creators to update their orgs
CREATE POLICY "organizations_update" ON organizations
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Allow organization creators to delete their orgs
CREATE POLICY "organizations_delete" ON organizations
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Create simplified RLS policies for organization_members
-- Allow all authenticated users to read all memberships
CREATE POLICY "org_members_select" ON organization_members
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow any authenticated user to insert memberships (for creating orgs and inviting)
CREATE POLICY "org_members_insert" ON organization_members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update their own membership role
CREATE POLICY "org_members_update" ON organization_members
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Allow users to delete their own membership
CREATE POLICY "org_members_delete" ON organization_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Ensure all foreign key relationships are properly set up
-- Check and add missing foreign keys

-- Fix profiles table foreign keys
DO $$
BEGIN
  -- Drop existing constraint if it exists
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_organization_id_fkey;
  
  -- Add the constraint
  ALTER TABLE profiles 
  ADD CONSTRAINT profiles_organization_id_fkey 
  FOREIGN KEY (organization_id) 
  REFERENCES organizations(id) 
  ON DELETE SET NULL;
EXCEPTION
  WHEN undefined_column THEN
    RAISE NOTICE 'organization_id column does not exist in profiles';
  WHEN undefined_table THEN
    RAISE NOTICE 'profiles or organizations table does not exist';
END $$;

-- Fix decisions table foreign keys
DO $$
BEGIN
  -- Drop existing constraint if it exists
  ALTER TABLE decisions DROP CONSTRAINT IF EXISTS decisions_owner_id_fkey;
  
  -- Add the constraint
  ALTER TABLE decisions 
  ADD CONSTRAINT decisions_owner_id_fkey 
  FOREIGN KEY (owner_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;
EXCEPTION
  WHEN undefined_column THEN
    RAISE NOTICE 'owner_id column does not exist in decisions';
  WHEN undefined_table THEN
    RAISE NOTICE 'decisions or profiles table does not exist';
END $$;

-- Fix organization_members foreign keys
DO $$
BEGIN
  -- Drop existing constraints if they exist
  ALTER TABLE organization_members DROP CONSTRAINT IF EXISTS organization_members_organization_id_fkey;
  ALTER TABLE organization_members DROP CONSTRAINT IF EXISTS organization_members_user_id_fkey;
  
  -- Add the constraints
  ALTER TABLE organization_members 
  ADD CONSTRAINT organization_members_organization_id_fkey 
  FOREIGN KEY (organization_id) 
  REFERENCES organizations(id) 
  ON DELETE CASCADE;
  
  ALTER TABLE organization_members 
  ADD CONSTRAINT organization_members_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;
EXCEPTION
  WHEN undefined_column THEN
    RAISE NOTICE 'Column does not exist in organization_members';
  WHEN undefined_table THEN
    RAISE NOTICE 'organization_members, organizations, or profiles table does not exist';
END $$;

-- Create a profile for admin@admin.com if it doesn't exist
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the auth user ID for admin@admin.com
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@admin.com'
  LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    -- Insert profile if it doesn't exist
    INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (
      admin_user_id,
      'admin@admin.com',
      'Admin User',
      'CEO',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();
    
    RAISE NOTICE 'Profile created/updated for admin@admin.com';
  ELSE
    RAISE NOTICE 'No auth user found for admin@admin.com';
  END IF;
END $$;

-- Verify the setup
SELECT 'Organizations table exists' as status, COUNT(*) as count FROM organizations;
SELECT 'Organization members table exists' as status, COUNT(*) as count FROM organization_members;
SELECT 'Profiles table exists' as status, COUNT(*) as count FROM profiles;
SELECT 'Admin profile exists' as status, COUNT(*) as count FROM profiles WHERE email = 'admin@admin.com';
