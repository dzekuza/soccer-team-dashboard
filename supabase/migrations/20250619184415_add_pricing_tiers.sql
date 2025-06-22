-- Create pricing_tiers table
CREATE TABLE IF NOT EXISTS pricing_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_event_id ON pricing_tiers(event_id);

-- Update RLS policies
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "pricing_tiers_select_policy" ON pricing_tiers;
DROP POLICY IF EXISTS "pricing_tiers_insert_policy" ON pricing_tiers;
DROP POLICY IF EXISTS "pricing_tiers_update_policy" ON pricing_tiers;
DROP POLICY IF EXISTS "pricing_tiers_delete_policy" ON pricing_tiers;

-- Create new policies
CREATE POLICY "pricing_tiers_select_policy" ON pricing_tiers
    FOR SELECT USING (true);

CREATE POLICY "pricing_tiers_insert_policy" ON pricing_tiers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "pricing_tiers_update_policy" ON pricing_tiers
    FOR UPDATE USING (true);

CREATE POLICY "pricing_tiers_delete_policy" ON pricing_tiers
    FOR DELETE USING (true); 