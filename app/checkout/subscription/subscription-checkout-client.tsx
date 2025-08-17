"use client";

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import type { SubscriptionType } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function SubscriptionCheckoutClient() {
  const searchParams = useSearchParams()
  const typeId = searchParams.get('typeId')
  
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: ''
  })

  const fetchSubscriptionType = useCallback(async () => {
    try {
      const response = await fetch('/api/subscription-types/public')
      if (!response.ok) throw new Error('Nepavyko užkrauti prenumeratos tipų')
      const data = await response.json()
      const type = data.find((t: SubscriptionType) => t.id === typeId)
      if (type) {
        setSubscriptionType(type)
      } else {
        setError('Prenumeratos tipas nerastas')
      }
    } catch (err) {
      console.error('Error fetching subscription type:', err)
      setError('Nepavyko užkrauti prenumeratos tipo')
    } finally {
      setIsLoading(false)
    }
  }, [typeId])

  useEffect(() => {
    if (typeId) {
      fetchSubscriptionType()
    } else {
      setError('Prenumeratos tipas nenurodytas')
      setIsLoading(false)
    }
  }, [typeId, fetchSubscriptionType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subscriptionType) return

    setIsProcessing(true)
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionTypeId: subscriptionType.id,
          purchaserName: formData.name,
          purchaserSurname: formData.surname,
          purchaserEmail: formData.email,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Nepavyko sukurti apmokėjimo sesijos')
      }

      const { sessionId } = await response.json()
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe nepalaikomas')
      }

      const { error } = await stripe.redirectToCheckout({ sessionId })
      if (error) {
        throw new Error(error.message)
      }
    } catch (err) {
      console.error('Error creating checkout session:', err)
      setError(err instanceof Error ? err.message : 'Nepavyko pradėti apmokėjimo')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full px-4 md:px-8 lg:px-16 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F15601] mx-auto mb-4"></div>
          <p className="text-white">Kraunama...</p>
        </div>
      </div>
    )
  }

  if (error || !subscriptionType) {
    return (
      <div className="w-full px-4 md:px-8 lg:px-16 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Klaida</h1>
          <p className="text-gray-300">{error || 'Prenumeratos tipas nerastas'}</p>
          <Button 
            onClick={() => window.history.back()} 
            className="mt-4 bg-[#F15601] hover:bg-[#E04501]"
          >
            Grįžti atgal
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 md:px-8 lg:px-16 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Prenumeratos pirkimas</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription Type Summary */}
        <Card className="bg-[#0A165B]/50 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">{subscriptionType.title}</CardTitle>
            <CardDescription className="text-gray-300">{subscriptionType.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-3xl font-bold text-[#F15601] mb-1">
                {formatCurrency(subscriptionType.price)}
              </div>
              <div className="text-sm text-gray-400">
                {subscriptionType.duration_days === 30 ? 'per mėnesį' : 
                 subscriptionType.duration_days === 365 ? 'per metus' : 
                 `per ${subscriptionType.duration_days} dienų`}
              </div>
            </div>
            
            {subscriptionType.features && subscriptionType.features.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-3 text-white">Įtraukta:</h3>
                <ul className="space-y-2">
                  {subscriptionType.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-300">
                      <Check className="h-4 w-4 mr-2 text-[#F15601] flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Purchase Form */}
        <Card className="bg-[#0A165B]/50 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Pirkėjo informacija</CardTitle>
            <CardDescription className="text-gray-300">Užpildykite savo duomenis prenumeratos pirkimui</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Vardas *</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname" className="text-white">Pavardė *</Label>
                  <Input 
                    id="surname" 
                    value={formData.surname} 
                    onChange={(e) => setFormData({...formData, surname: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">El. paštas *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  required 
                />
              </div>

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-400/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="border-t border-gray-600 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-white">Iš viso:</span>
                  <span className="text-xl font-bold text-[#F15601]">
                    {formatCurrency(subscriptionType.price)}
                  </span>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full bg-[#F15601] hover:bg-[#E04501]"
                >
                  {isProcessing ? "Apdorojama..." : "Pirkti prenumeratą"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
