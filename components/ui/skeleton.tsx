import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Card skeleton component
function CardSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-lg border bg-card p-6", className)} {...props}>
      <div className="space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

// Avatar skeleton component
function AvatarSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton className={cn("h-10 w-10 rounded-full", className)} {...props} />
  )
}

// Text skeleton component
function TextSkeleton({ lines = 1, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  )
}

// Image skeleton component
function ImageSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton className={cn("aspect-video w-full", className)} {...props} />
  )
}

// Button skeleton component
function ButtonSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton className={cn("h-10 w-24", className)} {...props} />
  )
}

// Grid skeleton component for loading states in grid layouts
function GridSkeleton({ 
  items = 6, 
  columns = 3, 
  className, 
  itemClassName,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { 
  items?: number
  columns?: number
  itemClassName?: string
}) {
  return (
    <div 
      className={cn(`grid gap-4`, className)} 
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      {...props}
    >
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} className={itemClassName} />
      ))}
    </div>
  )
}

// Table skeleton component
function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { 
  rows?: number
  columns?: number
}) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  )
}

export { 
  Skeleton, 
  CardSkeleton, 
  AvatarSkeleton, 
  TextSkeleton, 
  ImageSkeleton, 
  ButtonSkeleton,
  GridSkeleton,
  TableSkeleton
}
