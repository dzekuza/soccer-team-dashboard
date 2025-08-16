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
    id: "wallet",
    label: "Skaitmeninės piniginės",
    desc: "Apmokėkite greitai naudodami Apple Pay, Google Pay ir kt.",
  },
  {
    id: "card",
    label: "Mokėjimo kortelė",
    desc: "Apmokėkite naudodami Visa, Mastercard ar kitą banko kortelę.",
  },
]

export default function TicketsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<{ [tierId: string]: number }>({})
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [confirmEmail, setConfirmEmail] = useState("")
  const [payment, setPayment] = useState<string>("")

  useEffect(() => {
    if (!id) return
    const fetchEventData = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log("Fetching event data for ID:", id)
        const [eventRes, tiersRes] = await Promise.all([
          fetch(`/api/events/${id}`),
          fetch(`/api/events/${id}/pricing-tiers`),
        ])
        
        console.log("Event response status:", eventRes.status)
        console.log("Tiers response status:", tiersRes.status)
        
        if (!eventRes.ok) {
          const errorText = await eventRes.text()
          console.error("Event API error:", errorText)
          throw new Error(`Failed to fetch event details: ${eventRes.status}`)
        }
        if (!tiersRes.ok) {
          const errorText = await tiersRes.text()
          console.error("Tiers API error:", errorText)
          throw new Error(`Failed to fetch pricing tiers: ${tiersRes.status}`)
        }
        
        const { event, team1, team2 } = await eventRes.json()
        const pricingTiers = await tiersRes.json()
        
        console.log("Event data:", { event, team1, team2 })
        console.log("Pricing tiers:", pricingTiers)
        
        setEventData({
          event: { ...event, pricingTiers: pricingTiers || [] },
          team1,
          team2,
        })
      } catch (e: unknown) {
        console.error("Error in fetchEventData:", e)
        setError(e instanceof Error ? e.message : "An unknown error occurred.")
      } finally {
        setLoading(false)
      }
    }
    fetchEventData()
  }, [id])

  const selectedTiers = eventData?.event.pricingTiers.filter(tier => quantities[tier.id]) || []
  const total = selectedTiers.reduce((sum, tier) => sum + (quantities[tier.id] || 0) * tier.price, 0)
  const canSubmit = email && confirmEmail && email === confirmEmail && payment

  const handleQuantityChange = (tierId: string, delta: number, max: number) => {
    setQuantities(q => {
      const next = { ...q }
      next[tierId] = Math.max(0, Math.min((next[tierId] || 0) + delta, max))
      return next
    })
  }

  if (loading) return (
    <div className="bg-[#070F40] flex items-center justify-center min-h-screen text-white">
      <div className="text-center">
        <div className="text-2xl font-bold mb-4">Kraunama...</div>
        <div className="text-[#B0B8D9]">Gaunami renginio duomenys</div>
      </div>
    </div>
  )
  
  if (error) return (
    <div className="bg-[#070F40] flex items-center justify-center min-h-screen text-red-500">
      <div className="text-center">
        <div className="text-2xl font-bold mb-4">Klaida</div>
        <div className="text-lg">{error}</div>
        <Button 
          className="mt-4 btn-main"
          onClick={() => window.location.reload()}
        >
          Bandyti dar kartą
        </Button>
      </div>
    </div>
  )
  
  if (!eventData) return (
    <div className="bg-[#070F40] flex items-center justify-center min-h-screen text-white">
      <div className="text-center">
        <div className="text-2xl font-bold mb-4">Renginys nerastas</div>
        <div className="text-[#B0B8D9]">Renginys, kurio ieškote, neegzistuoja</div>
      </div>
    </div>
  )

  const { event, team1, team2 } = eventData

  return (
    <div className="bg-[#070F40] min-h-screen text-white">
      {/* Stepper */}
      <div className="flex w-full max-w-5xl mx-auto pt-10 pb-8">
        {["1. BILETO PASIRINKIMAS", "2. APMOKĖJIMAS", "3. BILIETAS"].map((label, idx) => (
          <div key={label} className={cn(
            "flex-1 flex flex-col items-center justify-center text-center",
            step === idx + 1 ? "text-white font-bold" : "text-[#B0B8D9] font-medium"
          )}>
            <div className={cn(
              "w-full px-2 py-3 text-lg uppercase border-b-4",
              step === idx + 1 ? "border-white" : "border-transparent"
            )}>{label}</div>
          </div>
        ))}
      </div>
      {/* Main content */}
      {step === 1 ? (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Ticket selection */}
          <Card className="bg-[#070F40] border border-[#232B5D] col-span-2 p-8">
            <h2 className="text-2xl font-bold mb-8">Pasirinkite bilietus</h2>
            {event.pricingTiers && event.pricingTiers.length > 0 ? (
              <div className="divide-y divide-[#232B5D]">
                {event.pricingTiers.map(tier => (
                  <div key={tier.id} className="flex flex-col md:flex-row md:items-center py-6 gap-6 md:gap-0">
                    <div className="flex-1">
                      <div className="text-lg font-bold mb-1">{tier.name}</div>
                      <div className="text-[#B0B8D9] text-sm mb-2">{tier.description}</div>
                      <div className="text-2xl font-bold mb-1">{tier.price === 0 ? "Nemokamas" : `€ ${tier.price.toFixed(2)}`}</div>
                      <div className="text-[#B0B8D9] text-xs">Liko {tier.quantity}</div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                      <Button variant="ghost" className="text-2xl px-3 py-1" onClick={() => handleQuantityChange(tier.id, -1, tier.quantity)}>-</Button>
                      <span className="text-xl font-bold w-6 text-center">{quantities[tier.id] || 0}</span>
                      <Button variant="ghost" className="text-2xl px-3 py-1" onClick={() => handleQuantityChange(tier.id, 1, tier.quantity)} disabled={(quantities[tier.id] || 0) >= tier.quantity}>+</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-[#B0B8D9] text-lg">Šiam renginiui kainų lygių nėra</div>
              </div>
            )}
          </Card>
          {/* Order summary */}
          <Card className="bg-[#070F40] border border-[#232B5D] p-8 flex flex-col gap-6">
            <div>
              <div className="text-lg font-bold mb-2">{team1?.team_name || 'Komanda 1'} – {team2?.team_name || 'Komanda 2'}</div>
              <div className="text-[#B0B8D9] text-sm mb-1">{event.date} {event.time && <span className="ml-2">{event.time}</span>}</div>
              <div className="text-[#B0B8D9] text-sm mb-1">{event.location}</div>
            </div>
            <div>
              <div className="text-lg font-bold mb-2">Užsakymo santrauka</div>
              {selectedTiers.length === 0 ? (
                <div className="text-[#B0B8D9]">Bilietų nepasirinkta.</div>
              ) : (
                <ul className="mb-2">
                  {selectedTiers.map(tier => (
                    <li key={tier.id} className="flex justify-between">
                      <span>{quantities[tier.id]} × {tier.name}{tier.price === 0 ? " (Nemokamas)" : tier.description?.includes("%") ? ` (${tier.description})` : ""}</span>
                      <span>{tier.price === 0 ? "€0.00" : `€${(tier.price * quantities[tier.id]).toFixed(2)}`}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex justify-between text-xl font-bold mt-4">
                <span>SUMA</span>
                <span>€{total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              className="btn-main text-lg font-bold w-full mt-4"
              disabled={selectedTiers.length === 0}
              onClick={() => {
                localStorage.setItem(`order-${id}`, JSON.stringify(quantities));
                setStep(2);
              }}
            >
              Check Out
            </Button>
          </Card>
        </div>
      ) : step === 2 ? (
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
            {payment === "card" && (
              <div className="mt-6 border border-[#232B5D] bg-[#10194A] p-6">
                <h3 className="text-xl font-bold mb-4">Įveskite kortelės duomenis</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Card number"
                    className="w-full bg-transparent border border-[#232B5D] rounded-none px-4 py-3 text-white placeholder-[#B0B8D9] text-lg outline-none"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="bg-transparent border border-[#232B5D] rounded-none px-4 py-3 text-white placeholder-[#B0B8D9] text-lg outline-none"
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      className="bg-transparent border border-[#232B5D] rounded-none px-4 py-3 text-white placeholder-[#B0B8D9] text-lg outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Cardholder name"
                    className="w-full bg-transparent border border-[#232B5D] rounded-none px-4 py-3 text-white placeholder-[#B0B8D9] text-lg outline-none"
                  />
                </div>
              </div>
            )}
            {payment === "wallet" && (
              <div className="mt-6 border border-[#232B5D] bg-[#10194A] p-6">
                <h3 className="text-xl font-bold mb-4">Pasirinkite skaitmeninę piniginę</h3>
                <div className="space-y-3">
                  {[
                    { id: "apple-pay", label: "Apple Pay", desc: "Apmokėkite naudodami Apple Pay" },
                    { id: "google-pay", label: "Google Pay", desc: "Apmokėkite naudodami Google Pay" },
                    { id: "paypal", label: "PayPal", desc: "Apmokėkite naudodami PayPal" },
                  ].map(wallet => (
                    <label key={wallet.id} className="flex items-center border border-[#232B5D] bg-transparent px-4 py-3 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="wallet"
                        value={wallet.id}
                        className="form-radio accent-main-orange mr-3 w-4 h-4"
                      />
                      <div>
                        <div className="text-lg font-medium">{wallet.label}</div>
                        <div className="text-[#B0B8D9] text-sm">{wallet.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </Card>
          {/* Order summary */}
          <Card className="bg-[#070F40] border border-[#232B5D] p-8 flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-3 h-3 rounded-full bg-white" />
              <span className="text-white font-medium">Time remaining:</span>
              <span className="text-white font-bold">15:00 min.</span>
            </div>
            <div>
              <div className="text-lg font-bold mb-2">{team1?.team_name || 'Team 1'} – {team2?.team_name || 'Team 2'}</div>
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
                      <span>{quantities[tier.id]} × {tier.name}{tier.price === 0 ? " (Nemokamas)" : tier.description?.includes("%") ? ` (${tier.description})` : ""}</span>
                      <span>{tier.price === 0 ? "€0.00" : `€${(tier.price * quantities[tier.id]).toFixed(2)}`}</span>
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
      ) : null}
    </div>
  )
} 