"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QrCode, Download, MapPin, Calendar, Clock } from "lucide-react"
import type { TicketWithDetails } from "@/lib/types"
import { QRCodeCanvas } from 'qrcode.react'

interface TicketPreviewProps {
  ticket: TicketWithDetails
  onDownload?: () => void
}

export function TicketPreview({ ticket, onDownload }: TicketPreviewProps) {
  return (
    <div className="bg-[#0A165B] rounded-2xl p-6 shadow-md relative">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-24 bg-[#0A2065] rounded-full" />
        <Badge variant="default" className="bg-[#F15601] text-white font-bold px-4 py-1 rounded-full text-xs">
          {ticket.isValidated ? "VALID" : "VALID"}
        </Badge>
      </div>
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white">{ticket.event.title}</h2>
      </div>
      <div className="flex items-center justify-center gap-4 text-white mb-2">
        <div className="flex items-center gap-1 text-base">
          <Calendar className="h-5 w-5" />
          <span>{ticket.event.date}</span>
        </div>
        <div className="flex items-center gap-1 text-base">
          <Clock className="h-5 w-5" />
          <span>{ticket.event.time}</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 text-white mb-4">
        <MapPin className="h-5 w-5" />
        <span>{ticket.event.location}</span>
      </div>
      <div className="bg-[#0A2065] rounded-xl p-4 mb-4 flex justify-end">
        <span className="text-[#F15601] text-xl font-bold">{ticket.tier.price} €</span>
      </div>
      <div className="bg-[#0A2065] rounded-xl p-4 mb-4 flex flex-col items-center">
        <QRCodeCanvas 
          value={ticket.id} 
          size={128} 
          className="mx-auto"
          level="M"
          includeMargin={true}
        />
        <p className="text-xs text-gray-300 mt-2">QR Code</p>
        <p className="text-xs text-gray-400">{ticket.id.slice(-8)}</p>
      </div>
      {onDownload && (
        <Button onClick={onDownload} className="w-full bg-[#F15601] hover:bg-[#E04501] text-white rounded-lg text-lg font-semibold py-3 mt-2">
          <Download className="h-5 w-5 mr-2" />
          Download PDF
        </Button>
      )}
      <div className="text-center text-xs text-gray-300 border-t border-[#0A2065] pt-2 mt-4">
        <p>Ticket ID: {ticket.id}</p>
        <p>Generated: {new Date(ticket.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  )
}
