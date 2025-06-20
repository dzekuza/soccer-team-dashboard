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

    const qr_code_url = `${window.location.origin}/api/validate-subscription/` // Placeholder

    const { data: newSubscription, error } = await supabase
      .from("subscriptions")
      .insert([
        {
          ...form,
          valid_from: new Date(form.valid_from).toISOString(),
          valid_to: new Date(form.valid_to).toISOString(),
          owner_id: user.id,
          qr_code_url,
        },
      ])
      .select()
      .single()

    if (error) {
      toast({
        title: "Klaida kuriant prenumeratą",
        description: error.message,
        variant: "destructive",
      })
    } else if (newSubscription) {
      // Generate a permanent QR code URL now that we have the ID
      const final_qr_code_url = `${window.location.origin}/api/validate-subscription/${newSubscription.id}`
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({ qr_code_url: final_qr_code_url })
        .eq("id", newSubscription.id)
      
      if (updateError) {
         toast({
          title: "Klaida atnaujinant QR kodą",
          description: updateError.message,
          variant: "destructive",
        })
      }

      toast({
        title: "Sėkmė!",
        description: "Prenumerata sėkmingai sukurta.",
      })
      setSubscriptions([newSubscription, ...subscriptions])
      setCreateOpen(false)
      setForm({})
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
                       <Button size="sm" variant="outline" onClick={() => alert(`QR Code URL: ${sub.qr_code_url}`)}>
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
                <Label>Galioja nuo</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.valid_from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.valid_from ? format(new Date(form.valid_from), "PPP") : <span>Pasirinkite datą</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]">
                    <Calendar
                      mode="single"
                      selected={form.valid_from ? new Date(form.valid_from) : undefined}
                      onSelect={(date) =>
                        setForm({
                          ...form,
                          valid_from: date ? format(date, "yyyy-MM-dd") : undefined,
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Galioja iki</Label>
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.valid_to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.valid_to ? format(new Date(form.valid_to), "PPP") : <span>Pasirinkite datą</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]">
                    <Calendar
                      mode="single"
                      selected={form.valid_to ? new Date(form.valid_to) : undefined}
                       onSelect={(date) =>
                        setForm({
                          ...form,
                          valid_to: date ? format(date, "yyyy-MM-dd") : undefined,
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Sukurti</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 