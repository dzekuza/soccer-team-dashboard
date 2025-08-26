"use client"

import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface StandingRow {
  position: number
  team: {
    name: string
    logo?: string
  }
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  league: string
  lastUpdated: string
}

interface StandingsTableProps {
  selectedTeam: string
}

export function StandingsTable({ selectedTeam }: StandingsTableProps) {
  const [standings, setStandings] = useState<StandingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/standings/scrape')
        if (!response.ok) throw new Error("Nepavyko gauti lentelės duomenų")
        
        const result = await response.json()
        console.log('Standings API response:', result)
        
        if (result.success) {
          // Map team names to league keys
          const teamToLeagueMap: { [key: string]: string } = {
            'Banga A': 'a_lyga',
            'Banga B': 'ii_lyga_a',
            'Banga M': 'moteru_a_lyga'
          }
          
          const leagueKey = teamToLeagueMap[selectedTeam]
          console.log('Looking for league key:', leagueKey)
          console.log('Available data:', result.data)
          
          const currentData = result.data.find((data: any) => data.league_key === leagueKey)
          console.log('Found data for league:', currentData)
          
          if (currentData?.standings_data) {
            console.log('Standings data:', currentData.standings_data)
            setStandings(currentData.standings_data)
          } else {
            console.log('No standings data found')
            setStandings([])
          }
        } else {
          throw new Error(result.error || "Klaida gaunant duomenis")
        }
      } catch (e: unknown) {
        console.error("Error fetching standings:", e)
        setError(e instanceof Error ? e.message : "Įvyko nežinoma klaida.")
      } finally {
        setLoading(false)
      }
    }

    fetchStandings()
  }, [selectedTeam])

  if (loading) {
    return (
      <div className="h-[400px] bg-[#0a165b] p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48 bg-gray-600" />
          <Skeleton className="h-6 w-24 bg-gray-600" />
        </div>
        <div className="bg-[#0f1f6b] rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-10 gap-2 p-3 border-b border-gray-700">
            <Skeleton className="h-4 w-8 bg-gray-600" />
            <Skeleton className="h-4 w-20 bg-gray-600" />
            <Skeleton className="h-4 w-8 bg-gray-600" />
            <Skeleton className="h-4 w-8 bg-gray-600" />
            <Skeleton className="h-4 w-8 bg-gray-600" />
            <Skeleton className="h-4 w-8 bg-gray-600" />
            <Skeleton className="h-4 w-8 bg-gray-600" />
            <Skeleton className="h-4 w-8 bg-gray-600" />
            <Skeleton className="h-4 w-8 bg-gray-600" />
            <Skeleton className="h-4 w-8 bg-gray-600" />
          </div>
          {/* Table Rows */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="grid grid-cols-10 gap-2 p-3 border-b border-gray-700 last:border-b-0">
              <Skeleton className="h-4 w-8 bg-gray-600" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full bg-gray-600" />
                <Skeleton className="h-4 w-24 bg-gray-600" />
              </div>
              <Skeleton className="h-4 w-8 bg-gray-600" />
              <Skeleton className="h-4 w-8 bg-gray-600" />
              <Skeleton className="h-4 w-8 bg-gray-600" />
              <Skeleton className="h-4 w-8 bg-gray-600" />
              <Skeleton className="h-4 w-8 bg-gray-600" />
              <Skeleton className="h-4 w-8 bg-gray-600" />
              <Skeleton className="h-4 w-8 bg-gray-600" />
              <Skeleton className="h-4 w-8 bg-gray-600" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[400px] bg-[#0a165b] flex items-center justify-center">
        <div className="text-white">Klaida: {error}</div>
      </div>
    )
  }

  if (standings.length === 0) {
    return (
      <div className="h-[400px] bg-[#0a165b] flex flex-col items-center justify-center gap-4">
        <div className="text-white">Nėra lentelės duomenų</div>
        <button 
          onClick={async () => {
            try {
              const response = await fetch('/api/standings/scrape', { method: 'POST' })
              if (response.ok) {
                window.location.reload()
              }
            } catch (error) {
              console.error('Error triggering scrape:', error)
            }
          }}
          className="px-4 py-2 bg-[#F15601] text-white rounded hover:bg-[#E04A00] transition-colors"
        >
          Atnaujinti duomenis
        </button>
      </div>
    )
  }

  return (
    <div className="bg-[#0a165b] min-h-[400px]">
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-[rgba(95,95,113,0.3)]">
              <th className="px-4 py-3 text-left font-medium text-[14px]">Poz.</th>
              <th className="px-4 py-3 text-left font-medium text-[14px]">Komanda</th>
              <th className="px-4 py-3 text-center font-medium text-[14px]">R</th>
              <th className="px-4 py-3 text-center font-medium text-[14px]">L</th>
              <th className="px-4 py-3 text-center font-medium text-[14px]">Lyg.</th>
              <th className="px-4 py-3 text-center font-medium text-[14px]">Pr.</th>
              <th className="px-4 py-3 text-center font-medium text-[14px]">Įv.</th>
              <th className="px-4 py-3 text-center font-medium text-[14px]">Pr.</th>
              <th className="px-4 py-3 text-center font-medium text-[14px]">Skirt.</th>
              <th className="px-4 py-3 text-center font-medium text-[14px]">Tšk.</th>
            </tr>
          </thead>
          <tbody>
            {standings.slice(0, 8).map((team, index) => (
                                              <tr 
                  key={index} 
                  className={`border-b border-[rgba(95,95,113,0.1)] hover:bg-[#0a2065] transition-colors ${
                    team.team.name?.toLowerCase().includes('banga') ? 'bg-[#070F40]/50' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-[14px] font-medium">
                    {team.position}
                  </td>
                  <td className="px-4 py-3 text-[14px] font-medium">
                    <div className="flex items-center gap-2">
                      {team.team.logo && (
                        <img 
                          src={team.team.logo} 
                          alt={team.team.name || 'Team'}
                          className="w-6 h-6 object-contain"
                        />
                      )}
                      <span className={team.team.name?.toLowerCase().includes('banga') ? 'text-[#F15601] font-semibold' : ''}>
                        {team.team.name || 'Unknown Team'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-[14px]">{team.played}</td>
                  <td className="px-4 py-3 text-center text-[14px]">{team.won}</td>
                  <td className="px-4 py-3 text-center text-[14px]">{team.drawn}</td>
                  <td className="px-4 py-3 text-center text-[14px]">{team.lost}</td>
                  <td className="px-4 py-3 text-center text-[14px]">{team.goalsFor}</td>
                  <td className="px-4 py-3 text-center text-[14px]">{team.goalsAgainst}</td>
                  <td className="px-4 py-3 text-center text-[14px]">{team.goalDifference}</td>
                  <td className="px-4 py-3 text-center text-[14px] font-semibold">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {standings.length > 8 && (
        <div className="bg-[#0a2065] flex flex-col items-center justify-center p-6">
          <a 
            href="/lentele" 
            className="text-white text-[16px] font-medium text-center hover:opacity-80 transition-opacity"
          >
            Rodyti pilną lentelę
          </a>
        </div>
      )}
    </div>
  )
}
