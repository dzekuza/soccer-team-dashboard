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

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

interface EventData {
  event: EventWithTiers
  team1: Team | null
  team2: Team | null
}

const steps = [
  { id: "01", name: "Varžybos", icon: CheckCircleIcon },
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <nav aria-label="Progress">
              <ol
                role="list"
                className="border border-main-border rounded-md divide-y divide-main-border md:flex md:divide-y-0"
              >
                {steps.map((step, stepIdx) => (
                  <li key={step.name} className="relative md:flex-1 md:flex">
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className={cn(
                        "group flex items-center w-full",
                        step.id === currentStep ? "text-main-orange" : ""
                      )}
                      aria-current={step.id === currentStep ? "step" : undefined}
                    >
                      <span className="px-6 py-4 flex items-center text-sm font-medium">
                        <span
                          className={cn(
                            "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full",
                            step.id === currentStep
                              ? "bg-main-orange"
                              : "bg-main-div-bg border-2 border-main-border"
                          )}
                        >
                          <step.icon
                            className={cn(
                              "w-6 h-6",
                              step.id === currentStep
                                ? "text-white"
                                : "text-gray-400"
                            )}
                            aria-hidden="true"
                          />
                        </span>
                        <span
                          className={cn(
                            "ml-4 text-sm font-medium",
                            step.id === currentStep
                              ? "text-white"
                              : "text-gray-300"
                          )}
                        >
                          {step.name}
                        </span>
                      </span>
                    </button>
                    {stepIdx !== steps.length - 1 ? (
                      <div
                        className="hidden md:block absolute top-0 right-0 h-full w-5"
                        aria-hidden="true"
                      >
                        <svg
                          className="h-full w-full text-main-border"
                          viewBox="0 0 22 80"
                          fill="none"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M0.5 0H20.5L8.5 40L20.5 80H0.5V0Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ol>
            </nav>

            {currentStep === "01" && (
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
            )}

            {currentStep === "02" && (
              <Card className="bg-main-div-bg border-main-border">
                <CardHeader>
                  <CardTitle className="text-white">
                    Pasirinkite bilieto tipą
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.pricingTiers?.map(tier => (
                      <button
                        key={tier.id}
                        onClick={() => setSelectedTier(tier)}
                        className={cn(
                          "div-main text-left p-6 rounded-lg border-2",
                          selectedTier?.id === tier.id
                            ? "border-main-orange"
                            : "border-main-border"
                        )}
                      >
                        <h3 className="text-xl font-bold">{tier.name}</h3>
                        <p className="text-2xl font-semibold mt-2">
                          {tier.price} €
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {tier.description || ""}
                        </p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
             {currentStep === "03" && (
              <Card className="bg-main-div-bg border-main-border">
                <CardHeader>
                  <CardTitle className="text-white">Jūsų Duomenys</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-white">
                          Vardas
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="bg-[#070f40] border-main-border text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-white">
                          Pavardė
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="bg-[#070f40] border-main-border text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">
                        El. paštas
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-[#070f40] border-main-border text-white"
                      />
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="w-full lg:col-span-1 space-y-6">
            <Card className="bg-main-div-bg border-main-border">
              <CardHeader>
                <CardTitle className="text-white">Užsakymo suvestinė</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTier ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Bilieto tipas</span>
                      <span className="font-semibold">{selectedTier.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Kaina</span>
                      <span className="font-semibold">
                        {selectedTier.price} €
                      </span>
                    </div>
                    <hr className="border-main-border" />
                    <div className="flex justify-between text-xl">
                      <span className="font-bold">Iš viso</span>
                      <span className="font-bold">
                        {selectedTier.price} €
                      </span>
                    </div>
                    <Button
                      onClick={handlePurchase}
                      className="w-full btn-main"
                      size="lg"
                    >
                      Pirkti bilietą
                    </Button>
                  </>
                ) : (
                  <p className="text-gray-400 text-center">
                    Pasirinkite bilietą.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 