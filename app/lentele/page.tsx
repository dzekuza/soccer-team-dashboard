"use client"

import { useState, useEffect } from "react"
import { PublicNavigation } from "@/components/public-navigation"
import { PublicFooter } from "@/components/public-footer"
import { PublicTabs } from "@/components/ui/tabs"
import Image from "next/image"

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

interface StandingsData {
  id: string
  league_key: string
  league_name: string
  standings_data: StandingRow[]
  last_updated: string
  created_at: string
}

export default function StandingsPage() {
  const [standingsData, setStandingsData] = useState<StandingsData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string>("a_lyga")

  const tabs = [
    { key: "a_lyga", label: "Banga A" },
    { key: "ii_lyga_a", label: "Banga B" },
    { key: "moteru_a_lyga", label: "Banga M" }
  ]

  useEffect(() => {
    const fetchStandings = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/standings/scrape')
        if (!response.ok) throw new Error("Nepavyko gauti lentelės duomenų")
        
        const result = await response.json()
        if (result.success) {
          setStandingsData(result.data)
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
  }, [])

  const getCurrentStandings = (): StandingRow[] => {
    const currentData = standingsData.find(data => data.league_key === selectedTeam)
    return currentData?.standings_data || []
  }

  const getLastUpdated = (): string => {
    const currentData = standingsData.find(data => data.league_key === selectedTeam)
    if (!currentData?.last_updated) return ""
    
    return new Date(currentData.last_updated).toLocaleDateString('lt-LT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  const currentStandings = getCurrentStandings()

  return (
    <div className="min-h-screen bg-[#0A165B] text-white">
      <PublicNavigation currentPage="lentele" />
      
      {/* Main Content */}
      <div className="w-full">
        <div className="text-center py-8 border-b border-[#232C62]">
          <h1 className="h1-public">Turnyrinė lentelė</h1>
        </div>
        
        {/* Team Tabs */}
        <div className="w-full">
          <PublicTabs
            tabs={tabs}
            activeTab={selectedTeam}
            onTabChange={setSelectedTeam}
          />
          
          {/* Last Updated Info */}
          {getLastUpdated() && (
            <div className="mt-4 text-sm text-gray-300 px-4">
              Atnaujinta: {getLastUpdated()}
            </div>
          )}
        </div>
        
        {/* Responsive Table Container */}
        <div className="w-full overflow-x-auto">
          {/* Table Header */}
          <div className="bg-[#0a2065] h-[70px] relative rounded-tr-[8px] border-b border-[rgba(95,95,113,0.39)] min-w-[600px]">
            <div className="flex items-center justify-between px-4 md:px-16 h-full">
              <div className="text-[rgba(255,255,255,0.58)] text-[14px] md:text-[16px] font-medium w-[19px] text-center">Vt</div>
              <div className="text-[rgba(255,255,255,0.58)] text-[14px] md:text-[16px] font-medium w-[120px] md:w-[233px]">Komanda</div>
              <div className="text-[rgba(255,255,255,0.58)] text-[14px] md:text-[16px] font-medium text-center w-[15px]">R</div>
              <div className="text-[rgba(255,255,255,0.58)] text-[14px] md:text-[16px] font-medium text-center w-[10px]">Perg.</div>
              <div className="text-[rgba(255,255,255,0.58)] text-[14px] md:text-[16px] font-medium text-center w-[10px]">Lyg.</div>
              <div className="text-[rgba(255,255,255,0.58)] text-[14px] md:text-[16px] font-medium text-center w-[9px]">Pr.</div>
              <div className="text-[rgba(255,255,255,0.58)] text-[14px] md:text-[16px] font-medium text-center w-[20px]">Įv.</div>
              <div className="text-[rgba(255,255,255,0.58)] text-[14px] md:text-[16px] font-medium text-center w-[21px]">Tsk.</div>
            </div>
          </div>
          
          {/* Table Content */}
          <div className="flex flex-col gap-px min-w-[600px]">
            {currentStandings.length > 0 ? (
              currentStandings.map((row) => (
                <div 
                  key={row.position}
                  className={`flex items-center justify-between px-4 md:px-16 py-2 border-b border-[rgba(95,95,113,0.39)] ${
                    row.team.name.toLowerCase().includes('banga') ? "bg-[#f15601]" : "bg-[#0a165b]"
                  }`}
                >
                  <div className="text-white text-[14px] md:text-[16px] font-medium w-[19px] text-center">{row.position}</div>
                  <div className="flex items-center gap-[8px] md:gap-[19px] w-[120px] md:w-[233px]">
                    <div className="h-6 w-6 md:h-8 md:w-8 relative flex-shrink-0">
                      <Image 
                        src={row.team.logo || '/placeholder-logo.png'} 
                        alt={row.team.name} 
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="text-white text-[12px] md:text-[16px] font-medium truncate">{row.team.name}</div>
                  </div>
                  <div className="text-white text-[14px] md:text-[16px] font-medium w-[15px] text-center">{row.played}</div>
                  <div className="text-white text-[14px] md:text-[16px] font-medium w-[10px] text-center">{row.won}</div>
                  <div className="text-white text-[14px] md:text-[16px] font-medium w-[10px] text-center">{row.drawn}</div>
                  <div className="text-white text-[14px] md:text-[16px] font-medium w-[9px] text-center">{row.lost}</div>
                  <div className="text-white text-[14px] md:text-[16px] font-medium w-[20px] text-center">{row.goalsFor}</div>
                  <div className="text-white text-[14px] md:text-[16px] font-medium w-[21px] text-center">{row.points}</div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-8 text-gray-300 min-w-[600px]">
                Nėra duomenų šiai komandai
              </div>
            )}
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
