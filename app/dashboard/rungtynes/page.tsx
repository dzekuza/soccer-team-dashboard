import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { MatchesClient } from "./matches-client";
import { unstable_noStore as noStore } from 'next/cache';

export default async function MatchesPage() {
  noStore();
  
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Get user - temporarily allow access without authentication for testing
  const { data: { user } } = await supabase.auth.getUser();
  
  // Temporarily comment out authentication check for testing
  // if (!user) {
  //   return <div>Please log in to view matches.</div>;
  // }

  // Fetch fixtures from database - show all fixtures for now
  const { data: fixtures, error } = await supabase
    .from("fixtures_all_new")
    .select("*")
    .order("match_date", { ascending: true });

  if (error) {
    console.error("Failed to fetch fixtures:", error);
    return <div>Error loading fixtures. Please try again later.</div>;
  }

  return <MatchesClient initialMatches={fixtures || []} />;
} 