"use client"

import Link from "next/link"
import { useState } from "react"
import { PublicTabs } from "@/components/ui/tabs"
import { TeamLogo } from "@/components/fixtures/team-logo"
import { formatDayMonthYear } from "@/lib/format-date"
import type { FixtureListItem } from "@/lib/fixtures"

type Variant = "schedule" | "results"

interface FixturesBoardProps {
  fixtures: FixtureListItem[]
  variant: Variant
}

const SQUAD_TABS = [
  { key: "Banga A", label: "Banga A" },
  { key: "Banga B", label: "Banga B" },
  { key: "Banga M", label: "Banga M" },
]

const EMPTY_LABELS: Record<Variant, string> = {
  schedule: "Nėra būsimų rungtynių šiai komandai",
  results: "Nėra rezultatų šiai komandai",
}

function FixtureRow({ fixture, variant }: { fixture: FixtureListItem; variant: Variant }) {
  const isSchedule = variant === "schedule"
  const showScore = !isSchedule && fixture.homeScore !== null && fixture.awayScore !== null
  const title = `${fixture.homeName} – ${fixture.awayName}`

  return (
    <li className="relative flex flex-col items-start justify-between gap-2 border-b border-surface bg-background px-4 py-4 transition-colors hover:bg-surface-raised md:flex-row md:items-center md:px-16">
      {/* One stretched link makes the whole row clickable without nesting the ticket link. */}
      <Link href={`/fixtures/${fixture.id}`} className="absolute inset-0" aria-label={`Rungtynės: ${title}`} />

      <div className="w-full text-sm font-medium text-white md:w-[200px] md:text-base">
        <div>{formatDayMonthYear(fixture.date)}</div>
        {isSchedule && fixture.time ? <div className="font-semibold text-primary">{fixture.time}</div> : null}
      </div>

      <div className="flex flex-1 items-center justify-center gap-2 md:gap-4">
        <div className="flex flex-1 items-center justify-end gap-1 md:gap-2">
          <span className="min-w-[60px] truncate text-right text-xs font-medium text-white md:min-w-[100px] md:text-base">
            {fixture.homeName}
          </span>
          <TeamLogo name={fixture.homeName} logo={fixture.homeLogo} className="h-5 w-5 text-[8px] md:h-8 md:w-8 md:text-xs" />
        </div>

        <div className="mx-2 shrink-0 text-base font-bold tabular-nums md:mx-4 md:text-xl">
          {showScore ? (
            <span className="text-white">
              {fixture.homeScore} – {fixture.awayScore}
            </span>
          ) : (
            <span className="text-primary">VS</span>
          )}
        </div>

        <div className="flex flex-1 items-center justify-start gap-1 md:gap-2">
          <TeamLogo name={fixture.awayName} logo={fixture.awayLogo} className="h-5 w-5 text-[8px] md:h-8 md:w-8 md:text-xs" />
          <span className="min-w-[60px] truncate text-left text-xs font-medium text-white md:min-w-[100px] md:text-base">
            {fixture.awayName}
          </span>
        </div>
      </div>

      <div className="flex w-full items-center gap-3 text-xs text-muted-foreground md:w-[200px] md:justify-end md:text-sm">
        {fixture.venue ? <span>{fixture.venue}</span> : null}
        {isSchedule && fixture.eventId ? (
          <Link
            href={`/event/${fixture.eventId}`}
            className="relative whitespace-nowrap bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-strong md:text-sm"
          >
            Bilietai
          </Link>
        ) : null}
      </div>
    </li>
  )
}

/** Squad tabs plus the matching list of fixtures; data arrives from the server as props. */
export function FixturesBoard({ fixtures, variant }: FixturesBoardProps) {
  const [squad, setSquad] = useState("Banga A")
  const visible = fixtures.filter((fixture) => fixture.squad === squad)

  return (
    <>
      <PublicTabs tabs={SQUAD_TABS} activeTab={squad} onTabChange={setSquad} />

      <div className="flex min-h-[400px] w-full flex-col">
        {visible.length > 0 ? (
          <ul>
            {visible.map((fixture) => (
              <FixtureRow key={fixture.id} fixture={fixture} variant={variant} />
            ))}
          </ul>
        ) : (
          <p className="flex flex-1 items-center justify-center py-8 text-muted-foreground">{EMPTY_LABELS[variant]}</p>
        )}
      </div>
    </>
  )
}
