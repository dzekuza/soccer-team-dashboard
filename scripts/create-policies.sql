-- Drop existing policies if they exist
DO $$
BEGIN
  -- Drop policies in reverse order of creation if dependencies exist
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'teams_admin_policy') THEN DROP POLICY "teams_admin_policy" ON teams; END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'teams_select_policy') THEN DROP POLICY "teams_select_policy" ON teams; END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tickets_admin_policy') THEN DROP POLICY "tickets_admin_policy" ON tickets; END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tickets_select_policy') THEN DROP POLICY "tickets_select_policy" ON tickets; END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'pricing_tiers_admin_policy') THEN DROP POLICY "pricing_tiers_admin_policy" ON pricing_tiers; END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'pricing_tiers_select_policy') THEN DROP POLICY "pricing_tiers_select_policy" ON pricing_tiers; END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'events_admin_policy') THEN DROP POLICY "events_admin_policy" ON events; END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'events_select_policy') THEN DROP POLICY "events_select_policy" ON events; END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'users_update_policy') THEN DROP POLICY "users_update_policy" ON users; END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'users_select_policy') THEN DROP POLICY "users_select_policy" ON users; END IF;
END;
$$;

-- Enable RLS on all tables that need it
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- USERS
-- Authenticated users can view any user profile
CREATE POLICY "users_select_policy" ON users FOR SELECT TO authenticated USING (true);
-- Users can update their own profile
CREATE POLICY "users_update_policy" ON users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- EVENTS, TICKETS, TEAMS, PRICING TIERS
-- Any authenticated user can manage all records in these tables.
CREATE POLICY "authenticated_user_can_manage_events" ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_user_can_manage_tickets" ON tickets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_user_can_manage_teams" ON teams FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_user_can_manage_pricing_tiers" ON pricing_tiers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow public read access to events, teams, and pricing tiers
CREATE POLICY "public_can_read_events" ON events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_can_read_teams" ON teams FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_can_read_pricing_tiers" ON pricing_tiers FOR SELECT TO anon, authenticated USING (true);

-- Grant permissions (redundant if policies are permissive, but good for clarity)
GRANT ALL ON users TO authenticated;
GRANT ALL ON events TO authenticated;
GRANT ALL ON pricing_tiers TO authenticated;
GRANT ALL ON tickets TO authenticated;
GRANT ALL ON teams TO authenticated;
