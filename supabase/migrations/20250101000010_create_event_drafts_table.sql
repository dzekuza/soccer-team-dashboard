-- Create event_drafts table for storing scraped event data
CREATE TABLE IF NOT EXISTS event_drafts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dedupe_key text UNIQUE,
    source text,
    raw jsonb,
    title text,
    date date,
    time text,
    location text,
    team1_name text,
    team2_name text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    used_at timestamptz
);

-- Create index for date-based queries
CREATE INDEX IF NOT EXISTS event_drafts_date_idx ON event_drafts(date);

-- Create index for dedupe_key lookups
CREATE INDEX IF NOT EXISTS event_drafts_dedupe_key_idx ON event_drafts(dedupe_key);

-- Create index for used_at filtering
CREATE INDEX IF NOT EXISTS event_drafts_used_at_idx ON event_drafts(used_at);

-- Add RLS policies
ALTER TABLE event_drafts ENABLE ROW LEVEL SECURITY;

-- Admins can manage all drafts
CREATE POLICY "Admins can manage all event drafts"
    ON event_drafts FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- Users can view drafts (for dashboard display)
CREATE POLICY "Users can view event drafts"
    ON event_drafts FOR SELECT
    USING (auth.role() = 'authenticated');
