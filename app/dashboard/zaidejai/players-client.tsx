// app/dashboard/players/players-client.tsx
"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { PlayerDialog } from "@/components/player-dialog"
import type { Player } from "@/lib/types"
import { Plus, MoreHorizontal, Download, RefreshCw, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PlayersClientProps {
  initialPlayers: Player[]
}

export function PlayersClient({ initialPlayers }: PlayersClientProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState<string>("")
  const [teamKeyFilter, setTeamKeyFilter] = useState<string>("")
  const [isScraping, setIsScraping] = useState(false)
  const [isUpdatingStats, setIsUpdatingStats] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)
  const { toast } = useToast()

  // Extract unique positions and team_keys from players
  const positions = useMemo(() => Array.from(new Set(players.map(p => p.position).filter(Boolean))), [players])
  const teamKeys = useMemo(() => Array.from(new Set(players.map(p => p.team_key).filter(Boolean))), [players])

  // Remove duplicates based on name and surname combination
  const uniquePlayers = useMemo(() => {
    return players.filter((player, index, self) => {
      const fullName = `${player.name || ''} ${player.surname || ''}`.toLowerCase().trim()
      const firstIndex = self.findIndex(p => 
        `${p.name || ''} ${p.surname || ''}`.toLowerCase().trim() === fullName
      )
      return index === firstIndex
    })
  }, [players])

  const filteredPlayers = useMemo(() => {
    return uniquePlayers.filter(player => {
      const fullName = `${player.name || ''} ${player.surname || ''}`.toLowerCase()
      const matchesSearch = fullName.includes(searchTerm.toLowerCase())
      const matchesPosition = positionFilter && positionFilter !== 'all' ? player.position === positionFilter : true
      const matchesTeamKey = teamKeyFilter && teamKeyFilter !== 'all' ? player.team_key === teamKeyFilter : true
      return matchesSearch && matchesPosition && matchesTeamKey
    })
  }, [uniquePlayers, searchTerm, positionFilter, teamKeyFilter])

  async function fetchPlayers() {
    try {
      const response = await fetch('/api/players')
      if (!response.ok) throw new Error("Failed to fetch players")
      const data = await response.json()
      setPlayers(data)
    } catch (error) {
      console.error("Failed to fetch players:", error)
      toast({ title: "Error", description: "Could not refresh the player list.", variant: "destructive" })
    }
  }

  const handlePlayerSaved = () => {
    fetchPlayers()
    setIsDialogOpen(false)
  }

  const handleCreate = () => {
    setSelectedPlayer(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (player: Player) => {
    setSelectedPlayer(player)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (id === undefined) {
      toast({ title: "Error", description: "Player ID is missing.", variant: "destructive" });
      return;
    }
    if (!confirm("Are you sure you want to delete this player?")) return

    try {
      const response = await fetch(`/api/players/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete player")
      }
      toast({ title: "Success", description: "Player deleted successfully." })
      fetchPlayers()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      })
    }
  }

  const handleScrapePlayers = async () => {
    if (!confirm("This will scrape BANGA players from LFF website. Continue?")) return
    
    setIsScraping(true)
    try {
      const response = await fetch('/api/players/scrape', { method: 'POST' })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to scrape players")
      }
      
      toast({ 
        title: "Success", 
        description: `Successfully scraped ${data.scrapedCount} players and inserted ${data.insertedCount} players.` 
      })
      fetchPlayers()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred during scraping.",
        variant: "destructive",
      })
    } finally {
      setIsScraping(false)
    }
  }

  const handleUpdatePlayerStats = async () => {
    if (!confirm("This will update player statistics for recent matches. Continue?")) return
    
    setIsUpdatingStats(true)
    try {
      const response = await fetch('/api/players/update-stats', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updateRecent: true })
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to update player stats")
      }
      
      toast({ 
        title: "Success", 
        description: data.message || "Player statistics updated successfully." 
      })
      fetchPlayers()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred while updating stats.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStats(false)
    }
  }

  const handleCleanDatabase = async () => {
    if (!confirm("This will remove duplicate player records from the database. Continue?")) return
    
    setIsCleaning(true)
    try {
      const response = await fetch('/api/players/clean-duplicates', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to clean duplicates")
      }
      
      toast({ 
        title: "Success", 
        description: data.message || "Duplicates removed successfully." 
      })
      fetchPlayers()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred while cleaning duplicates.",
        variant: "destructive",
      })
    } finally {
      setIsCleaning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Team Statistics Summary */}
      {players.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Team Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p className="text-3xl font-bold text-blue-600">{uniquePlayers.length}</p>
              <p className="text-sm text-muted-foreground font-medium">Iš viso žaidėjų</p>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p className="text-3xl font-bold text-green-600">
                {uniquePlayers.reduce((sum, p) => sum + (p.goals || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground font-medium">Total Goals</p>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p className="text-3xl font-bold text-blue-600">
                {uniquePlayers.reduce((sum, p) => sum + (p.assists || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground font-medium">Total Assists</p>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p className="text-3xl font-bold text-yellow-600">
                {uniquePlayers.reduce((sum, p) => sum + (p.yellow_cards || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground font-medium">Yellow Cards</p>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p className="text-3xl font-bold text-red-600">
                {uniquePlayers.reduce((sum, p) => sum + (p.red_cards || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground font-medium">Red Cards</p>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p className="text-3xl font-bold text-purple-600">
                {uniquePlayers.reduce((sum, p) => sum + (p.matches || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground font-medium">Iš viso rungtynių</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Input
            placeholder="Ieškoti žaidėjo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-auto"
          />
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Pozicija" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Visos pozicijos</SelectItem>
              {(positions ?? []).filter((pos): pos is string => pos !== null && pos !== undefined && typeof pos === 'string' && pos.trim() !== '').map((pos: string) => (
                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={teamKeyFilter} onValueChange={setTeamKeyFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Komanda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Visos komandos</SelectItem>
              {(teamKeys ?? []).filter(key => !!key).map((key) => (
                <SelectItem key={String(key)} value={String(key)}>{String(key)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Pridėti žaidėją
          </Button>
          <Button 
            onClick={handleScrapePlayers} 
            disabled={isScraping}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            {isScraping ? "Scraping..." : "Scrape BANGA Players"}
          </Button>
          <Button 
            onClick={handleUpdatePlayerStats} 
            disabled={isUpdatingStats}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isUpdatingStats ? "Updating..." : "Update Player Stats"}
          </Button>
          <Button 
            onClick={handleCleanDatabase} 
            disabled={isCleaning}
            variant="destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isCleaning ? "Cleaning..." : "Remove Duplicates"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground col-span-full">No players found.</div>
        ) : (
          filteredPlayers.map((player) => (
            <div key={player.id} className="bg-card text-card-foreground rounded-lg shadow-lg overflow-hidden relative">
               <div className="absolute top-2 right-2 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 bg-background/50 hover:bg-background/80">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(player)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(player.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              <div className="relative h-48 w-full">
                {player.image_url ? (
                  <Image
                    src={player.image_url}
                    alt={`${player.name} ${player.surname || ''}`}
                    layout="fill"
                    objectFit="cover"
                    className="bg-muted"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-300 rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-blue-400">
                        <span className="text-3xl font-bold text-blue-700">
                          {player.name?.charAt(0)}{player.surname?.charAt(0) || ''}
                        </span>
                      </div>
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full inline-block">
                        <span className="text-sm font-bold">#{player.number || '?'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                        {player.number || '?'}
                      </span>
                      <h3 className="text-lg font-bold">{player.name} {player.surname || ''}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">{player.position}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {player.team_key}
                    </span>
                  </div>
                </div>
                
                {/* Main Stats - Enhanced */}
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 text-center border border-gray-200">
                        <p className="font-bold text-xl text-gray-800">{player.matches || 0}</p>
                        <p className="text-xs text-muted-foreground font-medium">Rungtynės</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center border border-green-200">
                        <p className="font-bold text-xl text-green-700">{player.goals || 0}</p>
                        <p className="text-xs text-muted-foreground font-medium">Goals</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center border border-blue-200">
                        <p className="font-bold text-xl text-blue-700">{player.assists || 0}</p>
                        <p className="text-xs text-muted-foreground font-medium">Assists</p>
                    </div>
                </div>
                
                {/* Additional Stats - Enhanced */}
                <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                    <div className="bg-gray-50 rounded-md p-2 text-center border border-gray-200">
                        <p className="font-bold text-sm text-gray-800">{player.minutes || 0}</p>
                        <p className="text-muted-foreground font-medium">Min</p>
                    </div>
                    <div className="bg-yellow-50 rounded-md p-2 text-center border border-yellow-200">
                        <p className="font-bold text-sm text-yellow-700">{player.yellow_cards || 0}</p>
                        <p className="text-muted-foreground font-medium">YC</p>
                    </div>
                    <div className="bg-red-50 rounded-md p-2 text-center border border-red-200">
                        <p className="font-bold text-sm text-red-700">{player.red_cards || 0}</p>
                        <p className="text-muted-foreground font-medium">RC</p>
                    </div>
                    <div className="bg-purple-50 rounded-md p-2 text-center border border-purple-200">
                        <p className="font-bold text-sm text-purple-700">
                          {player.matches && player.minutes ? Math.round(player.minutes / player.matches) : 0}
                        </p>
                        <p className="text-muted-foreground font-medium">Avg Min</p>
                    </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <PlayerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onPlayerSaved={handlePlayerSaved}
        player={selectedPlayer}
      />
    </div>
  )
}