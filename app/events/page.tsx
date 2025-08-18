"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { PublicNavigation } from "@/components/public-navigation"
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleDateString('lt-LT', { month: 'short' })
    return { day: day.toString(), month }
  }

  const getEventImageSrc = (event: EventWithTiers) => {
    // If event has a cover image, use it
    if (event.coverImageUrl) {
      return event.coverImageUrl
    }
    
    // If teams have logos, create a combined image or use team logos
    // Fallback to branded background if no cover is set
    return '/bg%20qr.jpg'
  }

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
      <PublicNavigation currentPage="events" />
      
      {/* Main Content */}
      <div className="w-full">
        <div className="text-center py-8 border-b border-[#232C62]">
          <h1 className="h1-public">Renginiai</h1>
        </div>
        
        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((eventData) => {
            const { event, team1, team2 } = eventData
            const dateInfo = formatDate(event.date)
            
            // Debug log for cover image
            console.log(`Event ${event.id} coverImageUrl:`, event.coverImageUrl)
            
            return (
              <Link 
                key={event.id} 
                href={`/event/${event.id}`}
                className="block bg-[#0A165B] border border-[#232C62] hover:border-white transition-colors"
              >
                {/* Event Image */}
                <div className="relative aspect-video md:aspect-auto md:h-[163px]">
                  <Image
                    src={getEventImageSrc(event)}
                    alt={event.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      console.log(`Image failed to load for event ${event.id}:`, event.coverImageUrl)
                      const target = e.target as HTMLImageElement
                      target.src = '/bg%20qr.jpg'
                    }}
                  />
                  
                  {/* Date Overlay */}
                  <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white text-black px-2 md:px-3 py-1 text-center">
                    <div className="text-lg md:text-xl font-semibold leading-tight">{dateInfo.day}</div>
                    <div className="text-xs md:text-sm leading-tight">{dateInfo.month}</div>
                  </div>

                  {/* Teams Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-3 md:gap-6">
                    <div className="flex flex-col items-center">
                      <Image src={team1?.logo || '/placeholder-logo.png'} alt={team1?.team_name || 'Komanda 1'} width={40} height={40} className="object-contain w-10 h-10 md:w-12 md:h-12" />
                    </div>
                    <span className="text-white/80 font-bold text-base md:text-xl">VS</span>
                    <div className="flex flex-col items-center">
                      <Image src={team2?.logo || '/placeholder-logo.png'} alt={team2?.team_name || 'Komanda 2'} width={40} height={40} className="object-contain w-10 h-10 md:w-12 md:h-12" />
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                  <div className="text-white/65 text-sm md:text-base">
                    {event.location}
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-white text-lg md:text-xl font-semibold leading-tight">
                      {team1?.team_name || 'TBD'} vs {team2?.team_name || 'TBD'}
                    </h3>
                    <p className="text-white/65 text-sm md:text-base">
                      A Lyga – Round 22
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {events.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-white text-lg">Nėra renginių</p>
          </div>
        )}
        
        {/* Debug info */}
        <div className="text-center py-2">
          <p className="text-white text-xs">Debug: Loaded {events.length} events</p>
        </div>
      </div>
    </div>
  )
}
