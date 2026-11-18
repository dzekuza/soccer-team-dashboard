"use client"

import { useState } from "react"
import { PlayerCard } from "@/components/player-card"
import { PublicTabs } from "@/components/ui/tabs"
import type { Player } from "@/lib/types"

interface PlayersBoardProps {
  players: Player[]
  /** Squad to show first, e.g. "BANGA B" from `?team=`. */
  initialTeam?: string
}

interface PlayerGroup {
  title: string
  players: Player[]
}

const includesAny = (text: string, words: string[]) => words.some((word) => text.includes(word))

/** Goalkeepers, defenders, midfielders ("saugas" is a midfielder), forwards, then the rest. */
function groupByPosition(players: Player[]): PlayerGroup[] {
  const groups: Record<string, Player[]> = {
    Vartininkai: [],
    Gynėjai: [],
    Pusgynėjai: [],
    Puolėjai: [],
    Kiti: [],
  }

  for (const player of players) {
    const position = player.position?.toLowerCase() ?? ""
    if (includesAny(position, ["vartininkas", "vartininkė", "goalkeeper"])) groups.Vartininkai.push(player)
    else if (includesAny(position, ["gynėjas", "gynėja", "defender"])) groups.Gynėjai.push(player)
    else if (includesAny(position, ["saugas", "saugė", "pusgynėjas", "midfielder"])) groups.Pusgynėjai.push(player)
    else if (includesAny(position, ["puolėjas", "puolėja", "forward", "striker"])) groups.Puolėjai.push(player)
    else groups.Kiti.push(player)
  }

  return Object.entries(groups)
    .filter(([, members]) => members.length > 0)
    .map(([title, members]) => ({ title, players: members }))
}

/** Squad tabs and the players grouped by position; data arrives from the server as props. */
export function PlayersBoard({ players, initialTeam }: PlayersBoardProps) {
  const [team, setTeam] = useState(initialTeam ?? "all")

  const teams = Array.from(new Set(players.map((player) => player.team_key).filter(Boolean))) as string[]
  const tabs = [{ key: "all", label: "Visi" }, ...teams.map((key) => ({ key, label: key }))]
  const visible = team === "all" ? players : players.filter((player) => player.team_key === team)

  return (
    <>
      <PublicTabs tabs={tabs} activeTab={team} onTabChange={setTeam} />

      {groupByPosition(visible).map((group) => (
        <section key={group.title} aria-label={group.title} className="border-b border-surface">
          <h2 className="px-4 py-4 text-xl font-bold text-white md:px-16">{group.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {group.players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </section>
      ))}

      {visible.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">Šiai komandai žaidėjų nėra.</p>
      ) : null}
    </>
  )
}
