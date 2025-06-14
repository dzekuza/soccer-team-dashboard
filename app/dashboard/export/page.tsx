"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Event, Ticket } from "@/lib/types"
import { Download } from "lucide-react"
import { supabaseService } from "@/lib/supabase-service"

export default function ExportPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])

  // Add stats state at the top of the component
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTickets: 0,
    validatedTickets: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [eventsData, ticketsData, statsData] = await Promise.all([
        supabaseService.getEvents(),
        supabaseService.getTicketsWithDetails(),
        supabaseService.getEventStats(),
      ])

      setEvents(eventsData)
      setTickets(ticketsData)
      setStats(statsData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    }
  }

  const exportToWordPress = () => {
    const exportData = {
      events: events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        createdAt: event.createdAt,
      })),
      tickets: tickets.map((ticket) => ({
        id: ticket.id,
        eventId: ticket.eventId,
        purchaserName: ticket.purchaserName,
        purchaserEmail: ticket.purchaserEmail,
        isValidated: ticket.isValidated,
        createdAt: ticket.createdAt,
      })),
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `soccer-team-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportEventsCSV = () => {
    const headers = ["ID", "Title", "Description", "Date", "Time", "Location", "Created At"]
    const csvContent = [
      headers.join(","),
      ...events.map((event) =>
        [
          event.id,
          `"${event.title}"`,
          `"${event.description}"`,
          event.date,
          event.time,
          `"${event.location}"`,
          event.createdAt,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `events-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportTicketsCSV = () => {
    const headers = ["ID", "Event ID", "Purchaser Name", "Purchaser Email", "Validated", "Created At"]
    const csvContent = [
      headers.join(","),
      ...tickets.map((ticket) =>
        [
          ticket.id,
          ticket.eventId,
          `"${ticket.purchaserName}"`,
          ticket.purchaserEmail,
          ticket.isValidated,
          ticket.createdAt,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `tickets-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Eksportuoti duomenis</h1>
        <p className="text-gray-600">Eksportuokite savo renginius ir bilietus WordPress integracijai</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Renginiai</CardTitle>
            <CardDescription>Iš viso sukurta renginių</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bilietai</CardTitle>
            <CardDescription>Iš viso sugeneruota bilietų</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalTickets}</div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Badge variant="outline">{stats.validatedTickets} patvirtinta</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pajamos</CardTitle>
            <CardDescription>Numatomos visos pajamos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>WordPress eksportas</CardTitle>
            <CardDescription>Eksportuokite visus duomenis JSON formatu WordPress integracijai</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={exportToWordPress} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Eksportuoti WordPress
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CSV eksportai</CardTitle>
            <CardDescription>Eksportuokite atskirus duomenų rinkinius CSV formatu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={exportEventsCSV} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Eksportuoti renginių CSV
            </Button>
            <Button onClick={exportTicketsCSV} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Eksportuoti bilietų CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
