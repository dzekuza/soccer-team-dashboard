"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Download, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Standings row type
interface Standing {
  team_key: string
  team_name: string | null
  position: number | null
  played: number | null
  won: number | null
  drawn: number | null
  lost: number | null
  scored: number | null
  conceded: number | null
  goal_diff: string | null
  points: number | null
  logo: string | null
  fingerprint: string
}

interface StandingsData {
  id: string
  league_key: string
  league_name: string
  standings_data: any[]
  last_updated: string
  created_at: string
}

export function StandingsClient() {
  const [standingsData, setStandingsData] = useState<StandingsData[]>([])
  const [loading, setLoading] = useState(true)
  const [editRow, setEditRow] = useState<Standing | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<Partial<Standing>>({})
  const [selectedLeague, setSelectedLeague] = useState<string>("a_lyga")
  const [isScraping, setIsScraping] = useState(false)
  const { toast } = useToast()

  const leagues = [
    { key: "a_lyga", name: "Banga A" },
    { key: "ii_lyga_a", name: "Banga B" },
    { key: "moteru_a_lyga", name: "Banga M" }
  ]

  useEffect(() => {
    fetchStandings()
  }, [])

  const fetchStandings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/standings/scrape')
      if (!response.ok) throw new Error("Failed to fetch standings")
      
      const result = await response.json()
      if (result.success) {
        setStandingsData(result.data)
      } else {
        throw new Error(result.error || "Failed to fetch standings")
      }
    } catch (error) {
      console.error("Error fetching standings:", error)
      toast({
        title: "Error",
        description: "Failed to fetch standings data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getCurrentStandings = (): Standing[] => {
    const currentData = standingsData.find(data => data.league_key === selectedLeague)
    return currentData?.standings_data || []
  }

  const getLastUpdated = (): string => {
    const currentData = standingsData.find(data => data.league_key === selectedLeague)
    if (!currentData?.last_updated) return ""
    
    return new Date(currentData.last_updated).toLocaleDateString('lt-LT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleScrapeStandings = async () => {
    setIsScraping(true)
    try {
      const response = await fetch('/api/standings/scrape', {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error("Failed to scrape standings")
      
      const result = await response.json()
      if (result.success) {
        toast({
          title: "Success",
          description: "Standings data updated successfully"
        })
        await fetchStandings()
      } else {
        throw new Error(result.error || "Failed to scrape standings")
      }
    } catch (error) {
      console.error("Error scraping standings:", error)
      toast({
        title: "Error",
        description: "Failed to update standings data",
        variant: "destructive"
      })
    } finally {
      setIsScraping(false)
    }
  }

  const openEditModal = (row: Standing) => {
    setEditRow(row)
    setForm(row)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditRow(null)
    setForm({})
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      await fetch(`/api/standings/${editRow?.fingerprint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      
      toast({
        title: "Success",
        description: "Standing updated successfully"
      })
      
      await fetchStandings()
      closeModal()
    } catch (error) {
      console.error("Error updating standing:", error)
      toast({
        title: "Error",
        description: "Failed to update standing",
        variant: "destructive"
      })
    }
  }

  const currentStandings = getCurrentStandings()

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleScrapeStandings} 
            disabled={isScraping}
            className="bg-[#F15601] hover:bg-[#E04501]"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isScraping ? 'animate-spin' : ''}`} />
            {isScraping ? 'Atnaujinama...' : 'Atnaujinti duomenis'}
          </Button>
          {getLastUpdated() && (
            <span className="text-sm text-gray-600">
              Atnaujinta: {getLastUpdated()}
            </span>
          )}
        </div>
      </div>

      {/* League Tabs */}
      <Tabs value={selectedLeague} onValueChange={setSelectedLeague}>
        <TabsList className="grid w-full grid-cols-3">
          {leagues.map(league => (
            <TabsTrigger key={league.key} value={league.key}>
              {league.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedLeague} className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-600">Kraunama...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Poz.</TableHead>
                    <TableHead>Komanda</TableHead>
                    <TableHead className="w-[60px] text-center">R</TableHead>
                    <TableHead className="w-[60px] text-center">Perg.</TableHead>
                    <TableHead className="w-[60px] text-center">Lyg.</TableHead>
                    <TableHead className="w-[60px] text-center">Pr.</TableHead>
                    <TableHead className="w-[60px] text-center">Įv.</TableHead>
                    <TableHead className="w-[60px] text-center">Tsk.</TableHead>
                    <TableHead className="w-[100px] text-center">Veiksmai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentStandings.length > 0 ? (
                    currentStandings.map((row) => (
                      <TableRow key={row.fingerprint}>
                        <TableCell className="font-medium">{row.position}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          {row.logo && (
                            <img 
                              src={row.logo} 
                              alt="logo" 
                              className="w-6 h-6 rounded object-contain"
                            />
                          )}
                          <span className="truncate">{row.team_name}</span>
                        </TableCell>
                        <TableCell className="text-center">{row.played}</TableCell>
                        <TableCell className="text-center">{row.won}</TableCell>
                        <TableCell className="text-center">{row.drawn}</TableCell>
                        <TableCell className="text-center">{row.lost}</TableCell>
                        <TableCell className="text-center">{row.scored}</TableCell>
                        <TableCell className="text-center font-bold">{row.points}</TableCell>
                        <TableCell className="text-center">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openEditModal(row)}
                          >
                            Redaguoti
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Nėra duomenų šiai lygai
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Redaguoti poziciją</DialogTitle>
          </DialogHeader>
          {editRow && (
            <form
              onSubmit={e => {
                e.preventDefault()
                handleSave()
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Komandos pavadinimas</label>
                  <Input 
                    name="team_name" 
                    value={form.team_name ?? ""} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pozicija</label>
                  <Input 
                    name="position" 
                    type="number" 
                    value={form.position ?? ""} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sužaista</label>
                  <Input 
                    name="played" 
                    type="number" 
                    value={form.played ?? ""} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pergalės</label>
                  <Input 
                    name="won" 
                    type="number" 
                    value={form.won ?? ""} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lygiosios</label>
                  <Input 
                    name="drawn" 
                    type="number" 
                    value={form.drawn ?? ""} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pralaimėjimai</label>
                  <Input 
                    name="lost" 
                    type="number" 
                    value={form.lost ?? ""} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Įvarčiai už</label>
                  <Input 
                    name="scored" 
                    type="number" 
                    value={form.scored ?? ""} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Įvarčiai prieš</label>
                  <Input 
                    name="conceded" 
                    type="number" 
                    value={form.conceded ?? ""} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Taškai</label>
                  <Input 
                    name="points" 
                    type="number" 
                    value={form.points ?? ""} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Atšaukti
                </Button>
                <Button type="submit">
                  Išsaugoti
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 