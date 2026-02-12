-- Migration 009: Add Sport-Specific Modules (Golf & Ski)
-- Adds trip_type field and creates tables for golf and ski trip features

-- Add trip_type to trips table
ALTER TABLE public.trips
ADD COLUMN trip_type TEXT
CHECK (trip_type IN ('golf', 'ski', 'bachelor_party', 'general'))
DEFAULT 'general';

CREATE INDEX idx_trips_trip_type ON public.trips(trip_type);

-- =====================================================
-- GOLF MODULE TABLES
-- =====================================================

-- Golf tee times table
CREATE TABLE IF NOT EXISTS public.golf_tee_times (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  course_name TEXT NOT NULL,
  course_location TEXT,
  tee_time TIMESTAMPTZ NOT NULL,
  num_players INTEGER DEFAULT 4,
  players UUID[] DEFAULT '{}',
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Golf scorecards table
CREATE TABLE IF NOT EXISTS public.golf_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tee_time_id UUID REFERENCES public.golf_tee_times(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER,
  handicap INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tee_time_id, user_id)
);

-- Golf equipment needs table
CREATE TABLE IF NOT EXISTS public.golf_equipment (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  needs_clubs BOOLEAN DEFAULT false,
  needs_cart BOOLEAN DEFAULT false,
  needs_push_cart BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- =====================================================
-- SKI MODULE TABLES
-- =====================================================

-- Ski lift tickets table
CREATE TABLE IF NOT EXISTS public.ski_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ticket_type TEXT CHECK (ticket_type IN ('single_day', 'multi_day', 'season_pass', 'none')),
  num_days INTEGER,
  purchased BOOLEAN DEFAULT false,
  cost DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- Ski ability levels table
CREATE TABLE IF NOT EXISTS public.ski_abilities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ability_level TEXT CHECK (ability_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  ski_or_snowboard TEXT CHECK (ski_or_snowboard IN ('ski', 'snowboard', 'both')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- Ski equipment rentals table
CREATE TABLE IF NOT EXISTS public.ski_rentals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  needs_skis BOOLEAN DEFAULT false,
  needs_snowboard BOOLEAN DEFAULT false,
  needs_boots BOOLEAN DEFAULT false,
  needs_helmet BOOLEAN DEFAULT false,
  boot_size DECIMAL(4,1),
  height_cm INTEGER,
  weight_kg INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_golf_tee_times_trip ON public.golf_tee_times(trip_id);
CREATE INDEX idx_golf_scores_tee_time ON public.golf_scores(tee_time_id);
CREATE INDEX idx_golf_equipment_trip ON public.golf_equipment(trip_id);
CREATE INDEX idx_ski_tickets_trip ON public.ski_tickets(trip_id);
CREATE INDEX idx_ski_abilities_trip ON public.ski_abilities(trip_id);
CREATE INDEX idx_ski_rentals_trip ON public.ski_rentals(trip_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all sport tables
ALTER TABLE public.golf_tee_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.golf_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.golf_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ski_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ski_abilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ski_rentals ENABLE ROW LEVEL SECURITY;

-- Golf Tee Times Policies (trip members can view, organizer can manage)
CREATE POLICY "Trip members can view golf tee times"
  ON public.golf_tee_times FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = golf_tee_times.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can create golf tee times"
  ON public.golf_tee_times FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = golf_tee_times.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can update golf tee times"
  ON public.golf_tee_times FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = golf_tee_times.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can delete golf tee times"
  ON public.golf_tee_times FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = golf_tee_times.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

-- Golf Scores Policies (trip members can view, users can manage their own)
CREATE POLICY "Trip members can view golf scores"
  ON public.golf_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.golf_tee_times gtt
      JOIN public.trip_members tm ON tm.trip_id = gtt.trip_id
      WHERE gtt.id = golf_scores.tee_time_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own golf scores"
  ON public.golf_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own golf scores"
  ON public.golf_scores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own golf scores"
  ON public.golf_scores FOR DELETE
  USING (auth.uid() = user_id);

-- Golf Equipment Policies (trip members can view, users can manage their own)
CREATE POLICY "Trip members can view golf equipment"
  ON public.golf_equipment FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = golf_equipment.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own golf equipment"
  ON public.golf_equipment FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own golf equipment"
  ON public.golf_equipment FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own golf equipment"
  ON public.golf_equipment FOR DELETE
  USING (auth.uid() = user_id);

-- Ski Tickets Policies (trip members can view, users can manage their own)
CREATE POLICY "Trip members can view ski tickets"
  ON public.ski_tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = ski_tickets.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own ski tickets"
  ON public.ski_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ski tickets"
  ON public.ski_tickets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ski tickets"
  ON public.ski_tickets FOR DELETE
  USING (auth.uid() = user_id);

-- Ski Abilities Policies (trip members can view, users can manage their own)
CREATE POLICY "Trip members can view ski abilities"
  ON public.ski_abilities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = ski_abilities.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own ski abilities"
  ON public.ski_abilities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ski abilities"
  ON public.ski_abilities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ski abilities"
  ON public.ski_abilities FOR DELETE
  USING (auth.uid() = user_id);

-- Ski Rentals Policies (trip members can view, users can manage their own)
CREATE POLICY "Trip members can view ski rentals"
  ON public.ski_rentals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_members.trip_id = ski_rentals.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own ski rentals"
  ON public.ski_rentals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ski rentals"
  ON public.ski_rentals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ski rentals"
  ON public.ski_rentals FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- REAL-TIME SUBSCRIPTIONS
-- =====================================================

-- Enable real-time for golf and ski tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.golf_tee_times;
ALTER PUBLICATION supabase_realtime ADD TABLE public.golf_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ski_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ski_abilities;
