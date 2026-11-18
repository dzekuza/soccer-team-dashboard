import { Phone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { AcademyGroup } from "@/lib/club-content"

interface AcademyGroupCardProps {
  group: AcademyGroup
  /** "berniukai" | "mergaitės": completes the heading, e.g. "2016 m. gimimo berniukai". */
  audience: string
}

/** One training group: birth years, who to call, and the phone number. */
export function AcademyGroupCard({ group, audience }: AcademyGroupCardProps) {
  return (
    <Card className="rounded-none border-surface bg-surface-deep transition-colors duration-200 ease-out-strong hover:border-primary">
      <CardContent className="space-y-4 p-6">
        <h3 className="text-sm font-medium text-muted-foreground">
          {group.birthYears} m. gimimo {audience}
        </h3>
        <p className="text-title font-bold text-white">{group.contactName}</p>
        <a
          href={group.phone.href}
          className="inline-flex items-center gap-2 font-medium text-primary hover:text-primary-strong"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          {group.phone.label}
        </a>
      </CardContent>
    </Card>
  )
}
