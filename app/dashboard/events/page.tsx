"use client"

import { useState, useEffect } from "react"
import { Plus, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { CreateEventDialog } from "@/components/create-event-dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { EventWithTiers, TicketWithDetails, Team } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { Calendar } from '@/components/ui/calendar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { addDays, startOfWeek, endOfWeek, isSameDay, format, isToday, parseISO } from 'date-fns'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithTiers[]>([])
  const [tickets, setTickets] = useState<TicketWithDetails[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [view, setView] = useState<'grid' | 'calendar'>('grid')
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))

  useEffect(() => {
    fetchEvents()
    fetchTeams()
  }, [])

  const fetchEvents = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [eventsRes, ticketsRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/tickets"),
      ])
      if (!eventsRes.ok) throw new Error("Failed to fetch events")
      if (!ticketsRes.ok) throw new Error("Failed to fetch tickets")
      const eventsData = await eventsRes.json()
      const ticketsData = await ticketsRes.json()
      setEvents(eventsData)
      setTickets(ticketsData)
    } catch (error) {
      setError("Failed to load events. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/teams")
      if (!res.ok) throw new Error("Failed to fetch teams")
      const data = await res.json()
      setTeams(data)
    } catch {
      setTeams([])
    }
  }

  const handleEventCreated = () => {
    fetchEvents()
    setIsCreateDialogOpen(false)
  }

  const getTeam = (id?: string) => teams.find(t => t.id === id)

  // Helper: get events for a given date
  const eventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = typeof event.date === 'string' ? parseISO(event.date) : event.date
      return isSameDay(eventDate, date)
    })
  }
  // Helper: get attendee count for event
  const attendeeCount = (eventId: string) => tickets.filter(t => t.eventId === eventId).length

  // Render weekly calendar
  const renderWeeklyCalendar = () => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="px-2 py-1 rounded hover:bg-gray-100">&lt;</button>
          <span className="font-semibold">{format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}</span>
          <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="px-2 py-1 rounded hover:bg-gray-100">&gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-2 bg-gray-50 rounded p-2">
          {days.map(day => (
            <div key={day.toISOString()} className={`min-h-[120px] border rounded p-2 relative ${isToday(day) ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}> 
              <div className="text-xs font-semibold mb-1 flex items-center justify-between">
                <span>{format(day, 'EEE')}</span>
                <span>{format(day, 'd')}</span>
              </div>
              <div className="space-y-1">
                {eventsForDate(day).length === 0 ? (
                  <span className="text-gray-300 text-xs">No events</span>
                ) : (
                  eventsForDate(day).map(event => (
                    <Popover key={event.id}>
                      <PopoverTrigger asChild>
                        <div className="bg-blue-100 border border-blue-300 rounded px-2 py-1 text-xs flex flex-col cursor-pointer hover:bg-blue-200">
                          <span className="font-medium text-blue-900 truncate">{event.title}</span>
                          <span className="text-blue-700">Attendees: {attendeeCount(event.id)}</span>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent align="start">
                        <div className="space-y-1">
                          <div className="font-bold text-lg text-blue-900">{event.title}</div>
                          <div className="text-sm text-gray-700">{event.description}</div>
                          <div className="text-xs text-gray-500">{event.date} {event.time}</div>
                          <div className="text-xs text-gray-500">{event.location}</div>
                          <div className="text-xs text-blue-700 font-semibold">Attendees: {attendeeCount(event.id)}</div>
                          <a href={`/dashboard/events/${event.id}`} className="text-xs text-blue-600 underline mt-2 inline-block">View Event</a>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-gray-600">Manage your soccer team events</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>
      <Tabs value={view} onValueChange={v => setView(v as 'grid' | 'calendar')} className="mb-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
      </Tabs>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {view === 'grid' ? (
        error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )
      ) : (
        <div className="bg-white rounded shadow p-4">
          {renderWeeklyCalendar()}
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-medium mb-2">No events found</h3>
            <p className="text-gray-600 mb-6">Create your first event to get started</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const team1 = getTeam(event.team1Id)
            const team2 = getTeam(event.team2Id)
            const missingTeam = !team1 || !team2;
            return (
              <Card key={event.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col items-center gap-1 w-1/3">
                      {team1 ? (
                        <Image src={team1.logo} alt={team1.team_name} width={36} height={36} className="rounded bg-white p-1" />
                      ) : (
                        <div className="w-9 h-9 flex items-center justify-center bg-gray-200 rounded">
                          <AlertTriangle className="text-gray-400 w-6 h-6" />
                        </div>
                      )}
                      <span className="font-semibold text-xs text-center mt-1">{team1?.team_name || "Unknown Team"}</span>
                    </div>
                    <span className="text-xs text-gray-500 w-1/3 text-center">vs</span>
                    <div className="flex flex-col items-center gap-1 w-1/3">
                      {team2 ? (
                        <Image src={team2.logo} alt={team2.team_name} width={36} height={36} className="rounded bg-white p-1" />
                      ) : (
                        <div className="w-9 h-9 flex items-center justify-center bg-gray-200 rounded">
                          <AlertTriangle className="text-gray-400 w-6 h-6" />
                        </div>
                      )}
                      <span className="font-semibold text-xs text-center mt-1">{team2?.team_name || "Unknown Team"}</span>
                    </div>
                  </div>
                  {missingTeam && (
                    <div className="flex items-center gap-2 text-yellow-700 text-xs mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Warning: One or both teams not found</span>
                    </div>
                  )}
                  <CardTitle>
                    <Link href={`/dashboard/events/${event.id}`} className="hover:underline text-blue-700">
                      {event.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Date:</span> {event.date}
                    </p>
                    <p>
                      <span className="font-medium">Time:</span> {event.time}
                    </p>
                    <p>
                      <span className="font-medium">Location:</span> {event.location}
                    </p>
                    <div className="pt-2">
                      <p className="font-medium mb-1">Pricing Tiers:</p>
                      <div className="space-y-1">
                        {event.pricingTiers.map((tier) => {
                          const generatedCount = tickets.filter(t => t.tierId === tier.id).length;
                          const validatedCount = tickets.filter(t => t.tierId === tier.id && t.isValidated).length;
                          return (
                            <div key={tier.id} className="flex justify-between items-center">
                              <span>{tier.name}</span>
                              <div className="flex items-center space-x-2">
                                <span>{formatCurrency(tier.price)}</span>
                                <Badge variant="outline" className="text-xs">
                                  {generatedCount}/{tier.maxQuantity} (validated: {validatedCount})
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => (window.location.href = `/dashboard/tickets?eventId=${event.id}`)}
                  >
                    Generate Tickets
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={async () => {
                      await navigator.clipboard.writeText(`${window.location.origin}/event/${event.id}`)
                      alert('Link copied!')
                    }}
                  >
                    Share
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={deletingId === event.id}
                    onClick={async () => {
                      if (!window.confirm(`Are you sure you want to delete the event "${event.title}"? This cannot be undone.`)) return;
                      setDeletingId(event.id);
                      try {
                        const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
                        if (res.status === 204) {
                          setEvents(events.filter(e => e.id !== event.id));
                        } else {
                          const data = await res.json();
                          alert(data.error || "Failed to delete event.");
                        }
                      } catch {
                        alert("Failed to delete event. Network error.");
                      } finally {
                        setDeletingId(null);
                      }
                    }}
                  >
                    {deletingId === event.id ? "Deleting..." : "Delete"}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      <CreateEventDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onEventCreated={handleEventCreated}
      />
    </div>
  )
}
