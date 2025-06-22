"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateTicketDialog } from "@/components/create-ticket-dialog"
import type { TicketWithDetails } from "@/lib/types"
import { Download, Plus, Mail, MoreHorizontal } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketWithDetails[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [eventNameFilter, setEventNameFilter] = useState("")
  const [scanStatus, setScanStatus] = useState<"all" | "scanned" | "not_scanned">("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          id, event_id, tier_id, purchaser_name, purchaser_email, is_validated, created_at,
          events(*),
          pricing_tiers(*)
        `)
        .order("created_at", { ascending: false })
      if (error) throw error
      // Map data to TicketWithDetails type
      const mapped = (data || [])
        .map((t: any) => ({
          id: t.id,
          eventId: t.event_id,
          tierId: t.tier_id,
          purchaserName: t.purchaser_name,
          purchaserEmail: t.purchaser_email,
          isValidated: t.is_validated,
          createdAt: t.created_at,
          validatedAt: t.validated_at ?? null,
          qrCodeUrl: t.qr_code_url ?? '',
          userId: t.user_id ?? undefined,
          event: t.events ? {
            id: t.events.id,
            title: t.events.title,
            description: t.events.description,
            date: t.events.date,
            time: t.events.time,
            location: t.events.location,
            createdAt: t.events.created_at,
            updatedAt: t.events.updated_at,
            team1Id: t.events.team1_id,
            team2Id: t.events.team2_id,
            coverImageUrl: t.events.cover_image_url ?? undefined,
          } : undefined,
          tier: t.pricing_tiers ? {
            id: t.pricing_tiers.id,
            eventId: t.pricing_tiers.event_id,
            name: t.pricing_tiers.name,
            price: t.pricing_tiers.price,
            quantity: t.pricing_tiers.quantity,
            soldQuantity: t.pricing_tiers.sold_quantity,
          } : undefined,
        }))
        .filter((t: any) => t.event && t.tier)
      setTickets(mapped as TicketWithDetails[])
    } catch (error) {
      console.error("Failed to fetch tickets:", error)
    }
  }

  const handleTicketCreated = () => {
    fetchTickets()
    setIsCreateDialogOpen(false)
  }

  const handleResendEmail = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/resend`, {
        method: "POST",
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Failed to resend email")
      }
      toast({
        title: "Success",
        description: "Ticket confirmation email has been resent.",
      })
    } catch (error) {
      console.error("Failed to resend email:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadPDF = (ticket: TicketWithDetails) => {
    window.open(`/api/tickets/${ticket.id}/download`, "_blank")
  }

  // Filter tickets by event name and scan status
  const filteredTickets = tickets.filter(ticket => {
    const matchesEvent = ticket.event.title.toLowerCase().includes(eventNameFilter.toLowerCase())
    const matchesScan =
      scanStatus === 'all' ||
      (scanStatus === 'scanned' && ticket.isValidated) ||
      (scanStatus === 'not_scanned' && !ticket.isValidated)
    return matchesEvent && matchesScan
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bilietai</h1>
          <p className="text-gray-600">Tvarkykite ir generuokite renginių bilietus</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Generuoti bilietą
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Filtruoti pagal renginio pavadinimą"
          value={eventNameFilter}
          onChange={e => setEventNameFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full sm:w-64"
        />
        <select
          value={scanStatus}
          onChange={e => setScanStatus(e.target.value as "all" | "scanned" | "not_scanned")}
          className="border border-gray-300 rounded px-3 py-2 w-full sm:w-48"
        >
          <option value="all">Visi bilietai</option>
          <option value="scanned">Tik nuskenuoti</option>
          <option value="not_scanned">Tik nenuskenuoti</option>
        </select>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Renginys</TableHead>
              <TableHead>Pirkėjas</TableHead>
              <TableHead>El. paštas</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Laikas</TableHead>
              <TableHead>Tipas</TableHead>
              <TableHead>Kaina</TableHead>
              <TableHead>Statusas</TableHead>
              <TableHead>Veiksmai</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">Nėra bilietų pagal pasirinktus filtrus</TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.event.title}</TableCell>
                  <TableCell>{ticket.purchaserName}</TableCell>
                  <TableCell>{ticket.purchaserEmail}</TableCell>
                  <TableCell>{ticket.event.date}</TableCell>
                  <TableCell>{ticket.event.time}</TableCell>
                  <TableCell>{ticket.tier.name}</TableCell>
                  <TableCell>{ticket.tier.price} €</TableCell>
                  <TableCell>
                <Badge variant={ticket.isValidated ? "default" : "secondary"}>
                      {ticket.isValidated ? "Patvirtintas" : "Galiojantis"}
                </Badge>
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
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/tickets/${ticket.id}/download`);
                              const data = await response.json();
                              if (data.downloadUrl) {
                                window.open(data.downloadUrl, "_blank");
                              } else {
                                throw new Error(data.error || "Failed to get download link.");
                              }
                            } catch (error) {
                              alert(error instanceof Error ? error.message : "Could not download ticket.");
                            }
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          <span>Atsisiųsti</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResendEmail(ticket.id)}>
                          <Mail className="mr-2 h-4 w-4" />
                          <span>Siųsti iš naujo</span>
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

      <CreateTicketDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTicketCreated={handleTicketCreated}
      />
    </div>
  )
}
