"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Subscription } from "@/lib/types"
import { CreateSubscriptionDialog } from "@/components/create-subscription-dialog"
import { Mail, MoreHorizontal, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { QrCode } from "lucide-react"

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
        <h1 className="text-3xl font-bold">Prenumeratos</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Subscription
        </Button>
      </div>

      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle>Visos prenumeratos</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pirkėjas</TableHead>
                  <TableHead>El. paštas</TableHead>
                  <TableHead>Galioja nuo</TableHead>
                  <TableHead>Galioja iki</TableHead>
                  <TableHead className="text-right">Veiksmai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.length > 0 ? (
                  subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.purchaser_name || "-"}</TableCell>
                      <TableCell>{sub.purchaser_email || "-"}</TableCell>
                      <TableCell>{new Date(sub.valid_from).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(sub.valid_to).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setPreviewSub(sub)}>
                              <span>Peržiūrėti</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResendEmail(sub.id)}>
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
                    <TableCell colSpan={5} className="text-center">
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
                <Card key={sub.id} className="bg-background">
                  <CardHeader>
                    <CardTitle>{sub.purchaser_name || "Nenurodyta"}</CardTitle>
                    <CardContent className="p-0 pt-2 text-sm text-muted-foreground">{sub.purchaser_email}</CardContent>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <strong>Galioja nuo:</strong>
                      <span>{new Date(sub.valid_from).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>Galioja iki:</strong>
                      <span>{new Date(sub.valid_to).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => setPreviewSub(sub)}>
                        Peržiūrėti
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground">Nėra prenumeratų.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <CreateSubscriptionDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubscriptionCreated={handleSubscriptionCreated}
      />

      {/* Subscription Preview Modal */}
      <Dialog open={!!previewSub} onOpenChange={() => setPreviewSub(null)}>
        <DialogContent className="max-w-lg flex flex-col items-center">
          {previewSub && (
            <>
              <h2 className="text-lg font-bold mb-2">Prenumeratos peržiūra</h2>
              <div className="mb-4">
                <div><strong>Pirkėjas:</strong> {previewSub.purchaser_name}</div>
                <div><strong>El. paštas:</strong> {previewSub.purchaser_email}</div>
                <div><strong>Galioja nuo:</strong> {new Date(previewSub.valid_from).toLocaleDateString()}</div>
                <div><strong>Galioja iki:</strong> {new Date(previewSub.valid_to).toLocaleDateString()}</div>
              </div>
              <img src={previewSub.qr_code_url || ''} alt="QR code" className="w-48 h-48 mx-auto" />
              <div className="text-xs text-gray-500 mt-2">{previewSub.id}</div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 