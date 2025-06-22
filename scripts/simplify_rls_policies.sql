-- Remove the helper function as it's no longer needed
DROP FUNCTION IF EXISTS public.is_member_of_project_team(uuid);

-- RLS Policies for 'events'
DROP POLICY IF EXISTS "Enable read access for all users on events" ON public.events;
CREATE POLICY "Enable read access for all users on events" ON public.events FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Team members can manage their own team's events" ON public.events;
DROP POLICY IF EXISTS "Team members can insert events for their team" ON public.events;
DROP POLICY IF EXISTS "Team members can update events for their team" ON public.events;
DROP POLICY IF EXISTS "Team members can delete events for their team" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can manage events" ON public.events;
CREATE POLICY "Authenticated users can manage events" ON public.events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for 'pricing_tiers'
DROP POLICY IF EXISTS "Enable read access for all users on pricing_tiers" ON public.pricing_tiers;
CREATE POLICY "Enable read access for all users on pricing_tiers" ON public.pricing_tiers FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Team members can manage their own team's pricing_tiers" ON public.pricing_tiers;
DROP POLICY IF EXISTS "Team members can insert pricing_tiers for their team" ON public.pricing_tiers;
DROP POLICY IF EXISTS "Team members can update pricing_tiers for their team" ON public.pricing_tiers;
DROP POLICY IF EXISTS "Team members can delete pricing_tiers for their team" ON public.pricing_tiers;
DROP POLICY IF EXISTS "Authenticated users can manage pricing tiers" ON public.pricing_tiers;
CREATE POLICY "Authenticated users can manage pricing tiers" ON public.pricing_tiers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for 'tickets'
DROP POLICY IF EXISTS "Team members can view their own team's tickets" ON public.tickets;
DROP POLICY IF EXISTS "Enable read access for all users on tickets" ON public.tickets;
CREATE POLICY "Enable read access for all users on tickets" ON public.tickets FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Team members can manage their own team's tickets" ON public.tickets;
DROP POLICY IF EXISTS "Team members can insert tickets for their team" ON public.tickets;
DROP POLICY IF EXISTS "Team members can update tickets for their team" ON public.tickets;
DROP POLICY IF EXISTS "Team members can delete tickets for their team" ON public.tickets;
DROP POLICY IF EXISTS "Authenticated users can manage tickets" ON public.tickets;
CREATE POLICY "Authenticated users can manage tickets" ON public.tickets FOR ALL TO authenticated USING (true) WITH CHECK (true); 