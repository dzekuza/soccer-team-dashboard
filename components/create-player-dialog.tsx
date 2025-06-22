"use client"

import React, { useState } from "react"
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

interface CreatePlayerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPlayerCreated: () => void
}

export function CreatePlayerDialog({ open, onOpenChange, onPlayerCreated }: CreatePlayerDialogProps) {
  const [formData, setFormData] = useState<Partial<Player>>({
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
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
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

    let imageUrl = ""
    if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `player-images/${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('covers')
            .upload(fileName, imageFile)

        if (uploadError) {
            toast({ title: "Error", description: "Failed to upload image.", variant: "destructive"})
            setIsLoading(false)
            return
        }
        
        const { data: urlData } = supabase.storage.from('covers').getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
    }

    const payload = { ...formData, image_url: imageUrl };

    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create player")
      }
      
      toast({ title: "Success", description: "Player created successfully." })
      onPlayerCreated()
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pridėti naują žaidėją</DialogTitle>
          <DialogDescription>Užpildykite žaidėjo informaciją.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Input id="image_url" type="file" onChange={handleFileChange} accept="image/*" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Atšaukti</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Kuriama..." : "Sukurti"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 