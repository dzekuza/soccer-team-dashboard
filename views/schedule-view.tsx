import { PageHeading } from "@/components/common/page-heading"
import { LoadError } from "@/components/common/load-error"
import { FixturesBoard } from "@/components/fixtures/fixtures-board"
import { getScheduleFixtures } from "@/lib/fixtures"

export async function ScheduleView() {
  const fixtures = await getScheduleFixtures()

  return (
    <>
      <PageHeading title="Tvarkaraštis" />
      {fixtures ? <FixturesBoard fixtures={fixtures} variant="schedule" /> : <LoadError subject="tvarkaraščio" />}
    </>
  )
}
