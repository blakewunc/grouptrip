-- Function to automatically create trip member for trip creator
CREATE OR REPLACE FUNCTION public.handle_new_trip()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.trip_members (trip_id, user_id, role, rsvp_status)
  VALUES (NEW.id, NEW.created_by, 'organizer', 'accepted');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_trip_created
  AFTER INSERT ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_trip();

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.budget_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.itinerary_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.shared_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.availability
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to calculate trip member count
CREATE OR REPLACE FUNCTION public.get_trip_member_count(trip_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.trip_members
  WHERE trip_members.trip_id = $1 AND rsvp_status = 'accepted';
$$ LANGUAGE SQL STABLE;

-- Function to calculate expense balances for a trip
CREATE OR REPLACE FUNCTION public.calculate_expense_balances(p_trip_id UUID)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  total_paid DECIMAL(10,2),
  total_owed DECIMAL(10,2),
  balance DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH paid AS (
    SELECT
      se.paid_by as user_id,
      SUM(se.amount) as amount
    FROM public.shared_expenses se
    WHERE se.trip_id = p_trip_id
    GROUP BY se.paid_by
  ),
  owed AS (
    SELECT
      es.user_id,
      SUM(es.amount) as amount
    FROM public.expense_splits es
    JOIN public.shared_expenses se ON se.id = es.expense_id
    WHERE se.trip_id = p_trip_id
    GROUP BY es.user_id
  )
  SELECT
    COALESCE(p.user_id, o.user_id) as user_id,
    prof.display_name as user_name,
    COALESCE(p.amount, 0) as total_paid,
    COALESCE(o.amount, 0) as total_owed,
    COALESCE(p.amount, 0) - COALESCE(o.amount, 0) as balance
  FROM paid p
  FULL OUTER JOIN owed o ON p.user_id = o.user_id
  JOIN public.profiles prof ON prof.id = COALESCE(p.user_id, o.user_id);
END;
$$ LANGUAGE plpgsql STABLE;
