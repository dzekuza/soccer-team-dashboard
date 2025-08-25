#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createStandingsTable() {
  try {
    console.log('Creating standings table...')
    
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create standings table
        CREATE TABLE IF NOT EXISTS standings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          league_key TEXT UNIQUE NOT NULL,
          league_name TEXT NOT NULL,
          standings_data JSONB NOT NULL,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create index for faster queries
        CREATE INDEX IF NOT EXISTS idx_standings_league_key ON standings(league_key);
        CREATE INDEX IF NOT EXISTS idx_standings_last_updated ON standings(last_updated);

        -- Enable RLS
        ALTER TABLE standings ENABLE ROW LEVEL SECURITY;

        -- Create policy for public read access
        CREATE POLICY "Public read access" ON standings
          FOR SELECT USING (true);

        -- Create policy for authenticated users to insert/update
        CREATE POLICY "Authenticated users can insert/update" ON standings
          FOR ALL USING (auth.role() = 'authenticated');
      `
    })

    if (error) {
      console.error('Error creating standings table:', error)
      return
    }

    console.log('Standings table created successfully!')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

createStandingsTable()
