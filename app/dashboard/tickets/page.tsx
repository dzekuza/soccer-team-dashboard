"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateTicketDialog } from "@/components/create-ticket-dialog"
import type { TicketWithDetails } from "@/lib/types"
import { Download, Plus } from "lucide-react"
import { supabaseService } from "@/lib/supabase-service"

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketWithDetails[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const detailedTickets = await supabaseService.getTicketsWithDetails()
      setTickets(detailedTickets)
    } catch (error) {
      console.error("Failed to fetch tickets:", error)
    }
  }

  const handleTicketCreated = () => {
    fetchTickets()
    setIsCreateDialogOpen(false)
  }

  const handleDownloadPDF = async (ticket: TicketWithDetails) => {
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/pdf`)
      if (!res.ok) throw new Error("Failed to generate PDF")
      const pdfBlob = await res.blob()
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ticket-${ticket.id}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to generate PDF:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>
          <p className="text-gray-600">Manage and generate event tickets</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Ticket
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{ticket.event.title}</CardTitle>
                <Badge variant={ticket.isValidated ? "default" : "secondary"}>
                  {ticket.isValidated ? "Validated" : "Valid"}
                </Badge>
              </div>
              <CardDescription>
                {ticket.tier.name} - ${ticket.tier.price}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Purchaser:</span> {ticket.purchaserName}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {ticket.purchaserEmail}
                </p>
                <p>
                  <span className="font-medium">Date:</span> {ticket.event.date}
                </p>
                <p>
                  <span className="font-medium">Time:</span> {ticket.event.time}
                </p>
              </div>
              <Button onClick={() => handleDownloadPDF(ticket)} variant="outline" size="sm" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateTicketDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTicketCreated={handleTicketCreated}
      />
    </div>
  )
}
