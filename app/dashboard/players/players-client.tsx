// app/dashboard/players/players-client.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import type { Player } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { CreatePlayerDialog } from "@/components/create-player-dialog"
import { EditPlayerDialog } from "@/components/edit-player-dialog"
import Image from "next/image"

interface PlayersClientProps {
  initialPlayers: Player[];
}

export function PlayersClient({ initialPlayers }: PlayersClientProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers)
  const [teamFilter, setTeamFilter] = useState<string>("all")
  const [loading, setLoading] = useState(false)
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const { toast } = useToast()

  const fetchPlayers = async (team: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/players?team_key=${team === "all" ? "" : team}`)
      if (!response.ok) throw new Error("Failed to fetch players")
      const data = await response.json()
      setPlayers(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not fetch players.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayers(teamFilter)
  }, [teamFilter])

  const handlePlayerCreated = () => {
    fetchPlayers(teamFilter)
    setCreateDialogOpen(false)
  }

  const handlePlayerUpdated = () => {
    fetchPlayers(teamFilter)
    setEditDialogOpen(false)
    setSelectedPlayer(null)
  }
  
  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm("Are you sure you want to delete this player?")) return;

    try {
      const response = await fetch(`/api/players/${playerId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete player');
      toast({ title: "Success", description: "Player deleted successfully." });
      fetchPlayers(teamFilter); // Refresh list
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not delete player.",
        variant: "destructive",
      });
    }
  };


  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="flex-grow overflow-x-auto">
          <div className="flex gap-2 pb-2">
            <Button variant={teamFilter === 'all' ? 'default' : 'outline'} onClick={() => setTeamFilter('all')}>Visos komandos</Button>
            <Button variant={teamFilter === 'BANGA A' ? 'default' : 'outline'} onClick={() => setTeamFilter('BANGA A')}>Banga A</Button>
            <Button variant={teamFilter === 'BANGA B' ? 'default' : 'outline'} onClick={() => setTeamFilter('BANGA B')}>Banga B</Button>
            <Button variant={teamFilter === 'BANGA M' ? 'default' : 'outline'} onClick={() => setTeamFilter('BANGA M')}>Banga M</Button>
          </div>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Pridėti žaidėją
        </Button>
      </div>

      {/* Mobile View - Card List */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="text-center py-8">Kraunama...</div>
        ) : players.length === 0 ? (
          <div className="text-center py-8">Žaidėjų nerasta.</div>
        ) : (
          players.map((player) => (
            <div key={player.id} className="bg-card text-card-foreground rounded shadow p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Image
                    src={player.image_url || '/placeholder-user.jpg'}
                    alt={player.name || 'Player'}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{player.name} <span className="text-muted-foreground font-normal">#{player.number}</span></h3>
                    <p className="text-sm text-muted-foreground">{player.position}</p>
                    <p className="text-sm text-muted-foreground">{player.team_key}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setSelectedPlayer(player); setEditDialogOpen(true); }}>
                      <Edit className="mr-2 h-4 w-4" /> Redaguoti
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeletePlayer(player.id)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Ištrinti
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-bold">{player.matches}</p>
                  <p className="text-xs text-muted-foreground">Rungtynės</p>
                </div>
                <div>
                  <p className="font-bold">{player.minutes}</p>
                  <p className="text-xs text-muted-foreground">Minutės</p>
                </div>
                <div>
                  <p className="font-bold">{player.goals}</p>
                  <p className="text-xs text-muted-foreground">Įvarčiai</p>
                </div>
                <div>
                  <p className="font-bold">{player.assists}</p>
                  <p className="text-xs text-muted-foreground">Asistai</p>
                </div>
                <div>
                  <p className="font-bold">{player.yellow_cards}</p>
                  <p className="text-xs text-muted-foreground">Gel.</p>
                </div>
                <div>
                  <p className="font-bold">{player.red_cards}</p>
                  <p className="text-xs text-muted-foreground">Raud.</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block bg-card text-card-foreground rounded shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nr.</TableHead>
              <TableHead>Nuotrauka</TableHead>
              <TableHead>Vardas</TableHead>
              <TableHead>Pozicija</TableHead>
              <TableHead>Komanda</TableHead>
              <TableHead>Rungtynės</TableHead>
              <TableHead>Minutės</TableHead>
              <TableHead>Įvarčiai</TableHead>
              <TableHead>Asistai</TableHead>
              <TableHead>Gel.</TableHead>
              <TableHead>Raud.</TableHead>
              <TableHead>Veiksmai</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={12} className="text-center">Kraunama...</TableCell></TableRow>
            ) : players.length === 0 ? (
                <TableRow><TableCell colSpan={12} className="text-center">Žaidėjų nerasta.</TableCell></TableRow>
            ) : (
              players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>{player.number}</TableCell>
                  <TableCell>
                    <Image 
                        src={player.image_url || '/placeholder-user.jpg'} 
                        alt={player.name || 'Player'} 
                        width={40} 
                        height={40} 
                        className="rounded-full"
                    />
                  </TableCell>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.position}</TableCell>
                  <TableCell>{player.team_key}</TableCell>
                  <TableCell>{player.matches}</TableCell>
                  <TableCell>{player.minutes}</TableCell>
                  <TableCell>{player.goals}</TableCell>
                  <TableCell>{player.assists}</TableCell>
                  <TableCell>{player.yellow_cards}</TableCell>
                  <TableCell>{player.red_cards}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedPlayer(player); setEditDialogOpen(true); }}>
                          <Edit className="mr-2 h-4 w-4" /> Redaguoti
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeletePlayer(player.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Ištrinti
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {isCreateDialogOpen && (
        <CreatePlayerDialog
          open={isCreateDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onPlayerCreated={handlePlayerCreated}
        />
      )}

      {isEditDialogOpen && selectedPlayer && (
        <EditPlayerDialog
          open={isEditDialogOpen}
          onOpenChange={setEditDialogOpen}
          player={selectedPlayer}
          onPlayerUpdated={handlePlayerUpdated}
        />
      )}

    </div>
  )
}