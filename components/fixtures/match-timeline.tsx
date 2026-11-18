import { ArrowLeftRight } from "lucide-react"
import type { ReactNode } from "react"
import type { MatchEvent, MatchEventType } from "@/lib/fixtures"

interface MatchTimelineProps {
  events: MatchEvent[]
}

const EVENT_LABELS: Record<MatchEventType, string> = {
  goal: "Įvartis",
  yellow_card: "Geltona kortelė",
  red_card: "Raudona kortelė",
  substitution_in: "Pakeitimas: įėjo",
  substitution_out: "Pakeitimas: išėjo",
  other: "Įvykis",
}

const EVENT_ICONS: Record<MatchEventType, ReactNode> = {
  goal: <span className="h-3.5 w-3.5 rounded-full bg-primary" />,
  yellow_card: <span className="h-4 w-3 bg-booking-yellow" />,
  red_card: <span className="h-4 w-3 bg-booking-red" />,
  substitution_in: <ArrowLeftRight className="h-4 w-4 text-primary" />,
  substitution_out: <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />,
  other: <span className="h-2 w-2 rounded-full bg-muted-foreground" />,
}

function EventLabel({ event }: { event: MatchEvent }) {
  return (
    <span className="inline-flex items-center gap-3">
      {EVENT_ICONS[event.type]}
      <span className="text-white">{event.player || EVENT_LABELS[event.type]}</span>
      <span className="sr-only">({EVENT_LABELS[event.type]})</span>
    </span>
  )
}

/** Minute-by-minute list: home events on the left of the minute, away on the right. */
export function MatchTimeline({ events }: MatchTimelineProps) {
  return (
    <ol>
      {events.map((event, index) => (
        <li
          key={`${event.minute}-${event.player}-${index}`}
          className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-surface py-3"
        >
          <div className="justify-self-end text-right">
            {event.team === "home" ? <EventLabel event={event} /> : null}
          </div>
          <span className="w-12 text-center text-sm tabular-nums text-muted-foreground">{event.minute}&prime;</span>
          <div>{event.team === "away" ? <EventLabel event={event} /> : null}</div>
        </li>
      ))}
    </ol>
  )
}
