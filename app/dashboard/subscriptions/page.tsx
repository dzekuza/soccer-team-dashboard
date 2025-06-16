"use client"

import { useEffect, useState } from "react"
import { supabaseService } from "@/lib/supabase-service"
import type { Subscription, UserSubscription } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

// Define a local type for table rows with user and subscription info
interface UserSubscriptionTableRow {
  id: string
  userId: string
  subscriptionId: string
  purchaseDate: string
  expiresAt?: string
  assignedBy?: string
  createdAt: string
  user?: { email?: string; name?: string }
  subscription?: { title?: string }
}

export default function SubscriptionsDashboardPage() {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [userSubs, setUserSubs] = useState<UserSubscriptionTableRow[]>([])
  const [form, setForm] = useState({ title: "", description: "", price: "", validFrom: "", validUntil: "" })
  const [assign, setAssign] = useState({ userName: "", userEmail: "", subscriptionId: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)

  useEffect(() => {
    supabaseService.getSubscriptions().then(setSubs)
    // Fetch all user subscriptions
    supabase
      .from("user_subscriptions")
      .select("*, users:user_id(email, name), subscriptions(title)")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setUserSubs(
            data.map((us: any) => ({
              id: us.id,
              userId: us.user_id,
              subscriptionId: us.subscription_id,
              purchaseDate: us.purchase_date,
              expiresAt: us.expires_at,
              assignedBy: us.assigned_by,
              createdAt: us.created_at,
              user: us.users,
              subscription: us.subscriptions,
            }))
          )
        }
      })
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      // Only create the subscription
      const sub = await supabaseService.createSubscription({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        validFrom: form.validFrom,
        validUntil: form.validUntil,
      })
      setSubs([sub, ...subs])
      setForm({ title: "", description: "", price: "", validFrom: "", validUntil: "" })
      setSuccess("Prenumerata sukurta!")
      setCreateOpen(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      // Find or create user by email
      let userId: string | null = null
      const { data: user, error: userError } = await supabase
        .from("users").select("id").eq("email", assign.userEmail).single()
      if (user && user.id) {
        userId = user.id
      } else {
        // Create user if not found
        const { data: newUser, error: createUserError } = await supabase
          .from("users")
          .insert({ email: assign.userEmail, name: assign.userName, password: Math.random().toString(36).slice(-8), role: "staff" })
          .select("id")
          .single()
        if (createUserError || !newUser) throw new Error("Nepavyko sukurti vartotojo")
        userId = newUser.id
      }
      if (!userId) throw new Error("Nepavyko nustatyti vartotojo ID")
      await supabaseService.assignSubscriptionToUser(userId as string, assign.subscriptionId)
      setAssign({ userName: "", userEmail: "", subscriptionId: "" })
      setSuccess("Prenumerata priskirta klientui!")
      setAssignOpen(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold">Prenumeratos</h1>
        <Button onClick={() => setCreateOpen(true)}>Sukurti prenumeratą</Button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subs.map(s => (
          <div key={s.id} className="border rounded-lg p-5 bg-white shadow flex flex-col gap-2">
            <div className="text-lg font-semibold">{s.title}</div>
            <div className="text-gray-600 flex-1">{s.description}</div>
            <div className="text-sm">Kaina: <span className="font-bold">{s.price} €</span></div>
            <div className="text-sm">Galioja nuo: <span className="font-bold">{s.validFrom ? new Date(s.validFrom).toLocaleDateString() : "-"}</span></div>
            <div className="text-sm">Galioja iki: <span className="font-bold">{s.validUntil ? new Date(s.validUntil).toLocaleDateString() : "-"}</span></div>
            <Button
              variant="outline"
              className="mt-2 w-fit"
              onClick={() => {
                setAssign({ userName: "", userEmail: "", subscriptionId: s.id })
                setAssignOpen(true)
              }}
            >
              Priskirti klientui
            </Button>
          </div>
        ))}
      </div>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sukurti prenumeratą</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-2">
            <div>
              <Label>Pavadinimas</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div>
              <Label>Aprašymas</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <Label>Kaina</Label>
              <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
            </div>
            <div>
              <Label>Galioja nuo</Label>
              <Input type="date" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} required />
            </div>
            <div>
              <Label>Galioja iki</Label>
              <Input type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} required />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>Sukurti</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Assign subscription to user modal */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Priskirti prenumeratą klientui</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssign} className="space-y-2">
            <div>
              <Label>Kliento vardas</Label>
              <Input value={assign.userName} onChange={e => setAssign(a => ({ ...a, userName: e.target.value }))} required />
            </div>
            <div>
              <Label>Kliento el. paštas</Label>
              <Input type="email" value={assign.userEmail} onChange={e => setAssign(a => ({ ...a, userEmail: e.target.value }))} required />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>Priskirti</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Table of users who purchased subscriptions */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Prenumeratorių sąrašas</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vartotojo el. paštas</TableHead>
              <TableHead>Vardas</TableHead>
              <TableHead>Prenumerata</TableHead>
              <TableHead>Pirkimo data</TableHead>
              <TableHead>Galioja iki</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userSubs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Prenumeratorių nerasta</TableCell>
              </TableRow>
            ) : (
              userSubs.map(us => (
                <TableRow key={us.id}>
                  <TableCell>{us.user?.email || "-"}</TableCell>
                  <TableCell>{us.user?.name || "-"}</TableCell>
                  <TableCell>{us.subscription?.title || "-"}</TableCell>
                  <TableCell>{us.purchaseDate ? new Date(us.purchaseDate).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{us.expiresAt ? new Date(us.expiresAt).toLocaleDateString() : "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 