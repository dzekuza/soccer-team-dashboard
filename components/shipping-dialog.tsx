"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Truck, Package } from "lucide-react"

interface ShippingDialogProps {
  orderId: string
  orderNumber: string
  customerName: string
  onShip: (trackingNumber: string, notes?: string) => Promise<void>
  trigger?: React.ReactNode
}

export function ShippingDialog({ 
  orderId, 
  orderNumber, 
  customerName, 
  onShip, 
  trigger 
}: ShippingDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!trackingNumber.trim()) {
      toast({
        title: "Klaida",
        description: "Sekimo numeris yra privalomas",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await onShip(trackingNumber.trim(), notes.trim() || undefined)
      
      toast({
        title: "Sėkminga",
        description: "Užsakymas sėkmingai išsiųstas",
      })
      
      // Reset form and close dialog
      setTrackingNumber("")
      setNotes("")
      setIsOpen(false)
    } catch (error) {
      console.error("Error shipping order:", error)
      toast({
        title: "Klaida",
        description: "Nepavyko išsiųsti užsakymo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="flex items-center gap-2">
      <Truck className="h-4 w-4" />
      Išsiųsti
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Išsiųsti užsakymą
          </DialogTitle>
          <DialogDescription>
            Įveskite sekimo numerį ir pasirinktinai pridėkite pastabas
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="order-info">Užsakymo informacija</Label>
            <div className="p-3 bg-muted rounded-md text-sm">
              <p><strong>Užsakymas:</strong> #{orderNumber}</p>
              <p><strong>Klientas:</strong> {customerName}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tracking-number">
              Sekimo numeris <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tracking-number"
              placeholder="Įveskite sekimo numerį..."
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Pastabos (pasirinktinai)</Label>
            <Textarea
              id="notes"
              placeholder="Pridėkite papildomas pastabas..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Atšaukti
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Siunčiama..." : "Išsiųsti"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
