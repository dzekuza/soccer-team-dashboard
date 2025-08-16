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
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import type { SubscriptionType } from "@/lib/types"

interface CreateSubscriptionTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubscriptionTypeCreated: () => void
  subscriptionType?: SubscriptionType | null
  isEditing?: boolean
}

export function CreateSubscriptionTypeDialog({
  open,
  onOpenChange,
  onSubscriptionTypeCreated,
  subscriptionType,
  isEditing = false,
}: CreateSubscriptionTypeDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [durationDays, setDurationDays] = useState("")
  const [features, setFeatures] = useState<string[]>([""])
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Load subscription type data when editing
  useEffect(() => {
    if (subscriptionType && isEditing) {
      setTitle(subscriptionType.title)
      setDescription(subscriptionType.description || "")
      setPrice(subscriptionType.price.toString())
      setDurationDays(subscriptionType.duration_days.toString())
      setFeatures(subscriptionType.features || [""])
      setIsActive(subscriptionType.is_active)
    } else {
      // Reset form for new subscription type
      setTitle("")
      setDescription("")
      setPrice("")
      setDurationDays("")
      setFeatures([""])
      setIsActive(true)
    }
  }, [subscriptionType, isEditing, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError("Turite būti prisijungę, kad galėtumėte sukurti prenumeratos tipą.")
      return
    }
    setIsLoading(true)
    setError(null)

    try {
      const subscriptionTypeData = {
        title,
        description: description || null,
        price: parseFloat(price),
        duration_days: parseInt(durationDays),
        features: features.filter(f => f.trim() !== ""),
        is_active: isActive,
      }

      const url = isEditing && subscriptionType 
        ? `/api/subscription-types/${subscriptionType.id}`
        : '/api/subscription-types'
      
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionTypeData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Nepavyko sukurti prenumeratos tipo")
      }

      onSubscriptionTypeCreated()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const addFeature = () => {
    setFeatures([...features, ""])
  }

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index))
    }
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Redaguoti prenumeratos tipą" : "Sukurti prenumeratos tipą"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Atnaujinkite prenumeratos tipo informaciją." 
              : "Sukurkite naują prenumeratos tipą su kaina ir funkcijomis."
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Pavadinimas *</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="pvz., Premium mėnesinis, VIP metinis"
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Aprašymas</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Aprašykite, ką įtraukia ši prenumerata..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Kaina (€) *</Label>
              <Input 
                id="price" 
                type="number" 
                step="0.01" 
                min="0"
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                placeholder="29.99"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Trukmė (dienomis) *</Label>
              <Input 
                id="duration" 
                type="number" 
                min="1"
                value={durationDays} 
                onChange={(e) => setDurationDays(e.target.value)} 
                placeholder="30"
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Funkcijos</Label>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder={`Funkcija ${index + 1}`}
                  />
                  {features.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      className="px-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeature}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Pridėti funkciją
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="is-active">Aktyvus (galima pirkti)</Label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Atšaukti
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading 
                ? (isEditing ? "Atnaujinama..." : "Kuriama...") 
                : (isEditing ? "Atnaujinti" : "Sukurti")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
