-- Drop old policies first to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage pricing tiers" ON public.pricing_tiers;
DROP POLICY IF EXISTS "Admins can manage all tickets" ON public.tickets;

-- Grant broad permissions to any logged-in user
CREATE POLICY "Authenticated users can manage events"
  ON public.events FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage pricing tiers"
  ON public.pricing_tiers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage tickets"
  ON public.tickets FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
