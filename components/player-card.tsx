"use client"

import Image from "next/image"
import Link from "next/link"
import type { Player } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

interface PlayerCardProps {
  player: Player
}

// Skeleton component for player card
export function PlayerCardSkeleton() {
  return (
    <div className="bg-[#09155a] flex flex-col items-start justify-start relative w-full border border-[#232C62] overflow-hidden">
      {/* Player Image Section */}
      <div className="relative w-full h-[400px] overflow-hidden">
        <Skeleton className="h-full w-full bg-gray-600" />
        
        {/* Player Number */}
        <div className="absolute left-2 top-4">
          <Skeleton className="h-10 w-8 bg-gray-500" />
        </div>
        
        {/* Position */}
        <div className="absolute right-2 top-4">
          <Skeleton className="h-8 w-8 bg-gray-500" />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-[#09155a]" />
        
        {/* Player Name */}
        <div className="absolute bottom-2 left-4 space-y-2">
          <Skeleton className="h-8 w-32 bg-gray-500" />
          <Skeleton className="h-10 w-40 bg-gray-500" />
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="w-full p-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <Skeleton className="h-6 w-16 mx-auto mb-1 bg-gray-600" />
            <Skeleton className="h-8 w-12 mx-auto bg-gray-600" />
          </div>
          <div className="text-center">
            <Skeleton className="h-6 w-16 mx-auto mb-1 bg-gray-600" />
            <Skeleton className="h-8 w-12 mx-auto bg-gray-600" />
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 bg-gray-600" />
          <Skeleton className="h-2 w-full bg-gray-600" />
        </div>
      </div>
    </div>
  )
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
      "Goalkeeper": "VAR",
      "Vartininkas": "VAR",
      "Vartininkė": "VAR",
      "Defender": "GYN",
      "Saugas": "GYN",
      "Saugė": "GYN",
      "Gynėjas": "GYN",
      "Midfielder": "PUS",
      "Pusgynėjas": "PUS",
      "Forward": "PUO",
      "Puolėjas": "PUO",
      "Puolėja": "PUO",
      "Striker": "PUO",
      "Žaidėja": "ŽAI"
    }
    
    // If it's a known position, return the Lithuanian abbreviation
    if (positionMap[position]) {
      return positionMap[position]
    }
    
    // Otherwise, return first 3 characters of the position
    return position.toUpperCase().slice(0, 3)
  }

  const getCleanSheets = (player: Player) => {
    // For goalkeepers, clean sheets might be stored differently
    // This is a placeholder - adjust based on your data structure
    return player.goals || 0
  }

  const getProgressPercentage = (matches: number | null | undefined, goals: number | null | undefined) => {
    const matchesNum = Number(matches) || 0;
    const goalsNum = Number(goals) || 0;
    const total = matchesNum + goalsNum;
    
    if (total === 0) return 50; // Equal bars when no data
    
    return Math.round((matchesNum / total) * 100);
  }

  return (
    <Link href={`/zaidejai/${player.id}`} className="block">
      <div className="bg-[#09155a] flex flex-col items-start justify-start relative w-full border border-[#232C62] overflow-hidden hover:border-[#F15601] hover:bg-orange-500 transition-all duration-300 cursor-pointer group">
      {/* Player Image Section */}
      <div className="relative w-full h-[400px] overflow-hidden group-hover:bg-gradient-to-br group-hover:from-orange-400 group-hover:to-orange-600">
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
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-[#09155a] group-hover:bg-gradient-to-b group-hover:from-transparent group-hover:to-orange-500 transition-all duration-300" />
        
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
      <div className="bg-[#09155a] group-hover:bg-orange-500 p-4 w-full space-y-4 transition-colors duration-300">
        {/* Stats Row */}
        <div className="flex gap-6 items-center justify-start w-full">
          <div className="flex flex-col gap-1 flex-1">
            <div className="text-white text-base font-normal tracking-tight">
              Rungtynės
            </div>
            <div className="text-white text-3xl font-semibold tracking-tight">
              {player.matches || 0}
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <div className="text-white text-base font-normal tracking-tight">
              Įvarčiai
            </div>
            <div className="text-white text-3xl font-semibold tracking-tight">
              {getCleanSheets(player)}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          {(() => {
            const matches = Number(player.matches) || 0;
            const goals = Number(player.goals) || 0;
            const total = matches + goals;
            
            // Handle edge cases
            if (total === 0) {
              return (
                <div className="flex gap-1 items-center w-full">
                  <div className="bg-white h-2 rounded-full flex-1" />
                  <div className="bg-[#fc8231] h-2 rounded-full flex-1" />
                </div>
              );
            }
            
            // Calculate percentages
            const matchesPercent = Math.round((matches / total) * 100);
            const goalsPercent = Math.round((goals / total) * 100);
            
            return (
              <div className="flex gap-1 items-center w-full">
                <div 
                  className="bg-white h-2 rounded-l-full transition-all duration-300"
                  style={{ width: `${matchesPercent}%` }}
                />
                <div 
                  className="bg-[#fc8231] h-2 rounded-r-full transition-all duration-300"
                  style={{ width: `${goalsPercent}%` }}
                />
              </div>
            );
          })()}
          
          {/* Legend */}
                      <div className="flex gap-5 items-center">
              <div className="flex gap-1.5 items-end">
                <div className="text-white text-xs font-normal tracking-tight">
                  Rungtynės
                </div>
                <div className="bg-white rounded-sm w-3 h-3" />
              </div>
              <div className="flex gap-1.5 items-end">
                <div className="text-white text-xs font-normal tracking-tight">
                  Įvarčiai
                </div>
                <div className="bg-[#f15601] rounded-sm w-3 h-3" />
              </div>
            </div>
        </div>
      </div>
      </div>
    </Link>
  )
}
