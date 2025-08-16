"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateSubscriptionDialog } from "@/components/create-subscription-dialog"
import type { Subscription } from "@/lib/types"
import { Download, Plus, Mail, MoreHorizontal, QrCode, Calendar, X, Search } from "lucide-react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { QRCodeService } from "@/lib/qr-code-service"
import { useToast } from "@/components/ui/use-toast"
import { createPortal } from 'react-dom'

interface SubscriptionsClientProps {
    initialSubscriptions: Subscription[];
}

export function SubscriptionsClient({ initialSubscriptions }: SubscriptionsClientProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [nameFilter, setNameFilter] = useState("")
  const [emailFilter, setEmailFilter] = useState("")
  const { toast } = useToast()
  const [previewSub, setPreviewSub] = useState<Subscription | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isLoadingQR, setIsLoadingQR] = useState(false)

  async function fetchSubscriptions() {
    try {
      const response = await fetch('/api/subscriptions');
      if (!response.ok) throw new Error("Failed to fetch subscriptions");
      const data = await response.json();
      setSubscriptions(data);
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error)
      toast({ title: "Klaida", description: "Nepavyko atnaujinti prenumeratų sąrašo.", variant: "destructive" });
    }
  }

  const handleSubscriptionCreated = () => {
    fetchSubscriptions()
    setIsCreateOpen(false)
  }

  const handleResendEmail = async (subscriptionId: string) => {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/resend`, { method: "POST" })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Failed to resend email")
      toast({ title: "Success", description: "Subscription confirmation email has been resent." })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadPDF = async (subscription: Subscription) => {
    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}/download`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to download subscription.");
      }
      
      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
        : `subscription-${subscription.id}.pdf`;
      
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
      alert(error instanceof Error ? error.message : "Could not download subscription.");
    }
  }

  const handleShowQR = async (subscription: Subscription) => {
    setPreviewSub(subscription)
    setIsLoadingQR(true)
    setQrCodeUrl("")
    
    try {
      // Generate QR code using subscription ID for consistency with PDF
      const qrCodeUrl = await QRCodeService.generateLegacyQRCode(subscription.id)
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

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesName = subscription.purchaser_name?.toLowerCase().includes(nameFilter.toLowerCase()) || false
    const matchesEmail = (subscription.purchaser_email || "").toLowerCase().includes(emailFilter.toLowerCase())
    return matchesName && matchesEmail
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Input
            placeholder="Filtruoti pagal vardą..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="w-full sm:w-64"
          />
          <Input
            placeholder="Filtruoti pagal el. paštą..."
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            className="w-full sm:w-64"
          />
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-[#F15601] hover:bg-[#E04501]">
          <Plus className="h-4 w-4 mr-2" />
          Sukurti prenumeratą
        </Button>
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vardas</TableHead>
              <TableHead>El. paštas</TableHead>
              <TableHead>Galioja nuo</TableHead>
              <TableHead>Galioja iki</TableHead>
              <TableHead>Veiksmai</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Nėra prenumeratų pagal pasirinktus filtrus
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>{subscription.purchaser_name || "Nenurodyta"}</TableCell>
                  <TableCell>{subscription.purchaser_email}</TableCell>
                  <TableCell>{new Date(subscription.valid_from).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(subscription.valid_to).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleShowQR(subscription)}>
                          <QrCode className="h-4 w-4 mr-2" />
                          QR kodas
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadPDF(subscription)}>
                          <Download className="h-4 w-4 mr-2" />
                          Atsisiųsti PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResendEmail(subscription.id)}>
                          <Mail className="h-4 w-4 mr-2" />
                          Siųsti el. laišką
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {subscriptions.length > 0 ? (
          subscriptions.map((sub) => (
            <Card key={sub.id} className="bg-[#0A165B]/50 border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">{sub.purchaser_name || "Nenurodyta"}</CardTitle>
                <CardContent className="p-0 pt-2 text-sm text-gray-300">{sub.purchaser_email}</CardContent>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-white">
                  <strong>Galioja nuo:</strong>
                  <span>{new Date(sub.valid_from).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-white">
                  <strong>Galioja iki:</strong>
                  <span>{new Date(sub.valid_to).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => handleShowQR(sub)} className="border-gray-600 text-gray-300 hover:text-white hover:bg-[#0A2065]">
                    <QrCode className="h-4 w-4 mr-1" /> QR
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(sub)} className="border-gray-600 text-gray-300 hover:text-white hover:bg-[#0A2065]">
                    <Download className="h-4 w-4 mr-1" /> PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-300">Nėra prenumeratų.</p>
        )}
      </div>

      <CreateSubscriptionDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubscriptionCreated={handleSubscriptionCreated}
      />

      {/* Subscription Preview Modal */}
      {previewSub && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setPreviewSub(null);
            }
          }}
        >
          <div className="bg-[#0A165B] p-6 rounded-2xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Prenumeratos peržiūra</h2>
              <button 
                onClick={() => setPreviewSub(null)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3 bg-[#0A2065] p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-300">Pirkėjas:</span>
                <span className="text-white">{previewSub.purchaser_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-300">El. paštas:</span>
                <span className="text-white">{previewSub.purchaser_email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-300">Galioja nuo:</span>
                <span className="text-white">{new Date(previewSub.valid_from).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-300">Galioja iki:</span>
                <span className="text-white">{new Date(previewSub.valid_to).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-3 mt-4">
              <div className="bg-[#0A2065] p-4 rounded-lg">
                {isLoadingQR ? (
                  <div className="flex flex-col items-center">
                    <div className="w-48 h-48 bg-gray-600 rounded animate-pulse" />
                    <p className="text-xs text-gray-300 mt-2">Generating QR Code...</p>
                  </div>
                ) : qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className="w-48 h-48 mx-auto"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-48 h-48 bg-gray-600 rounded flex items-center justify-center">
                      <QrCode className="h-24 w-24 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-300 mt-2">QR Code Unavailable</p>
                  </div>
                )}
                <p className="text-xs text-gray-300 mt-2 text-center">Enhanced QR Code</p>
                <p className="text-xs text-gray-400 text-center">{previewSub.id.slice(-8)}</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
} 