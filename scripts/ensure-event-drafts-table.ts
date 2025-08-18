#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
    const url = process.env.SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
        process.exit(1);
    }

    const admin = createClient(url, key);

    try {
        // Check if table exists by trying to query it
        const { error: checkError } = await admin
            .from('event_drafts')
            .select('id')
            .limit(1);

        if (checkError && checkError.code === 'PGRST116') {
            // Table doesn't exist, create it using raw SQL
            console.log("Creating event_drafts table...");
            
            const createTableSQL = `
                CREATE TABLE event_drafts (
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
                
                CREATE INDEX event_drafts_date_idx ON event_drafts(date);
                CREATE INDEX event_drafts_dedupe_key_idx ON event_drafts(dedupe_key);
                CREATE INDEX event_drafts_used_at_idx ON event_drafts(used_at);
                
                ALTER TABLE event_drafts ENABLE ROW LEVEL SECURITY;
                
                CREATE POLICY "Admins can manage all event drafts"
                    ON event_drafts FOR ALL
                    USING (is_admin())
                    WITH CHECK (is_admin());
                
                CREATE POLICY "Users can view event drafts"
                    ON event_drafts FOR SELECT
                    USING (auth.role() = 'authenticated');
            `;

            // Execute the SQL using the REST API
            const response = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`,
                    'apikey': key
                },
                body: JSON.stringify({ sql: createTableSQL })
            });

            if (!response.ok) {
                throw new Error(`Failed to create table: ${response.statusText}`);
            }

            console.log("✅ event_drafts table created successfully");
        } else {
            console.log("✅ event_drafts table already exists");
        }
    } catch (e) {
        console.error("❌ Failed to ensure event_drafts table:", e);
        process.exit(1);
    }
}

main();
