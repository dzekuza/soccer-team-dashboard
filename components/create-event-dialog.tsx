"use client"

import type React from "react"
import { ChangeEvent, FormEvent, useState, useEffect, useRef } from "react"
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
import { Stepper } from "@/components/ui/stepper"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar } from "./ui/calendar"
import { format } from "date-fns"
import type { PostgrestError } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

interface PricingTier {
  name: string
  price: number
  quantity: number
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
    date: new Date(),
    time: "",
    location: "",
  })
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([
    { name: "General Admission", price: 25, quantity: 100 },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [apiSuccess, setApiSuccess] = useState<string | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [team1Id, setTeam1Id] = useState("")
  const [team2Id, setTeam2Id] = useState("")
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImageFilename, setCoverImageFilename] = useState<string>("")
  const [coverImageUploading, setCoverImageUploading] = useState(false)
  const [step, setStep] = useState(0)
  const steps = [
    "Pagrindinė informacija",
    "Data ir laikas",
    "Kainos ir nuolaidos"
  ]
  const [coverImageUrl, setCoverImageUrl] = useState<string>("")
  const dropRef = useRef<HTMLDivElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  useEffect(() => {
    if (!open) return;
    supabase
      .from("teams")
      .select("id, team_name, logo, created_at")
      .then(({ data, error }: { data: Team[] | null, error: PostgrestError | null }) => {
        if (error) {
          setTeams([]);
        } else {
          setTeams(Array.isArray(data) ? data : []);
        }
      });
  }, [open]);

  const addPricingTier = () => {
    setPricingTiers([...pricingTiers, { name: "", price: 0, quantity: 0 }])
  }

  const removePricingTier = (index: number) => {
    setPricingTiers(pricingTiers.filter((_, i: number) => i !== index))
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

    // Enhanced pricing tiers validation
    let hasTierError = false
    pricingTiers.forEach((tier: PricingTier, index: number) => {
      if (!tier.name || !tier.name.trim()) {
        newErrors[`tier_${index}_name`] = "Tier name is required"
        hasTierError = true
      }
      if (typeof tier.price !== "number" || isNaN(tier.price) || tier.price <= 0) {
        newErrors[`tier_${index}_price`] = "Price must be greater than 0"
        hasTierError = true
      }
      if (typeof tier.quantity !== "number" || isNaN(tier.quantity) || tier.quantity <= 0) {
        newErrors[`tier_${index}_quantity`] = "Quantity must be greater than 0"
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
      date: new Date(),
      time: "",
      location: "",
    })
    setPricingTiers([{ name: "General Admission", price: 25, quantity: 100 }])
    setErrors({})
    setApiError(null)
    setApiSuccess(null)
    setTeam1Id("")
    setTeam2Id("")
    setCoverImageFile(null)
    setCoverImageFilename("")
    setCoverImageUploading(false)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      await handleCoverImageFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
  }

  const handleCoverImageFile = async (file: File) => {
    setApiError(null)
    setCoverImageFile(file)
    setCoverImageUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `event-cover-${Date.now()}.${fileExt}`
      const { data, error } = await supabase.storage
        .from('covers')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })
      if (error) {
        throw error
      }
      const { data: urlData } = supabase.storage.from('covers').getPublicUrl(fileName)
      setCoverImageUrl(urlData.publicUrl)
    } catch (error) {
      console.error("Cover upload error:", error)
      setApiError(error instanceof Error ? error.message : "Failed to upload cover image")
    } finally {
      setCoverImageUploading(false)
    }
  }

  const handleCoverImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await handleCoverImageFile(file)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setApiSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const eventPayload = {
      event: {
        title: formData.title,
        description: formData.description,
        date: format(formData.date, "yyyy-MM-dd"),
        time: formData.time,
        location: formData.location,
        team1_id: team1Id || null,
        team2_id: team2Id || null,
        cover_image_url: coverImageUrl || null,
      },
      pricingTiers: pricingTiers,
    };

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
      const response = await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create event');
      }

      setApiSuccess("Event created successfully!");
      resetForm();
      onEventCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating event:', error);
      setApiError(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    // ... existing code ...
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen: boolean) => {
        if (!newOpen) {
          resetForm()
        }
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Naujas renginys</DialogTitle>
          <DialogDescription>Užpildykite informaciją apie renginį</DialogDescription>
        </DialogHeader>

        <div className="mb-6">
          <Stepper steps={steps} currentStep={step} onStepChange={setStep} />
        </div>

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
          {/* Step 1: Cover image, name, description */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <Label>Viršelio nuotrauka</Label>
                <div
                  ref={dropRef}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={cn(
                    "border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors",
                    isDragActive ? "border-main-orange bg-main-div-bg/70" : "border-main-border bg-main-div-bg"
                  )}
                >
                  <span className="block text-sm text-gray-400 mb-2">Nuvilkite paveikslėlį čia arba pasirinkite failą</span>
                  <Input type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" id="cover-upload-input" />
                  <label htmlFor="cover-upload-input" className="btn-main px-3 py-1 rounded cursor-pointer inline-block">Pasirinkti failą</label>
                  {coverImageUploading && <div className="text-sm text-gray-500 mt-1">Įkeliama...</div>}
                  {coverImageUrl && (
                    <div className="mt-2 flex justify-center">
                      <Image src={coverImageUrl} alt="Cover" width={200} height={120} className="rounded" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label>Pavadinimas</Label>
                <Input
                  value={formData.title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Renginio pavadinimas"
                />
                {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
              </div>
              <div>
                <Label>Aprašymas</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Trumpas renginio aprašymas"
                />
                {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
              </div>
            </div>
          )}

          {/* Step 2: Date and location */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Data</Label>
                <Input
                  type="date"
                  value={formData.date instanceof Date ? formData.date.toISOString().split('T')[0] : new Date(formData.date).toISOString().split('T')[0]}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value
                    setFormData({ ...formData, date: new Date(value) })
                  }}
                  placeholder="Renginio data"
                />
                {errors.date && <div className="text-red-500 text-xs mt-1">{errors.date}</div>}
              </div>
              <div>
                <Label>Laikas</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="Renginio laikas"
                />
                {errors.time && <div className="text-red-500 text-xs mt-1">{errors.time}</div>}
              </div>
              <div>
                <Label>Vieta</Label>
                <Input
                  value={formData.location}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Renginio vieta"
                />
                {errors.location && <div className="text-red-500 text-xs mt-1">{errors.location}</div>}
              </div>
            </div>
          )}

          {/* Step 3: Teams selection and pricing tiers */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Komanda 1</Label>
                  <select
                    value={team1Id}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setTeam1Id(e.target.value)}
                    className="w-full border border-main-border rounded px-3 py-2 bg-[#0A165B] text-white focus:border-main-orange focus:ring-2 focus:ring-main-orange focus:outline-none transition-colors"
                  >
                    <option value="">Pasirinkite komandą</option>
                    {Array.isArray(teams) && teams.map(team => (
                      <option key={team.id} value={team.id}>{team.team_name}</option>
                    ))}
                  </select>
                  {errors.team1Id && <div className="text-red-500 text-xs mt-1">{errors.team1Id}</div>}
                </div>
                <div className="flex-1">
                  <Label>Komanda 2</Label>
                  <select
                    value={team2Id}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setTeam2Id(e.target.value)}
                    className="w-full border border-main-border rounded px-3 py-2 bg-[#0A165B] text-white focus:border-main-orange focus:ring-2 focus:ring-main-orange focus:outline-none transition-colors"
                  >
                    <option value="">Pasirinkite komandą</option>
                    {Array.isArray(teams) && teams.map(team => (
                      <option key={team.id} value={team.id}>{team.team_name}</option>
                    ))}
                  </select>
                  {errors.team2Id && <div className="text-red-500 text-xs mt-1">{errors.team2Id}</div>}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Kainų kategorijos</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addPricingTier}>
                    <Plus className="h-4 w-4 mr-1" /> Pridėti kategoriją
                  </Button>
                </div>
                {errors.pricingTiers && <div className="text-red-500 text-xs mb-2">{errors.pricingTiers}</div>}
                {pricingTiers.map((tier: PricingTier, idx: number) => (
                  <div key={idx} className="flex gap-2 items-end mb-2">
                    <div className="flex-1">
                      <Label>Pavadinimas</Label>
                      <Input
                        value={tier.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => updatePricingTier(idx, "name", e.target.value)}
                        placeholder="Kategorijos pavadinimas"
                      />
                      {errors[`tier_${idx}_name`] && <div className="text-red-500 text-xs mt-1">{errors[`tier_${idx}_name`]}</div>}
                    </div>
                    <div className="w-32">
                      <Label>Kaina (€)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={tier.price}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => updatePricingTier(idx, "price", Number(e.target.value))}
                        placeholder="Kaina"
                      />
                      {errors[`tier_${idx}_price`] && <div className="text-red-500 text-xs mt-1">{errors[`tier_${idx}_price`]}</div>}
                    </div>
                    <div className="w-32">
                      <Label>Kiekis</Label>
                      <Input
                        type="number"
                        min={0}
                        value={tier.quantity}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => updatePricingTier(idx, "quantity", Number(e.target.value))}
                        placeholder="Kiekis"
                      />
                      {errors[`tier_${idx}_quantity`] && <div className="text-red-500 text-xs mt-1">{errors[`tier_${idx}_quantity`]}</div>}
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removePricingTier(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mt-6">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                Atgal
              </Button>
            )}
            {step < 2 && (
              <Button type="button" onClick={() => setStep(step + 1)}>
                Toliau
              </Button>
            )}
            {step === 2 && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Kuriama..." : "Sukurti renginį"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
