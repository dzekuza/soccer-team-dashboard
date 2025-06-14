"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QRScanner } from "@/components/qr-scanner"
import type { TicketWithDetails } from "@/lib/types"
import { CheckCircle, XCircle, Camera } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

export default function ScannerPage() {
  const [ticketId, setTicketId] = useState("")
  const [ticket, setTicket] = useState<TicketWithDetails | null>(null)
  const [validationResult, setValidationResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [overlayColor, setOverlayColor] = useState<string | null>(null)
  const overlayTimeout = useRef<NodeJS.Timeout | null>(null)

  const validateTicket = async (id: string) => {
    if (!id) return

    // Clean the ID: remove 'Ticket ID:' prefix and whitespace
    const cleanId = id.replace(/^Ticket ID:\s*/, '').trim();

    setIsLoading(true)
    setValidationResult(null)
    setTicket(null)

    try {
      // First, get ticket details
      const ticketResponse = await fetch(`/api/tickets/${cleanId}`)
      if (!ticketResponse.ok) {
        setValidationResult({ success: false, message: "Ticket not found" })
        return
      }

      const ticketData = await ticketResponse.json()
      setTicket(ticketData)

      // Then validate the ticket
      const validateResponse = await fetch("/api/tickets/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticketId: cleanId }),
      })

      const result = await validateResponse.json()

      if (result.success) {
        setValidationResult({ success: true, message: "Ticket validated successfully!" })
      } else {
        setValidationResult({ success: false, message: "Ticket already validated or invalid" })
      }
    } catch (error) {
      setValidationResult({ success: false, message: "Error validating ticket" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualValidation = (e: React.FormEvent) => {
    e.preventDefault()
    if (ticketId.trim()) {
      // Clean the ID before validation
      const cleanId = ticketId.replace(/^Ticket ID:\s*/, '').trim();
      validateTicket(cleanId)
    }
  }

  const handleScanFeedback = (success: boolean) => {
    setOverlayColor(success ? "green" : "red")
    if (overlayTimeout.current) clearTimeout(overlayTimeout.current)
    overlayTimeout.current = setTimeout(() => setOverlayColor(null), 400)
  }

  const handleQrCodeScanned = (result: string) => {
    setShowScanner(false)

    // Extract ticket ID from URL if it's a URL
    if (result.includes("/api/validate-ticket/")) {
      const ticketId = result.split("/api/validate-ticket/")[1]
      const cleanId = ticketId.replace(/^Ticket ID:\s*/, '').trim();
      setTicketId(cleanId)
      validateTicket(cleanId).then(() => {
        // Show feedback after validation result is set
        setTimeout(() => {
          handleScanFeedback(validationResult?.success ?? false)
        }, 100)
      })
    } else {
      // Try to use the result directly as a ticket ID
      const cleanResult = result.replace(/^Ticket ID:\s*/, '').trim();
      setTicketId(cleanResult)
      validateTicket(cleanResult).then(() => {
        // Show feedback after validation result is set
        setTimeout(() => {
          handleScanFeedback(validationResult?.success ?? false)
        }, 100)
      })
    }
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">QR kodų skaitytuvas</h1>
          <p className="text-gray-600">Skenuokite arba įveskite bilietų ID, kad patvirtintumėte bilietus</p>
        </div>

        {showScanner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            <QRScanner onScan={handleQrCodeScanned} onClose={() => setShowScanner(false)} />
            {overlayColor && (
              <div
                className={`fixed inset-0 z-60 pointer-events-none transition-opacity duration-300 ${
                  overlayColor === "green" ? "bg-green-400/60" : "bg-red-400/60"
                } animate-blink`}
              />
            )}
            <button
              className="absolute top-4 right-4 bg-white text-black rounded px-4 py-2 shadow-lg"
              onClick={() => setShowScanner(false)}
            >
              Uždaryti
            </button>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Rankinis patvirtinimas</CardTitle>
              <CardDescription>Įveskite bilieto ID, kad patvirtintumėte</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualValidation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ticketId">Bilieto ID</Label>
                  <Input
                    id="ticketId"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    placeholder="Įveskite bilieto ID"
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Tikrinama..." : "Patvirtinti bilietą"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kameros skaitytuvas</CardTitle>
              <CardDescription>Naudokite kamerą QR kodams skenuoti</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setShowScanner(true)} className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Atidaryti QR skaitytuvą
              </Button>
              <p className="text-sm text-gray-600 text-center">Spustelėkite, kad atidarytumėte kamerą ir nuskaitytumėte bilieto QR kodą</p>
            </CardContent>
          </Card>
        </div>

        {validationResult && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                {validationResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={validationResult.success ? "text-green-700" : "text-red-700"}>
                  {validationResult.message}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {ticket && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bilieto informacija</CardTitle>
                <Badge variant={ticket.isValidated ? "default" : "secondary"}>
                  {ticket.isValidated ? "Validated" : "Valid"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Renginys:</p>
                  <p>{ticket.event.title}</p>
                </div>
                <div>
                  <p className="font-medium">Data:</p>
                  <p>{ticket.event.date}</p>
                </div>
                <div>
                  <p className="font-medium">Laikas:</p>
                  <p>{ticket.event.time}</p>
                </div>
                <div>
                  <p className="font-medium">Vieta:</p>
                  <p>{ticket.event.location}</p>
                </div>
                <div>
                  <p className="font-medium">Kainų lygis:</p>
                  <p>{ticket.tier.name}</p>
                </div>
                <div>
                  <p className="font-medium">Kaina:</p>
                  <p>${ticket.tier.price}</p>
                </div>
                <div>
                  <p className="font-medium">Pirkėjas:</p>
                  <p>{ticket.purchaserName}</p>
                </div>
                <div>
                  <p className="font-medium">El. paštas:</p>
                  <p>{ticket.purchaserEmail}</p>
                </div>
              </div>

              {ticket.isValidated && ticket.validatedAt && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Patvirtinta:</p>
                  <p className="text-sm">{formatDateTime(ticket.validatedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Add blink animation
import "./scanner-blink.css"
