import Link from "next/link"
import { ContentSection } from "@/components/common/content-section"
import { MatchScoreboard } from "@/components/fixtures/match-scoreboard"
import { MatchStats } from "@/components/fixtures/match-stats"
import { MatchTimeline } from "@/components/fixtures/match-timeline"
import { formatMatchDate, type Fixture } from "@/lib/fixtures"

interface FixtureViewProps {
  fixture: Fixture
}

interface Detail {
  label: string
  value: string
}

/** Match page. Shows only data the fixture really has; no placeholder lineups. */
export function FixtureView({ fixture }: FixtureViewProps) {
  const details: Detail[] = [
    { label: "Data", value: formatMatchDate(fixture.matchDate) },
    ...(fixture.matchTime ? [{ label: "Pradžia", value: fixture.matchTime }] : []),
    ...(fixture.venue ? [{ label: "Aikštė", value: fixture.venue }] : []),
    ...(fixture.round ? [{ label: "Varžybos", value: fixture.round }] : []),
    ...(fixture.squad ? [{ label: "Komanda", value: fixture.squad }] : []),
  ]
  const hasEvents = fixture.events.length > 0
  const hasStats = fixture.stats.length > 0

  return (
    <>
      <MatchScoreboard fixture={fixture} />

      <ContentSection id="informacija" title="Rungtynių informacija">
        <dl className="grid gap-6 sm:grid-cols-2">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt className="text-sm text-muted-foreground">{detail.label}</dt>
              <dd className="text-lg font-semibold text-white">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </ContentSection>

      {hasEvents ? (
        <ContentSection id="ivykiai" title="Įvykiai">
          <MatchTimeline events={fixture.events} />
        </ContentSection>
      ) : null}

      {hasStats ? (
        <ContentSection id="statistika" title="Statistika">
          <MatchStats homeTeam={fixture.homeTeam} awayTeam={fixture.awayTeam} stats={fixture.stats} />
        </ContentSection>
      ) : null}

      {!hasEvents && !hasStats ? (
        <ContentSection id="ataskaita" title="Ataskaita">
          <p className="max-w-prose text-lg text-white">
            {fixture.status === "upcoming"
              ? "Rungtynių ataskaita bus paskelbta po rungtynių."
              : "Išsamios šių rungtynių ataskaitos dar nėra."}
          </p>
          <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
            Įvykiai ir statistika čia atsiras, kai tik bus paskelbti.
          </p>
          <Link href="/naujienos" className="inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-4 hover:text-primary-strong">
            Skaityti naujienas
          </Link>
        </ContentSection>
      ) : null}
    </>
  )
}
