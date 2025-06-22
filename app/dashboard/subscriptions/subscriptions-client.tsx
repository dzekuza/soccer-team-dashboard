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

interface SubscriptionsClientProps {
  initialSubscriptions: Subscription[];
}

export default function SubscriptionsClient({ initialSubscriptions }: SubscriptionsClientProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { toast } = useToast()

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

      <Card>
        <CardHeader>
          <CardTitle>Visos prenumeratos</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <CreateSubscriptionDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubscriptionCreated={handleSubscriptionCreated}
      />
    </div>
  )
} 