-- Drop all incorrect policies that were defaulting to the 'public' role.
DROP POLICY IF EXISTS "Authenticated users can see their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage teams" ON public.teams;
DROP POLICY IF EXISTS "Admins can manage pricing tiers" ON public.pricing_tiers;
DROP POLICY IF EXISTS "Admins can manage all tickets" ON public.tickets;

-- Recreate policies, explicitly assigning them to the 'authenticated' role.

-- Policies for: public.users
CREATE POLICY "Authenticated users can see their own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all user profiles"
  ON public.users FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Authenticated users can update their own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies for: public.events
CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policies for: public.teams
CREATE POLICY "Admins can manage teams"
  ON public.teams FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policies for: public.pricing_tiers
CREATE POLICY "Admins can manage pricing tiers"
  ON public.pricing_tiers FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policies for: public.tickets
CREATE POLICY "Admins can manage all tickets"
  ON public.tickets FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
