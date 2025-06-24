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
import { useAuth } from "@/hooks/use-auth"
import { v4 as uuidv4 } from "uuid"

interface CreateSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubscriptionCreated: () => void
}

export function CreateSubscriptionDialog({
  open,
  onOpenChange,
  onSubscriptionCreated,
}: CreateSubscriptionDialogProps) {
  const [purchaserName, setPurchaserName] = useState("")
  const [purchaserSurname, setPurchaserSurname] = useState("")
  const [purchaserEmail, setPurchaserEmail] = useState("")
  const [validFrom, setValidFrom] = useState(() => new Date().toISOString().split('T')[0])
  const [validTo, setValidTo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
        setError("You must be logged in to create a subscription.");
        return;
    }
    setIsLoading(true)
    setError(null)

    try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
        // Use only the subscription ID for the QR code value
        const subscriptionId = uuidv4();
        const qrCodeValue = subscriptionId;

        const response = await fetch(`${baseUrl}/api/subscriptions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                purchaser_name: purchaserName,
                purchaser_surname: purchaserSurname,
                purchaser_email: purchaserEmail,
                valid_from: validFrom,
                valid_to: validTo,
                qr_code_url: qrCodeValue,
                owner_id: user.id,
                id: subscriptionId,
            }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create subscription");
        }

      onSubscriptionCreated()
      onOpenChange(false)
      // Reset form
      setPurchaserName("")
      setPurchaserSurname("")
      setPurchaserEmail("")
      setValidFrom("")
      setValidTo("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const setEndDate = (months: number) => {
    const from = validFrom ? new Date(validFrom) : new Date();
    if (isNaN(from.getTime())) {
        // if validFrom is somehow invalid, use today as the base
        from.setTime(new Date().getTime());
    }
    from.setMonth(from.getMonth() + months);
    setValidTo(from.toISOString().split('T')[0]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Subscription</DialogTitle>
          <DialogDescription>Enter the details for the new subscription.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Purchaser Name</Label>
            <Input id="name" value={purchaserName} onChange={(e) => setPurchaserName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="surname">Purchaser Surname</Label>
            <Input id="surname" value={purchaserSurname} onChange={(e) => setPurchaserSurname(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Purchaser Email</Label>
            <Input id="email" type="email" value={purchaserEmail} onChange={(e) => setPurchaserEmail(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="valid-from">Valid From</Label>
                <Input id="valid-from" type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="valid-to">Galioja iki</Label>
                <Input id="valid-to" type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => setEndDate(1)} className="flex-grow">1 mėn.</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setEndDate(2)} className="flex-grow">2 mėn.</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setEndDate(3)} className="flex-grow">3 mėn.</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setEndDate(6)} className="flex-grow">6 mėn.</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setEndDate(12)} className="flex-grow">1 metai</Button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 