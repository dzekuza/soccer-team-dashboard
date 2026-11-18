import { PageHeading } from "@/components/common/page-heading"
import { LoadError } from "@/components/common/load-error"
import { FixturesBoard } from "@/components/fixtures/fixtures-board"
import { getResultFixtures } from "@/lib/fixtures"

export async function ResultsView() {
  const fixtures = await getResultFixtures()

  return (
    <>
      <PageHeading title="Rezultatai" />
      {fixtures ? <FixturesBoard fixtures={fixtures} variant="results" /> : <LoadError subject="rezultatų" />}
    </>
  )
}
