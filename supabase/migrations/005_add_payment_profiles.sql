-- Add payment profile columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS venmo_handle TEXT,
  ADD COLUMN IF NOT EXISTS zelle_email TEXT,
  ADD COLUMN IF NOT EXISTS cashapp_handle TEXT;

-- Create settlements table for tracking payment confirmations
CREATE TABLE IF NOT EXISTS public.settlements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  from_user UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  to_user UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'confirmed')),
  paid_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for settlements
CREATE INDEX IF NOT EXISTS idx_settlements_trip_id ON public.settlements(trip_id);
CREATE INDEX IF NOT EXISTS idx_settlements_from_user ON public.settlements(from_user);
CREATE INDEX IF NOT EXISTS idx_settlements_to_user ON public.settlements(to_user);

-- Add RLS policies for settlements
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view settlements they're involved in"
  ON public.settlements FOR SELECT
  USING (
    auth.uid() = from_user OR auth.uid() = to_user OR
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = settlements.trip_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create settlements for their trips"
  ON public.settlements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = trip_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own settlements"
  ON public.settlements FOR UPDATE
  USING (auth.uid() = from_user OR auth.uid() = to_user);
