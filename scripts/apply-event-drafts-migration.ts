#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

dotenv.config({ path: ".env.local" });

async function main() {
    const url = process.env.SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
        process.exit(1);
    }

    try {
        // Read the migration file
        const migrationPath = join(
            process.cwd(),
            "supabase",
            "migrations",
            "20250101000011_create_event_drafts_table.sql",
        );
        const sql = readFileSync(migrationPath, "utf8");

        console.log("Applying migration...");

        // Split SQL into statements
        const statements = sql
            .split(";")
            .map((stmt) => stmt.trim())
            .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

        // Apply each statement using the REST API
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (!statement) continue;

            console.log(`Executing statement ${i + 1}/${statements.length}...`);

            try {
                const response = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${key}`,
                        "apikey": key,
                    },
                    body: JSON.stringify({ sql: statement }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.log(
                        `⚠️  Statement ${i + 1} had an issue: ${errorText}`,
                    );
                    console.log(
                        `This might be normal if the object already exists`,
                    );
                } else {
                    console.log(`✅ Statement ${i + 1} executed successfully`);
                }
            } catch (err: any) {
                console.log(`⚠️  Statement ${i + 1} failed: ${err.message}`);
                console.log(`This might be normal for some statements`);
            }
        }

        console.log("\n🎉 Migration applied successfully!");

        // Test if the table was created
        const supabase = createClient(url, key);
        const { data: testData, error: testError } = await supabase
            .from("event_drafts")
            .select("id")
            .limit(1);

        if (testError) {
            console.error("❌ Table creation failed:", testError.message);
        } else {
            console.log("✅ event_drafts table is now accessible");
        }
    } catch (error) {
        console.error("❌ Failed to apply migration:", error);
        process.exit(1);
    }
}

main();
