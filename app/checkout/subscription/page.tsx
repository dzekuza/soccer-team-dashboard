"use client";

import { Suspense } from "react"
import { SubscriptionCheckoutClient } from "./subscription-checkout-client"

export default function SubscriptionCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F15601] mx-auto mb-4"></div>
          <p className="text-white">Kraunama...</p>
        </div>
      </div>
    }>
      <SubscriptionCheckoutClient />
    </Suspense>
  )
} 