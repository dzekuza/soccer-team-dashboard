-- This migration file cleans up and consolidates all Row-Level Security (RLS) policies
-- for the 'events' and 'pricing_tiers' tables to resolve persistent access issues.

-- First, drop all known existing policies on the events table to ensure a clean slate.
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage events for update" ON public.events;
DROP POLICY IF EXISTS "Admins can manage events for delete" ON public.events;
DROP POLICY IF EXISTS "events_access_policy" ON public.events;
DROP POLICY IF EXISTS "events_select_policy" ON public.events;
DROP POLICY IF EXISTS "events_write_policy" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can manage events" ON public.events;

-- Then, drop all known existing policies on the pricing_tiers table.
DROP POLICY IF EXISTS "Anyone can view pricing tiers" ON public.pricing_tiers;
DROP POLICY IF EXISTS "Admins can manage pricing tiers" ON public.pricing_tiers;
DROP POLICY IF EXISTS "pricing_tiers_access_policy" ON public.pricing_tiers;
DROP POLICY IF EXISTS "pricing_tiers_select_policy" ON public.pricing_tiers;
DROP POLICY IF EXISTS "pricing_tiers_write_policy" ON public.pricing_tiers;
DROP POLICY IF EXISTS "Authenticated users can manage pricing tiers" ON public.pricing_tiers;

--
-- Create new, consolidated policies for the 'events' table
--

-- 1. Allow any authenticated user to view events.
CREATE POLICY "Allow authenticated read access on events"
  ON public.events FOR SELECT
  TO authenticated
  USING (true);

-- 2. Allow users with 'admin' role to insert events.
CREATE POLICY "Allow admin insert on events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- 3. Allow users with 'admin' role to update events.
CREATE POLICY "Allow admin update on events"
  ON public.events FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- 4. Allow users with 'admin' role to delete events.
CREATE POLICY "Allow admin delete on events"
  ON public.events FOR DELETE
  TO authenticated
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

--
-- Create new, consolidated policies for the 'pricing_tiers' table
--

-- 1. Allow any authenticated user to view pricing tiers.
CREATE POLICY "Allow authenticated read access on pricing_tiers"
  ON public.pricing_tiers FOR SELECT
  TO authenticated
  USING (true);

-- 2. Allow users with 'admin' role to insert pricing tiers.
CREATE POLICY "Allow admin insert on pricing_tiers"
  ON public.pricing_tiers FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- 3. Allow users with 'admin' role to update pricing tiers.
CREATE POLICY "Allow admin update on pricing_tiers"
  ON public.pricing_tiers FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- 4. Allow users with 'admin' role to delete pricing tiers.
CREATE POLICY "Allow admin delete on pricing_tiers"
  ON public.pricing_tiers FOR DELETE
  TO authenticated
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'); 