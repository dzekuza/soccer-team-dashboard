"use client"

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
import { useToast } from "@/components/ui/use-toast"
import type { Match } from "@/lib/types"

interface EditMatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMatchUpdated: () => void
  match: Match
}

export function EditMatchDialog({ open, onOpenChange, onMatchUpdated, match }: EditMatchDialogProps) {
  const [formData, setFormData] = useState<Partial<Match>>(match)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  useEffect(() => {
    setFormData(match);
  }, [match]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/matches/${match.fingerprint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update match');
      }

      toast({ title: "Success", description: "Match updated successfully." });
      onMatchUpdated()
      onOpenChange(false)

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Match</DialogTitle>
          <DialogDescription>Update the details for the selected match.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="team_key">Team Key</Label>
            <Input id="team_key" name="team_key" value={formData.team_key || ""} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="match_date">Match Date</Label>
            <Input id="match_date" name="match_date" type="date" value={formData.match_date || ""} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="match_time">Match Time</Label>
            <Input id="match_time" name="match_time" type="time" value={formData.match_time || ""} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team1">Home Team</Label>
            <Input id="team1" name="team1" value={formData.team1 || ""} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team2">Away Team</Label>
            <Input id="team2" name="team2" value={formData.team2 || ""} onChange={handleChange} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="team1_score">Home Score</Label>
            <Input id="team1_score" name="team1_score" type="number" value={formData.team1_score || ""} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team2_score">Away Score</Label>
            <Input id="team2_score" name="team2_score" type="number" value={formData.team2_score || ""} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Input id="venue" name="venue" value={formData.venue || ""} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Input id="status" name="status" value={formData.status || ""} onChange={handleChange} />
          </div>
          <DialogFooter className="col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Match"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 