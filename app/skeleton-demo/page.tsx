import { 
  Skeleton, 
  CardSkeleton, 
  AvatarSkeleton, 
  TextSkeleton, 
  ImageSkeleton, 
  ButtonSkeleton,
  GridSkeleton,
  TableSkeleton
} from '@/components/ui/skeleton'
import { PlayerCardSkeleton } from '@/components/player-card'
import { EventCardSkeleton } from '@/components/event-card'

export default function SkeletonDemoPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Skeleton Components Demo</h1>
        <p className="text-muted-foreground">Showcasing all available skeleton loading states</p>
      </div>

      {/* Basic Skeleton */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Basic Skeleton</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-48" />
        </div>
      </section>

      {/* Card Skeleton */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Card Skeleton</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </section>

      {/* Avatar Skeleton */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Avatar Skeleton</h2>
        <div className="flex gap-4">
          <AvatarSkeleton />
          <AvatarSkeleton className="h-16 w-16" />
          <AvatarSkeleton className="h-20 w-20" />
        </div>
      </section>

      {/* Text Skeleton */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Text Skeleton</h2>
        <div className="space-y-4">
          <TextSkeleton lines={1} />
          <TextSkeleton lines={3} />
          <TextSkeleton lines={5} />
        </div>
      </section>

      {/* Image Skeleton */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Image Skeleton</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageSkeleton />
          <ImageSkeleton className="aspect-square" />
        </div>
      </section>

      {/* Button Skeleton */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Button Skeleton</h2>
        <div className="flex gap-4">
          <ButtonSkeleton />
          <ButtonSkeleton className="h-12 w-32" />
          <ButtonSkeleton className="h-8 w-20" />
        </div>
      </section>

      {/* Grid Skeleton */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Grid Skeleton</h2>
        <GridSkeleton items={6} columns={3} />
      </section>

      {/* Table Skeleton */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Table Skeleton</h2>
        <TableSkeleton rows={5} columns={4} />
      </section>

      {/* Player Card Skeleton */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Player Card Skeleton</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <PlayerCardSkeleton />
          <PlayerCardSkeleton />
          <PlayerCardSkeleton />
        </div>
      </section>

      {/* Event Card Skeleton */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Event Card Skeleton</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      </section>

      {/* Custom Dark Theme Skeletons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Dark Theme Skeletons</h2>
        <div className="bg-[#0A165B] p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-4 w-full bg-gray-600" />
            <Skeleton className="h-8 w-32 bg-gray-600" />
            <Skeleton className="h-12 w-48 bg-gray-600" />
          </div>
        </div>
      </section>
    </div>
  )
}
