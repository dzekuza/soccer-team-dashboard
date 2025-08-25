"use client"

import { useEffect, useState } from "react"
import { PublicNavigation } from "@/components/public-navigation"
import { PublicFooter } from "@/components/public-footer"
import { PublicEventCard } from "@/components/public-event-card"
import type { EventWithTiers, Team } from "@/lib/types"

interface EventData {
  event: EventWithTiers
  team1: Team | null
  team2: Team | null
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/events')
        if (!response.ok) throw new Error("Nepavyko gauti renginių")
        
        const data = await response.json()
        console.log("Fetched events:", data) // Debug log
        setEvents(data)
      } catch (e: unknown) {
        console.error("Error fetching events:", e)
        setError(e instanceof Error ? e.message : "Įvyko nežinoma klaida.")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A165B]">
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-xl">Kraunama...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A165B]">
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-xl">Klaida: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A165B] text-white">
      <PublicNavigation currentPage="renginiai" />
      
      {/* Main Content */}
      <div className="w-full">
        <div className="text-center py-8 border-b border-[#232C62]">
          <h1 className="h1-public">Renginiai</h1>
        </div>
        
        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((eventData) => (
            <PublicEventCard
              key={eventData.event.id}
              event={eventData.event}
              team1={eventData.team1}
              team2={eventData.team2}
            />
          ))}
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
