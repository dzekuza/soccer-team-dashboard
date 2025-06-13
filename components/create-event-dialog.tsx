"use client"

import type React from "react"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2 } from "lucide-react"

interface PricingTier {
  name: string
  price: number
  maxQuantity: number
}

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEventCreated: () => void
}

export function CreateEventDialog({ open, onOpenChange, onEventCreated }: CreateEventDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  })
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([
    { name: "General Admission", price: 25, maxQuantity: 100 },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [apiSuccess, setApiSuccess] = useState<string | null>(null)

  const addPricingTier = () => {
    setPricingTiers([...pricingTiers, { name: "", price: 0, maxQuantity: 0 }])
  }

  const removePricingTier = (index: number) => {
    setPricingTiers(pricingTiers.filter((_, i) => i !== index))
  }

  const updatePricingTier = (index: number, field: keyof PricingTier, value: string | number) => {
    const updated = [...pricingTiers]
    updated[index] = { ...updated[index], [field]: value }
    setPricingTiers(updated)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.date) newErrors.date = "Date is required"
    if (!formData.time) newErrors.time = "Time is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"

    // Validate pricing tiers
    let hasTierError = false
    pricingTiers.forEach((tier, index) => {
      if (!tier.name.trim()) {
        newErrors[`tier_${index}_name`] = "Name is required"
        hasTierError = true
      }
      if (tier.price <= 0) {
        newErrors[`tier_${index}_price`] = "Price must be greater than 0"
        hasTierError = true
      }
      if (tier.maxQuantity <= 0) {
        newErrors[`tier_${index}_maxQuantity`] = "Quantity must be greater than 0"
        hasTierError = true
      }
    })

    if (pricingTiers.length === 0) {
      newErrors.pricingTiers = "At least one pricing tier is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
    })
    setPricingTiers([{ name: "General Admission", price: 25, maxQuantity: 100 }])
    setErrors({})
    setApiError(null)
    setApiSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)
    setApiSuccess(null)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      console.log("Submitting event data:", { ...formData, pricingTiers })

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          pricingTiers,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create event")
      }

      console.log("Event created successfully:", responseData)

      // Show success message
      setApiSuccess("Event created successfully!")

      // Reset form
      resetForm()

      // Wait a moment before closing the dialog and refreshing the events list
      setTimeout(() => {
        onEventCreated()
        onOpenChange(false)
      }, 1500)
    } catch (error) {
      console.error("Failed to create event:", error)
      setApiError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          resetForm()
        }
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>Set up a new soccer team event with pricing tiers</DialogDescription>
        </DialogHeader>

        {apiError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        {apiSuccess && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{apiSuccess}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
              {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
              {errors.date && <p className="text-sm text-red-600">{errors.date}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
              {errors.time && <p className="text-sm text-red-600">{errors.time}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Pricing Tiers</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPricingTier}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tier
              </Button>
            </div>

            {errors.pricingTiers && <p className="text-sm text-red-600">{errors.pricingTiers}</p>}

            {pricingTiers.map((tier, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    Tier {index + 1}
                    {pricingTiers.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removePricingTier(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={tier.name}
                      onChange={(e) => updatePricingTier(index, "name", e.target.value)}
                      placeholder="e.g., VIP, General"
                      required
                    />
                    {errors[`tier_${index}_name`] && (
                      <p className="text-xs text-red-600">{errors[`tier_${index}_name`]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      value={tier.price}
                      onChange={(e) => updatePricingTier(index, "price", Number(e.target.value))}
                      min={0}
                      step={0.01}
                      required
                    />
                    {errors[`tier_${index}_price`] && (
                      <p className="text-xs text-red-600">{errors[`tier_${index}_price`]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Max Quantity</Label>
                    <Input
                      type="number"
                      value={tier.maxQuantity}
                      onChange={(e) => updatePricingTier(index, "maxQuantity", Number(e.target.value))}
                      min={1}
                      required
                    />
                    {errors[`tier_${index}_maxQuantity`] && (
                      <p className="text-xs text-red-600">{errors[`tier_${index}_maxQuantity`]}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
