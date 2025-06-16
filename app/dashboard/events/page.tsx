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
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar'
import { format, parseISO } from 'date-fns'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { isSameDay } from 'date-fns'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { supabaseService } from "@/lib/supabase-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithTiers[]>([])
  const [tickets, setTickets] = useState<TicketWithDetails[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [view, setView] = useState<'grid' | 'calendar'>('grid')
  const [modalEvent, setModalEvent] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchEvents()
    fetchTeams()
  }, [])

  const fetchEvents = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [eventsData, ticketsData] = await Promise.all([
        supabaseService.getEventsWithTiers(),
        supabaseService.getTicketsWithDetails(),
      ])
      setEvents(eventsData)
      setTickets(ticketsData)
    } catch (error) {
      setError("Nepavyko įkelti renginių. Bandykite vėliau.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTeams = async () => {
    try {
      const data = await supabaseService.getTeams()
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

  // Map events to FullScreenCalendar data structure
  const calendarData = events
    .filter(event => event && event.title)
    .reduce((acc, event) => {
      const day = parseISO(event.date)
      const found = acc.find(d => format(d.day, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
      const eventObj = {
        id: event.id,
        name: event.title,
        time: event.time,
        datetime: event.date + 'T' + (event.time || '00:00:00'),
        description: event.description,
        location: event.location,
      }
      if (found) {
        found.events.push(eventObj)
      } else {
        acc.push({ day, events: [eventObj] })
      }
      return acc
    }, [] as { day: Date; events: any[] }[])

  return (
    <div className="space-y-6">
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
      <Tabs value={view} onValueChange={v => setView(v as 'grid' | 'calendar')} className="mb-4">
        <TabsList>
          <TabsTrigger value="grid">Tinklelio vaizdas</TabsTrigger>
          <TabsTrigger value="calendar">Kalendoriaus vaizdas</TabsTrigger>
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
          <FullScreenCalendar
            data={calendarData}
            onEventClick={event => {
              setModalEvent(event)
              setModalOpen(true)
            }}
          />
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="max-w-lg">
              {modalEvent ? (
                <>
                  <DialogHeader>
                    <DialogTitle className="mb-2 text-2xl font-bold">{modalEvent.name}</DialogTitle>
                    <DialogDescription>
                      {modalEvent.description && modalEvent.description}
                    </DialogDescription>
                  </DialogHeader>
                  {modalEvent.cover && (
                    <div className="mb-4 flex justify-center">
                      <Image src={modalEvent.cover} alt="cover" width={320} height={180} className="rounded-lg object-cover" />
                    </div>
                  )}
                  <div className="space-y-2 text-sm">
                    {modalEvent.time && <div><span className="font-medium">Laikas:</span> {modalEvent.time}</div>}
                    {modalEvent.location && <div><span className="font-medium">Vieta:</span> {modalEvent.location}</div>}
                  </div>
                  <DialogFooter className="mt-4 gap-2">
                    <button className="btn-main px-4 py-2 rounded text-white" onClick={() => {navigator.share ? navigator.share({ title: modalEvent.name, text: modalEvent.description || '', url: window.location.href }) : navigator.clipboard.writeText(window.location.href)}}>
                      Dalintis
                    </button>
                    <button className="btn-main px-4 py-2 rounded text-white" onClick={() => {/* TODO: implement ticket generation */}}>
                      Generuoti bilietus
                    </button>
                  </DialogFooter>
                </>
              ) : (
                <div>Įkeliama...</div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-medium mb-2">Renginių nerasta</h3>
            <p className="text-gray-600 mb-6">Sukurkite savo pirmąjį renginį, kad pradėtumėte</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Sukurti renginį
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
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
                      <span className="font-semibold text-xs text-center mt-1">{team1?.team_name || "Nežinoma komanda"}</span>
                    </div>
                    <span className="text-xs text-gray-500 w-1/3 text-center">prieš</span>
                    <div className="flex flex-col items-center gap-1 w-1/3">
                      {team2 ? (
                        <Image src={team2.logo} alt={team2.team_name} width={36} height={36} className="rounded bg-white p-1" />
                      ) : (
                        <div className="w-9 h-9 flex items-center justify-center bg-gray-200 rounded">
                          <AlertTriangle className="text-gray-400 w-6 h-6" />
                        </div>
                      )}
                      <span className="font-semibold text-xs text-center mt-1">{team2?.team_name || "Nežinoma komanda"}</span>
                    </div>
                  </div>
                  {missingTeam && (
                    <div className="flex items-center gap-2 text-yellow-700 text-xs mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Įspėjimas: viena arba abi komandos nerastos</span>
                    </div>
                  )}
                  <CardTitle>
                    <Link href={`/dashboard/events/${event.id}`} className="hover:underline text-black text-base font-semibold">
                      {event.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Data:</span> {event.date}
                    </p>
                    <p>
                      <span className="font-medium">Laikas:</span> {event.time}
                    </p>
                    <p>
                      <span className="font-medium">Vieta:</span> {event.location}
                    </p>
                    <div className="pt-2">
                      <p className="font-medium mb-1">Kainų lygiai:</p>
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
                                  {generatedCount}/{tier.maxQuantity} (patvirtinta: {validatedCount})
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
                    Generuoti bilietus
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={async () => {
                      await navigator.clipboard.writeText(`${window.location.origin}/event/${event.id}`)
                      alert('Nuoroda nukopijuota!')
                    }}
                  >
                    Dalintis
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={deletingId === event.id}
                    onClick={async () => {
                      if (!window.confirm(`Ar tikrai norite ištrinti renginį "${event.title}"? Šio veiksmo atšaukti negalėsite.`)) return;
                      setDeletingId(event.id);
                      try {
                        const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
                        if (res.status === 204) {
                          setEvents(events.filter(e => e.id !== event.id));
                        } else {
                          const data = await res.json();
                          alert(data.error || "Nepavyko ištrinti renginio.");
                        }
                      } catch {
                        alert("Nepavyko ištrinti renginio. Tinklo klaida.");
                      } finally {
                        setDeletingId(null);
                      }
                    }}
                  >
                    {deletingId === event.id ? "Trinama..." : "Ištrinti"}
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
