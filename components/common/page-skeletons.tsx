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
