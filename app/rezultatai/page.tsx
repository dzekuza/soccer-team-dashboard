"use client"

import { useState, useEffect } from "react"
import { PublicNavigation } from "@/components/public-navigation"
import { PublicFooter } from "@/components/public-footer"
import { PublicTabs } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"

interface MatchResult {
  id: string
  date: string
  home_team: {
    name: string
    logo?: string
  }
  away_team: {
    name: string
    logo?: string
  }
  home_score: number
  away_score: number
  stadium: string
  league: string
}

interface ApiFixture {
  id: string
  fingerprint: string
  match_date: string
  match_time: string
  team1: string
  team2: string
  team1_score?: number
  team2_score?: number
  team1_logo?: string
  team2_logo?: string
  venue: string
  league_key?: string
  status: string
  round?: string
}

export default function ResultsPage() {
  const [fixtures, setFixtures] = useState<ApiFixture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string>("Banga A")

  const tabs = [
    { key: "Banga A", label: "Banga A" },
    { key: "Banga B", label: "Banga B" },
    { key: "Banga M", label: "Banga M" }
  ]

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/fixtures/public')
        if (!response.ok) throw new Error("Nepavyko gauti rezultatų duomenų")
        
        const result = await response.json()
        console.log("Fetched fixtures:", result)
        
        if (result.success) {
          // Filter completed matches (with scores)
          const completedMatches = result.data.filter((fixture: ApiFixture) => 
            fixture.team1_score !== null && fixture.team2_score !== null &&
            fixture.team1_score !== undefined && fixture.team2_score !== undefined &&
            fixture.status === 'completed'
          )
          
          console.log("Completed matches:", completedMatches)
          setFixtures(completedMatches)
        } else {
          throw new Error(result.error || "Failed to fetch fixtures")
        }
      } catch (e: unknown) {
        console.error("Error fetching results:", e)
        setError(e instanceof Error ? e.message : "Įvyko nežinoma klaida.")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [])

  const getCurrentResults = (): MatchResult[] => {
    console.log("Current fixtures:", fixtures)
    console.log("Selected team:", selectedTeam)
    
    // Filter fixtures by league and transform to MatchResult format
    const filteredFixtures = fixtures.filter(fixture => {
      // Filter by selected league
      return fixture.league_key === selectedTeam
    })
    
    console.log("Filtered fixtures:", filteredFixtures)
    
    return filteredFixtures
      .map(fixture => ({
        id: fixture.fingerprint,
        date: fixture.match_date,
        home_team: {
          name: fixture.team1,
          logo: fixture.team1_logo || `/placeholder-logo.png`
        },
        away_team: {
          name: fixture.team2,
          logo: fixture.team2_logo || `/placeholder-logo.png`
        },
        home_score: fixture.team1_score || 0,
        away_score: fixture.team2_score || 0,
        stadium: fixture.venue || "Nežinomas stadionas",
        league: fixture.league_key || "a_lyga"
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date, newest first
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('lt-LT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
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

  const currentResults = getCurrentResults()

  return (
    <div className="min-h-screen bg-[#0A165B] text-white">
      <PublicNavigation currentPage="rezultatai" />
      
      {/* Main Content */}
      <div className="w-full">
        <div className="text-center py-8 border-b border-[#232C62]">
          <h1 className="h1-public">Rezultatai</h1>
        </div>
        
        {/* Team Tabs */}
        <div className="w-full">
          <PublicTabs
            tabs={tabs}
            activeTab={selectedTeam}
            onTabChange={setSelectedTeam}
          />
        </div>
        
        {/* Results List */}
        <div className="w-full">
          {currentResults.length > 0 ? (
            <div className="flex flex-col">
              {currentResults.map((match) => (
                <Link 
                  key={match.id}
                  href={`/fixtures/${match.id}`}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-16 py-4 border-b border-[rgba(95,95,113,0.39)] bg-[#0a165b] hover:bg-[#0a2065] transition-colors cursor-pointer"
                >
                  {/* Date */}
                  <div className="text-white text-[14px] md:text-[16px] font-medium w-full md:w-[150px] mb-2 md:mb-0">
                    {formatDate(match.date)}
                  </div>
                  
                  {/* Match Details */}
                  <div className="flex items-center justify-center gap-2 md:gap-4 flex-1 mb-2 md:mb-0">
                    {/* Home Team */}
                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="text-white text-[12px] md:text-[16px] font-medium text-right min-w-[60px] md:min-w-[100px] truncate">
                        {match.home_team.name}
                      </span>
                      <div className="h-5 w-5 md:h-8 md:w-8 relative flex-shrink-0">
                        <Image 
                          src={match.home_team.logo || '/placeholder-logo.png'} 
                          alt={match.home_team.name} 
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                    
                    {/* Score */}
                    <div className="text-white text-[16px] md:text-[20px] font-bold mx-2 md:mx-4">
                      {match.home_score} - {match.away_score}
                    </div>
                    
                    {/* Away Team */}
                    <div className="flex items-center gap-1 md:gap-2">
                      <div className="h-5 w-5 md:h-8 md:w-8 relative flex-shrink-0">
                        <Image 
                          src={match.away_team.logo || '/placeholder-logo.png'} 
                          alt={match.away_team.name} 
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="text-white text-[12px] md:text-[16px] font-medium text-left min-w-[60px] md:min-w-[100px] truncate">
                        {match.away_team.name}
                      </span>
                    </div>
                  </div>
                  
                  {/* Stadium */}
                  <div className="text-white text-[11px] md:text-[14px] text-gray-300 w-full md:w-[200px] text-center md:text-right">
                    {match.stadium}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-gray-300">
              Nėra rezultatų šiai komandai
            </div>
          )}
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
