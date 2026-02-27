-- Link existing Neon profile surge13@locumate.com to the new Supabase Auth user.
-- New Supabase user UUID: 0bf506a6-49dd-4bd1-8a0d-32a8b540d08a
-- Run in Neon SQL Editor. Safe to run once (updates by email).

DO $$
DECLARE
  old_id UUID;
  new_id CONSTANT UUID := '0bf506a6-49dd-4bd1-8a0d-32a8b540d08a';
BEGIN
  SELECT id INTO old_id FROM profiles WHERE email = 'surge13@locumate.com' LIMIT 1;

  IF old_id IS NULL THEN
    RAISE NOTICE 'No profile found for surge13@locumate.com - nothing to update.';
    RETURN;
  END IF;

  IF old_id = new_id THEN
    RAISE NOTICE 'Profile already linked to new UUID.';
    RETURN;
  END IF;

  -- Update child tables first (they reference profiles.id via user_id)
  UPDATE user_context SET user_id = new_id WHERE user_id = old_id;
  UPDATE user_goals SET user_id = new_id WHERE user_id = old_id;

  -- Then update the profile's primary key to the new Supabase user id
  UPDATE profiles SET id = new_id WHERE email = 'surge13@locumate.com';

  RAISE NOTICE 'Linked surge13@locumate.com to Supabase user %.', new_id;
END $$;
