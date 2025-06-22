"use client"

import { useState, useEffect } from "react"
import type { Player } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface EditPlayerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  player: Player | null
  onPlayerUpdated: () => void
}

export function EditPlayerDialog({ open, onOpenChange, player, onPlayerUpdated }: EditPlayerDialogProps) {
  const [formData, setFormData] = useState<Partial<Player>>({})
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  useEffect(() => {
    if (player) {
      setFormData(player)
    }
  }, [player])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!player) return
    setIsLoading(true)

    try {
      const response = await fetch(`/api/players/${player.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update player')
      }

      toast({ title: "Success", description: "Player updated successfully." })
      onPlayerUpdated()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not update player.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const numericFields = ['matches', 'minutes', 'goals', 'assists', 'yellow_cards', 'red_cards'];
    const parsedValue = numericFields.includes(id) ? (value === '' ? null : Number(value)) : value;
    setFormData((prev: Partial<Player>) => ({ ...prev, [id]: parsedValue }));
  }
  
  const handleSelectChange = (id: keyof Player, value: string) => {
    setFormData((prev: Partial<Player>) => ({ ...prev, [id]: value }));
  };

  if (!player) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Redaguoti žaidėją</DialogTitle>
          <DialogDescription>Atnaujinkite žaidėjo informaciją.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Vardas</Label>
            <Input id="name" value={formData.name || ''} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number">Numeris</Label>
            <Input id="number" value={formData.number || ''} onChange={handleChange} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="image_url">Nuotrauka (URL)</Label>
            <Input id="image_url" value={formData.image_url || ''} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Pozicija</Label>
            <Input id="position" value={formData.position || ''} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team_key">Komanda</Label>
             <Select onValueChange={(value: "BANGA A" | "BANGA B" | "BANGA M") => handleSelectChange('team_key', value)} value={formData.team_key || undefined}>
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
          <h3 className="font-semibold pt-4">Statistika</h3>
           <div className="space-y-2">
            <Label htmlFor="matches">Rungtynės</Label>
            <Input id="matches" type="number" value={formData.matches ?? ''} onChange={handleChange} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="minutes">Minutės</Label>
            <Input id="minutes" type="number" value={formData.minutes ?? ''} onChange={handleChange} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="goals">Įvarčiai</Label>
            <Input id="goals" type="number" value={formData.goals ?? ''} onChange={handleChange} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="assists">Asistai</Label>
            <Input id="assists" type="number" value={formData.assists ?? ''} onChange={handleChange} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="yellow_cards">Gel. kortelės</Label>
            <Input id="yellow_cards" type="number" value={formData.yellow_cards ?? ''} onChange={handleChange} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="red_cards">Raud. kortelės</Label>
            <Input id="red_cards" type="number" value={formData.red_cards ?? ''} onChange={handleChange} />
          </div>
           <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Atšaukti</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Atnaujinama..." : "Atnaujinti žaidėją"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 