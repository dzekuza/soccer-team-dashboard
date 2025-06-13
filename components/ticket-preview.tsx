"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QrCode, Download, MapPin, Calendar, Clock } from "lucide-react"
import type { TicketWithDetails } from "@/lib/types"

interface TicketPreviewProps {
  ticket: TicketWithDetails
  onDownload?: () => void
}

export function TicketPreview({ ticket, onDownload }: TicketPreviewProps) {
  return (
    <Card className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200">
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-white">
            SOCCER TICKET
          </Badge>
          <Badge variant={ticket.isValidated ? "default" : "secondary"}>
            {ticket.isValidated ? "VALIDATED" : "VALID"}
          </Badge>
        </div>
        <CardTitle className="text-xl font-bold text-blue-900">{ticket.event.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Event Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span>{ticket.event.date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>{ticket.event.time}</span>
          </div>
          <div className="flex items-center space-x-2 col-span-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span>{ticket.event.location}</span>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="bg-white rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Tier:</span>
            <span>{ticket.tier.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Price:</span>
            <span className="font-bold text-green-600">${ticket.tier.price}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Purchaser:</span>
            <span>{ticket.purchaserName}</span>
          </div>
        </div>

        {/* QR Code Placeholder */}
        <div className="flex items-center justify-center bg-white rounded-lg p-4">
          <div className="text-center">
            <QrCode className="h-16 w-16 mx-auto text-gray-400" />
            <p className="text-xs text-gray-500 mt-2">QR Code</p>
            <p className="text-xs text-gray-400">{ticket.id.slice(-8)}</p>
          </div>
        </div>

        {/* Actions */}
        {onDownload && (
          <Button onClick={onDownload} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 border-t pt-2">
          <p>Ticket ID: {ticket.id}</p>
          <p>Generated: {new Date(ticket.createdAt).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
