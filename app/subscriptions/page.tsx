"use client";

import { useEffect, useState } from "react"
import type { SubscriptionPlan } from "@/lib/types"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

// Mock subscription plans - in a real app, these would come from the database
const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: "basic-monthly",
    title: "Basic Monthly",
    description: "Access to all home games for one month",
    price: 29.99,
    durationDays: 30,
    features: ["All home games", "Email support", "Mobile tickets"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "premium-monthly",
    title: "Premium Monthly",
    description: "Access to all games with premium benefits",
    price: 49.99,
    durationDays: 30,
    features: ["All home and away games", "Priority seating", "VIP support", "Exclusive content"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "season-pass",
    title: "Season Pass",
    description: "Full season access with all premium features",
    price: 299.99,
    durationDays: 365,
    features: ["All games", "Priority seating", "VIP support", "Exclusive content", "Season merchandise"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function PublicSubscriptionsPage() {
  const [subs, setSubs] = useState<SubscriptionPlan[]>([])

  useEffect(() => {
    // For now, use mock data. In the future, this would fetch from the database
    setSubs(mockSubscriptionPlans.filter(plan => plan.isActive))
  }, [])

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-[#0A165B]">Galimos prenumeratos</h1>
      <div className="space-y-6">
        {subs.map(s => (
          <div key={s.id} className="border rounded p-4 bg-white shadow">
            <h2 className="text-xl font-semibold mb-1 text-[#0A165B]">{s.title}</h2>
            <div className="text-gray-600 mb-2">{s.description}</div>
            <div className="mb-2">Kaina: <span className="font-bold text-[#F15601]">{formatCurrency(s.price)}</span></div>
            <div className="mb-2">Trukmė: <span className="font-bold">{s.durationDays} dienų</span></div>
            {s.features && s.features.length > 0 && (
              <div className="mb-3">
                <h3 className="font-semibold text-sm mb-1 text-[#0A165B]">Funkcijos:</h3>
                <ul className="text-sm text-gray-600">
                  {s.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-[#F15601] mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link href={`/checkout?subscriptionId=${s.id}`} className="inline-block px-4 py-2 bg-[#F15601] text-white rounded hover:bg-[#E04501] font-semibold">Pirkti</Link>
          </div>
        ))}
      </div>
    </div>
  )
} 