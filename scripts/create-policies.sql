-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert new users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Events policies
CREATE POLICY "Anyone can view events" ON events
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update events" ON events
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete events" ON events
    FOR DELETE USING (auth.role() = 'authenticated');

-- Pricing tiers policies
CREATE POLICY "Anyone can view pricing tiers" ON pricing_tiers
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create pricing tiers" ON pricing_tiers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update pricing tiers" ON pricing_tiers
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete pricing tiers" ON pricing_tiers
    FOR DELETE USING (auth.role() = 'authenticated');

-- Tickets policies
CREATE POLICY "Anyone can view tickets" ON tickets
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tickets" ON tickets
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update tickets" ON tickets
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete tickets" ON tickets
    FOR DELETE USING (auth.role() = 'authenticated');
