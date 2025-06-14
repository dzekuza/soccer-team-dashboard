"use client"

import * as React from "react"
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
} from "date-fns"
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface Event {
  id: string
  name: string
  time?: string
  datetime: string
  description?: string
  location?: string
}

interface CalendarData {
  day: Date
  events: Event[]
}

interface FullScreenCalendarProps {
  data: CalendarData[]
  onEventClick?: (event: Event) => void
}

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
]

export function FullScreenCalendar({ data, onEventClick }: FullScreenCalendarProps) {
  const today = startOfToday()
  const [selectedDay, setSelectedDay] = React.useState(today)
  const [currentMonth, setCurrentMonth] = React.useState(format(today, "MMM-yyyy"))
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date())

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  })

  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function goToToday() {
    setCurrentMonth(format(today, "MMM-yyyy"))
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Calendar Header */}
      <div className="flex flex-col space-y-4 p-4 md:flex-row md:items-center md:justify-between md:space-y-0 lg:flex-none">
        <div className="flex flex-auto">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-foreground">
                {format(firstDayCurrentMonth, "MMMM, yyyy")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {format(firstDayCurrentMonth, "MMM d, yyyy")} - {format(endOfMonth(firstDayCurrentMonth), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <div className="inline-flex w-full -space-x-px rounded-lg shadow-sm shadow-black/5 md:w-auto rtl:space-x-reverse">
            <Button
              onClick={previousMonth}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Ankstesnis mėnuo"
            >
              <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button
              onClick={goToToday}
              className="w-full rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 md:w-auto"
              variant="outline"
            >
              Šiandien
            </Button>
            <Button
              onClick={nextMonth}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Kitas mėnuo"
            >
              <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>
          <Separator orientation="vertical" className="hidden h-6 md:block" />
          <Separator orientation="horizontal" className="block w-full md:hidden" />
          <Button className="w-full gap-2 md:w-auto" disabled>
            <PlusCircle size={16} strokeWidth={2} aria-hidden="true" />
            <span>Naujas renginys</span>
          </Button>
        </div>
      </div>
      {/* Calendar Grid */}
      <div className="lg:flex lg:flex-auto lg:flex-col">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border text-center text-xs font-semibold leading-6 lg:flex-none">
          <div className="border-r py-2.5">Pr</div>
          <div className="border-r py-2.5">An</div>
          <div className="border-r py-2.5">Tr</div>
          <div className="border-r py-2.5">Kt</div>
          <div className="border-r py-2.5">Pn</div>
          <div className="border-r py-2.5">Št</div>
          <div className="py-2.5">Sk</div>
        </div>
        {/* Calendar Days */}
        <div className="flex text-xs leading-6 lg:flex-auto">
          <div className="w-full border-x grid grid-cols-7 grid-rows-5">
            {days.map((day, dayIdx) => (
              <div
                key={dayIdx}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  dayIdx === 0 && colStartClasses[getDay(day)],
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    !isSameMonth(day, firstDayCurrentMonth) &&
                    "bg-accent/50 text-muted-foreground",
                  "relative flex flex-col border-b border-r hover:bg-muted focus:z-10 cursor-pointer",
                  !isEqual(day, selectedDay) && "hover:bg-accent/75",
                )}
              >
                <header className="flex items-center justify-between p-2.5">
                  <button
                    type="button"
                    className={cn(
                      isEqual(day, selectedDay) && "text-primary-foreground",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        isSameMonth(day, firstDayCurrentMonth) &&
                        "text-foreground",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        !isSameMonth(day, firstDayCurrentMonth) &&
                        "text-muted-foreground",
                      isEqual(day, selectedDay) &&
                        isToday(day) &&
                        "border-none bg-primary",
                      isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        "bg-foreground",
                      (isEqual(day, selectedDay) || isToday(day)) &&
                        "font-semibold",
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs hover:border",
                    )}
                  >
                    <time dateTime={format(day, "yyyy-MM-dd")}>{format(day, "d")}</time>
                  </button>
                </header>
                <div className="flex-1 p-2.5">
                  {data
                    .filter((event) => isSameDay(event.day, day))
                    .map((day) => (
                      <div key={day.day.toString()} className="space-y-1.5">
                        {day.events.slice(0, 2).map((event) => (
                          <button
                            key={event.id}
                            className="flex flex-col items-start gap-1 rounded-lg border bg-muted/50 p-2 text-xs leading-tight hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
                            onClick={e => {
                              e.stopPropagation();
                              if (onEventClick) {
                                onEventClick(event)
                              } else {
                                alert(`${event.name}${event.time ? `\n${event.time}` : ''}`)
                              }
                            }}
                            type="button"
                          >
                            <p className="font-medium leading-none">{event.name}</p>
                            {event.time && <p className="leading-none text-muted-foreground">{event.time}</p>}
                          </button>
                        ))}
                        {day.events.length > 2 && (
                          <div className="text-xs text-muted-foreground">+ {day.events.length - 2} daugiau</div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 