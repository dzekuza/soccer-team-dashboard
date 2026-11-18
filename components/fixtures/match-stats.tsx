import type { StatRow } from "@/lib/fixtures"

interface MatchStatsProps {
  homeTeam: string
  awayTeam: string
  stats: StatRow[]
}

/** Share of the home side, 50 when both are zero. */
function homeShare({ home, away }: StatRow): number {
  const total = home + away
  return total === 0 ? 50 : (home / total) * 100
}

function StatBar({ row, homeTeam, awayTeam }: { row: StatRow; homeTeam: string; awayTeam: string }) {
  const share = homeShare(row)
  const label = `${row.label}: ${homeTeam} ${row.home}${row.suffix ?? ""}, ${awayTeam} ${row.away}${row.suffix ?? ""}`

  return (
    <svg role="img" aria-label={label} viewBox="0 0 100 4" preserveAspectRatio="none" className="h-1.5 w-full">
      <rect width="100" height="4" className="fill-surface-raised" />
      <rect width={share} height="4" className="fill-primary" />
    </svg>
  )
}

/** Paired bars: home value, label with a split bar, away value. Only real numbers are listed. */
export function MatchStats({ homeTeam, awayTeam, stats }: MatchStatsProps) {
  return (
    <ul className="space-y-6">
      {stats.map((row) => (
        <li key={row.key} className="grid grid-cols-[3.5rem_1fr_3.5rem] items-center gap-4">
          <span className="text-xl font-bold tabular-nums text-white">
            {row.home}
            {row.suffix}
          </span>
          <div className="space-y-2">
            <span className="block text-center text-sm text-muted-foreground">{row.label}</span>
            <StatBar row={row} homeTeam={homeTeam} awayTeam={awayTeam} />
          </div>
          <span className="text-right text-xl font-bold tabular-nums text-white">
            {row.away}
            {row.suffix}
          </span>
        </li>
      ))}
    </ul>
  )
}
