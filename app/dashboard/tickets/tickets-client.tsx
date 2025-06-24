"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateTicketDialog } from "@/components/create-ticket-dialog"
import type { TicketWithDetails } from "@/lib/types"
import { Download, Plus, Mail, MoreHorizontal, QrCode } from "lucide-react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { TicketPreview } from "@/components/ticket-preview"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface TicketsClientProps {
    initialTickets: TicketWithDetails[];
}

export function TicketsClient({ initialTickets }: TicketsClientProps) {
  const [tickets, setTickets] = useState<TicketWithDetails[]>(initialTickets)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [eventNameFilter, setEventNameFilter] = useState("")
  const [scanStatus, setScanStatus] = useState<"all" | "scanned" | "not_scanned">("all")
  const { toast } = useToast()
  const [previewTicket, setPreviewTicket] = useState<TicketWithDetails | null>(null)
  const [qrTicket, setQrTicket] = useState<TicketWithDetails | null>(null)

  async function fetchTickets() {
    try {
      const response = await fetch('/api/tickets');
      if (!response.ok) throw new Error("Failed to fetch tickets");
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error)
      toast({ title: "Klaida", description: "Nepavyko atnaujinti bilietų sąrašo.", variant: "destructive" });
    }
  }

  const handleTicketCreated = () => {
    fetchTickets()
    setIsCreateDialogOpen(false)
  }

  const handleResendEmail = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/resend`, { method: "POST" })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Failed to resend email")
      toast({ title: "Success", description: "Ticket confirmation email has been resent." })
    } catch (error) {
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

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Filtruoti pagal renginio pavadinimą"
          value={eventNameFilter}
          onChange={e => setEventNameFilter(e.target.value)}
          className="w-full sm:w-64 h-12 rounded-[16px] border border-[#5F5F71] bg-[#0A2065] px-5 py-3 text-base text-white placeholder:text-[#B6C1E2] focus:border-[#F15601] focus:bg-[#0A2065] outline-none transition-all"
        />
        <select
          value={scanStatus}
          onChange={e => setScanStatus(e.target.value as "all" | "scanned" | "not_scanned")}
          className="w-full sm:w-48 h-12 rounded-[16px] border border-[#5F5F71] bg-[#0A2065] px-5 py-3 text-base text-white focus:border-[#F15601] focus:bg-[#0A2065] outline-none transition-all"
        >
          <option value="all">Visi bilietai</option>
          <option value="scanned">Tik nuskenuoti</option>
          <option value="not_scanned">Tik nenuskenuoti</option>
        </select>
      </div>

      <div className="hidden md:block bg-card text-card-foreground rounded shadow overflow-x-auto">
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
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nėra bilietų pagal pasirinktus filtrus</TableCell>
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
                    <Badge variant={ticket.isValidated ? "default" : "success"}>
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
                        <DropdownMenuItem onClick={() => setPreviewTicket(ticket)}>
                          <span>Peržiūrėti</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setQrTicket(ticket)}>
                          <QrCode className="mr-2 h-4 w-4" />
                          <span>Peržiūrėti QR</span>
                        </DropdownMenuItem>
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

      {/* Ticket Preview Modal */}
      <Dialog open={!!previewTicket} onOpenChange={() => setPreviewTicket(null)}>
        <DialogContent className="max-w-lg">
          {previewTicket && <TicketPreview ticket={previewTicket} onDownload={() => handleDownloadPDF(previewTicket)} />}
        </DialogContent>
      </Dialog>
      {/* QR Code Modal */}
      <Dialog open={!!qrTicket} onOpenChange={() => setQrTicket(null)}>
        <DialogContent className="flex flex-col items-center max-w-xs">
          {qrTicket && (
            <>
              <h2 className="text-lg font-bold mb-2">QR kodas</h2>
              <img src={qrTicket.qrCodeUrl} alt="QR code" className="w-48 h-48 mx-auto" />
              <div className="text-xs text-gray-500 mt-2">{qrTicket.id}</div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="md:hidden space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Nėra bilietų pagal pasirinktus filtrus</div>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>{ticket.event.title}</CardTitle>
                <CardDescription>{ticket.purchaserName} - {ticket.purchaserEmail}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Data:</span>
                  <span>{ticket.event.date} {ticket.event.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tipas:</span>
                  <span>{ticket.tier.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Kaina:</span>
                  <span>{ticket.tier.price} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Statusas:</span>
                  <span>{ticket.isValidated ? "Patvirtintas" : "Galiojantis"}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => setPreviewTicket(ticket)}>
                    Peržiūrėti
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setQrTicket(ticket)}>
                    <QrCode className="h-4 w-4 mr-1" /> QR
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(ticket)}>
                    <Download className="h-4 w-4 mr-1" /> PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreateTicketDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTicketCreated={handleTicketCreated}
      />
    </div>
  )
} 