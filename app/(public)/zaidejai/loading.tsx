import { PageHeading } from "@/components/common/page-heading"
import { PlayerGridSkeleton } from "@/components/player-card"

/** Shown while the server renders this page (the page frame stays in place). */
export default function Loading() {
  return (
    <>
      <PageHeading title="Žaidėjai" />
      <PlayerGridSkeleton />
    </>
  )
}
