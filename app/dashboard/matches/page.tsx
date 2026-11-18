import { supabaseService } from "@/lib/supabase-service";
import { MatchesClient } from "./matches-client";
import { connection } from 'next/server';

export default async function MatchesPage() {
  await connection();
  const { data: matches, error } = await supabaseService.getMatches();

  if (error) {
    console.error("Failed to fetch matches:", error);
    // Optionally render an error state to the user
    return <div>Error loading matches. Please try again later.</div>;
  }

  return <MatchesClient initialMatches={matches || []} />;
} 