"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, MapPin, Clock } from "lucide-react"
import { PublicNavigation } from "@/components/public-navigation"
import { format } from 'date-fns'

interface Fixture {
  id: string
  fingerprint: string
  match_date: string
  match_time: string
  team1: string
  team2: string
  team1_score: number
  team2_score: number
  team1_logo: string
  team2_logo: string
  venue: string
  league_key: string
  status: "upcoming" | "completed" | "live"
  round: string
  lff_url_slug: string
  statistics: any
  events: any[]
  created_at: string
  updated_at: string
}

interface MatchEvent {
  team: "home" | "away"
  type: "goal" | "yellow_card" | "red_card" | "substitution_in" | "substitution_out" | "other"
  minute: number
  player: string
  description: string
}

export default function SingleFixturePage() {
  const params = useParams()
  const router = useRouter()
  const [fixture, setFixture] = useState<Fixture | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFixture = async () => {
      if (!params.id) return
      
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/fixtures/${params.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Rungtynės nerastos")
          }
          throw new Error("Nepavyko gauti rungtynių duomenų")
        }
        
        const data = await response.json()
        setFixture(data.fixture)
      } catch (e: unknown) {
        console.error("Error fetching fixture:", e)
        setError(e instanceof Error ? e.message : "Įvyko nežinoma klaida.")
      } finally {
        setLoading(false)
      }
    }

    fetchFixture()
  }, [params.id])

  const getTeamLogo = (logoUrl: string, teamName: string) => {
    if (logoUrl) {
      return logoUrl
    }
    return '/placeholder-logo.png' // Default team logo
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Artėjančios'
      case 'completed':
        return 'Baigtos'
      case 'live':
        return 'Tiesiogiai'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500'
      case 'completed':
        return 'bg-green-500'
      case 'live':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const processEvents = (events: MatchEvent[]) => {
    const processedEvents: { [key: string]: any[] } = {}
    
    events.forEach(event => {
      const playerKey = event.player.trim()
      if (!processedEvents[playerKey]) {
        processedEvents[playerKey] = []
      }
      
      // Map event types to our display types
      let displayType = 'other'
      if (event.type === 'goal') displayType = 'goal'
      else if (event.type === 'yellow_card') displayType = 'yellow'
      else if (event.type === 'red_card') displayType = 'red'
      else if (event.type === 'substitution_in' || event.type === 'substitution_out') displayType = 'substitution'
      
      processedEvents[playerKey].push({
        type: displayType,
        minute: event.minute
      })
    })
    
    return processedEvents
  }

  const getPlayerEvents = (playerName: string, events: MatchEvent[]) => {
    const processedEvents = processEvents(events)
    return processedEvents[playerName] || []
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A165B] text-white">
        <PublicNavigation currentPage="rezultatai" />
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-xl">Kraunama...</div>
        </div>
      </div>
    )
  }

  if (error || !fixture) {
    return (
      <div className="min-h-screen bg-[#0A165B] text-white">
        <PublicNavigation currentPage="rezultatai" />
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="text-white text-xl mb-4">{error || "Rungtynės nerastos"}</div>
          <Link 
            href="/rezultatai" 
            className="inline-flex items-center text-white hover:text-[#F15601] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Grįžti į rezultatus
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A165B] text-white">
      <PublicNavigation currentPage="rezultatai" />
      
      {/* Page Header */}
      <div className="w-full border-b border-[#232C62]">
        <div className="px-4 md:px-8 lg:px-16 py-4">
          <Link 
            href="/rezultatai" 
            className="inline-flex items-center text-white hover:text-[#F15601] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Grįžti į rezultatus
          </Link>
          
          {/* Match Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(fixture.status)}`}>
                {getStatusText(fixture.status)}
              </span>
              <span className="text-gray-300 text-sm">
                {fixture.league_key}
              </span>
            </div>
            <div className="text-right">
              <div className="flex items-center text-gray-300 text-sm mb-1">
                <Calendar className="w-4 h-4 mr-1" />
                {format(new Date(fixture.match_date), 'yyyy-MM-dd')}
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                {fixture.match_time}
              </div>
            </div>
          </div>

          {/* Teams and Score */}
          <div className="flex items-center justify-center space-x-8 mb-4">
            {/* Team 1 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 relative mb-2">
                <Image
                  src={getTeamLogo(fixture.team1_logo, fixture.team1)}
                  alt={fixture.team1}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder-logo.png'
                  }}
                />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-center">{fixture.team1}</h2>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center">
              <div className="text-4xl md:text-6xl font-bold mb-2">
                {fixture.team1_score} - {fixture.team2_score}
              </div>
              <div className="text-sm text-gray-300">VS</div>
            </div>

            {/* Team 2 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 relative mb-2">
                <Image
                  src={getTeamLogo(fixture.team2_logo, fixture.team2)}
                  alt={fixture.team2}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder-logo.png'
                  }}
                />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-center">{fixture.team2}</h2>
            </div>
          </div>

          {/* Venue */}
          {fixture.venue && (
            <div className="flex items-center justify-center text-gray-300 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              {fixture.venue}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 md:px-8 lg:px-16 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Match Lineups and Statistics */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">Mačo sudėtys ir statistika</h3>
            
            {/* Team Headers */}
            <div className="flex items-center justify-between mb-8">
              {/* Home Team */}
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 relative">
                  <Image
                    src={getTeamLogo(fixture.team1_logo, fixture.team1)}
                    alt={fixture.team1}
                    fill
                    className="object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-logo.png'
                    }}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-14 bg-[#232C62]"></div>

              {/* Away Team */}
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 relative">
                  <Image
                    src={getTeamLogo(fixture.team2_logo, fixture.team2)}
                    alt={fixture.team2}
                    fill
                    className="object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-logo.png'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Starting Lineups */}
            <div className="mb-8">
              <h4 className="text-xl font-medium text-white text-center mb-6">Startinės sudėtys</h4>
              
              <div className="grid grid-cols-2 gap-8">
                {/* Home Team Lineup */}
                <div>
                  <div className="bg-[#232C62] overflow-hidden">
                    {fixture.events && fixture.events.length > 0 ? (
                      // Extract unique players from home team events
                      Array.from(new Set(
                        fixture.events
                          .filter((event: MatchEvent) => event.team === 'home')
                          .map((event: MatchEvent) => event.player.trim())
                      )).slice(0, 11).map((playerName, index) => {
                        const playerEvents = getPlayerEvents(playerName, fixture.events)
                        return (
                          <div key={index} className="flex items-center justify-between px-6 py-5 border-b border-[#1A1F4A] last:border-b-0">
                            <div className="flex items-center gap-6 flex-1">
                              <div className="w-7 text-center font-medium text-white">
                                {index === 0 ? 'GK' : index <= 4 ? 'DF' : index <= 7 ? 'MF' : 'FW'}
                              </div>
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-7 text-center text-white/70">{index + 1}</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {playerEvents.map((event, eventIndex) => (
                                <div key={eventIndex} className="flex items-center gap-1.5">
                                  {event.type === 'yellow' && (
                                    <div className="w-3.5 h-5 bg-[#FFCC00]"></div>
                                  )}
                                  {event.type === 'red' && (
                                    <div className="w-3.5 h-5 bg-[#FF3B30]"></div>
                                  )}
                                  {event.type === 'goal' && (
                                    <div className="w-5 h-5 bg-[#F15601]"></div>
                                  )}
                                  {event.type === 'substitution' && (
                                    <div className="w-5 h-3.5 bg-[#F15601]"></div>
                                  )}
                                  <span className="text-sm text-white">{event.minute}'</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      // Fallback if no events
                      Array.from({ length: 11 }, (_, index) => (
                        <div key={index} className="flex items-center justify-between px-6 py-5 border-b border-[#1A1F4A] last:border-b-0">
                          <div className="flex items-center gap-6 flex-1">
                            <div className="w-7 text-center font-medium text-white">
                              {index === 0 ? 'GK' : index <= 4 ? 'DF' : index <= 7 ? 'MF' : 'FW'}
                            </div>
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-7 text-center text-white/70">{index + 1}</div>
                            </div>
                          </div>
                          <div className="flex gap-2"></div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Away Team Lineup */}
                <div>
                  <div className="bg-[#232C62] overflow-hidden">
                    {fixture.events && fixture.events.length > 0 ? (
                      // Extract unique players from away team events
                      Array.from(new Set(
                        fixture.events
                          .filter((event: MatchEvent) => event.team === 'away')
                          .map((event: MatchEvent) => event.player.trim())
                      )).slice(0, 11).map((playerName, index) => {
                        const playerEvents = getPlayerEvents(playerName, fixture.events)
                        return (
                          <div key={index} className="flex items-center justify-between px-6 py-5 border-b border-[#1A1F4A] last:border-b-0">
                            <div className="flex items-center gap-2">
                              {playerEvents.map((event, eventIndex) => (
                                <div key={eventIndex} className="flex items-center gap-1.5">
                                  {event.type === 'yellow' && (
                                    <div className="w-3.5 h-5 bg-[#FFCC00]"></div>
                                  )}
                                  {event.type === 'red' && (
                                    <div className="w-3.5 h-5 bg-[#FF3B30]"></div>
                                  )}
                                  {event.type === 'goal' && (
                                    <div className="w-5 h-5 bg-[#F15601]"></div>
                                  )}
                                  {event.type === 'substitution' && (
                                    <div className="w-5 h-3.5 bg-[#F15601]"></div>
                                  )}
                                  <span className="text-sm text-white">{event.minute}'</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-6 flex-1 justify-end">
                              <div className="flex items-center gap-3">
                                <div className="w-7 text-center text-white/70">{index + 1}</div>
                              </div>
                              <div className="w-7 text-center font-medium text-white">
                                {index === 0 ? 'GK' : index <= 4 ? 'DF' : index <= 7 ? 'MF' : 'FW'}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      // Fallback if no events
                      Array.from({ length: 11 }, (_, index) => (
                        <div key={index} className="flex items-center justify-between px-6 py-5 border-b border-[#1A1F4A] last:border-b-0">
                          <div className="flex items-center gap-2"></div>
                          <div className="flex items-center gap-6 flex-1 justify-end">
                            <div className="flex items-center gap-3">
                              <div className="w-7 text-center text-white/70">{index + 1}</div>
                            </div>
                            <div className="w-7 text-center font-medium text-white">
                              {index === 0 ? 'GK' : index <= 4 ? 'DF' : index <= 7 ? 'MF' : 'FW'}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Substitutes */}
            <div className="mb-8">
              <h4 className="text-xl font-medium text-white text-center mb-6">Atsarginiai žaidėjai</h4>
              
              <div className="grid grid-cols-2 gap-8">
                {/* Home Team Substitutes */}
                <div>
                  <div className="bg-[#232C62] overflow-hidden">
                    {fixture.events && fixture.events.length > 0 ? (
                      // Extract additional players from home team events (substitutes)
                      Array.from(new Set(
                        fixture.events
                          .filter((event: MatchEvent) => event.team === 'home')
                          .map((event: MatchEvent) => event.player.trim())
                      )).slice(11, 16).map((playerName, index) => {
                        const playerEvents = getPlayerEvents(playerName, fixture.events)
                        return (
                          <div key={index} className="flex items-center justify-between px-6 py-5 border-b border-[#1A1F4A] last:border-b-0">
                            <div className="flex items-center gap-6 flex-1">
                              <div className="w-7 text-center font-medium text-white">
                                {index === 0 ? 'GK' : index <= 2 ? 'DF' : index <= 4 ? 'MF' : 'FW'}
                              </div>
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-7 text-center text-white/70">{12 + index}</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {playerEvents.map((event, eventIndex) => (
                                <div key={eventIndex} className="flex items-center gap-1.5">
                                  {event.type === 'yellow' && (
                                    <div className="w-3.5 h-5 bg-[#FFCC00]"></div>
                                  )}
                                  {event.type === 'red' && (
                                    <div className="w-3.5 h-5 bg-[#FF3B30]"></div>
                                  )}
                                  {event.type === 'goal' && (
                                    <div className="w-5 h-5 bg-[#F15601]"></div>
                                  )}
                                  {event.type === 'substitution' && (
                                    <div className="w-5 h-3.5 bg-[#F15601]"></div>
                                  )}
                                  <span className="text-sm text-white">{event.minute}'</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      // Fallback if no events
                      Array.from({ length: 5 }, (_, index) => (
                        <div key={index} className="flex items-center justify-between px-6 py-5 border-b border-[#1A1F4A] last:border-b-0">
                          <div className="flex items-center gap-6 flex-1">
                            <div className="w-7 text-center font-medium text-white">
                              {index === 0 ? 'GK' : index <= 2 ? 'DF' : index <= 4 ? 'MF' : 'FW'}
                            </div>
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-7 text-center text-white/70">{12 + index}</div>
                            </div>
                          </div>
                          <div className="flex gap-2"></div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Away Team Substitutes */}
                <div>
                  <div className="bg-[#232C62] overflow-hidden">
                    {fixture.events && fixture.events.length > 0 ? (
                      // Extract additional players from away team events (substitutes)
                      Array.from(new Set(
                        fixture.events
                          .filter((event: MatchEvent) => event.team === 'away')
                          .map((event: MatchEvent) => event.player.trim())
                      )).slice(11, 16).map((playerName, index) => {
                        const playerEvents = getPlayerEvents(playerName, fixture.events)
                        return (
                          <div key={index} className="flex items-center justify-between px-6 py-5 border-b border-[#1A1F4A] last:border-b-0">
                            <div className="flex items-center gap-2">
                              {playerEvents.map((event, eventIndex) => (
                                <div key={eventIndex} className="flex items-center gap-1.5">
                                  {event.type === 'yellow' && (
                                    <div className="w-3.5 h-5 bg-[#FFCC00]"></div>
                                  )}
                                  {event.type === 'red' && (
                                    <div className="w-3.5 h-5 bg-[#FF3B30]"></div>
                                  )}
                                  {event.type === 'goal' && (
                                    <div className="w-5 h-5 bg-[#F15601]"></div>
                                  )}
                                  {event.type === 'substitution' && (
                                    <div className="w-5 h-3.5 bg-[#F15601]"></div>
                                  )}
                                  <span className="text-sm text-white">{event.minute}'</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-6 flex-1 justify-end">
                              <div className="flex items-center gap-3">
                                <div className="w-7 text-center text-white/70">{12 + index}</div>
                              </div>
                              <div className="w-7 text-center font-medium text-white">
                                {index === 0 ? 'GK' : index <= 2 ? 'DF' : index <= 4 ? 'MF' : 'FW'}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      // Fallback if no events
                      Array.from({ length: 5 }, (_, index) => (
                        <div key={index} className="flex items-center justify-between px-6 py-5 border-b border-[#1A1F4A] last:border-b-0">
                          <div className="flex items-center gap-2"></div>
                          <div className="flex items-center gap-6 flex-1 justify-end">
                            <div className="flex items-center gap-3">
                              <div className="w-7 text-center text-white/70">{12 + index}</div>
                            </div>
                            <div className="w-7 text-center font-medium text-white">
                              {index === 0 ? 'GK' : index <= 2 ? 'DF' : index <= 4 ? 'MF' : 'FW'}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Match Statistics */}
            {fixture.statistics && Object.keys(fixture.statistics).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Goals */}
                {fixture.statistics.goals && (
                  <div className="bg-[#232C62] rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 text-center">Įvarčiai</h4>
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{fixture.statistics.goals.home}</div>
                        <div className="text-sm text-gray-300">{fixture.team1}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{fixture.statistics.goals.away}</div>
                        <div className="text-sm text-gray-300">{fixture.team2}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Yellow Cards */}
                {fixture.statistics.yellow_cards && (
                  <div className="bg-[#232C62] rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 text-center">Geltonos kortelės</h4>
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400">{fixture.statistics.yellow_cards.home}</div>
                        <div className="text-sm text-gray-300">{fixture.team1}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400">{fixture.statistics.yellow_cards.away}</div>
                        <div className="text-sm text-gray-300">{fixture.team2}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Red Cards */}
                {fixture.statistics.red_cards && (
                  <div className="bg-[#232C62] rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 text-center">Raudonos kortelės</h4>
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-500">{fixture.statistics.red_cards.home}</div>
                        <div className="text-sm text-gray-300">{fixture.team1}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-500">{fixture.statistics.red_cards.away}</div>
                        <div className="text-sm text-gray-300">{fixture.team2}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Substitutions */}
                {fixture.statistics.substitutions && (
                  <div className="bg-[#232C62] rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 text-center">Keitimai</h4>
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400">{fixture.statistics.substitutions.home}</div>
                        <div className="text-sm text-gray-300">{fixture.team1}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400">{fixture.statistics.substitutions.away}</div>
                        <div className="text-sm text-gray-300">{fixture.team2}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Possession */}
                {fixture.statistics.possession && (
                  <div className="bg-[#232C62] rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 text-center">Puolimas</h4>
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{fixture.statistics.possession.home}%</div>
                        <div className="text-sm text-gray-300">{fixture.team1}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{fixture.statistics.possession.away}%</div>
                        <div className="text-sm text-gray-300">{fixture.team2}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shots */}
                {fixture.statistics.shots && (
                  <div className="bg-[#232C62] rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 text-center">Smūgiai</h4>
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{fixture.statistics.shots.home}</div>
                        <div className="text-sm text-gray-300">{fixture.team1}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{fixture.statistics.shots.away}</div>
                        <div className="text-sm text-gray-300">{fixture.team2}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Corners */}
                {fixture.statistics.corners && (
                  <div className="bg-[#232C62] rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 text-center">Kampiniai</h4>
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{fixture.statistics.corners.home}</div>
                        <div className="text-sm text-gray-300">{fixture.team1}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{fixture.statistics.corners.away}</div>
                        <div className="text-sm text-gray-300">{fixture.team2}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fouls */}
                {fixture.statistics.fouls && (
                  <div className="bg-[#232C62] rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 text-center">Pažeidimai</h4>
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{fixture.statistics.fouls.home}</div>
                        <div className="text-sm text-gray-300">{fixture.team1}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{fixture.statistics.fouls.away}</div>
                        <div className="text-sm text-gray-300">{fixture.team2}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>

          {/* Match Events Timeline */}
          {fixture.events && fixture.events.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-white mb-6">Mačo eiga</h3>
              
              <div className="bg-[#232C62] rounded-lg p-6">
                <div className="space-y-4">
                  {fixture.events.map((event, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-[#1A1F4A] rounded-lg">
                      <div className="text-sm text-gray-300 min-w-[60px]">
                        {event.minute}'
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{event.description}</div>
                        {event.player && (
                          <div className="text-sm text-gray-300">{event.player}</div>
                        )}
                      </div>
                      <div className={`w-4 h-4 rounded-full ${
                        event.type === 'goal' ? 'bg-green-500' :
                        event.type === 'yellow_card' ? 'bg-yellow-400' :
                        event.type === 'red_card' ? 'bg-red-500' :
                        event.type === 'substitution' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Match Details */}
          <div className="bg-[#232C62] rounded-lg p-6">
            <h3 className="text-2xl font-semibold text-white mb-4">Mačo informacija</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-300">Data:</span>
                <span className="text-white ml-2">{format(new Date(fixture.match_date), 'yyyy-MM-dd')}</span>
              </div>
              <div>
                <span className="text-gray-300">Laikas:</span>
                <span className="text-white ml-2">{fixture.match_time}</span>
              </div>
              <div>
                <span className="text-gray-300">Vieta:</span>
                <span className="text-white ml-2">{fixture.venue || 'Nenurodyta'}</span>
              </div>
              <div>
                <span className="text-gray-300">Lygos raundas:</span>
                <span className="text-white ml-2">{fixture.round || 'Nenurodyta'}</span>
              </div>
              <div>
                <span className="text-gray-300">Būsena:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm font-semibold ${getStatusColor(fixture.status)}`}>
                  {getStatusText(fixture.status)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
