import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface ContactCardProps {
  icon: LucideIcon
  title: string
  children: ReactNode
}

/** Icon + heading + details block for contact information. */
export function ContactCard({ icon: Icon, title, children }: ContactCardProps) {
  return (
    <Card className="rounded-none border-surface bg-surface-deep">
      <CardContent className="flex gap-4 p-6">
        <Icon className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <div className="space-y-1 text-muted-foreground">{children}</div>
        </div>
      </CardContent>
    </Card>
  )
}
