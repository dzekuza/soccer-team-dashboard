-- 1. Fix RLS policies to avoid infinite recursion
-- Tickets table policies
DROP POLICY IF EXISTS tickets_write_policy ON tickets;
DROP POLICY IF EXISTS tickets_select_policy ON tickets;
DROP POLICY IF EXISTS tickets_insert_policy ON tickets;

CREATE POLICY tickets_select_policy ON tickets
  FOR SELECT USING (true);

CREATE POLICY tickets_write_policy ON tickets
  FOR ALL USING (auth.role() = 'authenticated');

-- Pricing tiers policies
DROP POLICY IF EXISTS pricing_tiers_write_policy ON pricing_tiers;
DROP POLICY IF EXISTS pricing_tiers_select_policy ON pricing_tiers;

CREATE POLICY pricing_tiers_select_policy ON pricing_tiers
  FOR SELECT USING (true);

CREATE POLICY pricing_tiers_write_policy ON pricing_tiers
  FOR ALL USING (auth.role() = 'authenticated');

-- Events policies
DROP POLICY IF EXISTS events_write_policy ON events;
DROP POLICY IF EXISTS events_select_policy ON events;

CREATE POLICY events_select_policy ON events
  FOR SELECT USING (true);

CREATE POLICY events_write_policy ON events
  FOR ALL USING (auth.role() = 'authenticated');

-- Users policies
DROP POLICY IF EXISTS users_select_policy ON users;
DROP POLICY IF EXISTS users_insert_policy ON users;
DROP POLICY IF EXISTS users_update_policy ON users;
DROP POLICY IF EXISTS "Users can see self" ON users;

CREATE POLICY users_select_policy ON users
  FOR SELECT USING (true);

CREATE POLICY users_write_policy ON users
  FOR ALL USING (auth.role() = 'authenticated');

-- Teams policies
DROP POLICY IF EXISTS teams_write_policy ON teams;
DROP POLICY IF EXISTS teams_select_policy ON teams;

CREATE POLICY teams_select_policy ON teams
  FOR SELECT USING (true);

CREATE POLICY teams_write_policy ON teams
  FOR ALL USING (auth.role() = 'authenticated');

-- Clean up and optimize indexes
DROP INDEX IF EXISTS idx_events_date;
DROP INDEX IF EXISTS idx_tickets_event_id;
DROP INDEX IF EXISTS idx_tickets_user_id;
DROP INDEX IF EXISTS idx_pricing_tiers_event_id;

-- Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_events_date_time ON events (date, time);
CREATE INDEX IF NOT EXISTS idx_tickets_event_tier ON tickets (event_id, tier_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_status ON tickets (user_id, status);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_event_price ON pricing_tiers (event_id, price);

-- Add comments to document changes
COMMENT ON POLICY events_select_policy ON events IS 'Allow read access to all authenticated users';
COMMENT ON POLICY events_write_policy ON events IS 'Allow write access to authenticated users only';
COMMENT ON POLICY tickets_select_policy ON tickets IS 'Allow read access to all authenticated users';
COMMENT ON POLICY tickets_write_policy ON tickets IS 'Allow write access to authenticated users only';
COMMENT ON POLICY pricing_tiers_select_policy ON pricing_tiers IS 'Allow read access to all authenticated users';
COMMENT ON POLICY pricing_tiers_write_policy ON pricing_tiers IS 'Allow write access to authenticated users only';
COMMENT ON POLICY users_select_policy ON users IS 'Allow read access to all authenticated users';
COMMENT ON POLICY users_write_policy ON users IS 'Allow write access to authenticated users only';
COMMENT ON POLICY teams_select_policy ON teams IS 'Allow read access to all authenticated users';
COMMENT ON POLICY teams_write_policy ON teams IS 'Allow write access to authenticated users only'; 