-- Migration 014: Add expected_guests to trips
-- Allows organizers to set the expected headcount for accurate per-person cost
-- before all members have joined

ALTER TABLE public.trips
ADD COLUMN expected_guests INTEGER;
