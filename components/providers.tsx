"use client"

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

export function Providers({ children }: { children: React.ReactNode }) {
  if (!stripePromise) {
    return <div className="bg-red-900 text-white p-4 text-center font-bold">Trūksta Stripe viešojo rakto. Nustatykite NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY savo aplinkoje.</div>
  }
  return <Elements stripe={stripePromise}>{children}</Elements>
} 