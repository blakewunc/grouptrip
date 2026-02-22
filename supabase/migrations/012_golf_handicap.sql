-- Migration 012: Add handicap to golf_equipment for player profiling and group assignment
ALTER TABLE public.golf_equipment
ADD COLUMN handicap INTEGER DEFAULT NULL;
