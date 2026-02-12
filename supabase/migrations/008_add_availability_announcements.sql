-- User availability table
CREATE TABLE IF NOT EXISTS public.user_availability (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Trip announcements table
CREATE TABLE IF NOT EXISTS public.trip_announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_availability_trip_id ON public.user_availability(trip_id);
CREATE INDEX IF NOT EXISTS idx_user_availability_user_id ON public.user_availability(user_id);
CREATE INDEX IF NOT EXISTS idx_user_availability_dates ON public.user_availability(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_trip_announcements_trip_id ON public.trip_announcements(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_announcements_pinned ON public.trip_announcements(is_pinned);

-- RLS Policies for user_availability
ALTER TABLE public.user_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view availability"
  ON public.user_availability FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = user_availability.trip_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own availability"
  ON public.user_availability FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for trip_announcements
ALTER TABLE public.trip_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view announcements"
  ON public.trip_announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = trip_announcements.trip_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Trip organizers can create announcements"
  ON public.trip_announcements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = trip_id
        AND user_id = auth.uid()
        AND role = 'organizer'
    )
  );

CREATE POLICY "Creators can update their announcements"
  ON public.trip_announcements FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their announcements"
  ON public.trip_announcements FOR DELETE
  USING (auth.uid() = created_by);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_availability;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_announcements;
