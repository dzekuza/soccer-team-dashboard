import { PageHeading } from "@/components/common/page-heading"
import { CardGridSkeleton } from "@/components/common/page-skeletons"

/** Shown while the server renders this page (the page frame stays in place). */
export default function Loading() {
  return (
    <>
      <PageHeading title="Naujienos" />
      <CardGridSkeleton count={8} />
    </>
  )
}
