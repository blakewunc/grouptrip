-- Migration 013: Add handicap and phone to profiles for user preferences
ALTER TABLE public.profiles
ADD COLUMN handicap INTEGER DEFAULT NULL,
ADD COLUMN phone TEXT DEFAULT NULL;
