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
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import type { Team } from "@/lib/types"
import { supabase } from "@/lib/supabase"

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
  const [teams, setTeams] = useState<Team[]>([])
  const [team1Id, setTeam1Id] = useState("")
  const [team2Id, setTeam2Id] = useState("")
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string>("")
  const [coverImageUploading, setCoverImageUploading] = useState(false)

  useEffect(() => {
    if (!open) return
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch(() => setTeams([]))
  }, [open])

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
    if (!team1Id) newErrors.team1Id = "Team 1 is required"
    if (!team2Id) newErrors.team2Id = "Team 2 is required"
    if (team1Id && team2Id && team1Id === team2Id) {
      newErrors.team2Id = "Teams must be different"
    }

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
    setTeam1Id("")
    setTeam2Id("")
    setCoverImageFile(null)
    setCoverImageUrl("")
    setCoverImageUploading(false)
  }

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverImageFile(file)
    setCoverImageUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `event-cover-${Date.now()}.${fileExt}`
    const { data, error } = await supabase.storage.from('event-covers').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) {
      setApiError('Failed to upload cover image')
      setCoverImageUploading(false)
      return
    }
    const { data: urlData } = supabase.storage.from('event-covers').getPublicUrl(fileName)
    setCoverImageUrl(urlData.publicUrl)
    setCoverImageUploading(false)
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
      console.log("Submitting event data:", { ...formData, pricingTiers, team1Id, team2Id, coverImageUrl })

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          pricingTiers,
          team1Id,
          team2Id,
          coverImageUrl: coverImageUrl || undefined,
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team1">Team 1</Label>
              <select
                id="team1"
                value={team1Id}
                onChange={(e) => setTeam1Id(e.target.value)}
                className="w-full border rounded p-2"
                required
              >
                <option value="">Select Team 1</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.team_name}
                  </option>
                ))}
              </select>
              {team1Id && (
                <div className="flex items-center gap-2 mt-1">
                  <Image src={teams.find(t => t.id === team1Id)?.logo || ""} alt="Team 1 Logo" width={32} height={32} />
                  <span className="text-sm">{teams.find(t => t.id === team1Id)?.team_name}</span>
                </div>
              )}
              {errors.team1Id && <span className="text-red-600 text-xs">{errors.team1Id}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="team2">Team 2</Label>
              <select
                id="team2"
                value={team2Id}
                onChange={(e) => setTeam2Id(e.target.value)}
                className="w-full border rounded p-2"
                required
              >
                <option value="">Select Team 2</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.team_name}
                  </option>
                ))}
              </select>
              {team2Id && (
                <div className="flex items-center gap-2 mt-1">
                  <Image src={teams.find(t => t.id === team2Id)?.logo || ""} alt="Team 2 Logo" width={32} height={32} />
                  <span className="text-sm">{teams.find(t => t.id === team2Id)?.team_name}</span>
                </div>
              )}
              {errors.team2Id && <span className="text-red-600 text-xs">{errors.team2Id}</span>}
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

          <div className="mb-4">
            <Label htmlFor="coverImage">Cover Image</Label>
            <Input
              id="coverImage"
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              disabled={coverImageUploading}
            />
            {coverImageUploading && <div className="text-xs text-gray-500 mt-1">Uploading...</div>}
            {coverImageUrl && (
              <div className="mt-2">
                <Image src={coverImageUrl} alt="Cover Preview" width={320} height={180} className="rounded border" />
              </div>
            )}
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
