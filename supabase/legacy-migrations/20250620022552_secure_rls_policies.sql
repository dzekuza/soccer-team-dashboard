-- Drop all existing policies on the tables to ensure a clean slate.
DROP POLICY IF EXISTS "Authenticated users can see their own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Anyone can view teams" ON public.teams;
DROP POLICY IF EXISTS "Admins can manage teams" ON public.teams;
DROP POLICY IF EXISTS "Anyone can view pricing tiers" ON public.pricing_tiers;
DROP POLICY IF EXISTS "Admins can manage pricing tiers" ON public.pricing_tiers;
DROP POLICY IF EXISTS "Authenticated users can manage their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.users;

-- Drop existing generic policies first to avoid conflicts
DROP POLICY IF EXISTS events_access_policy ON public.events;
DROP POLICY IF EXISTS pricing_tiers_access_policy ON public.pricing_tiers;
DROP POLICY IF EXISTS teams_access_policy ON public.teams;
DROP POLICY IF EXISTS tickets_access_policy ON public.tickets;
DROP POLICY IF EXISTS users_insert_policy ON public.users;
DROP POLICY IF EXISTS users_select_policy ON public.users;
DROP POLICY IF EXISTS users_update_policy ON public.users;

-- Enable RLS for all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Policies for: public.users
--
DROP POLICY IF EXISTS "Authenticated users can see their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.users;

CREATE POLICY "Authenticated users can see their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all user profiles"
    ON public.users FOR SELECT
    USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Authenticated users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Note: User insertion is handled by the `handle_new_user` trigger.

--
-- Policies for: public.events
--
CREATE POLICY "Anyone can view events"
  ON public.events FOR SELECT
  USING (true);

-- Assuming only an 'admin' role can manage events.
-- Replace 'admin' with the correct role if different.
CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

--
-- Policies for: public.teams
--
DROP POLICY IF EXISTS "Anyone can view teams" ON public.teams;
DROP POLICY IF EXISTS "Admins can manage teams" ON public.teams;

CREATE POLICY "Anyone can view teams"
  ON public.teams FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage teams"
  ON public.teams FOR ALL
  USING ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' )
  WITH CHECK ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' );

--
-- Policies for: public.pricing_tiers
--
CREATE POLICY "Anyone can view pricing tiers"
  ON public.pricing_tiers FOR SELECT
  TO public, authenticated
  USING (true);

CREATE POLICY "Admins can manage pricing tiers"
  ON public.pricing_tiers FOR ALL
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  )
   WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

--
-- Policies for: public.tickets
--
DROP POLICY IF EXISTS "Authenticated users can view and manage their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can manage all tickets" ON public.tickets;

CREATE POLICY "Authenticated users can view and manage their own tickets"
  ON public.tickets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all tickets"
  ON public.tickets FOR ALL
  USING ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' )
  WITH CHECK ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' ); 