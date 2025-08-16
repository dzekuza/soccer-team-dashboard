"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MatchDialog } from "@/components/match-dialog"
import type { Match } from "@/lib/types"
import { Plus, MoreHorizontal } from "lucide-react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

interface MatchesClientProps {
    initialMatches: Match[];
}

export function MatchesClient({ initialMatches }: MatchesClientProps) {
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const { toast } = useToast()

  async function fetchMatches() {
    try {
      const response = await fetch('/api/matches');
      if (!response.ok) throw new Error("Failed to fetch matches");
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error("Failed to fetch matches:", error)
      toast({ title: "Error", description: "Could not refresh the match list.", variant: "destructive" });
    }
  }

  const handleMatchSaved = () => {
    fetchMatches()
    setIsDialogOpen(false)
  }
  
  const handleCreate = () => {
    setSelectedMatch(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (match: Match) => {
    setSelectedMatch(match);
    setIsDialogOpen(true);
  };

  const handleDelete = async (fingerprint: string) => {
    if (!confirm("Are you sure you want to delete this match?")) return;

    try {
      const response = await fetch(`/api/matches/${fingerprint}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete match");
      }
      toast({ title: "Success", description: "Match deleted successfully." });
      fetchMatches();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Matches</h1>
          <p className="text-gray-600">Manage and view your team&apos;s matches.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Match
        </Button>
      </div>

      <div className="bg-card text-card-foreground rounded shadow">
        {/* Mobile View - Card List */}
        <div className="md:hidden">
          {matches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No matches found.</div>
          ) : (
            matches.map((match) => (
              <div key={match.fingerprint} className="border-b last:border-b-0 p-4">
                <div className="flex justify-between items-center">
                  <div className="font-bold">{match.team1} vs {match.team2}</div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(match)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(match.fingerprint)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  <p>{match.match_date} at {match.match_time}</p>
                  <p>{match.venue}</p>
                  <p>Status: <span className="font-semibold">{match.status}</span></p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Home Team</TableHead>
                <TableHead>Away Team</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No matches found.</TableCell>
                </TableRow>
              ) : (
                matches.map((match) => (
                  <TableRow key={match.fingerprint}>
                    <TableCell>{match.match_date}</TableCell>
                    <TableCell>{match.match_time}</TableCell>
                    <TableCell>{match.team1}</TableCell>
                    <TableCell>{match.team2}</TableCell>
                    <TableCell>{match.team1_score} - {match.team2_score}</TableCell>
                    <TableCell>{match.venue}</TableCell>
                    <TableCell>{match.status}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(match)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(match.fingerprint)}>
                            Delete
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
      </div>

      <MatchDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onMatchSaved={handleMatchSaved}
        match={selectedMatch}
      />
    </div>
  )
} 