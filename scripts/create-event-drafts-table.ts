#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
        console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
        process.exit(1);
    }

    const supabase = createClient(url, key);

    try {
        // Create the table using raw SQL
        const createTableSQL = `
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
        `;

        const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
        
        if (createError) {
            console.error("Failed to create table via RPC:", createError);
            
            // Try alternative approach - check if table exists
            const { error: checkError } = await supabase
                .from('event_drafts')
                .select('id')
                .limit(1);
                
            if (checkError && checkError.code === 'PGRST116') {
                console.error("Table does not exist and cannot be created via RPC");
                console.log("Please create the table manually in Supabase dashboard:");
                console.log(createTableSQL);
                process.exit(1);
            } else if (checkError) {
                console.error("Error checking table:", checkError);
                process.exit(1);
            }
        }

        // Create indexes
        const createIndexesSQL = `
            CREATE INDEX IF NOT EXISTS event_drafts_date_idx ON event_drafts(date);
            CREATE INDEX IF NOT EXISTS event_drafts_dedupe_key_idx ON event_drafts(dedupe_key);
            CREATE INDEX IF NOT EXISTS event_drafts_used_at_idx ON event_drafts(used_at);
        `;

        await supabase.rpc('exec_sql', { sql: createIndexesSQL });

        // Enable RLS
        const enableRLSSQL = `
            ALTER TABLE event_drafts ENABLE ROW LEVEL SECURITY;
        `;

        await supabase.rpc('exec_sql', { sql: enableRLSSQL });

        console.log("✅ event_drafts table created successfully");
        
        // Test the table
        const { data, error: testError } = await supabase
            .from('event_drafts')
            .select('count')
            .limit(1);
            
        if (testError) {
            console.error("Error testing table:", testError);
        } else {
            console.log("✅ Table is accessible");
        }
        
    } catch (error) {
        console.error("❌ Failed to create event_drafts table:", error);
        process.exit(1);
    }
}

main();
