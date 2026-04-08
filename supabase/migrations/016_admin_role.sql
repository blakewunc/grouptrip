-- Add is_admin flag to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Only admins can read the is_admin column of other users
-- (users can still read their own profile via existing RLS)
-- No policy change needed — admins are verified server-side via service role
