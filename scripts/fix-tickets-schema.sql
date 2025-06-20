-- Fix tickets table schema
ALTER TABLE tickets 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS purchaser_name TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_tier_id ON tickets(tier_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- Fix RLS policies for tickets table
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON tickets;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON tickets;
DROP POLICY IF EXISTS "Enable update for ticket owners" ON tickets;
DROP POLICY IF EXISTS "Enable delete for ticket owners" ON tickets;

CREATE POLICY "Enable read access for all users" 
ON tickets FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON tickets FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for ticket owners" 
ON tickets FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = tickets.event_id 
    AND e.corporation_id IN (
      SELECT corporation_id FROM users 
      WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Enable delete for ticket owners" 
ON tickets FOR DELETE 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = tickets.event_id 
    AND e.corporation_id IN (
      SELECT corporation_id FROM users 
      WHERE id = auth.uid()
    )
  )
); 