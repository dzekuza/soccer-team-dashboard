"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PublicNavigation } from '@/components/public-navigation'
import type { Player } from '@/lib/types'

export default function PlayerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await fetch('/api/players')
        if (!response.ok) {
          throw new Error('Failed to fetch players')
        }
        const players = await response.json()
        const foundPlayer = players.find((p: Player) => p.id === params.id)
        
        if (foundPlayer) {
          setPlayer(foundPlayer)
        } else {
          setError('Player not found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPlayer()
    }
  }, [params.id])

  const getPositionDisplay = (position: string | null | undefined) => {
    if (!position) return 'N/A'
    
    const positionMap: Record<string, string> = {
      "Goalkeeper": "VARTININKAS",
      "Vartininkas": "VARTININKAS",
      "Vartininkė": "VARTININKĖ",
      "Defender": "GYNĖJAS",
      "Saugas": "SAUGAS",
      "Gynėjas": "GYNĖJAS",
      "Saugė": "SAUGĖ",
      "Midfielder": "PUSGYNĖJAS",
      "Pusgynėjas": "PUSGYNĖJAS",
      "Forward": "PUOLĖJAS",
      "Puolėjas": "PUOLĖJAS",
      "Puolėja": "PUOLĖJA",
      "Striker": "PUOLĖJAS",
      "Žaidėja": "ŽAIDĖJA"
    }
    
    return positionMap[position] || position.toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A165B] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-[#0A165B]">
        <PublicNavigation currentPage="zaidejai" />
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-xl">Player not found</div>
        </div>
      </div>
    )
  }

  // Split name into first and last name
  const fullName = player.name || ''
  const nameParts = fullName.split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  return (
    <div className="min-h-screen bg-[#0A165B] text-white">
              <PublicNavigation currentPage="zaidejai" />
      
      {/* Main Player Layout */}
      <div className="flex flex-col lg:flex-row h-auto">
        {/* Player Image Section */}
        <div 
          className="w-full lg:w-1/2 h-96 lg:h-[500px] relative overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('/c2cb6597d2c71c6025cb283eaf62bf578a893145.jpg')`
          }}
        >
          {/* Player Image - Enhanced styling */}
          <div 
            className="absolute inset-0 bg-contain bg-bottom bg-no-repeat"
            style={{ 
              backgroundImage: `url('${player.image_url || '/placeholder-user.jpg'}')`,
              backgroundSize: '60% auto',
              filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))'
            }}
          />
        </div>
        
        {/* Player Info Section */}
        <div className="w-full lg:w-1/2 bg-[#0A165B] flex flex-col justify-end">
        {/* Player Name and Jersey Number - Inline */}
        <div className="flex flex-col sm:flex-row justify-between items-end p-6 lg:p-12">
          {/* Player Name and Position */}
          <div>
            <div className="text-white text-base lg:text-lg font-sans uppercase tracking-wide mb-2">
              {firstName}
            </div>
            <div className="text-white text-2xl lg:text-4xl font-serif font-bold uppercase tracking-wide mb-2">
              {lastName}
            </div>
            <div className="text-white text-base lg:text-lg font-sans uppercase tracking-wide">
              {getPositionDisplay(player.position)}
            </div>
          </div>
          
          {/* Jersey Number */}
          <div className="text-orange-500 text-4xl lg:text-6xl font-bold mt-4 sm:mt-0">
            #{player.number || 'N/A'}
          </div>
        </div>
        
        {/* Player Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-0">
          {/* Row 1 */}
          <div className="border border-[rgba(95,95,113,0.31)] p-4 lg:p-6">
            <div className="text-white text-xs lg:text-sm font-sans uppercase tracking-wide mb-2">TAUTYBĖ</div>
            <div className="text-white text-lg lg:text-xl font-sans">Lithuania</div>
          </div>
          <div className="border border-[rgba(95,95,113,0.31)] p-4 lg:p-6">
            <div className="text-white text-xs lg:text-sm font-sans uppercase tracking-wide mb-2">AMŽIUS</div>
            <div className="text-white text-lg lg:text-xl font-sans">25</div>
          </div>
          <div className="border border-[rgba(95,95,113,0.31)] p-4 lg:p-6 lg:col-span-1 col-span-2">
            <div className="text-white text-xs lg:text-sm font-sans uppercase tracking-wide mb-2">POZICIJA</div>
            <div className="text-white text-lg lg:text-xl font-sans">{getPositionDisplay(player.position)}</div>
          </div>
          
          {/* Row 2 */}
          <div className="border border-[rgba(95,95,113,0.31)] p-4 lg:p-6">
            <div className="text-white text-xs lg:text-sm font-sans uppercase tracking-wide mb-2">NUMERIS</div>
            <div className="text-white text-lg lg:text-xl font-sans">{player.number || 'N/A'}</div>
          </div>
          <div className="border border-[rgba(95,95,113,0.31)] p-4 lg:p-6">
            <div className="text-white text-xs lg:text-sm font-sans uppercase tracking-wide mb-2">SVORIS</div>
            <div className="text-white text-lg lg:text-xl font-sans">-</div>
          </div>
          <div className="border border-[rgba(95,95,113,0.31)] p-4 lg:p-6 lg:col-span-1 col-span-2">
            <div className="text-white text-xs lg:text-sm font-sans uppercase tracking-wide mb-2">UGIS</div>
            <div className="text-white text-lg lg:text-xl font-sans">-</div>
          </div>
        </div>
      </div>
    </div>

      {/* Statistics Section */}
      <div className="p-4 lg:p-6">
        <h2 className="text-white text-2xl lg:text-3xl font-bold uppercase">Statistika</h2>
      </div>
      
      {/* Statistics Cards - Full Width */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 lg:p-6">
        {/* Matches and Goals Card */}
        <div className="bg-[#0A165B] border border-[rgba(95,95,113,0.31)] p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div className="text-white text-lg font-bold">Rungtynės</div>
            <div className="text-white text-lg font-bold">Įvarčiai</div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="text-white text-3xl font-bold">{player.matches || 0}</div>
            <div className="text-white text-3xl font-bold">{player.goals || 0}</div>
          </div>
          {(() => {
            const matches = Number(player.matches) || 0;
            const goals = Number(player.goals) || 0;
            const total = matches + goals;
            
            // Handle edge cases
            if (total === 0) {
              return (
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2 relative">
                  <div className="bg-white h-3 rounded-full absolute left-0 top-0" style={{ width: '50%' }}></div>
                  <div className="bg-orange-500 h-3 rounded-full absolute right-0 top-0" style={{ width: '50%' }}></div>
                </div>
              );
            }
            
            // Calculate percentages
            const matchesPercent = Math.round((matches / total) * 100);
            const goalsPercent = Math.round((goals / total) * 100);
            
            return (
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2 relative">
                <div className="bg-white h-3 rounded-l-full absolute left-0 top-0" style={{ width: `${matchesPercent}%` }}></div>
                <div className="bg-orange-500 h-3 rounded-r-full absolute right-0 top-0" style={{ width: `${goalsPercent}%` }}></div>
              </div>
            );
          })()}

          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <span className="text-white">Rungtynės</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-white">Įvarčiai</span>
            </div>
          </div>
        </div>
        
        {/* Time and Assists Card */}
        <div className="bg-[#0A165B] border border-[rgba(95,95,113,0.31)] p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div className="text-white text-lg font-bold">Laikas</div>
            <div className="text-white text-lg font-bold">Rezultatyvūs perdavimai</div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="text-white text-3xl font-bold">{player.minutes || 0}</div>
            <div className="text-white text-3xl font-bold">{player.assists || 0}</div>
          </div>
          {(() => {
            const minutes = Number(player.minutes) || 0;
            const assists = Number(player.assists) || 0;
            const total = minutes + assists;
            
            // Handle edge cases
            if (total === 0) {
              return (
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2 relative">
                  <div className="bg-white h-3 rounded-full absolute left-0 top-0" style={{ width: '50%' }}></div>
                  <div className="bg-orange-500 h-3 rounded-full absolute right-0 top-0" style={{ width: '50%' }}></div>
                </div>
              );
            }
            
            // Calculate percentages
            const minutesPercent = Math.round((minutes / total) * 100);
            const assistsPercent = Math.round((assists / total) * 100);
            
            return (
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2 relative">
                <div className="bg-white h-3 rounded-l-full absolute left-0 top-0" style={{ width: `${minutesPercent}%` }}></div>
                <div className="bg-orange-500 h-3 rounded-r-full absolute right-0 top-0" style={{ width: `${assistsPercent}%` }}></div>
              </div>
            );
          })()}
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <span className="text-white">Laikas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-white">Rezultatyvūs perdavimai</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-0">
        {/* Red Cards */}
        <div className="border border-[rgba(95,95,113,0.31)] p-6">
          <div className="text-white text-sm font-bold uppercase mb-2">Raudonos kortelės</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
            <div className="text-white text-xl font-medium">{player.red_cards || 0}</div>
          </div>
        </div>
        
        {/* Yellow Cards */}
        <div className="border border-[rgba(95,95,113,0.31)] p-6">
          <div className="text-white text-sm font-bold uppercase mb-2">Geltonos kortelės</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
            <div className="text-white text-xl font-medium">{player.yellow_cards || 0}</div>
          </div>
        </div>
        
        {/* Team */}
        <div className="border border-[rgba(95,95,113,0.31)] p-6">
          <div className="text-white text-sm font-bold uppercase mb-2">Komanda</div>
          <div className="text-white text-xl font-medium">{player.team_key || 'N/A'}</div>
        </div>
        
        {/* Position */}
        <div className="border border-[rgba(95,95,113,0.31)] p-6">
          <div className="text-white text-sm font-bold uppercase mb-2">Pozicija</div>
          <div className="text-white text-xl font-medium">{getPositionDisplay(player.position)}</div>
        </div>
      </div>
    </div>
  )
}
