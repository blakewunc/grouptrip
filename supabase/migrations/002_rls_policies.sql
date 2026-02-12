-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trips policies
CREATE POLICY "Trip members can view trips"
  ON public.trips FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.trip_members WHERE trip_id = trips.id
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "Authenticated users can create trips"
  ON public.trips FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Trip organizers can update trips"
  ON public.trips FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.trip_members
      WHERE trip_id = trips.id AND role = 'organizer'
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "Trip organizers can delete trips"
  ON public.trips FOR DELETE
  USING (created_by = auth.uid());

-- Trip members policies
CREATE POLICY "Members can view trip members"
  ON public.trip_members FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.trip_members tm2
      WHERE tm2.trip_id = trip_members.trip_id
    )
  );

CREATE POLICY "Users can join trips"
  ON public.trip_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own membership"
  ON public.trip_members FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Organizers can manage members"
  ON public.trip_members FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.trip_members
      WHERE trip_id = trip_members.trip_id AND role = 'organizer'
    )
  );

-- Budget categories policies
CREATE POLICY "Trip members can view budget"
  ON public.budget_categories FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.trip_members WHERE trip_id = budget_categories.trip_id
    )
  );

CREATE POLICY "Trip organizers can manage budget"
  ON public.budget_categories FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.trip_members
      WHERE trip_id = budget_categories.trip_id AND role = 'organizer'
    )
  );

-- Budget splits policies
CREATE POLICY "Trip members can view budget splits"
  ON public.budget_splits FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.trip_members tm
      JOIN public.budget_categories bc ON bc.trip_id = tm.trip_id
      WHERE bc.id = budget_splits.category_id
    )
  );

CREATE POLICY "Trip organizers can manage budget splits"
  ON public.budget_splits FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.trip_members tm
      JOIN public.budget_categories bc ON bc.trip_id = tm.trip_id
      WHERE bc.id = budget_splits.category_id AND tm.role = 'organizer'
    )
  );

-- Itinerary items policies
CREATE POLICY "Trip members can view itinerary"
  ON public.itinerary_items FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.trip_members WHERE trip_id = itinerary_items.trip_id
    )
  );

CREATE POLICY "Trip organizers can manage itinerary"
  ON public.itinerary_items FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.trip_members
      WHERE trip_id = itinerary_items.trip_id AND role = 'organizer'
    )
  );

-- Comments policies
CREATE POLICY "Trip members can view comments"
  ON public.comments FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.trip_members tm
      JOIN public.itinerary_items ii ON ii.trip_id = tm.trip_id
      WHERE ii.id = comments.itinerary_item_id
    )
  );

CREATE POLICY "Trip members can add comments"
  ON public.comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND auth.uid() IN (
      SELECT user_id FROM public.trip_members tm
      JOIN public.itinerary_items ii ON ii.trip_id = tm.trip_id
      WHERE ii.id = comments.itinerary_item_id
    )
  );

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Reactions policies
CREATE POLICY "Trip members can view reactions"
  ON public.reactions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.trip_members tm
      JOIN public.itinerary_items ii ON ii.trip_id = tm.trip_id
      WHERE ii.id = reactions.itinerary_item_id
    )
  );

CREATE POLICY "Trip members can add reactions"
  ON public.reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
  ON public.reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Shared expenses policies
CREATE POLICY "Trip members can view expenses"
  ON public.shared_expenses FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.trip_members WHERE trip_id = shared_expenses.trip_id
    )
  );

CREATE POLICY "Trip members can add expenses"
  ON public.shared_expenses FOR INSERT
  WITH CHECK (
    auth.uid() = paid_by
    AND auth.uid() IN (
      SELECT user_id FROM public.trip_members WHERE trip_id = shared_expenses.trip_id
    )
  );

CREATE POLICY "Expense creator can update"
  ON public.shared_expenses FOR UPDATE
  USING (auth.uid() = paid_by);

CREATE POLICY "Expense creator can delete"
  ON public.shared_expenses FOR DELETE
  USING (auth.uid() = paid_by);

-- Expense splits policies
CREATE POLICY "Trip members can view expense splits"
  ON public.expense_splits FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.trip_members tm
      JOIN public.shared_expenses se ON se.trip_id = tm.trip_id
      WHERE se.id = expense_splits.expense_id
    )
  );

CREATE POLICY "Expense creator can manage splits"
  ON public.expense_splits FOR ALL
  USING (
    auth.uid() IN (
      SELECT paid_by FROM public.shared_expenses WHERE id = expense_splits.expense_id
    )
  );

-- Availability policies
CREATE POLICY "Trip members can view availability"
  ON public.availability FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.trip_members WHERE trip_id = availability.trip_id
    )
  );

CREATE POLICY "Users can manage own availability"
  ON public.availability FOR ALL
  USING (auth.uid() = user_id);
