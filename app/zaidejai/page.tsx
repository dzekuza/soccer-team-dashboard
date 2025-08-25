"use client"

import { useEffect, useState } from "react"
import { PublicNavigation } from "@/components/public-navigation"
import { PublicFooter } from "@/components/public-footer"
import { PlayerCard } from "@/components/player-card"
import { PublicTabs } from "@/components/ui/tabs"
import type { Player } from "@/lib/types"

interface PlayerGroup {
  title: string
  players: Player[]
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/players')
        if (!response.ok) throw new Error("Nepavyko gauti žaidėjų")
        
        const data = await response.json()
        console.log("Fetched players:", data)
        setPlayers(data)
      } catch (e: unknown) {
        console.error("Error fetching players:", e)
        setError(e instanceof Error ? e.message : "Įvyko nežinoma klaida.")
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  // Remove duplicates based on name and surname combination
  const uniquePlayers = players.filter((player, index, self) => {
    const fullName = `${player.name || ''} ${player.surname || ''}`.toLowerCase().trim()
    const firstIndex = self.findIndex(p => 
      `${p.name || ''} ${p.surname || ''}`.toLowerCase().trim() === fullName
    )
    return index === firstIndex
  })

  // Filter players based on search term and team selection
  const filteredPlayers = uniquePlayers.filter(player => {
    const fullName = `${player.name || ''} ${player.surname || ''}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase())
    const matchesTeam = selectedTeam === "all" || player.team_key === selectedTeam
    return matchesSearch && matchesTeam
  })

  // Group players by position
  const groupPlayersByPosition = (players: Player[]): PlayerGroup[] => {
    const positionGroups: Record<string, Player[]> = {
      'Vartininkai': [],
      'Gynėjai': [],
      'Pusgynėjai': [],
      'Puolėjai': [],
      'Kiti': []
    }

    players.forEach(player => {
      const position = player.position?.toLowerCase() || ''
      
      if (position.includes('vartininkas') || position.includes('goalkeeper') || position.includes('vartininkė')) {
        positionGroups['Vartininkai'].push(player)
      } else if (position.includes('saugas') || position.includes('defender') || position.includes('gynėjas') || position.includes('gynėja') || position.includes('saugė')) {
        positionGroups['Gynėjai'].push(player)
      } else if (position.includes('pusgynėjas') || position.includes('midfielder')) {
        positionGroups['Pusgynėjai'].push(player)
      } else if (position.includes('puolėjas') || position.includes('forward') || position.includes('striker') || position.includes('puolėja')) {
        positionGroups['Puolėjai'].push(player)
      } else {
        positionGroups['Kiti'].push(player)
      }
    })

    // Return only groups that have players
    return Object.entries(positionGroups)
      .filter(([_, players]) => players.length > 0)
      .map(([title, players]) => ({ title, players }))
  }

  // Get unique teams for filter
  const teams = Array.from(new Set(players.map(p => p.team_key).filter(Boolean))) as string[]

  // Create tabs array for PublicTabs component
  const tabs = [
    { key: "all", label: "Visi" },
    ...teams.map(team => ({ key: team, label: team }))
  ]

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

  const playerGroups = groupPlayersByPosition(filteredPlayers)

  return (
    <div className="min-h-screen bg-[#0A165B] text-white">
      <PublicNavigation currentPage="zaidejai" />
      
      {/* Main Content */}
      <div className="w-full">
        <div className="text-center py-8 border-b border-[#232C62]">
          <h1 className="h1-public">Žaidėjai</h1>
        </div>
        
        {/* Team Tabs */}
        <div className="w-full">
          <PublicTabs
            tabs={tabs}
            activeTab={selectedTeam}
            onTabChange={setSelectedTeam}
          />
        </div>
        
        {/* Filters */}
        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Ieškoti žaidėjų..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-[#232C62] text-white border border-[#F15601] rounded focus:outline-none focus:border-[#F15601]"
            />
          </div>
        </div>
        
        {/* Players Grid */}
        <div className="p-4">
          {groupPlayersByPosition(filteredPlayers).map((group) => (
            <div key={group.title} className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#F15601]">{group.title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {group.players.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
