"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Plus, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Subscription } from "@/lib/types"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import QRCode from "react-qr-code";

type SubscriptionForm = {
  purchaser_name?: string
  purchaser_surname?: string
  purchaser_email?: string
  valid_from?: string
  valid_to?: string
}

export default function SubscriptionsPage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState<SubscriptionForm>({})
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchSubscriptions()
    }
  }, [user])

  const fetchSubscriptions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setSubscriptions(data || [])
    } catch (err) {
      setError("Nepavyko įkelti prenumeratų.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!form.valid_from || !form.valid_to) {
      toast({
        title: "Klaida",
        description: "Prašome pasirinkti galiojimo laikotarpį.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          owner_id: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription.');
      }
      
      const newSubscription = await response.json();
      
      toast({
        title: "Sėkmė!",
        description: "Prenumerata sėkmingai sukurta.",
      })
      setSubscriptions([newSubscription, ...subscriptions])
      setCreateOpen(false)
      setForm({})

    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
       toast({
        title: "Klaida kuriant prenumeratą",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-semibold">{error}</p>
        <Button onClick={fetchSubscriptions} className="mt-4">
          Bandyti dar kartą
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prenumeratos</h1>
          <p className="text-gray-600">
            Kurkite ir tvarkykite individualias prenumeratas.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Sukurti prenumeratą
        </Button>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pirkėjas</TableHead>
              <TableHead>Galioja nuo</TableHead>
              <TableHead>Galioja iki</TableHead>
              <TableHead>Veiksmai</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length > 0 ? (
              subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {sub.purchaser_name} {sub.purchaser_surname}
                      </span>
                      <span className="text-sm text-gray-500">
                        {sub.purchaser_email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(sub.valid_from), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(sub.valid_to), "yyyy-MM-dd")}
                  </TableCell>
                   <TableCell>
                    <div className="flex gap-2">
                       <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          const validationUrl = `${window.location.origin}/api/validate-subscription/${sub.id}`;
                          setQrCodeUrl(validationUrl);
                        }}>
                        QR Kodas
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                           if (!window.confirm(`Ar tikrai norite ištrinti šią prenumeratą?`)) return;
                           const { error } = await supabase.from('subscriptions').delete().eq('id', sub.id)
                           if (error) {
                              toast({ title: "Klaida", description: error.message, variant: 'destructive'})
                           } else {
                              toast({ title: "Sėkmė!", description: "Prenumerata ištrinta."})
                              fetchSubscriptions()
                           }
                        }}
                      >
                        Ištrinti
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  Prenumeratų nerasta.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sukurti naują prenumeratą</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purchaser_name">Vardas</Label>
                <Input
                  id="purchaser_name"
                  value={form.purchaser_name || ""}
                  onChange={(e) =>
                    setForm({ ...form, purchaser_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="purchaser_surname">Pavardė</Label>
                <Input
                  id="purchaser_surname"
                  value={form.purchaser_surname || ""}
                  onChange={(e) =>
                    setForm({ ...form, purchaser_surname: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="purchaser_email">El. paštas</Label>
              <Input
                id="purchaser_email"
                type="email"
                value={form.purchaser_email || ""}
                onChange={(e) =>
                  setForm({ ...form, purchaser_email: e.target.value })
                }
              />
            </div>
             <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valid_from">Galioja nuo</Label>
                <Input
                  id="valid_from"
                  type="date"
                  value={form.valid_from || ""}
                  onChange={(e) =>
                    setForm({ ...form, valid_from: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="valid_to">Galioja iki</Label>
                <Input
                  id="valid_to"
                  type="date"
                  value={form.valid_to || ""}
                  onChange={(e) =>
                    setForm({ ...form, valid_to: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Sukurti</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!qrCodeUrl} onOpenChange={(isOpen) => !isOpen && setQrCodeUrl(null)}>
        <DialogContent className="max-w-xs">
            <DialogHeader>
                <DialogTitle>Nuskaitykite prenumeratos QR kodą</DialogTitle>
            </DialogHeader>
            <div className="p-4 bg-white rounded-md">
                {qrCodeUrl && <QRCode value={qrCodeUrl} size={256} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />}
            </div>
        </DialogContent>
      </Dialog>

    </div>
  )
} 