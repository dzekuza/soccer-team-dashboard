-- Create fixtures table for storing scraped fixture data
CREATE TABLE IF NOT EXISTS public.fixtures_all_new (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fingerprint TEXT UNIQUE NOT NULL,
    match_date DATE NOT NULL,
    match_time TIME,
    team1 TEXT NOT NULL,
    team2 TEXT NOT NULL,
    team1_score INTEGER,
    team2_score INTEGER,
    venue TEXT,
    league_key TEXT NOT NULL,
    status TEXT DEFAULT 'upcoming',
    round TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_draft BOOLEAN DEFAULT true,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.fixtures_all_new ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance (after table creation)
CREATE INDEX IF NOT EXISTS idx_fixtures_league_key ON public.fixtures_all_new(league_key);
CREATE INDEX IF NOT EXISTS idx_fixtures_match_date ON public.fixtures_all_new(match_date);
CREATE INDEX IF NOT EXISTS idx_fixtures_owner_id ON public.fixtures_all_new(owner_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_is_draft ON public.fixtures_all_new(is_draft);
CREATE INDEX IF NOT EXISTS idx_fixtures_fingerprint ON public.fixtures_all_new(fingerprint);

-- Create RLS policies
CREATE POLICY "Users can view their own fixtures" ON public.fixtures_all_new
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own fixtures" ON public.fixtures_all_new
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own fixtures" ON public.fixtures_all_new
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own fixtures" ON public.fixtures_all_new
    FOR DELETE USING (auth.uid() = owner_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_fixtures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_fixtures_updated_at
    BEFORE UPDATE ON public.fixtures_all_new
    FOR EACH ROW
    EXECUTE FUNCTION update_fixtures_updated_at();
