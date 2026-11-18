import { Skeleton } from "@/components/ui/skeleton"

/**
 * Placeholders for the data area of a page. Pages always render their frame
 * (heading, tabs) immediately and swap one of these in while data loads, instead
 * of blocking on a full-screen loader.
 */

interface RowListSkeletonProps {
  rows?: number
}

/** Rows like the fixtures / results lists: date, teams, action. */
export function RowListSkeleton({ rows = 6 }: RowListSkeletonProps) {
  return (
    <div className="flex flex-col" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col items-start justify-between gap-3 border-b border-surface px-4 py-4 md:flex-row md:items-center md:px-16"
        >
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-8 w-full max-w-md" />
          <Skeleton className="h-8 w-28" />
        </div>
      ))}
    </div>
  )
}

interface CardGridSkeletonProps {
  count?: number
}

/** Image-on-top cards for news and shop grids. */
export function CardGridSkeleton({ count = 6 }: CardGridSkeletonProps) {
  return (
    <div className="grid gap-6 px-4 py-8 sm:grid-cols-2 md:px-16 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-4">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  )
}

/** Title, hero image and a few paragraphs for article and product detail pages. */
export function ArticleSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 md:px-16" aria-hidden="true">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="aspect-video w-full" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

/** Two-column profile hero (photo left, name and stats right) for player pages. */
export function ProfileSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row" aria-hidden="true">
      <Skeleton className="h-96 w-full rounded-none lg:h-[500px] lg:w-1/2" />
      <div className="w-full space-y-6 p-6 lg:w-1/2 lg:p-12">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

/** Scoreboard-shaped placeholder for the match page. */
export function MatchSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="border-b border-surface px-4 py-8 md:px-16 md:py-12">
        <div className="mx-auto max-w-5xl space-y-6">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-7 w-32" />
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-10">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full md:h-28 md:w-28" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-16 w-36 md:h-20 md:w-56" />
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full md:h-28 md:w-28" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 px-4 py-10 md:px-16 lg:grid-cols-3 lg:gap-12">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 sm:grid-cols-2 lg:col-span-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  )
}
