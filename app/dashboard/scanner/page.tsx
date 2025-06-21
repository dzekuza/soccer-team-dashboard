"use client"

import { useState } from "react"
import QrScanner from "@/components/qr-scanner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, ScanLine } from "lucide-react"
import { format } from "date-fns"
import type { TicketWithDetails, Subscription } from "@/lib/types"
import "./scanner-blink.css"

type ScanResult = {
  status: "success" | "error" | "warning"
  message: string
  details?: TicketWithDetails | Subscription
}

export default function ScannerPage() {
  const [lastScan, setLastScan] = useState<ScanResult | null>(null)
  const [isScanning, setIsScanning] = useState(true)

  const handleScan = async (data: string | null) => {
    if (!data || !isScanning) return
    setIsScanning(false) // Stop scanning after a result
    setLastScan(null)

    try {
      const url = new URL(data)
      const path = url.pathname
      let result: ScanResult | null = null

      if (path.startsWith("/api/validate-ticket/")) {
        result = await handleTicketValidation(path)
      } else if (path.startsWith("/api/validate-subscription/")) {
        result = await handleSubscriptionValidation(path)
      } else {
        result = {
          status: "error",
          message: "Netinkamas QR kodas. Nuskenuokite bilieto arba prenumeratos QR kodą.",
        }
      }
      setLastScan(result)
    } catch (err) {
      setLastScan({
        status: "error",
        message: "Klaida apdorojant QR kodą. Patikrinkite, ar QR kodas yra teisingas.",
      })
      console.error(err)
    }

    setTimeout(() => setIsScanning(true), 3000)
  }

  const handleTicketValidation = async (path: string): Promise<ScanResult> => {
    const response = await fetch(path)
    const result = await response.json()

    if (!response.ok) {
      return { status: "error", message: result.error || "Bilieto patikrinti nepavyko." }
    }
    
    if (!result.success) {
      return {
        status: "warning",
        message: result.message || "Bilietas jau buvo panaudotas.",
        details: result.ticket,
      }
    }

    return {
      status: "success",
      message: "Bilietas sėkmingai patvirtintas!",
      details: result.ticket,
    }
  }

  const handleSubscriptionValidation = async (path: string): Promise<ScanResult> => {
    const response = await fetch(path)
    const result = await response.json() 

    if (!response.ok) {
      if (response.status === 410) {
        return { status: "warning", message: result.message || "Prenumerata nebegalioja.", details: result }
      }
      return { status: "error", message: result.error || "Prenumeratos patikrinti nepavyko." }
    }
    
    if (result.status === 'active') {
      return { status: "success", message: "Prenumerata galioja.", details: result }
    }

    return { status: "error", message: "Įvyko nežinoma klaida tikrinant prenumeratą.", details: result }
  }


  const renderScanResult = () => {
    if (!lastScan) return null

    let icon = <ScanLine className="h-6 w-6" />
    let alertVariant: "default" | "destructive" = "default"
    let title = ""

    switch (lastScan.status) {
      case "success":
        icon = <CheckCircle className="h-6 w-6 text-green-500" />
        title = "Patvirtinta"
        break
      case "error":
        icon = <XCircle className="h-6 w-6 text-red-500" />
        title = "Klaida"
        alertVariant = "destructive"
        break
      case "warning":
        icon = <AlertTriangle className="h-6 w-6 text-yellow-500" />
        title = "Įspėjimas"
        alertVariant = "default"
        break
    }

    const details = lastScan.details
    const isTicket = details && "events" in details && "pricing_tiers" in details
    const isSubscription = details && "valid_from" in details

    return (
      <Alert variant={alertVariant} className="mt-4">
        <div className="flex items-start">
          <div className="pt-0.5">{icon}</div>
          <div className="ml-3 flex-1">
            <p className="font-bold">{title}</p>
            <AlertDescription>{lastScan.message}</AlertDescription>
            {details && (
              <div className="mt-2 text-sm text-foreground">
                {isTicket && (
                  <>
                    <p><strong>Renginys:</strong> {details.events.title}</p>
                    <p><strong>Bilietas:</strong> {details.pricing_tiers.name}</p>
                    <p><strong>Pirkėjas:</strong> {details.purchaser_name} ({details.purchaser_email})</p>
                  </>
                )}
                {isSubscription && (
                  <>
                    <p><strong>Prenumerata:</strong> {details.purchaser_name} {details.purchaser_surname}</p>
                    <p><strong>El. paštas:</strong> {details.purchaser_email}</p>
                    <p><strong>Galioja nuo:</strong> {format(new Date(details.valid_from), "yyyy-MM-dd")}</p>
                    <p><strong>Galioja iki:</strong> {format(new Date(details.valid_to), "yyyy-MM-dd")}</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </Alert>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Card>
        <CardHeader><CardTitle>QR Kodų Skeneris</CardTitle></CardHeader>
        <CardContent>
          <div className="relative w-full aspect-square bg-gray-900 rounded-md overflow-hidden">
            <QrScanner onScan={handleScan} />
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="scanner-line"></div>
              </div>
            )}
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <p className="text-white text-lg font-medium">Apdorojama...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {renderScanResult()}
    </div>
  )
}
