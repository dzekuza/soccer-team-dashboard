"use client"

import { useState, useMemo } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CreateEventDialog } from "@/components/create-event-dialog"
import type { EventWithTiers, TicketWithDetails, Team } from "@/lib/types"
import { supabase } from "@/lib/supabase"
import { EventCard } from "@/components/event-card"
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Trash2, Edit, Eye } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

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
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  SearchIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

interface CalendarEvent {
  id: string
  name: string
  time: string
  datetime: string
}

interface CalendarData {
  day: Date
  events: CalendarEvent[]
}

interface FullScreenCalendarProps {
  data: CalendarData[]
  onNewEventClick: () => void;
  onEventClick: (eventId: string) => void;
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

function FullScreenCalendar({ data, onNewEventClick, onEventClick }: FullScreenCalendarProps) {
  const today = startOfToday()
  const [selectedDay, setSelectedDay] = React.useState(today)
  const [currentMonth, setCurrentMonth] = React.useState(
    format(today, "MMM-yyyy"),
  )
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
            <div className="hidden w-20 flex-col items-center justify-center rounded-lg border bg-muted p-0.5 md:flex">
              <h1 className="p-1 text-xs uppercase text-muted-foreground">
                {format(today, "MMM")}
              </h1>
              <div className="flex w-full items-center justify-center rounded-lg border bg-background p-0.5 text-lg font-bold">
                <span>{format(today, "d")}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-foreground">
                {format(firstDayCurrentMonth, "MMMM, yyyy")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {format(firstDayCurrentMonth, "MMM d, yyyy")} -{" "}
                {format(endOfMonth(firstDayCurrentMonth), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <Button variant="outline" size="icon" className="hidden lg:flex">
            <SearchIcon size={16} strokeWidth={2} aria-hidden="true" />
          </Button>

          <Separator orientation="vertical" className="hidden h-6 lg:block" />

          <div className="inline-flex w-full -space-x-px rounded-lg shadow-sm shadow-black/5 md:w-auto rtl:space-x-reverse">
            <Button
              onClick={previousMonth}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Navigate to previous month"
            >
              <ChevronLeftIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button
              onClick={goToToday}
              className="w-full rounded-none shadow-none first:rounded-s-lg last:rounded-s-lg focus-visible:z-10 md:w-auto"
              variant="outline"
            >
              Today
            </Button>
            <Button
              onClick={nextMonth}
              className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
              variant="outline"
              size="icon"
              aria-label="Navigate to next month"
            >
              <ChevronRightIcon size={16} strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>

          <Separator orientation="vertical" className="hidden h-6 md:block" />
          <Separator
            orientation="horizontal"
            className="block w-full md:hidden"
          />

          <Button className="w-full gap-2 md:w-auto" onClick={onNewEventClick}>
            <PlusCircleIcon size={16} strokeWidth={2} aria-hidden="true" />
            <span>New Event</span>
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="lg:flex lg:flex-auto lg:flex-col">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border text-center text-xs font-semibold leading-6 lg:flex-none">
          <div className="border-r py-2.5">Sun</div>
          <div className="border-r py-2.5">Mon</div>
          <div className="border-r py-2.5">Tue</div>
          <div className="border-r py-2.5">Wed</div>
          <div className="border-r py-2.5">Thu</div>
          <div className="border-r py-2.5">Fri</div>
          <div className="py-2.5">Sat</div>
        </div>

        {/* Calendar Days */}
        <div className="flex text-xs leading-6 lg:flex-auto">
          <div className="hidden w-full border-x lg:grid lg:grid-cols-7 lg:grid-rows-5">
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
                  "relative flex flex-col border-b border-r hover:bg-muted focus:z-10",
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
                    <time dateTime={format(day, "yyyy-MM-dd")}>
                      {format(day, "d")}
                    </time>
                  </button>
                </header>
                <div className="flex-1 p-2.5">
                  {data
                    .filter((event) => isSameDay(event.day, day))
                    .map((day) => (
                      <div key={day.day.toString()} className="space-y-1.5">
                        {day.events.slice(0, 1).map((event) => (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event.id);
                            }}
                            className="flex flex-col items-start gap-1 rounded-lg border bg-muted/50 p-2 text-xs leading-tight cursor-pointer hover:bg-muted/75 transition-colors"
                          >
                            <p className="font-medium leading-none">
                              {event.name}
                            </p>
                            <p className="leading-none text-muted-foreground">
                              {event.time}
                            </p>
                          </div>
                        ))}
                        {day.events.length > 1 && (
                          <div className="text-xs text-muted-foreground">
                            + {day.events.length - 1} more
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="isolate grid w-full grid-cols-7 grid-rows-5 border-x lg:hidden">
            {days.map((day, dayIdx) => (
              <button
                onClick={() => setSelectedDay(day)}
                key={dayIdx}
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
                  (isEqual(day, selectedDay) || isToday(day)) &&
                    "font-semibold",
                  "flex h-14 flex-col border-b border-r px-3 py-2 hover:bg-muted focus:z-10",
                )}
              >
                <time
                  dateTime={format(day, "yyyy-MM-dd")}
                  className={cn(
                    "ml-auto flex size-6 items-center justify-center rounded-full",
                    isEqual(day, selectedDay) &&
                      isToday(day) &&
                      "bg-primary text-primary-foreground",
                    isEqual(day, selectedDay) &&
                      !isToday(day) &&
                      "bg-primary text-primary-foreground",
                  )}
                >
                  {format(day, "d")}
                </time>
                {data.filter((date) => isSameDay(date.day, day)).length > 0 && (
                  <div>
                    {data
                      .filter((date) => isSameDay(date.day, day))
                      .map((date) => (
                        <div
                          key={date.day.toString()}
                          className="-mx-0.5 mt-auto flex flex-wrap-reverse"
                        >
                          {date.events.map((event) => (
                            <span
                              key={event.id}
                              className="mx-0.5 mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground"
                            />
                          ))}
                        </div>
                      ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface EventsClientProps {
  initialEvents: EventWithTiers[];
  initialTickets?: TicketWithDetails[];
  initialTeams: Team[];
}

export default function EventsClient({
  initialEvents,
  initialTickets = [],
  initialTeams,
}: EventsClientProps) {
  const [events, setEvents] = useState<EventWithTiers[]>(initialEvents)
  const [tickets, setTickets] = useState<TicketWithDetails[]>(initialTickets)
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [view, setView] = useState<'grid' | 'calendar'>('grid')
  const [selectedEvent, setSelectedEvent] = useState<EventWithTiers | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)

  const handleEventCreated = async () => {
    window.location.reload();
  }

  const handleDeleteEvent = async (eventId: string) => {
    const eventToDelete = events.find(e => e.id === eventId);
    if (!eventToDelete) return;

    if (!window.confirm(`Ar tikrai norite ištrinti renginį "${eventToDelete.title}"? Šio veiksmo atšaukti negalėsite.`)) return;
    setDeletingId(eventId);
    
    console.log('🗑️ Starting deletion of event:', eventId);
    
    // Check authentication status first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('❌ Authentication error:', authError);
      alert('Authentication error. Please log in again.');
      return;
    }
    
    if (!user) {
      console.error('❌ No authenticated user found');
      alert('Please log in to delete events.');
      return;
    }
    
    console.log('✅ User authenticated:', user.id);
    
    // Check user role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError);
    } else {
      console.log('👤 User role:', userProfile?.role);
    }
    
    try {
      // First, delete all tickets associated with this event
      console.log('📋 Deleting tickets for event:', eventId);
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .delete()
        .eq('event_id', eventId)
        .select();

      if (ticketsError) {
        console.error('❌ Error deleting tickets:', ticketsError);
        console.error('❌ Error details:', ticketsError.message, ticketsError.details, ticketsError.hint);
        // Continue anyway, as the event deletion might still work
      } else {
        console.log('✅ Successfully deleted tickets:', ticketsData?.length || 0, 'tickets');
      }

      // Then, delete all pricing tiers associated with this event
      console.log('💰 Deleting pricing tiers for event:', eventId);
      const { data: tiersData, error: tiersError } = await supabase
        .from('pricing_tiers')
        .delete()
        .eq('event_id', eventId)
        .select();

      if (tiersError) {
        console.error('❌ Error deleting pricing tiers:', tiersError);
        console.error('❌ Error details:', tiersError.message, tiersError.details, tiersError.hint);
        // Continue anyway, as the event deletion might still work
      } else {
        console.log('✅ Successfully deleted pricing tiers:', tiersData?.length || 0, 'tiers');
      }

      // Finally, delete the event itself
      console.log('🎫 Deleting event:', eventId);
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .select();

      if (eventError) {
        console.error('❌ Error deleting event:', eventError);
        console.error('❌ Error details:', eventError.message, eventError.details, eventError.hint);
        throw eventError;
      }
      
      console.log('✅ Successfully deleted event');
      setEvents(events.filter(e => e.id !== eventId));
      alert('Renginys sėkmingai ištrintas.');

    } catch (err) {
      console.error('❌ Error in handleDeleteEvent:', err);
      const errorMessage = err instanceof Error ? err.message : "Nepavyko ištrinti renginio.";
      alert(errorMessage);
    } finally {
      setDeletingId(null);
    }
  }

  const handleEventClick = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setIsEventModalOpen(true);
    }
  }

  const calendarData = useMemo(() => {
    const groupedEvents: { [key: string]: CalendarData } = events.reduce((acc, event) => {
        // The event.date is a string like "YYYY-MM-DD". new Date() will parse it as UTC.
        // To avoid timezone issues, we can construct the date carefully.
        const dateParts = event.date.split('-').map(Number);
        const eventDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        
        const dayKey = format(eventDate, 'yyyy-MM-dd');
        
        if (!acc[dayKey]) {
            acc[dayKey] = {
                day: eventDate,
                events: []
            };
        }
        acc[dayKey].events.push({
            id: event.id,
            name: event.title,
            time: event.time,
            datetime: `${event.date}T${event.time}`
        });
        return acc;
    }, {} as { [key: string]: CalendarData });
    return Object.values(groupedEvents);
  }, [events]);

  // Find the next upcoming event (or most recent if all are past)
  const now = new Date();
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const featuredEvent = sortedEvents.find(e => new Date(e.date) >= now) || sortedEvents[0];

  let team1, team2;
  if (featuredEvent) {
    team1 = teams.find(t => t.id === featuredEvent.team1Id);
    team2 = teams.find(t => t.id === featuredEvent.team2Id);
  }

  return (
    <div className="space-y-6">
      {/* Event Header Section */}
      {featuredEvent && (
        <div className="w-full flex flex-col items-center justify-center rounded-lg bg-[rgba(7,15,64,0.70)] border border-[rgba(95,95,113,0.31)] py-8 px-4 mb-4">
          <div className="text-white text-lg font-medium uppercase tracking-tight mb-2 text-center">
            {featuredEvent.title || 'Rungtynės'}
          </div>
          <div className="flex flex-row items-center justify-center gap-8 mb-4">
            {/* Team 1 */}
            <div className="flex flex-col items-center min-w-[100px]">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-2 overflow-hidden">
                <img src={team1?.logo || '/placeholder-logo.svg'} alt={team1?.team_name || 'Komanda 1'} className="object-contain w-16 h-16" />
              </div>
              <div className="text-white text-xl font-bold leading-tight">{team1?.team_name || 'Komanda 1'}</div>
              <div className="text-white/70 text-xs mt-1">{/* Pozicija */}– vieta A lygoje</div>
            </div>
            {/* VS */}
            <div className="flex flex-col items-center justify-center">
              <div className="text-5xl font-extrabold text-white">VS</div>
            </div>
            {/* Team 2 */}
            <div className="flex flex-col items-center min-w-[100px]">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-2 overflow-hidden">
                <img src={team2?.logo || '/placeholder-logo.svg'} alt={team2?.team_name || 'Komanda 2'} className="object-contain w-16 h-16" />
              </div>
              <div className="text-white text-xl font-bold leading-tight">{team2?.team_name || 'Komanda 2'}</div>
              <div className="text-white/70 text-xs mt-1">{/* Pozicija */}– vieta A lygoje</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="text-white text-base font-semibold">{featuredEvent.date} {featuredEvent.time && <span className="ml-2">{featuredEvent.time}</span>}</div>
            <div className="text-white/80 text-sm">{featuredEvent.location}</div>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Renginiai</h1>
          <p className="text-gray-600">Tvarkykite savo futbolo komandos renginius</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Sukurti renginį
        </Button>
      </div>
      <Tabs value={view} onValueChange={(v: string) => setView(v as 'grid' | 'calendar')} className="mb-4">
        <TabsList>
          <TabsTrigger value="grid">Tinklelio vaizdas</TabsTrigger>
          <TabsTrigger value="calendar">Kalendoriaus vaizdas</TabsTrigger>
        </TabsList>
      </Tabs>
      {view === 'grid' ? (
        events.length === 0 ? (
          <Card className="bg-card text-card-foreground">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-medium mb-2">Renginių nerasta</h3>
              <p className="text-muted-foreground mb-6">Sukurkite savo pirmąjį renginį, kad pradėtumėte</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Sukurti renginį
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.filter(Boolean).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                tickets={tickets}
                teams={teams}
                onDelete={handleDeleteEvent}
                deletingId={deletingId}
              />
            ))}
          </div>
        )
      ) : (
        <FullScreenCalendar 
          data={calendarData} 
          onNewEventClick={() => setIsCreateDialogOpen(true)}
          onEventClick={handleEventClick}
        />
      )}

      {/* Event Preview Modal */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="max-w-2xl bg-[#0A165B] border-[#0A2065]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Renginio peržiūra
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              {/* Event Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedEvent.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{selectedEvent.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{selectedEvent.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-[#F15601] text-white">
                  {selectedEvent.pricingTiers?.length || 0} kainų lygiai
                </Badge>
              </div>

              {/* Event Description */}
              {selectedEvent.description && (
                <div>
                  <h4 className="font-medium text-white mb-2">Aprašymas</h4>
                  <p className="text-gray-300 text-sm">{selectedEvent.description}</p>
                </div>
              )}

              {/* Pricing Tiers */}
              {selectedEvent.pricingTiers && selectedEvent.pricingTiers.length > 0 && (
                <div>
                  <h4 className="font-medium text-white mb-3">Kainų lygiai</h4>
                  <div className="space-y-2">
                    {selectedEvent.pricingTiers.map((tier) => (
                      <div key={tier.id} className="flex items-center justify-between p-3 bg-[#0A2065] rounded-lg">
                        <div>
                          <span className="font-medium text-white">{tier.name}</span>
                          <p className="text-sm text-gray-300">Kiekis: {tier.quantity}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-[#F15601]">{formatCurrency(tier.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-[#0A2065]">
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                  onClick={() => {
                    // TODO: Implement edit functionality
                    alert('Redagavimo funkcija bus pridėta vėliau');
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Redaguoti
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                  onClick={() => {
                    // TODO: Implement view details functionality
                    alert('Detalės bus rodomos vėliau');
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Peržiūrėti
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => {
                    setIsEventModalOpen(false);
                    handleDeleteEvent(selectedEvent.id);
                  }}
                  disabled={deletingId === selectedEvent.id}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deletingId === selectedEvent.id ? 'Ištrinama...' : 'Ištrinti'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CreateEventDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onEventCreated={handleEventCreated}
      />
    </div>
  )
} 