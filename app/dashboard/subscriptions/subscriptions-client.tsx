"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Subscription } from "@/lib/types"
import { CreateSubscriptionDialog } from "@/components/create-subscription-dialog"
import { Mail, MoreHorizontal, Plus, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { QRCodeCanvas } from 'qrcode.react'
import { createPortal } from 'react-dom'

interface SubscriptionsClientProps {
  initialSubscriptions: Subscription[];
}

export default function SubscriptionsClient({ initialSubscriptions }: SubscriptionsClientProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { toast } = useToast()
  const [previewSub, setPreviewSub] = useState<Subscription | null>(null)

  const handleSubscriptionCreated = () => {
    // A simple way to refresh data is to reload the page,
    // causing the server component to re-fetch.
    window.location.reload();
  }

  const handleResendEmail = async (subscriptionId: string) => {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/resend`, {
        method: "POST",
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Failed to resend email")
      }
      toast({
        title: "Success",
        description: "Subscription confirmation email has been resent.",
      })
    } catch (error) {
      console.error("Failed to resend email:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Prenumeratos</h1>
          <p className="text-gray-300">Tvarkykite ir generuokite prenumeratas</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-[#F15601] hover:bg-[#E04501] text-white">
          <Plus className="mr-2 h-4 w-4" />
          Create Subscription
        </Button>
      </div>

      <div className="hidden md:block bg-[#0A165B]/50 border border-gray-700 rounded-lg shadow-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700 hover:bg-[#0A2065]/50">
              <TableHead className="text-gray-300 font-medium">Pirkėjas</TableHead>
              <TableHead className="text-gray-300 font-medium">El. paštas</TableHead>
              <TableHead className="text-gray-300 font-medium">Galioja nuo</TableHead>
              <TableHead className="text-gray-300 font-medium">Galioja iki</TableHead>
              <TableHead className="text-gray-300 font-medium">Veiksmai</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length > 0 ? (
              subscriptions.map((sub) => (
                <TableRow key={sub.id} className="border-gray-700 hover:bg-[#0A2065]/30 transition-colors">
                  <TableCell className="text-white font-medium">{sub.purchaser_name || "-"}</TableCell>
                  <TableCell className="text-gray-300">{sub.purchaser_email || "-"}</TableCell>
                  <TableCell className="text-white">{new Date(sub.valid_from).toLocaleDateString()}</TableCell>
                  <TableCell className="text-white">{new Date(sub.valid_to).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-[#0A2065]/50">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#0A165B] border-gray-600">
                        <DropdownMenuItem onClick={() => setPreviewSub(sub)} className="text-white hover:bg-[#0A2065] focus:bg-[#0A2065]">
                          <span>Peržiūrėti</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResendEmail(sub.id)} className="text-white hover:bg-[#0A2065] focus:bg-[#0A2065]">
                          <Mail className="mr-2 h-4 w-4" />
                          <span>Siųsti iš naujo</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                  Nėra prenumeratų.
                </TableCell>
              </TableRow>
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
                  <Button size="sm" variant="outline" onClick={() => setPreviewSub(sub)} className="border-gray-600 text-gray-300 hover:text-white hover:bg-[#0A2065]">
                    Peržiūrėti
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
                <QRCodeCanvas 
                  value={previewSub.qr_code_url || previewSub.id} 
                  size={192} 
                  className="mx-auto"
                  level="M"
                  includeMargin={true}
                />
                <p className="text-xs text-gray-300 mt-2 text-center">QR Code</p>
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