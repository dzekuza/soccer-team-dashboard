"use client"

import Image from "next/image"
import type { Player } from "@/lib/types"

interface PlayerCardProps {
  player: Player
}

export function PlayerCard({ player }: PlayerCardProps) {
  const getPlayerImageSrc = (player: Player) => {
    if (player.image_url) {
      return player.image_url
    }
    return '/placeholder-user.jpg'
  }

  const getPositionAbbreviation = (position: string | null | undefined) => {
    if (!position) return "N/A"
    
    const positionMap: Record<string, string> = {
      "Goalkeeper": "GK",
      "Vartininkas": "GK",
      "Defender": "DEF",
      "Saugas": "DEF",
      "Midfielder": "MID",
      "Pusgynėjas": "MID",
      "Forward": "FWD",
      "Puolėjas": "FWD",
      "Striker": "ST",
      "Puolėjas": "ST"
    }
    
    // If it's a known position, return the abbreviation
    if (positionMap[position]) {
      return positionMap[position]
    }
    
    // Otherwise, return first 3 characters of the position
    return position.toUpperCase().slice(0, 3)
  }

  const getCleanSheets = (player: Player) => {
    // For goalkeepers, clean sheets might be stored differently
    // This is a placeholder - adjust based on your data structure
    return player.matches || 0
  }

  const getProgressPercentage = (matches: number | null | undefined) => {
    if (!matches) return 0
    // Assuming a season has 30+ matches, calculate percentage
    const maxMatches = 30
    return Math.min((matches / maxMatches) * 100, 100)
  }

  return (
    <div className="bg-[#09155a] flex flex-col items-start justify-start relative w-full border border-[#232C62] overflow-hidden">
      {/* Player Image Section */}
      <div className="relative w-full h-[400px] overflow-hidden">
        <Image
          src={getPlayerImageSrc(player)}
          alt={`${player.name} ${player.surname}`}
          fill
          className="object-cover object-top"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder-user.jpg'
          }}
        />
        
        {/* Player Number */}
        <div className="absolute left-2 top-4 text-white text-4xl font-bold tracking-tight">
          {player.number || "?"}
        </div>
        
        {/* Position */}
        <div className="absolute right-2 top-4 text-white/60 text-3xl font-bold tracking-tight">
          {getPositionAbbreviation(player.position)}
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-[#09155a]" />
        
        {/* Player Name */}
        <div className="absolute bottom-2 left-4 text-white">
          <div className="text-2xl font-normal tracking-tight leading-10">
            {player.name || "N/A"}
          </div>
          <div className="text-3xl font-bold tracking-tight leading-12">
            {player.surname || "N/A"}
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="bg-[#09155a] p-4 w-full space-y-4">
        {/* Stats Row */}
        <div className="flex gap-6 items-center justify-start w-full">
          <div className="flex flex-col gap-1 flex-1">
            <div className="text-white text-base font-normal tracking-tight">
              Rungtynes
            </div>
            <div className="text-white text-3xl font-semibold tracking-tight">
              {player.matches || 0}
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <div className="text-white text-base font-normal tracking-tight">
              Ivarciai
            </div>
            <div className="text-white text-3xl font-semibold tracking-tight">
              {getCleanSheets(player)}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex gap-1 items-center w-full">
            <div className="bg-white h-2 rounded-full flex-1" />
            <div 
              className="bg-[#fc8231] h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage(player.matches)}%` }}
            />
          </div>
          
          {/* Legend */}
          <div className="flex gap-5 items-center">
            <div className="flex gap-1.5 items-end">
              <div className="text-white text-xs font-normal tracking-tight">
                Rungtynes
              </div>
              <div className="bg-white rounded-sm w-3 h-3" />
            </div>
            <div className="flex gap-1.5 items-end">
              <div className="text-white text-xs font-normal tracking-tight">
                Ivarciai
              </div>
              <div className="bg-[#f15601] rounded-sm w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
