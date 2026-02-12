-- Accommodation details table
CREATE TABLE IF NOT EXISTS public.accommodations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT,
  address TEXT,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  door_code TEXT,
  wifi_name TEXT,
  wifi_password TEXT,
  house_rules TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooming assignments table
CREATE TABLE IF NOT EXISTS public.room_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  room_name TEXT NOT NULL,
  bed_type TEXT,
  capacity INTEGER DEFAULT 1,
  assigned_users UUID[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shared documents/links table
CREATE TABLE IF NOT EXISTS public.trip_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('accommodation', 'reservation', 'activity', 'flight', 'other')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transportation coordination table
CREATE TABLE IF NOT EXISTS public.transportation (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('carpool', 'flight', 'train', 'other')),
  driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  departure_time TIMESTAMPTZ,
  departure_location TEXT,
  arrival_time TIMESTAMPTZ,
  arrival_location TEXT,
  seats_available INTEGER,
  passengers UUID[] DEFAULT '{}',
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_accommodations_trip_id ON public.accommodations(trip_id);
CREATE INDEX IF NOT EXISTS idx_room_assignments_trip_id ON public.room_assignments(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_documents_trip_id ON public.trip_documents(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_documents_category ON public.trip_documents(category);
CREATE INDEX IF NOT EXISTS idx_transportation_trip_id ON public.transportation(trip_id);
CREATE INDEX IF NOT EXISTS idx_transportation_type ON public.transportation(type);

-- RLS Policies for accommodations
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view accommodation"
  ON public.accommodations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = accommodations.trip_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Trip organizers can manage accommodation"
  ON public.accommodations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = accommodations.trip_id
        AND user_id = auth.uid()
        AND role = 'organizer'
    )
  );

-- RLS Policies for room_assignments
ALTER TABLE public.room_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view room assignments"
  ON public.room_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = room_assignments.trip_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can update room assignments"
  ON public.room_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = room_assignments.trip_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for trip_documents
ALTER TABLE public.trip_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view documents"
  ON public.trip_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = trip_documents.trip_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can create documents"
  ON public.trip_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = trip_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own documents"
  ON public.trip_documents FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own documents"
  ON public.trip_documents FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for transportation
ALTER TABLE public.transportation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view transportation"
  ON public.transportation FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = transportation.trip_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can create transportation"
  ON public.transportation FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = trip_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own transportation"
  ON public.transportation FOR UPDATE
  USING (auth.uid() = created_by OR auth.uid() = driver_id);

CREATE POLICY "Users can delete their own transportation"
  ON public.transportation FOR DELETE
  USING (auth.uid() = created_by);

-- Enable real-time for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.accommodations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transportation;
