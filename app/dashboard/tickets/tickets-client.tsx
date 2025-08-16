"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateTicketDialog } from "@/components/create-ticket-dialog"
import type { TicketWithDetails } from "@/lib/types"
import { Download, Plus, Mail, MoreHorizontal, QrCode, Calendar, Clock, MapPin, X, Search } from "lucide-react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { QRCodeCanvas } from 'qrcode.react'
import { useToast } from "@/components/ui/use-toast"
import { createPortal } from 'react-dom'

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

  const handleDownloadPDF = async (ticket: TicketWithDetails) => {
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/download`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to download ticket.");
      }
      
      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
        : `ticket-${ticket.id}.pdf`;
      
      // Create a blob and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not download ticket.");
    }
  }

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Ar tikrai norite ištrinti šį bilietą? Šio veiksmo atšaukti negalėsite.")) {
      return;
    }

    try {
      const response = await fetch(`/api/tickets/${ticketId}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete ticket.");
      }
      
      toast({ title: "Sėkmė", description: "Bilietas sėkmingai ištrintas." });
      fetchTickets(); // Refresh the list
    } catch (error) {
      toast({
        title: "Klaida",
        description: error instanceof Error ? error.message : "Nepavyko ištrinti bilieto.",
        variant: "destructive",
      });
    }
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
          <h1 className="text-3xl font-bold text-white">Bilietai</h1>
          <p className="text-gray-300">Tvarkykite ir generuokite renginių bilietus</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-[#F15601] hover:bg-[#E04501] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Generuoti bilietą
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Filtruoti pagal renginio pavadinimą"
            value={eventNameFilter}
            onChange={e => setEventNameFilter(e.target.value)}
            className="pl-10 bg-white/10 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#F15601] focus:ring-[#F15601] focus:ring-1"
          />
        </div>
        <Select value={scanStatus} onValueChange={(value) => setScanStatus(value as "all" | "scanned" | "not_scanned")}>
          <SelectTrigger className="w-full sm:w-48 bg-white/10 border-gray-600 text-white focus:border-[#F15601] focus:ring-[#F15601] focus:ring-1">
            <SelectValue placeholder="Filtruoti bilietus" />
          </SelectTrigger>
          <SelectContent className="bg-[#0A165B] border-gray-600">
            <SelectItem value="all" className="text-white hover:bg-[#0A2065] focus:bg-[#0A2065]">Visi bilietai</SelectItem>
            <SelectItem value="scanned" className="text-white hover:bg-[#0A2065] focus:bg-[#0A2065]">Tik nuskenuoti</SelectItem>
            <SelectItem value="not_scanned" className="text-white hover:bg-[#0A2065] focus:bg-[#0A2065]">Tik nenuskenuoti</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden md:block bg-[#0A165B]/50 border border-gray-700 rounded-lg shadow-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700 hover:bg-[#0A2065]/50">
              <TableHead className="text-gray-300 font-medium">Renginys</TableHead>
              <TableHead className="text-gray-300 font-medium">Pirkėjas</TableHead>
              <TableHead className="text-gray-300 font-medium">El. paštas</TableHead>
              <TableHead className="text-gray-300 font-medium">Data</TableHead>
              <TableHead className="text-gray-300 font-medium">Laikas</TableHead>
              <TableHead className="text-gray-300 font-medium">Tipas</TableHead>
              <TableHead className="text-gray-300 font-medium">Kaina</TableHead>
              <TableHead className="text-gray-300 font-medium">Statusas</TableHead>
              <TableHead className="text-gray-300 font-medium">Veiksmai</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-400">Nėra bilietų pagal pasirinktus filtrus</TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket.id} className="border-gray-700 hover:bg-[#0A2065]/30 transition-colors">
                  <TableCell className="text-white font-medium">{ticket.event.title}</TableCell>
                  <TableCell className="text-white">{ticket.purchaserName}</TableCell>
                  <TableCell className="text-gray-300">{ticket.purchaserEmail}</TableCell>
                  <TableCell className="text-white">{ticket.event.date}</TableCell>
                  <TableCell className="text-white">{ticket.event.time}</TableCell>
                  <TableCell className="text-gray-300">{ticket.tier.name}</TableCell>
                  <TableCell className="text-[#F15601] font-semibold">{ticket.tier.price} €</TableCell>
                  <TableCell>
                    <Badge 
                      variant={ticket.isValidated ? "default" : "secondary"}
                      className={ticket.isValidated ? "bg-green-600 text-white" : "bg-[#F15601] text-white"}
                    >
                      {ticket.isValidated ? "Patvirtintas" : "Galiojantis"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-[#0A2065]/50">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#0A165B] border-gray-600">
                        <DropdownMenuItem onClick={() => setPreviewTicket(ticket)} className="text-white hover:bg-[#0A2065] focus:bg-[#0A2065]">
                          <span>Peržiūrėti</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setQrTicket(ticket)} className="text-white hover:bg-[#0A2065] focus:bg-[#0A2065]">
                          <QrCode className="mr-2 h-4 w-4" />
                          <span>Peržiūrėti QR</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/tickets/${ticket.id}/download`);
                              if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(errorData.error || "Failed to download ticket.");
                              }
                              
                              // Get the filename from the Content-Disposition header
                              const contentDisposition = response.headers.get('Content-Disposition');
                              const filename = contentDisposition 
                                ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
                                : `ticket-${ticket.id}.pdf`;
                              
                              // Create a blob and download it
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = filename;
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                            } catch (error) {
                              alert(error instanceof Error ? error.message : "Could not download ticket.");
                            }
                          }}
                          className="text-white hover:bg-[#0A2065] focus:bg-[#0A2065]"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          <span>Atsisiųsti</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResendEmail(ticket.id)} className="text-white hover:bg-[#0A2065] focus:bg-[#0A2065]">
                          <Mail className="mr-2 h-4 w-4" />
                          <span>Siųsti iš naujo</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteTicket(ticket.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20 focus:bg-red-900/20">
                          <X className="mr-2 h-4 w-4" />
                          <span>Ištrinti</span>
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
      {previewTicket && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setPreviewTicket(null);
            }
          }}
        >
          <div className="bg-[#0A165B] rounded-2xl p-6 shadow-md relative max-w-md w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 w-24 bg-[#0A2065] rounded-full" />
              <Badge variant="default" className="bg-[#F15601] text-white font-bold px-4 py-1 rounded-full text-xs">
                {previewTicket.isValidated ? "VALID" : "VALID"}
              </Badge>
            </div>
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-white">{previewTicket.event.title}</h2>
            </div>
            <div className="flex items-center justify-center gap-4 text-white mb-2">
              <div className="flex items-center gap-1 text-base">
                <Calendar className="h-5 w-5" />
                <span>{previewTicket.event.date}</span>
              </div>
              <div className="flex items-center gap-1 text-base">
                <Clock className="h-5 w-5" />
                <span>{previewTicket.event.time}</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-white mb-4">
              <MapPin className="h-5 w-5" />
              <span>{previewTicket.event.location}</span>
            </div>
            <div className="bg-[#0A2065] rounded-xl p-4 mb-4 flex justify-end">
              <span className="text-[#F15601] text-xl font-bold">{previewTicket.tier.price} €</span>
            </div>
            <div className="bg-[#0A2065] rounded-xl p-4 mb-4 flex flex-col items-center">
              <QRCodeCanvas 
                value={previewTicket.id} 
                size={128} 
                className="mx-auto"
                level="M"
                includeMargin={true}
              />
              <p className="text-xs text-gray-300 mt-2">QR Code</p>
              <p className="text-xs text-gray-400">{previewTicket.id.slice(-8)}</p>
            </div>
            <Button onClick={() => handleDownloadPDF(previewTicket)} className="w-full bg-[#F15601] hover:bg-[#E04501] text-white rounded-lg text-lg font-semibold py-3 mt-2">
              <Download className="h-5 w-5 mr-2" />
              Download PDF
            </Button>
            <div className="text-center text-xs text-gray-300 border-t border-[#0A2065] pt-2 mt-4">
              <p>Ticket ID: {previewTicket.id}</p>
              <p>Generated: {new Date(previewTicket.createdAt).toLocaleDateString()}</p>
            </div>
            <button onClick={() => setPreviewTicket(null)} className="absolute top-4 right-4 text-white hover:text-gray-300">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>,
        document.body
      )}
      {/* QR Code Modal */}
      {qrTicket && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setQrTicket(null);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-xs w-full">
            <h2 className="text-lg font-bold mb-2 text-[#0A165B]">QR kodas</h2>
            <QRCodeCanvas value={qrTicket.qrCodeUrl ?? qrTicket.id} size={192} className="mx-auto" />
            <div className="text-xs text-gray-500 mt-2">{qrTicket.id}</div>
            <button onClick={() => setQrTicket(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>,
        document.body
      )}

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