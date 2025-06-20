-- Update RLS policies for teams table
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "teams_select_policy" ON teams;
DROP POLICY IF EXISTS "teams_insert_policy" ON teams;
DROP POLICY IF EXISTS "teams_update_policy" ON teams;
DROP POLICY IF EXISTS "teams_delete_policy" ON teams;

-- Create new policies
CREATE POLICY "teams_select_policy" ON teams
    FOR SELECT USING (true);

CREATE POLICY "teams_insert_policy" ON teams
    FOR INSERT WITH CHECK (true);

CREATE POLICY "teams_update_policy" ON teams
    FOR UPDATE USING (true);

CREATE POLICY "teams_delete_policy" ON teams
    FOR DELETE USING (true); 