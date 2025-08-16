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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { v4 as uuidv4 } from "uuid"
import type { SubscriptionType } from "@/lib/types"

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
  const [selectedSubscriptionTypeId, setSelectedSubscriptionTypeId] = useState("")
  const [validFrom, setValidFrom] = useState(() => new Date().toISOString().split('T')[0])
  const [validTo, setValidTo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subscriptionTypes, setSubscriptionTypes] = useState<SubscriptionType[]>([])
  const { user } = useAuth();

  // Fetch subscription types when dialog opens
  useEffect(() => {
    if (open) {
      fetchSubscriptionTypes()
    }
  }, [open])

  const fetchSubscriptionTypes = async () => {
    try {
      const response = await fetch('/api/subscription-types')
      if (!response.ok) throw new Error("Failed to fetch subscription types")
      const data = await response.json()
      setSubscriptionTypes(data.filter((type: SubscriptionType) => type.is_active))
    } catch (error) {
      console.error("Failed to fetch subscription types:", error)
      setError("Nepavyko užkrauti prenumeratos tipų")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
        setError("Turite būti prisijungę, kad galėtumėte sukurti prenumeratą.");
        return;
    }
    if (!selectedSubscriptionTypeId) {
        setError("Prašome pasirinkti prenumeratos tipą.");
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
                subscription_type_id: selectedSubscriptionTypeId,
            }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Nepavyko sukurti prenumeratos");
        }

      onSubscriptionCreated()
      onOpenChange(false)
      // Reset form
      setPurchaserName("")
      setPurchaserSurname("")
      setPurchaserEmail("")
      setSelectedSubscriptionTypeId("")
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

  const selectedSubscriptionType = subscriptionTypes.find(type => type.id === selectedSubscriptionTypeId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sukurti prenumeratą</DialogTitle>
          <DialogDescription>Įveskite naujos prenumeratos informaciją.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subscription-type">Prenumeratos tipas *</Label>
            <Select value={selectedSubscriptionTypeId} onValueChange={setSelectedSubscriptionTypeId} required>
              <SelectTrigger>
                <SelectValue placeholder="Pasirinkite prenumeratos tipą" />
              </SelectTrigger>
              <SelectContent>
                {subscriptionTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.title} - €{type.price} ({type.duration_days} dienų)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSubscriptionType && (
            <div className="p-3 bg-[#0A165B]/20 border border-[#0A165B]/30 rounded-lg">
              <h4 className="font-medium text-sm mb-2 text-white">{selectedSubscriptionType.title}</h4>
              <p className="text-sm text-gray-300 mb-2">{selectedSubscriptionType.description}</p>
              <div className="text-sm text-gray-300">
                <span className="font-medium">Kaina:</span> €{selectedSubscriptionType.price} | 
                <span className="font-medium ml-2">Trukmė:</span> {selectedSubscriptionType.duration_days} dienų
              </div>
              {selectedSubscriptionType.features && selectedSubscriptionType.features.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm font-medium text-white">Funkcijos:</span>
                  <ul className="text-sm text-gray-300 mt-1">
                    {selectedSubscriptionType.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Pirkėjo vardas</Label>
            <Input id="name" value={purchaserName} onChange={(e) => setPurchaserName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="surname">Pirkėjo pavardė</Label>
            <Input id="surname" value={purchaserSurname} onChange={(e) => setPurchaserSurname(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Pirkėjo el. paštas</Label>
            <Input id="email" type="email" value={purchaserEmail} onChange={(e) => setPurchaserEmail(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="valid-from">Galioja nuo</Label>
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
              Atšaukti
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Kuriama..." : "Sukurti"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 