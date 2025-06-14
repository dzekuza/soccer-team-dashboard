"use client";

import { useEffect, useState } from "react"
import { supabaseService } from "@/lib/supabase-service"
import type { Subscription } from "@/lib/types"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

export default function PublicSubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([])

  useEffect(() => {
    supabaseService.getSubscriptions().then(setSubs)
  }, [])

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Available Subscriptions</h1>
      <div className="space-y-6">
        {subs.map(s => (
          <div key={s.id} className="border rounded p-4 bg-white shadow">
            <h2 className="text-xl font-semibold mb-1">{s.title}</h2>
            <div className="text-gray-600 mb-2">{s.description}</div>
            <div className="mb-2">Price: <span className="font-bold">{formatCurrency(s.price)}</span></div>
            <div className="mb-2">Duration: <span className="font-bold">{s.durationDays} days</span></div>
            <Link href={`/checkout?subscriptionId=${s.id}`} className="inline-block px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 font-semibold">Buy</Link>
          </div>
        ))}
      </div>
    </div>
  )
} 