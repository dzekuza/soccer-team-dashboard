-- This script creates a 'fans' table to store customer information.

-- 1. Create the 'fans' table to store core customer data.
CREATE TABLE public.fans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    surname TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comment to explain the purpose of the table.
COMMENT ON TABLE public.fans IS 'Stores core information about customers (fans) who purchase tickets or subscriptions.';

-- 2. Create a trigger to automatically update the 'updated_at' column.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_updated_at                                                
BEFORE UPDATE ON public.fans                                                    
FOR EACH ROW                                                                    
EXECUTE PROCEDURE update_updated_at_column();

-- 3. Enable Row Level Security (RLS) on the table.
ALTER TABLE public.fans ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for the 'fans' table.
-- Only authenticated users with an 'admin' role can manage fan records.
CREATE POLICY "Admins can manage fans"
ON public.fans
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
