"use client"

import { useEffect, useState } from "react"
import { supabaseService } from "@/lib/supabase-service"
import type { Subscription } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export default function SubscriptionsDashboardPage() {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [form, setForm] = useState({ title: "", description: "", price: "", durationDays: "" })
  const [assign, setAssign] = useState({ userEmail: "", subscriptionId: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    supabaseService.getSubscriptions().then(setSubs)
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
      <div className="flex items-center justify-between mb-6">
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
    </div>
  )
} 