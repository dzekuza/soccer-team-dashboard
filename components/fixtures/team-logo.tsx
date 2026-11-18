import Image from "next/image"
import { cn } from "@/lib/utils"

interface TeamLogoProps {
  name: string
  logo: string | null
  className?: string
}

/** Club crest, or the team's initials when no logo is stored. */
export function TeamLogo({ name, logo, className }: TeamLogoProps) {
  const size = cn("relative shrink-0", className)

  if (logo) {
    return (
      <div className={size}>
        <Image src={logo} alt="" fill sizes="112px" className="object-contain" />
      </div>
    )
  }

  const initials = name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase()

  return (
    <div
      aria-hidden="true"
      className={cn(size, "grid place-items-center rounded-full bg-surface font-bold text-muted-foreground")}
    >
      {initials}
    </div>
  )
}
