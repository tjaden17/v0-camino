# Password Change Functionality

This document explains how the password change system works in Camino.

## Overview

Users are required to change their password after their first login for security purposes. They can also change their password anytime from their profile page.

## How It Works

### 1. Database Schema

The `profiles` table includes two columns for password management:

- `password_changed_at` - Timestamp of when the password was last changed
- `must_change_password` - Boolean flag indicating if the user needs to change their password

### 2. First Login Flow

1. When a user signs up, the `must_change_password` flag is set to `true` in their profile
2. After successful login, the protected layout checks if the user has `must_change_password: true` and no `password_changed_at` value
3. If true, a modal is displayed requiring the user to change their password before accessing the app
4. The modal cannot be dismissed until the password is changed
5. After successful password change:
   - `password_changed_at` is set to current timestamp
   - `must_change_password` is set to `false`
   - User can now access the app normally

### 3. Manual Password Change

Users can change their password anytime from the Profile page:

1. Navigate to Profile
2. Click "Change Password" button in the Account section
3. Enter current password and new password (with confirmation)
4. Password must meet security requirements:
   - At least 8 characters long
   - Contains uppercase and lowercase letters
   - Contains at least one number

### 4. Password Requirements

All passwords must meet the following criteria:
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number

## Setup Instructions

1. Run the migration script to add the password change columns:
   ```sql
   -- Run scripts/006_add_password_change_flag.sql in Supabase SQL Editor
   ```

2. The system automatically handles:
   - Setting the flag for new signups
   - Checking the flag on login
   - Displaying the password change modal
   - Updating the database after password change

## Components

- `components/change-password-modal.tsx` - Password change modal with validation
- `app/(protected)/layout.tsx` - Checks for first login and displays modal
- `app/(protected)/profile/page.tsx` - Includes "Change Password" button
- `app/auth/signup/page.tsx` - Sets `must_change_password` flag for new users

## Security Notes

- Passwords are hashed by Supabase Auth (never stored in plain text)
- Password validation is enforced on both client and server
- Users cannot bypass the first login password change
- Password change uses Supabase Auth's `updateUser()` method for security
