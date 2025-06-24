// app/dashboard/players/players-client.tsx
"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { PlayerDialog } from "@/components/player-dialog"
import type { Player } from "@/lib/types"
import { Plus, MoreHorizontal } from "lucide-react"
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
  const { toast } = useToast()

  // Extract unique positions and team_keys from players
  const positions = useMemo(() => Array.from(new Set(players.map(p => p.position).filter(Boolean))), [players])
  const teamKeys = useMemo(() => Array.from(new Set(players.map(p => p.team_key).filter(Boolean))), [players])

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const matchesSearch = player.name?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPosition = positionFilter ? player.position === positionFilter : true
      const matchesTeamKey = teamKeyFilter ? player.team_key === teamKeyFilter : true
      return matchesSearch && matchesPosition && matchesTeamKey
    })
  }, [players, searchTerm, positionFilter, teamKeyFilter])

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

  const handleDelete = async (id: number | undefined) => {
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

  return (
    <div className="space-y-6">
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
              <SelectItem value="">Visos pozicijos</SelectItem>
              {(positions ?? []).filter((pos): pos is string => typeof pos === 'string' && pos.trim() !== '').map((pos: string) => (
                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={teamKeyFilter} onValueChange={setTeamKeyFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Komanda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Visos komandos</SelectItem>
              {(teamKeys ?? []).filter(key => !!key).map((key) => (
                <SelectItem key={String(key)} value={String(key)}>{String(key)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Pridėti žaidėją
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
              {player.image_url && (
                <div className="relative h-48 w-full">
                  <Image
                    src={player.image_url}
                    alt={player.name || "Player image"}
                    layout="fill"
                    objectFit="cover"
                    className="bg-muted"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-bold">{player.name}</h3>
                <p className="text-muted-foreground">#{player.number} • {player.position}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm text-center">
                    <div>
                        <p className="font-bold">{player.matches || 0}</p>
                        <p className="text-xs text-muted-foreground">Matches</p>
                    </div>
                    <div>
                        <p className="font-bold">{player.goals || 0}</p>
                        <p className="text-xs text-muted-foreground">Goals</p>
                    </div>
                    <div>
                        <p className="font-bold">{player.assists || 0}</p>
                        <p className="text-xs text-muted-foreground">Assists</p>
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