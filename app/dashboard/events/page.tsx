"use client"

import { useState, useEffect } from "react"
import { Plus, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { CreateEventDialog } from "@/components/create-event-dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { EventWithTiers, TicketWithDetails, Team } from "@/lib/types"
import { formatCurrency, cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { supabaseService } from "@/lib/supabase-service"
import { Component as TwoMonthCalendar } from "@/components/ui/demo"
import { supabase } from "@/lib/supabase"

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithTiers[]>([])
  const [tickets, setTickets] = useState<TicketWithDetails[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [view, setView] = useState<'grid' | 'calendar'>('grid')

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
      <Tabs value={view} onValueChange={(v: string) => setView(v as 'grid' | 'calendar')} className="mb-4">
        <TabsList>
          <TabsTrigger value="grid">Tinklelio vaizdas</TabsTrigger>
          <TabsTrigger value="calendar">Kalendoriaus vaizdas</TabsTrigger>
        </TabsList>
      </Tabs>
      {view === 'grid' ? (
        error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : isLoading ? (
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
            {events.filter(Boolean).map((event) => {
              const team1 = getTeam(event.team1_id)
              const team2 = getTeam(event.team2_id)
              const eventTickets = tickets.filter(t => t.event_id === event.id)
              const missingTeam = !team1 || !team2;
              return (
                <Card key={event.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-col items-center gap-1 w-1/3">
                        {team1 ? (
                          <Image src={team1.logo || ''} alt={team1.team_name} width={36} height={36} className="rounded bg-white p-1" />
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
                          <Image src={team2.logo || ''} alt={team2.team_name} width={36} height={36} className="rounded bg-white p-1" />
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
                          {event.pricing_tiers?.map((tier) => {
                            const generatedCount = eventTickets.filter(t => t.tier_id === tier.id).length;
                            const validatedCount = eventTickets.filter(t => t.tier_id === tier.id && t.status === 'validated').length;
                            return (
                              <div key={tier.id} className="flex justify-between items-center text-xs">
                                <div className="flex items-center">
                                  <span className="font-medium">{tier.name}</span>
                                  <span className="text-gray-500 ml-2">({formatCurrency(tier.price)})</span>
                                </div>
                                <Badge variant="secondary" className="font-mono">
                                  {validatedCount} / {generatedCount} / {tier.quantity}
                                </Badge>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex flex-col gap-2">
                    <Button
                      className="w-full"
                      onClick={() => (window.location.href = `/dashboard/tickets?eventId=${event.id}`)}
                    >
                      Generuoti bilietus
                    </Button>
                    <Button
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
                          const { error } = await supabase
                            .from('events')
                            .delete()
                            .eq('id', event.id)

                          if (error) {
                            throw error;
                          }
                          
                          setEvents(events.filter(e => e.id !== event.id));
                          alert('Renginys sėkmingai ištrintas.');

                        } catch (err) {
                          const errorMessage = err instanceof Error ? err.message : "Nepavyko ištrinti renginio.";
                          alert(errorMessage);
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
        )
      ) : (
        <TwoMonthCalendar />
      )}

      <CreateEventDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onEventCreated={handleEventCreated}
      />
    </div>
  )
}
