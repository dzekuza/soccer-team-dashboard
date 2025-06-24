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
    <div className="max-w-md mx-auto bg-[#0A165B] rounded-2xl p-4 shadow-xl">
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 w-24 bg-gray-100 rounded-full" />
          <Badge variant="default" className="bg-[#F15601] text-white font-bold px-4 py-1 rounded-full text-xs">
            {ticket.isValidated ? "VALID" : "VALID"}
          </Badge>
        </div>
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-[#0A165B]">{ticket.event.title}</h2>
        </div>
        <div className="flex items-center justify-center gap-4 text-[#0A165B] mb-2">
          <div className="flex items-center gap-1 text-base">
            <Calendar className="h-5 w-5" />
            <span>{ticket.event.date}</span>
          </div>
          <div className="flex items-center gap-1 text-base">
            <Clock className="h-5 w-5" />
            <span>{ticket.event.time}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 text-[#0A165B] mb-4">
          <MapPin className="h-5 w-5" />
          <span>{ticket.event.location}</span>
        </div>
        <div className="bg-[#F6F8FF] rounded-xl p-4 mb-4 flex justify-end">
          <span className="text-green-600 text-xl font-bold">${ticket.tier.price}</span>
        </div>
        <div className="bg-[#F6F8FF] rounded-xl p-4 mb-4 flex flex-col items-center">
          <QrCode className="h-16 w-16 text-gray-400" />
          <p className="text-xs text-gray-500 mt-2">QR Code</p>
          <p className="text-xs text-gray-400">{ticket.id.slice(-8)}</p>
        </div>
        {onDownload && (
          <Button onClick={onDownload} className="w-full btn-main rounded-lg text-lg font-semibold py-3 mt-2">
            <Download className="h-5 w-5 mr-2" />
            Download PDF
          </Button>
        )}
        <div className="text-center text-xs text-gray-500 border-t pt-2 mt-4">
          <p>Ticket ID: {ticket.id}</p>
          <p>Generated: {new Date(ticket.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}
