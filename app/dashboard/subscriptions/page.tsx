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
  const [form, setForm] = useState({ title: "", description: "", price: "", durationDays: "" })
  const [assign, setAssign] = useState({ userEmail: "", subscriptionId: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [createOpen, setCreateOpen] = useState(false)

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
      const sub = await supabaseService.createSubscription({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        durationDays: Number(form.durationDays),
      })
      setSubs([sub, ...subs])
      setForm({ title: "", description: "", price: "", durationDays: "" })
      setSuccess("Prenumeratas sukurtas!")
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
      // Find user by email
      const { data: user, error: userError } = await supabase
        .from("users").select("id").eq("email", assign.userEmail).single()
      if (userError || !user) throw new Error("User not found")
      await supabaseService.assignSubscriptionToUser(user.id, assign.subscriptionId)
      setSuccess("Prenumeratas priskirtas!")
      setAssign({ userEmail: "", subscriptionId: "" })
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
            <div className="text-sm">Trukmė: <span className="font-bold">{s.durationDays} dienos(-ų)</span></div>
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
              <Label>Trukmė (dienomis)</Label>
              <Input type="number" value={form.durationDays} onChange={e => setForm(f => ({ ...f, durationDays: e.target.value }))} required />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>Sukurti</Button>
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