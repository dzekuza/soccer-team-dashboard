import { Suspense } from "react"
import { SubscriptionTypesClient } from "./subscription-types-client"
import { supabaseService } from "@/lib/supabase-service"
import type { SubscriptionType } from "@/lib/types"

export default async function SubscriptionTypesPage() {
  const subscriptionTypes = await supabaseService.getSubscriptionTypes()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Prenumeratos tipai</h1>
        <p className="text-gray-300 mt-2">
          Valdykite skirtingus prenumeratos tipus su kainomis ir funkcijomis
        </p>
      </div>
      
      <Suspense fallback={<div>Kraunama...</div>}>
        <SubscriptionTypesClient initialSubscriptionTypes={subscriptionTypes} />
      </Suspense>
    </div>
  )
}
