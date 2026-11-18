import { createClient } from "@supabase/supabase-js"

/** Anon-key client for reading public data on the server (row-level security applies). */
export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
