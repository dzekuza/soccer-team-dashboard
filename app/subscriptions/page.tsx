"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { PublicNavigation } from "@/components/public-navigation"
import { useCart } from "@/context/cart-context"
import { CartSheet } from "@/components/cart-sheet"
import { useToast } from "@/components/ui/use-toast"
import { Minus, Plus } from "lucide-react"

interface SubscriptionTier {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  soldQuantity: number
}

export default function SubscriptionsPage() {
  const { toast } = useToast()
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart()
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false)

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/subscription-types/public')
        if (!response.ok) throw new Error("Nepavyko gauti abonementų")
        
        const data = await response.json()
        setSubscriptionTiers(data)
      } catch (e: unknown) {
        console.error("Error fetching subscriptions:", e)
        setError(e instanceof Error ? e.message : "Įvyko nežinoma klaida.")
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptions()
  }, [])

  const getQuantityInCart = (tierId: string) => {
    const item = cart.find(item => item.id === tierId)
    return item ? item.quantity : 0
  }

  const getTotalPrice = () => {
    return subscriptionTiers.reduce((total, tier) => {
      const quantity = getQuantityInCart(tier.id)
      return total + (tier.price * quantity)
    }, 0)
  }

  const handleQuantityChange = (tierId: string, newQuantity: number) => {
    const currentQuantity = getQuantityInCart(tierId)
    
    if (newQuantity === 0) {
      // Remove from cart if quantity is 0
      removeFromCart(tierId)
    } else if (currentQuantity === 0 && newQuantity > 0) {
      // Add new item to cart
      const tier = subscriptionTiers.find(t => t.id === tierId)
      if (tier) {
        addToCart({
          id: tier.id,
          name: tier.name,
          price: tier.price,
          quantity: newQuantity,
          eventId: "subscription",
          eventTitle: "Abonementai",
          image: "/Banga-1.png",
          color: "Abonementai",
          category: "Abonementai",
        })
      }
    } else {
      // Update existing item quantity
      updateQuantity(tierId, newQuantity - currentQuantity)
    }
  }

  const handleAddToCart = () => {
    // Check if there are any items in cart
    const hasItems = cart.length > 0

    if (hasItems) {
      setIsCartSheetOpen(true)
      toast({
        title: "Krepšelis atidarytas",
        description: "Jūsų krepšelis yra paruoštas",
      })
    } else {
      toast({
        title: "Klaida",
        description: "Pasirinkite bent vieną abonementą",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A165B] text-white flex items-center justify-center">
        <div className="text-white text-xl">Kraunama...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A165B] text-white flex items-center justify-center">
        <div className="text-red-500 text-xl">Klaida: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A165B] text-white">
      <PublicNavigation currentPage="subscriptions" />
      <CartSheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen} />
      
      {/* Main Content */}
      <div className="w-full pb-20 lg:pb-0">
        <div className="text-center py-8 border-b border-[#232C62]">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Abonementai</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left Column - About Subscriptions */}
          <div>
            <div className="bg-[#0A165B] border-l border-t border-b border-[#232C62] p-6 h-full">
              <h2 className="text-white text-xl font-bold mb-4">APIE ABONEMENTUS</h2>
              <p className="text-gray-300 leading-relaxed">
                Svarbus abonementų pasiūlymas FK &quot;Banga&quot; gerbėjams. Su mūsų abonementais galėsite lankytis visuose namų rungtynių sezone, gauti specialius pasiūlymus ir būti pirmieji, kurie sužinos apie naujienas. Abonementai suteikia ne tik patogumą, bet ir finansinę naudą, nes kaina yra žemesnė nei atskirų bilietų suma. Pasirinkite jums tinkamiausią abonementą ir tapkite tikru FK &quot;Banga&quot; gerbėju!
              </p>
            </div>
          </div>

          {/* Right Column - Subscription Selection */}
          <div>
            <div className="bg-[#0A165B] border-l border-r border-t border-b border-[#232C62] p-6 h-full flex flex-col">
              <h2 className="text-white text-xl font-bold mb-6">ABONEMENTAI</h2>
              
              {/* Subscription Tiers */}
              <div className="space-y-4 mb-6 flex-1">
                {subscriptionTiers.map((tier) => {
                  const quantity = getQuantityInCart(tier.id)
                  const remaining = tier.quantity - tier.soldQuantity
                  
                  return (
                    <div key={tier.id} className="border border-[#232C62] p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg">{tier.name}</h3>
                          <p className="text-gray-400 text-sm mt-1">
                            {tier.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold text-xl">
                            €{tier.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(tier.id, Math.max(0, quantity - 1))}
                            className="w-8 h-8 p-0 border-[#232C62] text-white hover:bg-white/10 rounded-none"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="text-white font-semibold min-w-[2rem] text-center">
                            {quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(tier.id, quantity + 1)}
                            className="w-8 h-8 p-0 border-[#232C62] text-white hover:bg-white/10 rounded-none"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Order Summary */}
              <div className="border-t border-[#232C62] pt-4 mb-6">
                <h3 className="text-white font-semibold mb-3">Jūsų užsakymas</h3>
                <div className="space-y-2">
                  {subscriptionTiers.map((tier) => {
                    const quantity = getQuantityInCart(tier.id)
                    if (quantity === 0) return null
                    
                    return (
                      <div key={tier.id} className="flex justify-between text-gray-300">
                        <span>{quantity} x {tier.name}</span>
                        <span>€{(tier.price * quantity).toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="border-t border-[#232C62] pt-2 mt-3">
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>SUMA</span>
                    <span>€{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button - Desktop Only */}
              <div className="hidden lg:block">
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-[#F15601] hover:bg-[#F15601]/90 text-white font-semibold py-3 text-lg rounded-none"
                >
                  Pridėti į krepšelį
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Add to Cart Button - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0A165B] border-t border-[#232C62] p-4 lg:hidden z-50">
        <Button
          onClick={handleAddToCart}
          className="w-full bg-[#F15601] hover:bg-[#F15601]/90 text-white font-semibold py-4 text-lg rounded-none"
        >
          Pridėti į krepšelį
        </Button>
      </div>
    </div>
  )
} 