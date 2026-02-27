-- Link Neon profile surge13@locumate.com to the DEV Supabase Auth user.
-- Use this when working locally (localhost) with dev Supabase.
--
-- BEFORE RUNNING: Replace REPLACE_WITH_DEV_USER_UUID below with the actual
-- dev Supabase user UUID: Dashboard → Authentication → Users → surge13@locumate.com → copy UID.
--
-- Run in Neon SQL Editor.

DO $$
DECLARE
  old_id UUID;
  new_id CONSTANT UUID := 'REPLACE_WITH_DEV_USER_UUID'::uuid;
BEGIN
  SELECT id INTO old_id FROM profiles WHERE email = 'surge13@locumate.com' LIMIT 1;

  IF old_id IS NULL THEN
    RAISE NOTICE 'No profile found for surge13@locumate.com - nothing to update.';
    RETURN;
  END IF;

  IF old_id = new_id THEN
    RAISE NOTICE 'Profile already linked to dev UUID.';
    RETURN;
  END IF;

  UPDATE user_context SET user_id = new_id WHERE user_id = old_id;
  UPDATE user_goals SET user_id = new_id WHERE user_id = old_id;
  UPDATE profiles SET id = new_id WHERE email = 'surge13@locumate.com';

  RAISE NOTICE 'Linked surge13@locumate.com to dev Supabase user %.', new_id;
END $$;
