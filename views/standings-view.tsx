import { PageHeading } from "@/components/common/page-heading"
import { LoadError } from "@/components/common/load-error"
import { StandingsBoard } from "@/components/standings/standings-board"
import { getStandings } from "@/lib/standings"

export async function StandingsView() {
  const groups = await getStandings()

  return (
    <>
      <PageHeading title="Turnyrinė lentelė" />
      {groups ? <StandingsBoard groups={groups} /> : <LoadError subject="lentelės" />}
    </>
  )
}
