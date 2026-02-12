-- Migration 010: Add bachelorette_party trip type
-- Expands trip_type to include bachelorette parties

-- Drop the old constraint
ALTER TABLE public.trips
DROP CONSTRAINT IF EXISTS trips_trip_type_check;

-- Add new constraint with bachelorette_party included
ALTER TABLE public.trips
ADD CONSTRAINT trips_trip_type_check
CHECK (trip_type IN ('golf', 'ski', 'bachelor_party', 'bachelorette_party', 'general'));
