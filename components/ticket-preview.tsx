"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QrCode, Download, MapPin, Calendar, Clock } from "lucide-react"
import type { TicketWithDetails } from "@/lib/types"
import { QRCodeService } from "@/lib/qr-code-service"
import { useEffect, useState } from "react"

interface TicketPreviewProps {
  ticket: TicketWithDetails
  onDownload?: () => void
}

export function TicketPreview({ ticket, onDownload }: TicketPreviewProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isLoadingQR, setIsLoadingQR] = useState(true)

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setIsLoadingQR(true)
        // Use the enhanced QR code service to generate the same QR code as the PDF
        const enhancedQRCodeUrl = await QRCodeService.updateTicketQRCode(ticket)
        setQrCodeUrl(enhancedQRCodeUrl)
      } catch (error) {
        console.error("Error generating QR code for preview:", error)
        // Fallback to simple QR code if enhanced generation fails
        setQrCodeUrl("")
      } finally {
        setIsLoadingQR(false)
      }
    }

    generateQRCode()
  }, [ticket])

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
        {isLoadingQR ? (
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-gray-600 rounded animate-pulse" />
            <p className="text-xs text-gray-300 mt-2">Generating QR Code...</p>
          </div>
        ) : qrCodeUrl ? (
          <>
            <img 
              src={qrCodeUrl} 
              alt="QR Code" 
              className="w-32 h-32 mx-auto"
            />
            <p className="text-xs text-gray-300 mt-2">Enhanced QR Code</p>
            <p className="text-xs text-gray-400">{ticket.id.slice(-8)}</p>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-gray-600 rounded flex items-center justify-center">
              <QrCode className="h-16 w-16 text-gray-400" />
            </div>
            <p className="text-xs text-gray-300 mt-2">QR Code Unavailable</p>
          </div>
        )}
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
