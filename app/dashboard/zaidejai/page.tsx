import { PlayersClient } from "./players-client";
import { supabaseService } from "@/lib/supabase-service";
import type { Player } from "@/lib/types";

export default async function PlayersPage() {
  const { data: players, error } = await supabaseService.getPlayers();

  if (error) {
    console.error("Failed to fetch players:", error);
    // Optionally render an error state
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Žaidėjai</h1>
          <p className="text-gray-600">Tvarkykite komandų žaidėjų duomenis</p>
        </div>
      </div>
      <PlayersClient initialPlayers={(players as Player[]) || []} />
    </div>
  );
}
