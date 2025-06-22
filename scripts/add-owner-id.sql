-- Add owner_id column to corporations table
ALTER TABLE corporations ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- Update existing corporations to set owner_id from the admin user
UPDATE corporations c
SET owner_id = u.id
FROM users u
WHERE u.corporation_id = c.id
AND u.role = 'admin'; 