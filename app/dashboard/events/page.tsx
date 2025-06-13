"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { CreateEventDialog } from "@/components/create-event-dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { EventWithTiers, TicketWithDetails } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithTiers[]>([])
  const [tickets, setTickets] = useState<TicketWithDetails[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
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

  const handleEventCreated = () => {
    console.log("Event created, refreshing events list...")
    fetchEvents()
    setIsCreateDialogOpen(false)
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

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
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
              <CardFooter className="border-t pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => (window.location.href = `/dashboard/tickets?eventId=${event.id}`)}
                >
                  Generate Tickets
                </Button>
              </CardFooter>
            </Card>
          ))}
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
