"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { EventWithTiers, Team, PricingTier } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CardElement, PaymentRequestButtonElement, useStripe, useElements } from '@stripe/react-stripe-js'

interface EventData {
  event: EventWithTiers
  team1: Team | null
  team2: Team | null
}

const paymentMethods = [
  {
    id: "wallet",
    label: "Skaitmeniniai piniginės",
    desc: "Apmokėkite greitai naudodami „Apple Pay“, „Google Pay“ ir kt.",
  },
  {
    id: "card",
    label: "Mokėjimo kortelė",
    desc: "Apmokėkite naudodami „Visa“, „Mastercard“ ar kitą banko kortelę.",
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
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentRequest, setPaymentRequest] = useState<any>(null)
  const [canMakePayment, setCanMakePayment] = useState(false)

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
  }, [id])

  const selectedTiers = eventData?.event.pricingTiers.filter(tier => quantities[tier.id]) || []
  const total = selectedTiers.reduce((sum, tier) => sum + (quantities[tier.id] || 0) * tier.price, 0)
  const canSubmit = email && confirmEmail && email === confirmEmail && payment

  useEffect(() => {
    if (stripe && total > 0 && !paymentRequest) {
      const pr = stripe.paymentRequest({
        country: 'LT',
        currency: 'eur',
        total: {
          label: 'Bilietai',
          amount: Math.round(total * 100),
        },
        requestPayerName: true,
        requestPayerEmail: true,
      })
      pr.canMakePayment().then(result => {
        setCanMakePayment(!!result)
      })
      setPaymentRequest(pr)
    }
  }, [stripe, total, paymentRequest])

  const handleQuantityChange = (tierId: string, delta: number, max: number) => {
    setQuantities(q => {
      const next = { ...q }
      next[tierId] = Math.max(0, Math.min((next[tierId] || 0) + delta, max))
      return next
    })
  }

  async function handleCardPayment(e: React.FormEvent) {
    e.preventDefault()
    setProcessing(true)
    setPaymentError(null)
    try {
      // Call your backend to create a PaymentIntent
      const res = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          email,
        }),
      })
      const { clientSecret, error } = await res.json()
      if (error) throw new Error(error)
      if (!stripe || !elements) throw new Error('Stripe not loaded')
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error('CardElement not found')
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { email },
        },
      })
      if (result.error) throw new Error(result.error.message)
      // Payment successful
      // TODO: Show success UI or redirect
    } catch (err: any) {
      setPaymentError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="bg-main flex items-center justify-center min-h-screen text-white">Loading...</div>
  if (error) return <div className="bg-main flex items-center justify-center min-h-screen text-red-500">{error}</div>
  if (!eventData) return <div className="bg-main flex items-center justify-center min-h-screen text-white">Event not found.</div>

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
            <div className="divide-y divide-[#232B5D]">
              {event.pricingTiers.map(tier => (
                <div key={tier.id} className="flex flex-col md:flex-row md:items-center py-6 gap-6 md:gap-0">
                  <div className="flex-1">
                    <div className="text-lg font-bold mb-1">{tier.name}</div>
                    <div className="text-[#B0B8D9] text-sm mb-2">{tier.description}</div>
                    <div className="text-2xl font-bold mb-1">{tier.price === 0 ? "Nemokamas" : `€ ${tier.price.toFixed(2)}`}</div>
                    <div className="text-[#B0B8D9] text-xs">Remaining {tier.quantity}</div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <Button variant="ghost" className="text-2xl px-3 py-1" onClick={() => handleQuantityChange(tier.id, -1, tier.quantity)}>-</Button>
                    <span className="text-xl font-bold w-6 text-center">{quantities[tier.id] || 0}</span>
                    <Button variant="ghost" className="text-2xl px-3 py-1" onClick={() => handleQuantityChange(tier.id, 1, tier.quantity)} disabled={(quantities[tier.id] || 0) >= tier.quantity}>+</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          {/* Order summary */}
          <Card className="bg-[#070F40] border border-[#232B5D] p-8 flex flex-col gap-6">
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
              <form onSubmit={handleCardPayment} className="mt-6">
                <div className="bg-[#10194A] p-6 rounded-md border border-[#232B5D]">
                  <div className="text-white font-bold mb-2">Įveskite kortelės duomenis</div>
                  <div className="bg-[#232B5D] h-12 flex items-center px-4">
                    <CardElement options={{ style: { base: { color: '#fff', fontSize: '18px' } } }} />
                  </div>
                  {paymentError && <div className="text-red-500 mt-2">{paymentError}</div>}
                  <Button className="btn-main text-lg font-bold w-full mt-4" type="submit" disabled={!canSubmit || processing}>{processing ? 'Vykdoma...' : 'Confirm Payment'}</Button>
                </div>
              </form>
            )}
            {payment === "wallet" && (
              <div className="mt-6">
                <div className="flex items-center gap-4 mb-2">
                  <img src="/apple-pay-badge.svg" alt="Apple Pay" className="h-8" />
                  <img src="/google-pay-badge.svg" alt="Google Pay" className="h-8" />
                </div>
                <div className="bg-[#232B5D] h-12 flex items-center justify-center text-[#B0B8D9]">
                  {canMakePayment && paymentRequest ? (
                    <PaymentRequestButtonElement options={{ paymentRequest }} />
                  ) : (
                    <span>Apple Pay / Google Pay (Stripe)</span>
                  )}
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