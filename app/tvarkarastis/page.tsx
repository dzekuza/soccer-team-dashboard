"use client"

import { useState, useEffect } from "react"
import { PublicNavigation } from "@/components/public-navigation"
import { PublicFooter } from "@/components/public-footer"
import { PublicTabs } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"

interface UpcomingFixture {
  id: string
  date: string
  time: string
  home_team: {
    name: string
    logo?: string
  }
  away_team: {
    name: string
    logo?: string
  }
  stadium: string
  league: string
  hasEvent?: boolean
  eventId?: string
}

interface ApiFixture {
  id: string
  fingerprint: string
  match_date: string
  match_time: string
  team1: string
  team2: string
  team1_logo?: string
  team2_logo?: string
  venue: string
  league_key?: string
  status: string
  round?: string
}

export default function SchedulePage() {
  const [fixtures, setFixtures] = useState<ApiFixture[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string>("Banga A")

  const tabs = [
    { key: "Banga A", label: "Banga A" },
    { key: "Banga B", label: "Banga B" },
    { key: "Banga M", label: "Banga M" }
  ]

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch fixtures
        const fixturesResponse = await fetch('/api/fixtures/public')
        if (!fixturesResponse.ok) throw new Error("Nepavyko gauti tvarkaraščio duomenų")
        
        const fixturesResult = await fixturesResponse.json()
        console.log("Fetched fixtures:", fixturesResult)
        
        if (fixturesResult.success) {
          // Filter upcoming matches (not completed and in the future)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          const upcomingMatches = fixturesResult.data.filter((fixture: ApiFixture) => {
            const matchDate = new Date(fixture.match_date)
            matchDate.setHours(0, 0, 0, 0)
            
            return fixture.status !== 'completed' && matchDate >= today
          })
          
          console.log("Upcoming matches:", upcomingMatches)
          setFixtures(upcomingMatches)
        } else {
          throw new Error(fixturesResult.error || "Failed to fetch fixtures")
        }

        // Fetch events
        const eventsResponse = await fetch('/api/events')
        if (eventsResponse.ok) {
          const eventsResult = await eventsResponse.json()
          console.log("Fetched events:", eventsResult)
          // Handle both array and object with data property
          const eventsData = Array.isArray(eventsResult) ? eventsResult : (eventsResult.data || [])
          setEvents(eventsData)
        }
      } catch (e: unknown) {
        console.error("Error fetching data:", e)
        setError(e instanceof Error ? e.message : "Įvyko nežinoma klaida.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getCurrentFixtures = (): UpcomingFixture[] => {
    console.log("Current fixtures:", fixtures)
    console.log("Selected team:", selectedTeam)
    console.log("Events:", events)
    
    // Filter fixtures by league and transform to UpcomingFixture format
    const filteredFixtures = fixtures.filter(fixture => {
      // Filter by selected league
      return fixture.league_key === selectedTeam
    })
    
    console.log("Filtered fixtures:", filteredFixtures)
    
    return filteredFixtures
      .map(fixture => {
        // Check if there's an event for this fixture
        const relatedEvent = events.find(eventData => {
          const event = eventData.event || eventData // Handle both wrapped and unwrapped event data
          
          console.log('Checking event:', event.title, 'against fixture:', fixture.team1, 'vs', fixture.team2)
          
          // Normalize team names for comparison
          const normalizeTeamName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '')
          
          const fixtureTeam1Normalized = normalizeTeamName(fixture.team1)
          const fixtureTeam2Normalized = normalizeTeamName(fixture.team2)
          const eventTitleNormalized = normalizeTeamName(event.title || '')
          
          // Match by fixture fingerprint or by team names and date
          const matches = event.fixture_id === fixture.fingerprint || 
                 (event.title && 
                  eventTitleNormalized.includes(fixtureTeam1Normalized) && 
                  eventTitleNormalized.includes(fixtureTeam2Normalized) &&
                  event.date && new Date(event.date).toDateString() === new Date(fixture.match_date).toDateString())
          
          console.log('Match result:', matches, 'Event title normalized:', eventTitleNormalized, 'Team1:', fixtureTeam1Normalized, 'Team2:', fixtureTeam2Normalized)
          return matches
        })
        
        return {
          id: fixture.fingerprint,
          date: fixture.match_date,
          time: fixture.match_time,
          home_team: {
            name: fixture.team1,
            logo: fixture.team1_logo || `/placeholder-logo.png`
          },
          away_team: {
            name: fixture.team2,
            logo: fixture.team2_logo || `/placeholder-logo.png`
          },
          stadium: fixture.venue || "Nežinomas stadionas",
          league: fixture.league_key || "a_lyga",
          hasEvent: !!relatedEvent,
          eventId: relatedEvent?.event?.id || relatedEvent?.id
        }
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date, earliest first
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('lt-LT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string): string => {
    if (!timeString) return ""
    return timeString.substring(0, 5) // Extract HH:MM from HH:MM:SS
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

  const currentFixtures = getCurrentFixtures()

  return (
    <div className="min-h-screen bg-[#0A165B] text-white">
      <PublicNavigation currentPage="tvarkarastis" />
      
      {/* Main Content */}
      <div className="w-full">
        <div className="text-center py-8 border-b border-[#232C62]">
          <h1 className="h1-public">Tvarkaraštis</h1>
        </div>
        
        {/* Team Tabs */}
        <div className="w-full">
          <PublicTabs
            tabs={tabs}
            activeTab={selectedTeam}
            onTabChange={setSelectedTeam}
          />
        </div>
        
        {/* Fixtures List */}
        <div className="w-full min-h-[400px] flex flex-col">
          {currentFixtures.length > 0 ? (
            <div className="flex flex-col">
              {currentFixtures.map((fixture) => (
                <Link 
                  key={fixture.id}
                  href={`/fixtures/${fixture.id}`}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-16 py-4 border-b border-[rgba(95,95,113,0.39)] bg-[#0a165b] hover:bg-[#0a2065] transition-colors cursor-pointer"
                >
                  {/* Date and Time */}
                  <div className="text-white text-[14px] md:text-[16px] font-medium w-full md:w-[200px] mb-2 md:mb-0">
                    <div>{formatDate(fixture.date)}</div>
                    {fixture.time && (
                      <div className="text-[#F15601] font-semibold">{formatTime(fixture.time)}</div>
                    )}
                  </div>
                  
                  {/* Match Details */}
                  <div className="flex items-center justify-center gap-2 md:gap-4 flex-1 mb-2 md:mb-0">
                    {/* Home Team */}
                    <div className="flex items-center gap-1 md:gap-2 flex-1 justify-end">
                      <span className="text-white text-[12px] md:text-[16px] font-medium text-right min-w-[60px] md:min-w-[100px] truncate">
                        {fixture.home_team.name}
                      </span>
                      <div className="h-5 w-5 md:h-8 md:w-8 relative flex-shrink-0">
                        <Image 
                          src={fixture.home_team.logo || '/placeholder-logo.png'} 
                          alt={fixture.home_team.name} 
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                    
                    {/* VS */}
                    <div className="text-white text-[16px] md:text-[20px] font-bold mx-2 md:mx-4 flex-shrink-0 text-[#F15601]">
                      VS
                    </div>
                    
                    {/* Away Team */}
                    <div className="flex items-center gap-1 md:gap-2 flex-1 justify-start">
                      <div className="h-5 w-5 md:h-8 md:w-8 relative flex-shrink-0">
                        <Image 
                          src={fixture.away_team.logo || '/placeholder-logo.png'} 
                          alt={fixture.away_team.name} 
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="text-white text-[12px] md:text-[16px] font-medium text-left min-w-[60px] md:min-w-[100px] truncate">
                        {fixture.away_team.name}
                      </span>
                    </div>
                  </div>
                  
                  {/* Stadium and Tickets Button */}
                  <div className="flex flex-col md:flex-row items-center md:items-end gap-2 w-full md:w-[200px] text-left">
                    <div className="text-white text-[11px] md:text-[14px] text-gray-300">
                      {fixture.stadium}
                    </div>
                    {fixture.hasEvent && fixture.eventId && (
                      <Link 
                        href={`/event/${fixture.eventId}`}
                        className="bg-[#F15601] hover:bg-[#E04A00] text-white text-[12px] md:text-[14px] font-semibold px-3 py-1.5 rounded transition-colors whitespace-nowrap"
                      >
                        Bilietai
                      </Link>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-8 text-gray-300">
              Nėra būsimų rungtynių šiai komandai
            </div>
          )}
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
