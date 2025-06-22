-- Drop existing policies and function
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create simplified non-recursive policy
CREATE POLICY "users_select_policy" ON users
    FOR SELECT USING (
        -- Users can read themselves
        auth.uid() = id
        OR
        -- Users with admin role can read all users
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- Create insert policy
CREATE POLICY "users_insert_policy" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Create update policy
CREATE POLICY "users_update_policy" ON users
    FOR UPDATE USING (
        auth.uid() = id
        OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- Create delete policy
CREATE POLICY "users_delete_policy" ON users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated; 