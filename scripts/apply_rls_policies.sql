-- Helper function to check if the current user is a member of a specific project team.
-- This function uses SECURITY DEFINER to securely check against the project_team_members table.
CREATE OR REPLACE FUNCTION public.is_member_of_project_team(p_team_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.project_team_members
    WHERE project_team_id = p_team_id AND user_id = auth.uid()
  );
END;
$$;


-- RLS Policies for the 'events' table
-- Allow public read access.
DROP POLICY IF EXISTS "Enable read access for all users on events" ON public.events;
CREATE POLICY "Enable read access for all users on events"
ON public.events FOR SELECT TO public USING (true);

-- Allow team members to manage their team's events.
DROP POLICY IF EXISTS "Team members can manage their own team's events" ON public.events;
DROP POLICY IF EXISTS "Team members can insert events for their team" ON public.events;
CREATE POLICY "Team members can insert events for their team"
ON public.events FOR INSERT TO authenticated WITH CHECK (public.is_member_of_project_team(project_team_id));

DROP POLICY IF EXISTS "Team members can update events for their team" ON public.events;
CREATE POLICY "Team members can update events for their team"
ON public.events FOR UPDATE TO authenticated USING (public.is_member_of_project_team(project_team_id)) WITH CHECK (public.is_member_of_project_team(project_team_id));

DROP POLICY IF EXISTS "Team members can delete events for their team" ON public.events;
CREATE POLICY "Team members can delete events for their team"
ON public.events FOR DELETE TO authenticated USING (public.is_member_of_project_team(project_team_id));


-- RLS Policies for the 'pricing_tiers' table
-- Allow public read access.
DROP POLICY IF EXISTS "Enable read access for all users on pricing_tiers" ON public.pricing_tiers;
CREATE POLICY "Enable read access for all users on pricing_tiers"
ON public.pricing_tiers FOR SELECT TO public USING (true);

-- Allow team members to manage their team's pricing tiers.
DROP POLICY IF EXISTS "Team members can manage their own team's pricing_tiers" ON public.pricing_tiers;
DROP POLICY IF EXISTS "Team members can insert pricing_tiers for their team" ON public.pricing_tiers;
CREATE POLICY "Team members can insert pricing_tiers for their team"
ON public.pricing_tiers FOR INSERT TO authenticated WITH CHECK (public.is_member_of_project_team(project_team_id));

DROP POLICY IF EXISTS "Team members can update pricing_tiers for their team" ON public.pricing_tiers;
CREATE POLICY "Team members can update pricing_tiers for their team"
ON public.pricing_tiers FOR UPDATE TO authenticated USING (public.is_member_of_project_team(project_team_id)) WITH CHECK (public.is_member_of_project_team(project_team_id));

DROP POLICY IF EXISTS "Team members can delete pricing_tiers for their team" ON public.pricing_tiers;
CREATE POLICY "Team members can delete pricing_tiers for their team"
ON public.pricing_tiers FOR DELETE TO authenticated USING (public.is_member_of_project_team(project_team_id));


-- RLS Policies for the 'tickets' table
-- Allow team members to view their own team's tickets.
DROP POLICY IF EXISTS "Team members can view their own team's tickets" ON public.tickets;
CREATE POLICY "Team members can view their own team's tickets"
ON public.tickets FOR SELECT TO authenticated USING (public.is_member_of_project_team(project_team_id));

-- Allow team members to manage their own team's tickets.
DROP POLICY IF EXISTS "Team members can manage their own team's tickets" ON public.tickets;
DROP POLICY IF EXISTS "Team members can insert tickets for their team" ON public.tickets;
CREATE POLICY "Team members can insert tickets for their team"
ON public.tickets FOR INSERT TO authenticated WITH CHECK (public.is_member_of_project_team(project_team_id));

DROP POLICY IF EXISTS "Team members can update tickets for their team" ON public.tickets;
CREATE POLICY "Team members can update tickets for their team"
ON public.tickets FOR UPDATE TO authenticated USING (public.is_member_of_project_team(project_team_id)) WITH CHECK (public.is_member_of_project_team(project_team_id));

DROP POLICY IF EXISTS "Team members can delete tickets for their team" ON public.tickets;
CREATE POLICY "Team members can delete tickets for their team"
ON public.tickets FOR DELETE TO authenticated USING (public.is_member_of_project_team(project_team_id)); 