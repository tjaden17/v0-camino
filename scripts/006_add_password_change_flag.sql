-- Add password change tracking to profiles table
alter table public.profiles 
add column if not exists password_changed_at timestamp with time zone,
add column if not exists must_change_password boolean default false;

-- Update existing users to not require password change
update public.profiles
set must_change_password = false
where must_change_password is null;
