"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

interface Match {
  id: string
  team1: string
  team2: string
  team1_logo?: string
  team2_logo?: string
  match_date: string
  venue?: string
  team1_score?: number | null
  team2_score?: number | null
  status: string
  league_key?: string
}

const RECENT_RESULTS_LIMIT = 10

function formatScore(match: Match): string {
  if (match.team1_score == null || match.team2_score == null) return '-'
  return `${match.team1_score} - ${match.team2_score}`
}

interface UpcomingMatchesProps {
  selectedTeam: string
}

export function UpcomingMatches({ selectedTeam }: UpcomingMatchesProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/fixtures/public')
        if (response.ok) {
          const result = await response.json()
          const data: Match[] = result.data || result

          const forTeam = (fixture: Match) =>
            !selectedTeam || fixture.league_key === selectedTeam

          const isUpcoming = (fixture: Match) =>
            fixture.status === 'upcoming' ||
            (fixture.status !== 'completed' && new Date(fixture.match_date) >= new Date())

          const upcoming = data.filter((fixture) => forTeam(fixture) && isUpcoming(fixture))

          // Off-season: no upcoming fixtures, so show the latest results instead
          const filtered = upcoming.length > 0
            ? upcoming
            : data
                .filter((fixture) => forTeam(fixture) && fixture.status === 'completed')
                .sort((a, b) => b.match_date.localeCompare(a.match_date))
                .slice(0, RECENT_RESULTS_LIMIT)
          setMatches(filtered)
        }
      } catch (error) {
        console.error('Error fetching matches:', error)
        setError('Failed to load fixtures')
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [selectedTeam])

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const goToPrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1))
  }

  const goToNext = () => {
    setCurrentIndex(Math.min(matches.length - 3, currentIndex + 1))
  }

  if (loading) {
    return (
      <div className="h-[146px] bg-[#0a165b] p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32 bg-gray-600" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full bg-gray-600" />
            <Skeleton className="h-8 w-8 rounded-full bg-gray-600" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#0f1f6b] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-16 bg-gray-600" />
                <Skeleton className="h-4 w-12 bg-gray-600" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full bg-gray-600" />
                  <Skeleton className="h-3 w-12 bg-gray-600" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-4 w-8 bg-gray-600 mb-1" />
                  <Skeleton className="h-3 w-16 bg-gray-600" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-12 bg-gray-600" />
                  <Skeleton className="h-6 w-6 rounded-full bg-gray-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[146px] bg-[#0a165b] flex items-center justify-center">
        <div className="text-white">Klaida: {error}</div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="h-[146px] bg-[#0a165b] flex items-center justify-center">
        <div className="text-white">Nėra artimiausių rungtynių</div>
      </div>
    )
  }

  return (
        <div className="relative h-[146px] overflow-hidden w-full">
      {/* Matches Container */}
              <div 
          className="flex transition-transform duration-300 ease-in-out" 
          style={{ transform: `translateX(-${currentIndex * (isMobile ? 300 : 350)}px)` }}
        >
          {matches.map((match, index) => (
            <Link 
              key={match.id || index} 
              href={`/fixtures/${match.id}`}
              className="flex-shrink-0 w-[300px] md:w-[350px] h-[146px] bg-[#0a165b] border-r border-[rgba(95,95,113,0.25)] relative hover:bg-[#0a2065] transition-colors cursor-pointer"
            >
            {/* Teams and Score Row */}
            <div className="absolute top-[25px] left-0 right-0 flex items-center justify-between px-6">
              {/* Team 1 */}
              <div className="flex items-center space-x-2 flex-1">
                {match.team1_logo ? (
                  <Image 
                    src={match.team1_logo} 
                    alt={match.team1}
                    width={24}
                    height={24}
                    className="rounded"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                )}
                <span className="text-white text-sm font-medium truncate">{match.team1}</span>
              </div>
              
              {/* Score or VS */}
              <div className="flex-shrink-0 mx-4">
                <span className="text-white text-base font-medium">
                  {formatScore(match)}
                </span>
              </div>
              
              {/* Team 2 */}
              <div className="flex items-center space-x-2 flex-1 justify-end">
                <span className="text-white text-sm font-medium truncate">{match.team2}</span>
                {match.team2_logo ? (
                  <Image 
                    src={match.team2_logo} 
                    alt={match.team2}
                    width={24}
                    height={24}
                    className="rounded"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="absolute top-[60px] left-[25px]">
              <span className="text-white text-sm font-medium">
                {new Date(match.match_date).toLocaleDateString('lt-LT', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
            </div>

            {/* Venue */}
            <div className="absolute top-[88px] left-[25px]">
              <span className="text-white text-sm font-medium">
                {match.venue || 'Stadionas'}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Navigation Buttons */}
      {matches.length > 3 && (
        <>
          <button 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 w-[50px] h-[50px] bg-[#111111] flex items-center justify-center hover:bg-[#222222] transition-colors"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
                          <button 
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[50px] h-[50px] bg-[#111111] flex items-center justify-center hover:bg-[#222222] transition-colors"
                  onClick={goToNext}
                  disabled={currentIndex >= matches.length - 3}
                >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
