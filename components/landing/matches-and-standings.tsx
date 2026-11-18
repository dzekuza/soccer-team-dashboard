"use client"

import { useState } from "react"
import { PublicTabs } from "@/components/ui/tabs"
import { UpcomingMatches } from "@/components/upcoming-matches"
import { StandingsTable } from "@/components/standings-table"

const TEAM_TABS = [
  { key: "Banga A", label: "Banga" },
  { key: "Banga B", label: "Banga B" },
  { key: "Banga M", label: "Merginos" },
]

/** Upcoming matches and the league table, each with its own team tabs. */
export function MatchesAndStandings() {
  const [selectedTeam, setSelectedTeam] = useState("Banga A")
  const [selectedStandingsTeam, setSelectedStandingsTeam] = useState("Banga A")

  return (
    <>
    {/* Upcoming Matches Section */}
    <section className="w-full bg-background">
      <div className="w-full max-w-none">
        <PublicTabs
          tabs={TEAM_TABS}
          activeTab={selectedTeam}
          onTabChange={setSelectedTeam}
        />
        <div className="w-full">
          {selectedTeam === "Banga A" && <UpcomingMatches selectedTeam="Banga A" />}
          {selectedTeam === "Banga B" && <UpcomingMatches selectedTeam="Banga B" />}
          {selectedTeam === "Banga M" && <UpcomingMatches selectedTeam="Banga M" />}
        </div>
      </div>
    </section>

    {/* Standings Section */}
    <section className="w-full bg-background">
      <div className="w-full max-w-none">
        <div className="text-center py-8 border-t border-b border-surface">
          <h2 className="text-white text-headline font-bold">
            Turnyrinė lentelė
          </h2>
        </div>
        <PublicTabs
          tabs={TEAM_TABS}
          activeTab={selectedStandingsTeam}
          onTabChange={setSelectedStandingsTeam}
        />
        <div className="w-full">
          {selectedStandingsTeam === "Banga A" && <StandingsTable selectedTeam="Banga A" />}
          {selectedStandingsTeam === "Banga B" && <StandingsTable selectedTeam="Banga B" />}
          {selectedStandingsTeam === "Banga M" && <StandingsTable selectedTeam="Banga M" />}
        </div>
      </div>
    </section>
    </>
  )
}
