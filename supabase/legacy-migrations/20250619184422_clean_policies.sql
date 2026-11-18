-- Drop all existing policies
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Create simplified policies for all tables
CREATE POLICY "users_select_policy" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_policy" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_policy" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "events_access_policy" ON events FOR ALL USING (true);
CREATE POLICY "pricing_tiers_access_policy" ON pricing_tiers FOR ALL USING (true);
CREATE POLICY "tickets_access_policy" ON tickets FOR ALL USING (true);
CREATE POLICY "teams_access_policy" ON teams FOR ALL USING (true);

-- Fix tickets table schema if needed
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tickets' 
        AND column_name = 'pricing_tier_id'
    ) THEN
        ALTER TABLE tickets RENAME COLUMN pricing_tier_id TO tier_id;
    END IF;
END $$;

-- Grant permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON events TO authenticated;
GRANT ALL ON pricing_tiers TO authenticated;
GRANT ALL ON tickets TO authenticated;
GRANT ALL ON teams TO authenticated; 