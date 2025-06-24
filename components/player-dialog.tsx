"use client"

import React, { useState, useEffect } from "react"
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
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import type { Player } from "@/lib/types"

interface PlayerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPlayerSaved: () => void
  player?: Player | null
}

const initialFormData: Partial<Player> = {
  name: "",
  number: "",
  position: "",
  team_key: "BANGA A",
  matches: 0,
  minutes: 0,
  goals: 0,
  assists: 0,
  yellow_cards: 0,
  red_cards: 0,
  image_url: "",
}

export function PlayerDialog({ open, onOpenChange, onPlayerSaved, player }: PlayerDialogProps) {
  const [formData, setFormData] = useState<Partial<Player>>(initialFormData)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const isEditMode = !!player

  useEffect(() => {
    if (isEditMode && player) {
      setFormData(player)
    } else {
      setFormData(initialFormData)
    }
    setImageFile(null) // Reset file input on open
  }, [player, isEditMode, open])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    const numericFields = ['number', 'matches', 'minutes', 'goals', 'assists', 'yellow_cards', 'red_cards'];
    const parsedValue = numericFields.includes(id) ? (value === '' ? null : Number(value)) : value;
    setFormData(prev => ({ ...prev, [id]: parsedValue }))
  }

  const handleSelectChange = (id: keyof Player, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    let imageUrl = isEditMode ? player?.image_url : "";

    if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `player-images/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
            .from('covers')
            .upload(fileName, imageFile)

        if (uploadError) {
            toast({ title: "Error", description: `Failed to upload image: ${uploadError.message}`, variant: "destructive"})
            setIsLoading(false)
            return
        }
        
        const { data: urlData } = supabase.storage.from('covers').getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
    }

    const payload = { ...formData, image_url: imageUrl };
    const url = isEditMode ? `/api/players/${player?.id}` : '/api/players';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'create'} player`)
      }
      
      toast({ title: "Success", description: `Player ${isEditMode ? 'updated' : 'created'} successfully.` })
      onPlayerSaved()
      onOpenChange(false)

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Redaguoti žaidėją' : 'Pridėti naują žaidėją'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Atnaujinkite žaidėjo informaciją.' : 'Užpildykite žaidėjo informaciją.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Vardas</Label>
            <Input id="name" value={formData.name || ""} onChange={handleInputChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number">Numeris</Label>
            <Input id="number" type="number" value={formData.number || ""} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Pozicija</Label>
            <Input id="position" value={formData.position || ""} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team_key">Komanda</Label>
            <Select value={formData.team_key || "BANGA A"} onValueChange={(value) => handleSelectChange("team_key", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pasirinkite komandą" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BANGA A">Banga A</SelectItem>
                <SelectItem value="BANGA B">Banga B</SelectItem>
                <SelectItem value="BANGA M">Banga M</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <Label htmlFor="image_url">Nuotrauka</Label>
            <Input id="image_file" type="file" onChange={handleFileChange} accept="image/*" />
            {isEditMode && formData.image_url && !imageFile && (
                <p className="text-sm text-muted-foreground">Current image: <a href={formData.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a></p>
            )}
          </div>
          <h3 className="font-semibold pt-4">Statistika</h3>
           <div className="space-y-2">
            <Label htmlFor="matches">Rungtynės</Label>
            <Input id="matches" type="number" value={formData.matches ?? ''} onChange={handleInputChange} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="minutes">Minutės</Label>
            <Input id="minutes" type="number" value={formData.minutes ?? ''} onChange={handleInputChange} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="goals">Įvarčiai</Label>
            <Input id="goals" type="number" value={formData.goals ?? ''} onChange={handleInputChange} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="assists">Asistai</Label>
            <Input id="assists" type="number" value={formData.assists ?? ''} onChange={handleInputChange} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="yellow_cards">Gel. kortelės</Label>
            <Input id="yellow_cards" type="number" value={formData.yellow_cards ?? ''} onChange={handleInputChange} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="red_cards">Raud. kortelės</Label>
            <Input id="red_cards" type="number" value={formData.red_cards ?? ''} onChange={handleInputChange} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Atšaukti</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (isEditMode ? "Atnaujinama..." : "Kuriama...") : (isEditMode ? "Atnaujinti žaidėją" : "Sukurti")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 