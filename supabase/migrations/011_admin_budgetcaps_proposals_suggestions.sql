-- Migration 011: Admin controls, budget caps, trip proposals, activity suggestions

-- 1. Add budget_cap to trip_members
ALTER TABLE public.trip_members
ADD COLUMN IF NOT EXISTS budget_cap DECIMAL(10,2) DEFAULT NULL;

-- 2. Add proposal_enabled to trips
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS proposal_enabled BOOLEAN DEFAULT false;

-- 3. Create pending_invites table
CREATE TABLE IF NOT EXISTS public.pending_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  invited_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, email)
);

CREATE INDEX IF NOT EXISTS idx_pending_invites_email ON public.pending_invites(email);
CREATE INDEX IF NOT EXISTS idx_pending_invites_trip_id ON public.pending_invites(trip_id);

-- 4. Create activity_suggestions table
CREATE TABLE IF NOT EXISTS public.activity_suggestions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE,
  time TIME,
  location TEXT,
  suggested_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_suggestions_trip_id ON public.activity_suggestions(trip_id);
CREATE INDEX IF NOT EXISTS idx_activity_suggestions_status ON public.activity_suggestions(status);

-- 5. RLS for pending_invites
ALTER TABLE public.pending_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view pending invites"
  ON public.pending_invites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = pending_invites.trip_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can insert pending invites"
  ON public.pending_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = pending_invites.trip_id
        AND user_id = auth.uid()
        AND role = 'organizer'
    )
  );

CREATE POLICY "Organizers can delete pending invites"
  ON public.pending_invites FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = pending_invites.trip_id
        AND user_id = auth.uid()
        AND role = 'organizer'
    )
  );

-- 6. RLS for activity_suggestions
ALTER TABLE public.activity_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view suggestions"
  ON public.activity_suggestions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = activity_suggestions.trip_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can create suggestions"
  ON public.activity_suggestions FOR INSERT
  WITH CHECK (
    auth.uid() = suggested_by
    AND EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = activity_suggestions.trip_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Suggestion creators can update own"
  ON public.activity_suggestions FOR UPDATE
  USING (auth.uid() = suggested_by);

CREATE POLICY "Organizers can update any suggestion"
  ON public.activity_suggestions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = activity_suggestions.trip_id
        AND user_id = auth.uid()
        AND role = 'organizer'
    )
  );

CREATE POLICY "Suggestion creators can delete own"
  ON public.activity_suggestions FOR DELETE
  USING (auth.uid() = suggested_by);

CREATE POLICY "Organizers can delete any suggestion"
  ON public.activity_suggestions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members
      WHERE trip_id = activity_suggestions.trip_id
        AND user_id = auth.uid()
        AND role = 'organizer'
    )
  );

-- 7. Add organizer UPDATE policy on trip_members (for role changes)
CREATE POLICY "Organizers can update any member"
  ON public.trip_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members tm
      WHERE tm.trip_id = trip_members.trip_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'organizer'
    )
  );

-- 8. Auto-link pending invites when a new profile is created
CREATE OR REPLACE FUNCTION public.handle_pending_invites()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.trip_members (trip_id, user_id, role, rsvp_status)
  SELECT trip_id, NEW.id, 'member', 'pending'
  FROM public.pending_invites
  WHERE LOWER(email) = LOWER(NEW.email);

  DELETE FROM public.pending_invites WHERE LOWER(email) = LOWER(NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_check_invites
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_pending_invites();

-- 9. Updated_at trigger for activity_suggestions
CREATE TRIGGER set_activity_suggestions_updated_at
  BEFORE UPDATE ON public.activity_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 10. Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_suggestions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pending_invites;
