import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { TeamLogo } from "@/components/fixtures/team-logo"
import { cn } from "@/lib/utils"
import { STATUS_LABELS, type Fixture } from "@/lib/fixtures"

interface MatchScoreboardProps {
  fixture: Fixture
}

interface TeamBlockProps {
  name: string
  logo: string | null
  /** Dim the team that lost; hierarchy comes from colour, not size. */
  dimmed: boolean
}

function TeamBlock({ name, logo, dimmed }: TeamBlockProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center md:gap-4">
      <TeamLogo name={name} logo={logo} className="h-14 w-14 text-xl md:h-28 md:w-28 md:text-3xl" />
      <h2
        className={cn(
          "text-base font-bold md:text-title",
          dimmed ? "text-muted-foreground" : "text-white",
        )}
      >
        {name}
      </h2>
    </div>
  )
}

const statusClassName: Record<Fixture["status"], string> = {
  completed: "bg-surface-raised text-white",
  upcoming: "border border-primary text-primary",
  live: "bg-primary text-white",
}

/** Header of the match page: status, the two teams and the score (or kick-off time). */
export function MatchScoreboard({ fixture }: MatchScoreboardProps) {
  const { status, homeScore, awayScore } = fixture
  const hasScore = homeScore !== null && awayScore !== null
  const homeLost = hasScore && homeScore < awayScore
  const awayLost = hasScore && awayScore < homeScore
  const backHref = status === "upcoming" ? "/tvarkarastis" : "/rezultatai"
  const backLabel = status === "upcoming" ? "Grįžti į tvarkaraštį" : "Grįžti į rezultatus"

  return (
    <section aria-labelledby="match-title" className="border-b border-surface px-4 py-8 md:px-16 md:py-12">
      <div>
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>

        <h1 id="match-title" className="sr-only">
          {fixture.homeTeam} – {fixture.awayTeam}
          {hasScore ? `, ${homeScore}:${awayScore}` : ""}
        </h1>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <span
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold",
              statusClassName[status],
            )}
          >
            {status === "live" ? (
              <span className="h-2 w-2 animate-pulse rounded-full bg-white motion-reduce:animate-none" aria-hidden="true" />
            ) : null}
            {STATUS_LABELS[status]}
          </span>
          {[fixture.round, fixture.squad].filter(Boolean).map((label) => (
            <span key={label} className="text-sm text-muted-foreground">
              {label}
            </span>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:mt-10 md:gap-10">
          <TeamBlock name={fixture.homeTeam} logo={fixture.homeLogo} dimmed={homeLost} />

          <p className="text-center font-bold tabular-nums text-display" aria-hidden="true">
            {hasScore ? (
              <>
                <span className={homeLost ? "text-muted-foreground" : undefined}>{homeScore}</span>
                <span className="px-2 text-muted-foreground md:px-4">–</span>
                <span className={awayLost ? "text-muted-foreground" : undefined}>{awayScore}</span>
              </>
            ) : (
              <span className="text-headline text-primary">{fixture.matchTime ?? "–"}</span>
            )}
          </p>

          <TeamBlock name={fixture.awayTeam} logo={fixture.awayLogo} dimmed={awayLost} />
        </div>
      </div>
    </section>
  )
}
