-- Drop conflicting and outdated permissive RLS policies to improve performance and security.

-- Drop duplicate public read policy on events
DROP POLICY IF EXISTS "public_can_read_events" ON public.events;

-- Drop duplicate public read policy on pricing_tiers
DROP POLICY IF EXISTS "public_can_read_pricing_tiers" ON public.pricing_tiers;

-- Drop duplicate public read policies on teams
DROP POLICY IF EXISTS "public_can_read_teams" ON public.teams;
DROP POLICY IF EXISTS "Anyone can view teams" ON public.teams;

-- Drop duplicate public read policy on tickets
DROP POLICY IF EXISTS "public" ON public.tickets;
