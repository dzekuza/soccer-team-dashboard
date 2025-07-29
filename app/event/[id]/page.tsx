"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { EventWithTiers, Team, PricingTier } from "@/lib/types"
import { useCart } from "@/context/cart-context"
import { CartSheet } from "@/components/cart-sheet"
import { EventHeader } from "@/components/event-header"
import { cn } from "@/lib/utils"
import {
  CheckCircleIcon,
  CreditCardIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { loadStripe } from "@stripe/stripe-js"
import Link from "next/link"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

interface EventData {
  event: EventWithTiers
  team1: Team | null
  team2: Team | null
}

const steps = [
  { id: "01", name: "Apie varžybąs", icon: CheckCircleIcon },
  { id: "02", name: "Bilietai", icon: CreditCardIcon },
  { id: "03", name: "Duomenys", icon: UserIcon },
]

export default function EventPage() {
  const { id } = useParams()
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false)
  const { cart, addToCart, updateQuantity } = useCart()
  const [currentStep, setCurrentStep] = useState("01")
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })

  useEffect(() => {
    if (eventData?.event?.pricingTiers?.[0]) {
      setSelectedTier(eventData.event.pricingTiers[0])
    }
  }, [eventData])

  useEffect(() => {
    if (!id) return

    const fetchEventData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [eventRes, tiersRes] = await Promise.all([
          fetch(`/api/events/${id}`),
          fetch(`/api/events/${id}/pricing-tiers`),
        ])

        if (!eventRes.ok) throw new Error("Failed to fetch event details")
        if (!tiersRes.ok) throw new Error("Failed to fetch pricing tiers")

        const { event, team1, team2 } = await eventRes.json()
        const pricingTiers = await tiersRes.json()

        const fullEventData: EventData = {
          event: { ...event, pricingTiers: pricingTiers || [] },
          team1,
          team2,
        }

        setEventData(fullEventData)
      } catch (e: unknown) {
        console.error("Error fetching event data:", e)
        setError(e instanceof Error ? e.message : "An unknown error occurred.")
      } finally {
        setLoading(false)
      }
    }

    fetchEventData()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePurchase = async () => {
    if (!selectedTier || !eventData) {
      alert("Please select a ticket tier.")
      return
    }

    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert("Please fill in all your details.")
      setCurrentStep("03")
      return
    }

    try {
      const response = await fetch("/api/checkout/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: eventData.event.id,
          tierId: selectedTier.id,
          quantity: 1, // For now, we handle one ticket at a time
          purchaserName: formData.firstName,
          purchaserSurname: formData.lastName,
          purchaserEmail: formData.email,
        }),
      })

      const { sessionId, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      const stripe = await stripePromise
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          console.error("Stripe redirect error:", error)
          alert(`Payment error: ${error.message}`)
        }
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error)
      alert(`An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleAddToCart = () => {
    if (!selectedTier || !eventData) return
    const { event, team1, team2 } = eventData
    addToCart({
      id: selectedTier.id,
      name: selectedTier.name,
      price: selectedTier.price,
      quantity: 1,
      eventId: event.id,
      eventTitle: event.title,
      image: event.coverImageUrl || "/placeholder.jpg",
      color:
        team1 && team2
          ? `${team1.team_name} vs ${team2.team_name}`
          : "Renginys",
      category: "Bilietai",
    })
    setIsCartSheetOpen(true)
  }

  const getQuantityInCart = (tierId: string) => {
    const item = cart.find(item => item.id === tierId)
    return item ? item.quantity : 0
  }

  if (loading)
    return (
      <div className="bg-main flex items-center justify-center min-h-screen text-white">
        Loading...
      </div>
    )
  if (error)
    return (
      <div className="bg-main flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    )
  if (!eventData)
    return (
      <div className="bg-main flex items-center justify-center min-h-screen text-white">
        Event not found.
      </div>
    )

  const { event, team1, team2 } = eventData

  return (
    <div className="bg-main text-white min-h-screen">
      <CartSheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen} />

      {/* Cover Image Section */}
      {event.coverImageUrl && (
        <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
          <Image
            src={event.coverImageUrl}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {/* Team Logos and Names */}
              <div className="flex items-center justify-center gap-8 mb-6">
                <div className="flex flex-col items-center">
                  <img 
                    src={team1?.logo || '/placeholder-logo.svg'} 
                    alt={team1?.team_name || 'Komanda 1'} 
                    className="object-contain w-20 h-20 mb-3" 
                  />
                  <span className="text-white font-bold text-lg">
                    {team1?.team_name || 'Komanda 1'}
                  </span>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white/80">VS</div>
                <div className="flex flex-col items-center">
                  <img 
                    src={team2?.logo || '/placeholder-logo.svg'} 
                    alt={team2?.team_name || 'Komanda 2'} 
                    className="object-contain w-20 h-20 mb-3" 
                  />
                  <span className="text-white font-bold text-lg">
                    {team2?.team_name || 'Komanda 2'}
                  </span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                {event.title}
              </h1>
              <div className="flex items-center justify-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  <span>{event.date}</span>
                </div>
                {event.time && (
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5" />
                    <span>{event.time}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* 2x1 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Event Description */}
          <div className="space-y-6">
            <Card className="bg-main-div-bg border-main-border">
              <CardHeader>
                <CardTitle className="text-white">Apie Renginį</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Event Details Card */}
            <Card className="bg-main-div-bg border-main-border">
              <CardHeader>
                <CardTitle className="text-white">Renginio Informacija</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Data</p>
                    <p className="text-white font-medium">{event.date}</p>
                  </div>
                </div>
                {event.time && (
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-sm text-gray-400">Laikas</p>
                      <p className="text-white font-medium">{event.time}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <MapPinIcon className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Vieta</p>
                    <p className="text-white font-medium">{event.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Ticket Selection */}
          <div className="space-y-6">
            <Card className="bg-main-div-bg border-main-border">
              <CardHeader>
                <CardTitle className="text-white">Bilietų Pasirinkimas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Team Display */}
                <div className="flex items-center justify-center gap-6 mb-6">
                  <div className="flex flex-col items-center">
                    <img 
                      src={team1?.logo || '/placeholder-logo.svg'} 
                      alt={team1?.team_name || 'Komanda 1'} 
                      className="object-contain w-16 h-16 mb-2" 
                    />
                    <span className="text-white font-semibold text-center">
                      {team1?.team_name || 'Komanda 1'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">VS</div>
                  <div className="flex flex-col items-center">
                    <img 
                      src={team2?.logo || '/placeholder-logo.svg'} 
                      alt={team2?.team_name || 'Komanda 2'} 
                      className="object-contain w-16 h-16 mb-2" 
                    />
                    <span className="text-white font-semibold text-center">
                      {team2?.team_name || 'Komanda 2'}
                    </span>
                  </div>
                </div>

                {/* Pricing Tiers */}
                {event.pricingTiers && event.pricingTiers.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Pasirinkite bilietą:</h3>
                    {event.pricingTiers.map((tier) => {
                      const soldQuantity = tier.soldQuantity || 0
                      const totalQuantity = tier.quantity || 0
                      const availableQuantity = Math.max(0, totalQuantity - soldQuantity)
                      const inCart = getQuantityInCart(tier.id)
                      
                      return (
                        <div
                          key={tier.id}
                          className={cn(
                            "border rounded-lg p-4 cursor-pointer transition-all",
                            selectedTier?.id === tier.id
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-main-border hover:border-gray-600"
                          )}
                          onClick={() => setSelectedTier(tier)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="text-white font-semibold">{tier.name}</h4>
                              {tier.description && (
                                <p className="text-gray-400 text-sm mt-1">{tier.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-white">€{tier.price}</p>
                              <p className="text-sm text-gray-400">
                                Liko: {availableQuantity} bilietų
                              </p>
                            </div>
                          </div>
                          
                          {inCart > 0 && (
                            <div className="mt-2 p-2 bg-green-500/20 border border-green-500/30 rounded">
                              <p className="text-green-400 text-sm">
                                Krepšelyje: {inCart} vnt.
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Bilietų informacija neprieinama</p>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedTier && (
                  <div className="grid grid-cols-2 gap-4 pt-6">
                    <Button
                      onClick={handleAddToCart}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors duration-200"
                      disabled={selectedTier.quantity - selectedTier.soldQuantity <= 0}
                    >
                      Pridėti į krepšelį
                    </Button>
                    
                    <Link href={`/event/${event.id}/tickets`} passHref>
                      <Button className="w-full bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200">
                        Peržiūrėti bilietus
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 