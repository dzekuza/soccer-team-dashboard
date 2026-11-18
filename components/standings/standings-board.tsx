"use client"

import { useState } from "react"
import { PublicTabs } from "@/components/ui/tabs"
import { TeamLogo } from "@/components/fixtures/team-logo"
import { cn } from "@/lib/utils"
import type { StandingsGroup } from "@/lib/standings"

interface StandingsBoardProps {
  groups: StandingsGroup[]
}

const LEAGUE_TABS = [
  { key: "a_lyga", label: "Banga A" },
  { key: "ii_lyga_a", label: "Banga B" },
  { key: "moteru_a_lyga", label: "Banga M" },
]

const HEADERS = [
  { label: "Vt", title: "Vieta" },
  { label: "Komanda", title: "Komanda" },
  { label: "R", title: "Rungtynės" },
  { label: "Perg.", title: "Pergalės" },
  { label: "Lyg.", title: "Lygiosios" },
  { label: "Pr.", title: "Pralaimėjimai" },
  { label: "Įv.", title: "Įvarčiai" },
  { label: "Tšk.", title: "Taškai" },
]

const cell = "px-2 py-5 text-center text-sm font-medium tabular-nums text-white md:text-base"

function formatUpdated(value: string): string {
  return new Date(value).toLocaleString("lt-LT", {
    timeZone: "Europe/Vilnius",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** League tabs plus the table for the selected squad; data arrives from the server as props. */
export function StandingsBoard({ groups }: StandingsBoardProps) {
  const [leagueKey, setLeagueKey] = useState("a_lyga")
  const group = groups.find((item) => item.leagueKey === leagueKey)
  const rows = group?.rows ?? []

  return (
    <>
      <PublicTabs tabs={LEAGUE_TABS} activeTab={leagueKey} onTabChange={setLeagueKey} />

      {group?.lastUpdated ? (
        <p className="mt-4 px-4 text-sm text-muted-foreground md:px-16">Atnaujinta: {formatUpdated(group.lastUpdated)}</p>
      ) : null}

      <div className="w-full overflow-x-auto">
        {rows.length > 0 ? (
          <table className="w-full min-w-[600px] border-collapse">
            <caption className="sr-only">Turnyrinė lentelė</caption>
            <thead className="bg-surface-raised">
              <tr className="border-b border-surface">
                {HEADERS.map((header, index) => (
                  <th
                    key={header.label}
                    scope="col"
                    title={header.title}
                    className={cn(
                      "px-2 py-5 text-sm font-medium text-white/60 md:text-base",
                      index === 1 ? "text-left" : "text-center",
                      index === 0 && "pl-4 md:pl-16",
                      index === HEADERS.length - 1 && "pr-4 md:pr-16",
                    )}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.position}
                  className={cn(
                    "border-b border-surface",
                    row.team.name.toLowerCase().includes("banga") ? "bg-primary" : "bg-background",
                  )}
                >
                  <td className={cn(cell, "pl-4 md:pl-16")}>{row.position}</td>
                  <td className="px-2 py-5">
                    <div className="flex items-center gap-3">
                      <TeamLogo name={row.team.name} logo={row.team.logo ?? null} className="h-6 w-6 text-[8px] md:h-8 md:w-8 md:text-xs" />
                      <span className="truncate text-xs font-medium text-white md:text-base">{row.team.name}</span>
                    </div>
                  </td>
                  <td className={cell}>{row.played}</td>
                  <td className={cell}>{row.won}</td>
                  <td className={cell}>{row.drawn}</td>
                  <td className={cell}>{row.lost}</td>
                  <td className={cell}>{row.goalsFor}</td>
                  <td className={cn(cell, "pr-4 font-bold md:pr-16")}>{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="flex items-center justify-center py-8 text-muted-foreground">Nėra duomenų šiai komandai</p>
        )}
      </div>
    </>
  )
}
