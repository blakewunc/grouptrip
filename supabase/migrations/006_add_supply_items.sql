-- Create supply_items table for shared packing lists
CREATE TABLE IF NOT EXISTS public.supply_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('food_drinks', 'gear_equipment', 'kitchen_cooking', 'entertainment', 'toiletries', 'other')),
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  status TEXT DEFAULT 'needed' CHECK (status IN ('needed', 'claimed', 'packed')),
  cost DECIMAL(10,2),
  claimed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for supply_items
CREATE INDEX IF NOT EXISTS idx_supply_items_trip_id ON public.supply_items(trip_id);
CREATE INDEX IF NOT EXISTS idx_supply_items_category ON public.supply_items(category);
CREATE INDEX IF NOT EXISTS idx_supply_items_claimed_by ON public.supply_items(claimed_by);
CREATE INDEX IF NOT EXISTS idx_supply_items_status ON public.supply_items(status);

-- Add RLS policies for supply_items
ALTER TABLE public.supply_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view supply items"
  ON public.supply_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = supply_items.trip_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can create supply items"
  ON public.supply_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = trip_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can update supply items"
  ON public.supply_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = supply_items.trip_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can delete supply items"
  ON public.supply_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = supply_items.trip_id AND user_id = auth.uid()
    )
  );

-- Enable real-time for supply_items
ALTER PUBLICATION supabase_realtime ADD TABLE public.supply_items;
