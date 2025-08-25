"use client"

import Link from "next/link"
import Image from "next/image"
import type { EventWithTiers, Team } from "@/lib/types"

interface PublicEventCardProps {
  event: EventWithTiers
  team1: Team | null
  team2: Team | null
}

export function PublicEventCard({ event, team1, team2 }: PublicEventCardProps) {
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
    
    // Fallback to branded background if no cover is set
    return '/bg%20qr.jpg'
  }

  const dateInfo = formatDate(event.date)

  return (
    <Link 
      href={`/event/${event.id}`}
      className="bg-[#0A165B] border border-[#232C62] hover:border-[#F15601] transition-colors duration-200 group"
    >
      {/* Event Image */}
      <div className="relative aspect-video">
        <Image
          src={getEventImageSrc(event)}
          alt={event.title}
          fill
          className="object-cover"
        />
        {/* Date Overlay */}
        <div className="absolute top-4 left-4 bg-[#F15601] text-white px-3 py-1 rounded">
          <div className="text-sm font-bold">{dateInfo.day}</div>
          <div className="text-xs">{dateInfo.month}</div>
        </div>
        
        {/* Team Logos Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-6 bg-black/20">
          <div className="flex flex-col items-center gap-2">
            {team1 ? (
              <Image 
                src={team1.logo || '/placeholder-logo.png'} 
                alt={team1.team_name} 
                width={48} 
                height={48} 
                className="object-contain bg-white/90 rounded-full p-1"
              />
            ) : (
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-600">?</span>
              </div>
            )}
            <span className="text-white text-sm font-semibold text-shadow-lg">{team1?.team_name || "Nėra"}</span>
          </div>
          
          <span className="text-white font-bold text-lg text-shadow-lg">VS</span>
          
          <div className="flex flex-col items-center gap-2">
            {team2 ? (
              <Image 
                src={team2.logo || '/placeholder-logo.png'} 
                alt={team2.team_name} 
                width={48} 
                height={48} 
                className="object-contain bg-white/90 rounded-full p-1"
              />
            ) : (
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-600">?</span>
              </div>
            )}
            <span className="text-white text-sm font-semibold text-shadow-lg">{team2?.team_name || "Nėra"}</span>
          </div>
        </div>
      </div>
      
      {/* Event Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
          {event.title}
        </h3>
        
        <p className="text-sm text-gray-300 mb-2">
          {new Date(event.date).toLocaleDateString('lt-LT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <p className="text-sm text-gray-300">
          {event.location}
        </p>
      </div>
    </Link>
  )
}
