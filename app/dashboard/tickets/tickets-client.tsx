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
import { QRCodeService } from "@/lib/qr-code-service"
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
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isLoadingQR, setIsLoadingQR] = useState(false)
  const [previewQrCodeUrl, setPreviewQrCodeUrl] = useState<string>("")
  const [isLoadingPreviewQR, setIsLoadingPreviewQR] = useState(false)

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
      
      toast({ title: "Success", description: "Ticket deleted successfully." });
      fetchTickets();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    }
  }

  const handleShowQR = async (ticket: TicketWithDetails) => {
    setQrTicket(ticket)
    setIsLoadingQR(true)
    setQrCodeUrl("")
    
    try {
      // Generate QR code using ticket ID for consistency with PDF
      const qrCodeUrl = await QRCodeService.generateLegacyQRCode(ticket.id)
      setQrCodeUrl(qrCodeUrl)
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast({
        title: "Error",
        description: "Failed to generate QR code.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingQR(false)
    }
  }

  const handleShowPreview = async (ticket: TicketWithDetails) => {
    setPreviewTicket(ticket)
    setIsLoadingPreviewQR(true)
    setPreviewQrCodeUrl("")
    
    try {
      // Generate QR code using ticket ID for consistency with PDF
      const qrCodeUrl = await QRCodeService.generateLegacyQRCode(ticket.id)
      setPreviewQrCodeUrl(qrCodeUrl)
    } catch (error) {
      console.error("Error generating QR code for preview:", error)
      // Don't show toast for preview errors, just log them
    } finally {
      setIsLoadingPreviewQR(false)
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesEventName = ticket.event.title.toLowerCase().includes(eventNameFilter.toLowerCase())
    const matchesScanStatus = scanStatus === "all" || 
      (scanStatus === "scanned" && ticket.isValidated) || 
      (scanStatus === "not_scanned" && !ticket.isValidated)
    return matchesEventName && matchesScanStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Input
            placeholder="Filtruoti pagal renginį..."
            value={eventNameFilter}
            onChange={(e) => setEventNameFilter(e.target.value)}
            className="w-full sm:w-64"
          />
          <Select value={scanStatus} onValueChange={(value: "all" | "scanned" | "not_scanned") => setScanStatus(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Visi bilietai</SelectItem>
              <SelectItem value="scanned">Patvirtinti</SelectItem>
              <SelectItem value="not_scanned">Nepatvirtinti</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-[#F15601] hover:bg-[#E04501]">
          <Plus className="h-4 w-4 mr-2" />
          Sukurti bilietą
        </Button>
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Nėra bilietų pagal pasirinktus filtrus
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.purchaserEmail}</TableCell>
                  <TableCell>{ticket.event.date}</TableCell>
                  <TableCell>{ticket.event.time}</TableCell>
                  <TableCell>{ticket.tier.name}</TableCell>
                  <TableCell className="text-red-500 font-semibold">{ticket.tier.price} €</TableCell>
                  <TableCell>
                    <Badge variant={ticket.isValidated ? "default" : "secondary"} className={ticket.isValidated ? "bg-green-500" : "bg-orange-500"}>
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
                          <DropdownMenuItem onClick={() => handleShowPreview(ticket)}>
                            Peržiūrėti
                          </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShowQR(ticket)}>
                          <QrCode className="h-4 w-4 mr-2" />
                          QR kodas
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadPDF(ticket)}>
                          <Download className="h-4 w-4 mr-2" />
                          Atsisiųsti PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResendEmail(ticket.id)}>
                          <Mail className="h-4 w-4 mr-2" />
                          Siųsti el. laišką
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteTicket(ticket.id)} className="text-red-600">
                          Ištrinti
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

      {/* Preview Modal */}
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
              {isLoadingPreviewQR ? (
                <div className="flex flex-col items-center">
                  <div className="w-48 h-48 bg-gray-200 rounded animate-pulse" />
                  <p className="text-sm text-gray-500 mt-2">Generating QR Code...</p>
                </div>
              ) : previewQrCodeUrl ? (
                <img 
                  src={previewQrCodeUrl} 
                  alt="QR Code" 
                  className="w-48 h-48 mx-auto"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center">
                    <QrCode className="h-24 w-24 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">QR Code Unavailable</p>
                </div>
              )}
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
            {isLoadingQR ? (
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 bg-gray-200 rounded animate-pulse" />
                <p className="text-sm text-gray-500 mt-2">Generating QR Code...</p>
              </div>
            ) : qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-48 h-48 mx-auto"
              />
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center">
                  <QrCode className="h-24 w-24 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mt-2">QR Code Unavailable</p>
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2 text-center">{qrTicket.id}</div>
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
                  <Button size="sm" variant="outline" onClick={() => handleShowPreview(ticket)}>
                    Peržiūrėti
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleShowQR(ticket)}>
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