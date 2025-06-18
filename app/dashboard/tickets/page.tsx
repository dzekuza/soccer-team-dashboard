"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateTicketDialog } from "@/components/create-ticket-dialog"
import type { TicketWithDetails } from "@/lib/types"
import { Download, Plus, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { generateTicketPDF, uint8ArrayToPdfBlob } from "@/lib/pdf-generator"
import { useToast } from "@/components/ui/use-toast"

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketWithDetails[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [eventNameFilter, setEventNameFilter] = useState("")
  const [scanStatus, setScanStatus] = useState<'all' | 'scanned' | 'not_scanned'>('all')
  const [resendingId, setResendingId] = useState<string | null>(null)
  const { toast } = useToast()

  const SUPABASE_PUBLIC_URL = "https://phvjdfqxzitzohiskwwo.supabase.co/storage/v1/object/public/ticket-pdfs";
  const SUPABASE_PDF_BASE_URL = "https://phvjdfqxzitzohiskwwo.supabase.co/storage/v1/object/public/ticket-pdfs//";
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

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
          event_id: t.event_id,
          tier_id: t.tier_id,
          purchaser_name: t.purchaser_name,
          purchaser_email: t.purchaser_email,
          is_validated: t.is_validated,
          created_at: t.created_at,
          validated_at: t.validated_at ?? null,
          qr_code_url: t.qr_code_url ?? '',
          event_cover_image_url: t.event_cover_image_url ?? undefined,
          event_date: t.event_date ?? undefined,
          event_title: t.event_title ?? undefined,
          event_description: t.event_description ?? undefined,
          event_location: t.event_location ?? undefined,
          event_time: t.event_time ?? undefined,
          team1_id: t.team1_id ?? undefined,
          team2_id: t.team2_id ?? undefined,
          pdf_url: t.pdf_url ?? undefined,
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

  const uploadPdfToSupabase = async (ticketId: string, pdfBlob: Blob): Promise<string | null> => {
    const fileName = `ticket-${ticketId}.pdf`;
    const { data, error } = await supabase.storage.from('ticket-pdfs').upload(fileName, pdfBlob, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'application/pdf',
    });
    if (error) {
      console.error('Failed to upload PDF:', error);
      return null;
    }
    return data?.path || null;
  };

  const updateTicketPdfUrl = async (ticketId: string, pdfUrl: string) => {
    const { error } = await supabase.from('tickets').update({ pdf_url: pdfUrl }).eq('id', ticketId);
    if (error) {
      console.error('Failed to update ticket pdf_url:', error);
    }
  };

  const handleDownloadPDF = async (ticketId: string) => {
    // Always fetch the latest ticket details from Supabase
    const { supabaseService } = await import("@/lib/supabase-service");
    const ticket = await supabaseService.getTicketById(ticketId);
    if (!ticket) {
      alert('Nepavyko rasti bilieto duomenų.');
      return;
    }
    let pdfUrl = ticket.pdf_url;
    let team1 = undefined;
    let team2 = undefined;
    if (ticket.team1_id) {
      const t1 = await supabaseService.getTeamById(ticket.team1_id);
      if (!t1) {
        console.warn(`Team 1 not found for id: ${ticket.team1_id}`);
        alert('Įspėjimas: Nerasta komanda 1. Patikrinkite duomenų bazę.');
        team1 = undefined;
      } else {
        team1 = t1;
      }
    }
    if (ticket.team2_id) {
      const t2 = await supabaseService.getTeamById(ticket.team2_id);
      if (!t2) {
        console.warn(`Team 2 not found for id: ${ticket.team2_id}`);
        alert('Įspėjimas: Nerasta komanda 2. Patikrinkite duomenų bazę.');
        team2 = undefined;
      } else {
        team2 = t2;
      }
    }
    // Ensure qr_code_url is set
    const qrCodeUrl = ticket.qr_code_url && ticket.qr_code_url.trim() !== '' ? ticket.qr_code_url : `/api/validate-ticket/${ticket.id}`;
    const ticketForPdf = { ...ticket, qr_code_url: qrCodeUrl };
    if (!pdfUrl || typeof pdfUrl !== 'string' || pdfUrl.trim() === '') {
      // 1. Generate PDF
      const pdfBytes = await generateTicketPDF(ticketForPdf, team1, team2);
      const pdfBlob = uint8ArrayToPdfBlob(pdfBytes);
      // 2. Upload to Supabase
      const uploadedPath = await uploadPdfToSupabase(ticket.id, pdfBlob);
      if (!uploadedPath) {
        alert('Nepavyko įkelti PDF į serverį.');
        return;
      }
      // 3. Update ticket record
      await updateTicketPdfUrl(ticket.id, uploadedPath);
      pdfUrl = SUPABASE_PDF_BASE_URL + uploadedPath;
    }
    // 4. Download PDF
    try {
      const res = await fetch(pdfUrl);
      if (!res.ok) throw new Error('PDF not found');
      const blob = await res.blob();
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
    } catch (e) {
      alert('Nepavyko atsisiųsti PDF.');
    }
  };

  const handleResend = async (ticketId: string) => {
    setResendingId(ticketId)
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_id: ticketId }),
      })
      if (res.ok) {
        toast({ title: "Bilietas išsiųstas pakartotinai", description: "El. laiškas su PDF bilietu išsiųstas pirkėjui." })
      } else {
        const data = await res.json()
        toast({ title: "Klaida siunčiant bilietą", description: data.error || "Nepavyko išsiųsti bilieto el. paštu.", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Klaida siunčiant bilietą", description: "Nepavyko išsiųsti bilieto el. paštu.", variant: "destructive" })
    } finally {
      setResendingId(null)
    }
  }

  // Filter tickets by event name and scan status
  const filteredTickets = tickets.filter(ticket => {
    const matchesEvent = ticket.event.title.toLowerCase().includes(eventNameFilter.toLowerCase())
    const matchesScan =
      scanStatus === 'all' ||
      (scanStatus === 'scanned' && ticket.is_validated) ||
      (scanStatus === 'not_scanned' && !ticket.is_validated)
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
              <TableHead>ID</TableHead>
              <TableHead>Renginys</TableHead>
              <TableHead>Pirkėjas</TableHead>
              <TableHead>Statusas</TableHead>
              <TableHead>Veiksmai</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">Nėra bilietų pagal pasirinktus filtrus</TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>{ticket.event.title}</TableCell>
                  <TableCell>{ticket.purchaser_name}</TableCell>
                  <TableCell>
                    <Badge variant={ticket.is_validated ? "default" : "secondary"}>
                      {ticket.is_validated ? "Patvirtintas" : "Galiojantis"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleDownloadPDF(ticket.id)} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button onClick={() => handleResend(ticket.id)} variant="outline" size="sm" className="ml-2" disabled={resendingId === ticket.id}>
                      <RefreshCw className={"h-4 w-4 mr-2 animate-spin" + (resendingId === ticket.id ? "" : " hidden")} />
                      {resendingId === ticket.id ? "Siunčiama..." : "Persiųsti"}
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
