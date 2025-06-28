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
} from "@heroicons/react/24/outline"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { loadStripe } from "@stripe/stripe-js"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
      <EventHeader event={event} team1={team1} team2={team2} />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full flex justify-center mb-6 bg-transparent">
            <TabsTrigger value="overview" className="flex-1">Apžvalga</TabsTrigger>
            <TabsTrigger value="tickets" className="flex-1">Bilietų informacija</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="bg-main-div-bg border-main-border">
              <CardHeader>
                <CardTitle className="text-white">Apie Renginį</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 whitespace-pre-wrap">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <Card className="bg-main-div-bg border-main-border flex flex-col items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="text-2xl font-bold text-white">{event.title}</div>
                <div className="flex flex-row items-center gap-6">
                  <img src={team1?.logo || '/placeholder-logo.svg'} alt={team1?.team_name || 'Komanda 1'} className="object-contain w-20 h-20" />
                  <span className="text-3xl font-extrabold text-white">VS</span>
                  <img src={team2?.logo || '/placeholder-logo.svg'} alt={team2?.team_name || 'Komanda 2'} className="object-contain w-20 h-20" />
                </div>
                <div className="flex flex-row items-center gap-8 mt-4">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-semibold text-white">{team1?.team_name || 'Komanda 1'}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-semibold text-white">{team2?.team_name || 'Komanda 2'}</span>
                  </div>
                </div>
                <div className="text-white text-xl mt-4">{event.date} {event.time && <span className="ml-2">{event.time}</span>}</div>
                <div className="text-white/80 text-lg">{event.location}</div>
              </div>
              <Link href={`/event/${event.id}/tickets`} passHref legacyBehavior>
                <Button className="btn-main text-lg font-bold w-full max-w-xs mt-8">Pasirinkti bilietus</Button>
              </Link>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
} 