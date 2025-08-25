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

interface Fixture {
  id: string;
  fingerprint: string;
  match_date: string;
  match_time: string;
  team1: string;
  team2: string;
  team1_score?: number;
  team2_score?: number;
  venue: string;
  league_key: string;
  status: string;
  round?: string;
  statistics?: string; // JSON string
  events?: string; // JSON string
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

interface MatchesClientProps {
    initialMatches: Fixture[];
}

export function MatchesClient({ initialMatches }: MatchesClientProps) {
  const [matches, setMatches] = useState<Fixture[]>(initialMatches)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const { toast } = useToast()

  async function fetchMatches() {
    try {
      const response = await fetch('/api/fixtures/scrape');
      if (!response.ok) throw new Error("Nepavyko gauti rungtynių");
      const data = await response.json();
      if (data.success) {
        setMatches(data.data || []);
      } else {
        throw new Error(data.error || "Failed to fetch fixtures");
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error)
      toast({ title: "Klaida", description: "Nepavyko atnaujinti rungtynių sąrašo.", variant: "destructive" });
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

  const handleEdit = (match: Fixture) => {
    // Convert Fixture to Match format for the dialog
    const matchForDialog: Match = {
      team_key: match.league_key,
      team1: match.team1,
      team2: match.team2,
      team1_score: match.team1_score ?? null,
      team2_score: match.team2_score ?? null,
      team1_logo: "",
      team2_logo: "",
      match_date: match.match_date,
      match_time: match.match_time,
      venue: match.venue,
      match_group: "past",
      fingerprint: match.fingerprint,
      lff_url_slug: null,
      status: match.status,
      home_shots_total: null,
      away_shots_total: null,
      home_shots_on_target: null,
      away_shots_on_target: null,
      home_shots_off_target: null,
      away_shots_off_target: null,
      home_attacks: null,
      away_attacks: null,
      home_dangerous_attacks: null,
      away_dangerous_attacks: null,
      home_corners: null,
      away_corners: null
    };
    setSelectedMatch(matchForDialog);
    setIsDialogOpen(true);
  };

  const handleDelete = async (fingerprint: string) => {
    if (!confirm("Ar tikrai norite ištrinti šias rungtynes?")) return;

    try {
      const response = await fetch(`/api/matches/${fingerprint}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Nepavyko ištrinti rungtynių");
      }
      toast({ title: "Sėkmingai", description: "Rungtynės sėkmingai ištrintos." });
      fetchMatches();
    } catch (error) {
      toast({
        title: "Klaida",
        description: error instanceof Error ? error.message : "Įvyko nežinoma klaida.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mano rungtynės</h1>
          <p className="text-gray-600">Tvarkykite ir peržiūrėkite savo komandos rungtynes.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={async () => {
              try {
                const response = await fetch('/api/fixtures/scrape', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
                
                if (!response.ok) {
                  throw new Error('Failed to scrape fixtures');
                }
                
                const result = await response.json();
                if (result.success) {
                  toast({ 
                    title: "Sėkmingai", 
                    description: `Išskrapinta ${result.data.flatMap((league: any) => league.fixtures).length} rungtynių`, 
                    variant: "default" 
                  });
                  // Refresh the matches list
                  await fetchMatches();
                } else {
                  throw new Error(result.error || 'Failed to scrape fixtures');
                }
              } catch (error) {
                console.error('Error scraping fixtures:', error);
                toast({ 
                  title: "Klaida", 
                  description: "Nepavyko išskrapinti rungtynių", 
                  variant: "destructive" 
                });
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Scrapinti rungtynes
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Sukurti rungtynes
          </Button>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded shadow">
        {/* Mobile View - Card List */}
        <div className="md:hidden">
          {matches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Rungtynių nerasta.</div>
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
                        Redaguoti
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(match.fingerprint)}>
                        Ištrinti
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  <p>{match.match_date} at {match.match_time}</p>
                  <p>{match.venue}</p>
                  <p>Būsena: <span className="font-semibold">{match.status}</span></p>
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
                <TableHead>League</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Statistics</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Rungtynių nerasta.</TableCell>
                </TableRow>
              ) : (
                matches.map((match) => {
                  // Parse statistics if available
                  let statistics = null;
                  if (match.statistics) {
                    try {
                      statistics = JSON.parse(match.statistics);
                    } catch (e) {
                      console.error('Failed to parse statistics:', e);
                    }
                  }

                  return (
                    <TableRow key={match.fingerprint}>
                      <TableCell>{match.match_date}</TableCell>
                      <TableCell>{match.match_time}</TableCell>
                      <TableCell>{match.team1}</TableCell>
                      <TableCell>{match.team2}</TableCell>
                      <TableCell>
                        {match.team1_score !== null && match.team2_score !== null 
                          ? `${match.team1_score} - ${match.team2_score}` 
                          : 'TBD'}
                      </TableCell>
                      <TableCell>{match.venue}</TableCell>
                      <TableCell>{match.league_key}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          match.status === 'completed' ? 'bg-green-100 text-green-800' :
                          match.status === 'live' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {match.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {statistics ? (
                          <div className="text-xs space-y-1">
                            {statistics.possession && (
                              <div>Possession: {statistics.possession.home}% - {statistics.possession.away}%</div>
                            )}
                            {statistics.shots && (
                              <div>Shots: {statistics.shots.home} - {statistics.shots.away}</div>
                            )}
                            {statistics.corners && (
                              <div>Corners: {statistics.corners.home} - {statistics.corners.away}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No stats</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          let events = null;
                          if (match.events) {
                            try {
                              events = JSON.parse(match.events);
                            } catch (e) {
                              console.error('Failed to parse events:', e);
                            }
                          }
                          
                          return events && events.length > 0 ? (
                            <div className="text-xs space-y-1 max-h-20 overflow-y-auto">
                              {events.slice(0, 3).map((event: any, index: number) => (
                                <div key={index} className="flex items-center gap-1">
                                  <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                    {event.minute}&apos;
                                  </span>
                                  <span className="truncate">{event.player}</span>
                                </div>
                              ))}
                              {events.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  +{events.length - 3} more events
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">No events</span>
                          );
                        })()}
                      </TableCell>
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
                              Redaguoti
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(match.fingerprint)}>
                              Ištrinti
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
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