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
import { dbService } from "@/lib/db-service"

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketWithDetails[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [eventNameFilter, setEventNameFilter] = useState("")
  const [scanStatus, setScanStatus] = useState<'all' | 'scanned' | 'not_scanned'>('all')
  const [resendingId, setResendingId] = useState<string | null>(null)
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const SUPABASE_PUBLIC_URL = "https://phvjdfqxzitzohiskwwo.supabase.co/storage/v1/object/public/ticket-pdfs";
  const SUPABASE_PDF_BASE_URL = "https://phvjdfqxzitzohiskwwo.supabase.co/storage/v1/object/public/ticket-pdfs//";
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          *,
          events (*),
          pricing_tiers (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(tickets as TicketWithDetails[]);
    } catch (error) {
      console.error("Failed to fetch tickets:", error)
      setError("Nepavyko įkelti bilietų. Bandykite dar kartą vėliau.")
    } finally {
      setIsLoading(false)
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
    // Always fetch the latest ticket details
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        events (*),
        pricing_tiers (*)
      `)
      .eq('id', ticketId)
      .single();

    if (error || !ticket) {
      alert('Nepavyko rasti bilieto duomenų.');
      console.error(error)
      return;
    }

    if (!ticket.events || !ticket.pricing_tiers) {
      alert("Nepavyko sugeneruoti PDF: bilietui trūksta renginio arba kainos lygio informacijos. Tikėtina, kad susijęs renginys buvo ištrintas.");
      console.error("Missing event or pricing tier data for ticket:", ticket.id);
      return;
    }

    let team1 = undefined;
    let team2 = undefined;
    if (ticket.events.team1_id) {
      const t1 = await dbService.getTeamById(ticket.events.team1_id);
      team1 = t1 || undefined;
      if (!team1) {
        console.warn(`Team 1 not found for id: ${ticket.events.team1_id}`);
        alert('Įspėjimas: Nerasta komanda 1. Patikrinkite duomenų bazę.');
      }
    }
    if (ticket.events.team2_id) {
      const t2 = await dbService.getTeamById(ticket.events.team2_id);
      team2 = t2 || undefined;
      if (!team2) {
        console.warn(`Team 2 not found for id: ${ticket.events.team2_id}`);
        alert('Įspėjimas: Nerasta komanda 2. Patikrinkite duomenų bazę.');
      }
    }

    // Ensure qr_code_url is set
    const qrCodeUrl = ticket.qr_code_url && ticket.qr_code_url.trim() !== '' ? ticket.qr_code_url : `/api/validate-ticket/${ticket.id}`;
    const ticketForPdf = { ...ticket, qr_code_url: qrCodeUrl };

    // Generate and upload PDF
    const pdfBytes = await generateTicketPDF(ticketForPdf, team1, team2);
    const pdfBlob = uint8ArrayToPdfBlob(pdfBytes);
    const uploadedPath = await uploadPdfToSupabase(ticket.id, pdfBlob);
    if (!uploadedPath) {
      alert('Nepavyko įkelti PDF į serverį.');
      return;
    }

    // Download PDF
    try {
      const pdfUrl = SUPABASE_PDF_BASE_URL + uploadedPath;
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
    if (!ticket.events) return false; // Guard against tickets with no event data
    const matchesEvent = ticket.events.title.toLowerCase().includes(eventNameFilter.toLowerCase())
    const matchesScan =
      scanStatus === 'all' ||
      (scanStatus === 'scanned' && ticket.status === 'validated') ||
      (scanStatus === 'not_scanned' && ticket.status !== 'validated')
    return matchesEvent && matchesScan
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-semibold">{error}</p>
        <Button onClick={fetchTickets} className="mt-4">Bandyti dar kartą</Button>
      </div>
    )
  }

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
            {filteredTickets.length > 0 ? (
              filteredTickets.map(ticket => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{ticket.events.title}</span>
                      <span className="text-sm text-gray-500">{ticket.pricing_tiers.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{ticket.purchaser_name}</span>
                      <span className="text-sm text-gray-500">{ticket.purchaser_email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ticket.status === 'validated' ? "secondary" : "default"}>
                      {ticket.status === 'validated' ? "Nuskenuotas" : "Nenuskenuotas"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(ticket.id)}>
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResend(ticket.id)}
                        disabled={resendingId === ticket.id}
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${resendingId === ticket.id ? "animate-spin" : ""}`} />
                        Siųsti
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  Bilietų nerasta.
                </TableCell>
              </TableRow>
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
