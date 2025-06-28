"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { EventWithTiers, Team, PricingTier } from "@/lib/types"
import { cn } from "@/lib/utils"

interface EventData {
  event: EventWithTiers
  team1: Team | null
  team2: Team | null
}

const paymentMethods = [
  {
    id: "bank",
    label: "Elektroninė bankininkystė",
    desc: "Atsiskaitykite per savo internetinį banką – Swedbank, SEB, Luminor ir kt.",
  },
  {
    id: "wallet",
    label: "Skaitmeninės piniginės",
    desc: "Apmokėkite greitai naudodami „Apple Pay“, „Google Pay“, „PayPal“ ir kt.",
  },
  {
    id: "card",
    label: "Mokėjimo kortelė",
    desc: "Apmokėkite naudodami „Visa“, „Mastercard“ ar kitą banko kortelę.",
  },
]

export default function PaymentPage() {
  const { id } = useParams()
  const router = useRouter()
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<{ [tierId: string]: number }>({})
  const [email, setEmail] = useState("")
  const [confirmEmail, setConfirmEmail] = useState("")
  const [payment, setPayment] = useState<string>("")

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
        // For demo, simulate order from localStorage or default
        const savedOrder = typeof window !== "undefined" ? JSON.parse(localStorage.getItem(`order-${id}`) || '{}') : {}
        if (Object.keys(savedOrder).length === 0) {
          router.replace(`/event/${id}/tickets`)
          return
        }
        setOrder(savedOrder)
        setEventData({
          event: { ...event, pricingTiers: pricingTiers || [] },
          team1,
          team2,
        })
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "An unknown error occurred.")
      } finally {
        setLoading(false)
      }
    }
    fetchEventData()
  }, [id, router])

  const selectedTiers = eventData?.event.pricingTiers.filter(tier => order[tier.id]) || []
  const total = selectedTiers.reduce((sum, tier) => sum + (order[tier.id] || 0) * tier.price, 0)
  const canSubmit = email && confirmEmail && email === confirmEmail && payment

  if (loading) return <div className="bg-main flex items-center justify-center min-h-screen text-white">Loading...</div>
  if (error) return <div className="bg-main flex items-center justify-center min-h-screen text-red-500">{error}</div>
  if (!eventData) return <div className="bg-main flex items-center justify-center min-h-screen text-white">Event not found.</div>

  const { event, team1, team2 } = eventData

  return (
    <div className="bg-[#070F40] min-h-screen text-white">
      {/* Stepper */}
      <div className="flex w-full max-w-5xl mx-auto pt-10 pb-8">
        {["1. BILETO PASIRINKIMAS", "2. APMOKĖJIMAS", "3. BILIETAS"].map((step, idx) => (
          <div key={step} className={cn(
            "flex-1 flex flex-col items-center justify-center text-center",
            idx === 1 ? "text-white font-bold" : "text-[#B0B8D9] font-medium"
          )}>
            <div className={cn(
              "w-full px-2 py-3 text-lg uppercase border-b-4",
              idx === 1 ? "border-white" : "border-transparent"
            )}>{step}</div>
          </div>
        ))}
      </div>
      {/* Main content */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Payment form */}
        <Card className="bg-[#070F40] border border-[#232B5D] col-span-2 p-8">
          <h2 className="text-2xl font-bold mb-8">Where to send the tickets</h2>
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <input
              type="email"
              placeholder="Email address *"
              className="flex-1 bg-transparent border border-[#232B5D] rounded-none px-4 py-3 text-white placeholder-[#B0B8D9] text-lg outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="email"
              placeholder="Confirm address *"
              className="flex-1 bg-transparent border border-[#232B5D] rounded-none px-4 py-3 text-white placeholder-[#B0B8D9] text-lg outline-none"
              value={confirmEmail}
              onChange={e => setConfirmEmail(e.target.value)}
            />
          </div>
          <h2 className="text-2xl font-bold mb-6">Choose your payment method</h2>
          <div className="flex flex-col gap-4">
            {paymentMethods.map(method => (
              <label key={method.id} className={cn(
                "flex items-center border border-[#232B5D] bg-transparent px-6 py-5 cursor-pointer transition-colors",
                payment === method.id ? "border-white bg-[#10194A]" : ""
              )}>
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={payment === method.id}
                  onChange={() => setPayment(method.id)}
                  className="form-radio accent-main-orange mr-4 w-5 h-5"
                />
                <div>
                  <div className="text-lg font-bold mb-1">{method.label}</div>
                  <div className="text-[#B0B8D9] text-sm">{method.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </Card>
        {/* Order summary */}
        <Card className="bg-[#070F40] border border-[#232B5D] p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-3 h-3 rounded-full bg-white" />
            <span className="text-white font-medium">Time remaining:</span>
            <span className="text-white font-bold">15:00 min.</span>
          </div>
          <div>
            <div className="text-lg font-bold mb-2">{team1?.team_name} – {team2?.team_name}</div>
            <div className="text-[#B0B8D9] text-sm mb-1">{event.date} {event.time && <span className="ml-2">{event.time}</span>}</div>
            <div className="text-[#B0B8D9] text-sm mb-1">{event.location}</div>
          </div>
          <div>
            <div className="text-lg font-bold mb-2">Order Summary</div>
            {selectedTiers.length === 0 ? (
              <div className="text-[#B0B8D9]">No tickets selected.</div>
            ) : (
              <ul className="mb-2">
                {selectedTiers.map(tier => (
                  <li key={tier.id} className="flex justify-between">
                    <span>{order[tier.id]} × {tier.name}{tier.price === 0 ? " (Nemokamas)" : tier.description?.includes("%") ? ` (${tier.description})` : ""}</span>
                    <span>{tier.price === 0 ? "€0.00" : `€${(tier.price * order[tier.id]).toFixed(2)}`}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-between text-xl font-bold mt-4">
              <span>SUMA</span>
              <span>€{total.toFixed(2)}</span>
            </div>
          </div>
          <Button className="btn-main text-lg font-bold w-full mt-4" disabled={!canSubmit}>Confirm Payment</Button>
        </Card>
      </div>
    </div>
  )
} 