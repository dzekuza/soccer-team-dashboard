"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Event, PricingTier } from "@/lib/types"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

interface CreateTicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTicketCreated: () => void
}

export function CreateTicketDialog({ open, onOpenChange, onTicketCreated }: CreateTicketDialogProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([])
  const [selectedEventId, setSelectedEventId] = useState("")
  const [selectedTierId, setSelectedTierId] = useState("")
  const [purchaserName, setPurchaserName] = useState("")
  const [purchaserEmail, setPurchaserEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchEvents()
    }
  }, [open])

  useEffect(() => {
    if (selectedEventId) {
      fetchPricingTiers(selectedEventId)
    }
  }, [selectedEventId])

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events")
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error("Failed to fetch events:", error)
    }
  }

  const fetchPricingTiers = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/pricing-tiers`)
      const data = await response.json()
      setPricingTiers(data)
    } catch (error) {
      console.error("Failed to fetch pricing tiers:", error)
      setPricingTiers([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEventId || !selectedTierId) {
      alert("Please select an event and a pricing tier before creating a ticket.")
      return
    }
    setIsLoading(true)

    try {
      const ticketId = uuidv4()
      const qrCodeUrl = `/api/validate-ticket/${ticketId}`
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("team1_id, team2_id, title, description, date, time, location, cover_image_url")
        .eq("id", selectedEventId)
        .single()
      if (eventError || !eventData) throw eventError || new Error("Event not found")
      const { data, error } = await supabase.from("tickets").insert([
        {
          id: ticketId,
          event_id: selectedEventId,
          tier_id: selectedTierId,
          purchaser_name: purchaserName,
          purchaser_email: purchaserEmail,
          is_validated: false,
          qr_code_url: qrCodeUrl,
        },
      ])
      if (error) {
        console.error("Supabase error:", error)
        alert("Supabase error: " + (error.message || JSON.stringify(error)))
        throw error
      }
      console.log("Supabase insert data:", data)
      onTicketCreated()
      setSelectedEventId("")
      setSelectedTierId("")
      setPurchaserName("")
      setPurchaserEmail("")
    } catch (error) {
      console.error("Failed to create ticket:", error)
      if (error && typeof error === "object") {
        alert("Failed to create ticket: " + JSON.stringify(error))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generuoti bilietą</DialogTitle>
          <DialogDescription>Sukurkite naują bilietą renginiui</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event">Renginys</Label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId} required>
              <SelectTrigger>
                <SelectValue placeholder="Pasirinkite renginį" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title} - {event.date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEventId && (
            <div className="space-y-2">
              <Label htmlFor="tier">Kainų lygis</Label>
              <Select value={selectedTierId} onValueChange={setSelectedTierId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pasirinkite kainų lygį" />
                </SelectTrigger>
                <SelectContent>
                  {pricingTiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.name} - {tier.price} €
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Pirkėjo vardas</Label>
            <Input id="name" value={purchaserName} onChange={(e) => setPurchaserName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Pirkėjo el. paštas</Label>
            <Input
              id="email"
              type="email"
              value={purchaserEmail}
              onChange={(e) => setPurchaserEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Atšaukti
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Generuojama..." : "Generuoti"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
