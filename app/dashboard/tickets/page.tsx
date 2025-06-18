"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateTicketDialog } from "@/components/create-ticket-dialog"
import type { TicketWithDetails } from "@/lib/types"
import { Download, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { generateTicketPDF, uint8ArrayToPdfBlob } from "@/lib/pdf-generator"

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketWithDetails[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [eventNameFilter, setEventNameFilter] = useState("")
  const [scanStatus, setScanStatus] = useState<'all' | 'scanned' | 'not_scanned'>('all')

  const SUPABASE_PUBLIC_URL = "https://ebdfqztiximsqdnvwkqu.supabase.co/storage/v1/object/public/ticket-pdfs";

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          id, event_id, tier_id, purchaser_name, purchaser_email, is_validated, created_at,
          event:events(*),
          tier:pricing_tiers(*)
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
          event: t.event ? {
            id: t.event.id,
            title: t.event.title,
            description: t.event.description,
            date: t.event.date,
            time: t.event.time,
            location: t.event.location,
            createdAt: t.event.created_at,
            updatedAt: t.event.updated_at,
            team1Id: t.event.team1_id,
            team2Id: t.event.team2_id,
            coverImageUrl: t.event.cover_image_url ?? undefined,
          } : undefined,
          tier: t.tier ? {
            id: t.tier.id,
            eventId: t.tier.event_id,
            name: t.tier.name,
            price: t.tier.price,
            maxQuantity: t.tier.max_quantity,
            soldQuantity: t.tier.sold_quantity,
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

  const handleDownloadPDF = async (ticket: TicketWithDetails) => {
    // Defensive check for qrCodeUrl
    if (!ticket.qrCodeUrl || typeof ticket.qrCodeUrl !== 'string' || ticket.qrCodeUrl.trim() === '') {
      alert('Šio bilieto QR kodas nerastas. Negalima sugeneruoti PDF.');
      return;
    }
    // Fetch team1 and team2 info if available
    let team1 = undefined;
    let team2 = undefined;
    try {
      if (ticket.event.team1Id) {
        const { data } = await supabase.from("teams").select("id, team_name, logo").eq("id", ticket.event.team1Id).single();
        if (data) team1 = data;
      }
      if (ticket.event.team2Id) {
        const { data } = await supabase.from("teams").select("id, team_name, logo").eq("id", ticket.event.team2Id).single();
        if (data) team2 = data;
      }
    } catch (e) {
      // fallback: ignore team info if fetch fails
    }
    const pdfBytes = await generateTicketPDF(ticket, team1, team2);
    const blob = uint8ArrayToPdfBlob(pdfBytes);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${ticket.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

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
          onChange={e => setScanStatus(e.target.value as 'all' | 'scanned' | 'not_scanned')}
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
                    <Button onClick={() => handleDownloadPDF(ticket)} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                      PDF
              </Button>
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
