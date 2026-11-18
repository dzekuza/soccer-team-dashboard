import { unstable_cache } from "next/cache"
import { createPublicClient } from "@/lib/supabase-public"
import type { Player } from "@/lib/types"

/** Same person listed twice (same first and last name): keep the first. */
function dropDuplicates(players: Player[]): Player[] {
  const seen = new Set<string>()
  return players.filter((player) => {
    const key = `${player.name ?? ""} ${player.surname ?? ""}`.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** All players, ordered by name, cached for a minute. Null when the query fails. */
export const getPlayers = unstable_cache(
  async (): Promise<Player[] | null> => {
    const { data, error } = await createPublicClient()
      .from("banga_playerss")
      .select("*")
      .order("name", { ascending: true })

    if (error || !data) {
      console.error("getPlayers failed:", error?.message)
      return null
    }

    return dropDuplicates(data as Player[])
  },
  ["public-players"],
  { revalidate: 60 },
)
