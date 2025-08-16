"use client";

import { useEffect, useState } from "react"
import type { SubscriptionType } from "@/lib/types"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

export default function PublicSubscriptionsPage() {
  const [subscriptionTypes, setSubscriptionTypes] = useState<SubscriptionType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSubscriptionTypes() {
      try {
        const response = await fetch('/api/subscription-types/public')
        if (!response.ok) {
          throw new Error('Nepavyko užkrauti prenumeratos tipų')
        }
        const data = await response.json()
        setSubscriptionTypes(data.filter((type: SubscriptionType) => type.is_active))
      } catch (err) {
        console.error('Error fetching subscription types:', err)
        setError('Nepavyko užkrauti prenumeratos tipų')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscriptionTypes()
  }, [])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6 text-white">Galimos prenumeratos</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-6 bg-[#0A165B]/50 border-gray-700 shadow animate-pulse">
              <div className="h-6 bg-gray-600 rounded mb-2"></div>
              <div className="h-4 bg-gray-600 rounded mb-4"></div>
              <div className="h-8 bg-gray-600 rounded mb-4"></div>
              <div className="h-4 bg-gray-600 rounded mb-2"></div>
              <div className="h-4 bg-gray-600 rounded mb-4"></div>
              <div className="h-10 bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6 text-white">Galimos prenumeratos</h1>
        <div className="text-center text-red-400">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-white">Galimos prenumeratos</h1>
      
      {subscriptionTypes.length === 0 ? (
        <div className="text-center text-gray-300">
          <p>Šiuo metu nėra galimų prenumeratos tipų.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subscriptionTypes.map((subscriptionType) => (
            <Card key={subscriptionType.id} className="hover:shadow-lg transition-shadow bg-[#0A165B]/50 border border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{subscriptionType.title}</CardTitle>
                  <Badge variant="outline" className="text-[#F15601] border-[#F15601]">
                    {subscriptionType.duration_days} dienų
                  </Badge>
                </div>
                <CardDescription className="text-gray-300">
                  {subscriptionType.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-3xl font-bold text-[#F15601] mb-1">
                    {formatCurrency(subscriptionType.price)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {subscriptionType.duration_days === 30 ? 'per mėnesį' : 
                     subscriptionType.duration_days === 365 ? 'per metus' : 
                     `per ${subscriptionType.duration_days} dienų`}
                  </div>
                </div>
                
                {subscriptionType.features && subscriptionType.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-sm mb-3 text-white">Įtraukta:</h3>
                    <ul className="space-y-2">
                      {subscriptionType.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-300">
                          <Check className="h-4 w-4 mr-2 text-[#F15601] flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <Link 
                  href={`/checkout/subscription?typeId=${subscriptionType.id}`} 
                  className="w-full inline-flex justify-center items-center px-4 py-2 bg-[#F15601] text-white rounded-lg hover:bg-[#E04501] font-semibold transition-colors"
                >
                  Pirkti prenumeratą
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 