"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { EventWithTiers, Team, PricingTier } from "@/lib/types"
import { useCart } from "@/context/cart-context"
import { CartSheet } from "@/components/cart-sheet"
import { PublicNavigation } from "@/components/public-navigation"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Minus, Plus } from "lucide-react"

interface EventData {
  event: EventWithTiers
  team1: Team | null
  team2: Team | null
}

export default function EventPage() {
  const { id } = useParams()
  const { toast } = useToast()
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false)
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart()

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

        if (!eventRes.ok) throw new Error("Nepavyko gauti renginio duomenų")
        if (!tiersRes.ok) throw new Error("Nepavyko gauti kainų lygių")

        const { event, team1, team2 } = await eventRes.json()
        const pricingTiers = await tiersRes.json()

        const fullEventData: EventData = {
          event: { ...event, pricingTiers: pricingTiers || [] },
          team1,
          team2,
        }

        setEventData(fullEventData)
      } catch (e: unknown) {
        console.error("Error fetching event data:", e)
        setError(e instanceof Error ? e.message : "Įvyko nežinoma klaida.")
      } finally {
        setLoading(false)
      }
    }

    fetchEventData()
  }, [id])

  const handleAddToCart = () => {
    if (!eventData) return
    
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
        description: "Pasirinkite bent vieną bilietą",
        variant: "destructive",
      })
    }
  }

  const getQuantityInCart = (tierId: string) => {
    const item = cart.find(item => item.id === tierId)
    return item ? item.quantity : 0
  }

  const handleQuantityChange = (tierId: string, newQuantity: number) => {
    const currentQuantity = getQuantityInCart(tierId)
    
    if (newQuantity === 0) {
      // Remove from cart if quantity is 0
      removeFromCart(tierId)
    } else if (currentQuantity === 0 && newQuantity > 0) {
      // Add new item to cart
      const tier = eventData?.event.pricingTiers?.find(t => t.id === tierId)
      if (tier && eventData) {
        addToCart({
          id: tier.id,
          name: tier.name,
          price: tier.price,
          quantity: newQuantity,
          eventId: eventData.event.id,
          eventTitle: eventData.event.title,
          image: eventData.event.coverImageUrl || "/Banga-1.png",
          color: `${eventData.team1?.team_name || 'TBD'} vs ${eventData.team2?.team_name || 'TBD'}`,
          category: "Bilietai",
        })
      }
    } else {
      // Update existing item quantity
      updateQuantity(tierId, newQuantity - currentQuantity)
    }
  }

  const getTotalPrice = () => {
    return eventData?.event.pricingTiers?.reduce((total, tier) => {
      const quantity = getQuantityInCart(tier.id)
      return total + (tier.price * quantity)
    }, 0) || 0
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleDateString('lt-LT', { month: 'long' })
    const year = date.getFullYear()
    const dayOfWeek = date.toLocaleDateString('lt-LT', { weekday: 'long' })
    return { day, month, year, dayOfWeek }
  }

  if (loading)
    return (
      <div className="bg-[#0A165B] flex items-center justify-center min-h-screen text-white">
        Kraunama...
      </div>
    )
  if (error)
    return (
      <div className="bg-[#0A165B] flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    )
  if (!eventData)
    return (
      <div className="bg-[#0A165B] flex items-center justify-center min-h-screen text-white">
        Renginys nerastas.
      </div>
    )

  const { event, team1, team2 } = eventData
  const dateInfo = formatDate(event.date)

  return (
    <div className="bg-[#0A165B] text-white min-h-screen">
      <PublicNavigation currentPage="events" />
      <CartSheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen} />

      {/* Event Banner */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        <Image
          src={event.coverImageUrl || '/Banga-1.png'}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {/* Team Logos and Names */}
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="flex flex-col items-center">
                <Image 
                  src={team1?.logo || '/Banga-1.png'} 
                  alt={team1?.team_name || 'Komanda 1'} 
                  width={80}
                  height={80}
                  className="object-contain w-20 h-20 mb-3" 
                />
                <span className="text-white font-bold text-lg">
                  {team1?.team_name || 'Banga'}
                </span>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white/80">VS</div>
              <div className="flex flex-col items-center">
                <Image 
                  src={team2?.logo || '/placeholder-logo.svg'} 
                  alt={team2?.team_name || 'Komanda 2'} 
                  width={80}
                  height={80}
                  className="object-contain w-20 h-20 mb-3" 
                />
                <span className="text-white font-bold text-lg">
                  {team2?.team_name || 'K. Žalgiris'}
                </span>
              </div>
            </div>
            
            <div className="text-white/90 text-lg">
              {event.time}, {dateInfo.dayOfWeek} {dateInfo.day}, {dateInfo.month}
            </div>
            <div className="text-white/90 text-lg">
              {event.location}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="w-full px-4 md:px-8 lg:px-16 pb-20 lg:pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left Column - Event Information */}
          <div>
            <div className="bg-[#0A165B] border-l border-t border-b border-[#232C62] p-6 h-full">
              <h2 className="text-white text-xl font-bold mb-4">APIE RENGINĮ</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                {event.description || `Svarbus mačas tarp FK "Banga" ir "${team2?.team_name || 'Kauno Žalgiris'}" ${event.location} stadione ${dateInfo.day} ${dateInfo.month}. Namų komanda sieks atsigauti po nesėkmių ir stiprinti savo poziciją lygos lentelėje, įrodant savo stiprybę prieš vieną iš čempionato lyderių ir atkurti gerbėjų pasitikėjimą.`}
              </p>
              
              <div className="space-y-4">
                <h3 className="text-white text-lg font-semibold">Rungtynių informacija</h3>
                <div className="space-y-3 text-gray-300">
                  <div><strong>Data:</strong> {dateInfo.year} m. {dateInfo.month} {dateInfo.day} d. ({dateInfo.dayOfWeek})</div>
                  <div><strong>Laikas:</strong> {event.time}</div>
                  <div><strong>Vieta:</strong> {event.location}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Ticket Selection */}
          <div>
            <div className="bg-[#0A165B] border-l border-r border-t border-b border-[#232C62] p-6 h-full">
              <h2 className="text-white text-xl font-bold mb-6">BILIETAI</h2>
              
              {/* Ticket Types */}
              <div className="space-y-4 mb-6">
                {event.pricingTiers?.map((tier) => {
                  const quantity = getQuantityInCart(tier.id)
                  const soldQuantity = tier.soldQuantity || 0
                  const totalQuantity = tier.quantity || 0
                  const remaining = Math.max(0, totalQuantity - soldQuantity)
                  
                  return (
                    <div key={tier.id} className="border border-[#232C62] p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg">{tier.name}</h3>
                          <p className="text-gray-400 text-sm mt-1">
                            {tier.description || getTierDescription(tier.name)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold text-xl">
                            €{tier.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(tier.id, Math.max(0, quantity - 1))}
                            className="w-8 h-8 p-0 border-[#232C62] text-white hover:bg-white/10"
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
                            className="w-8 h-8 p-0 border-[#232C62] text-white hover:bg-white/10"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-gray-400 text-sm">
                          Liko {remaining}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Event Details Summary */}
              <div className="border-t border-[#232C62] pt-4 mb-6">
                <div className="text-center text-gray-300 space-y-1">
                  <div className="font-semibold">{team1?.team_name || 'FK „Banga"'} - {team2?.team_name || '„K. Žalgiris"'}</div>
                  <div>{dateInfo.year} m. {dateInfo.month} {dateInfo.day} d. ({dateInfo.dayOfWeek}), {event.time} EEST</div>
                  <div>{event.location}</div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-[#232C62] pt-4 mb-6">
                <h3 className="text-white font-semibold mb-3">Užsakymo suvestinė</h3>
                <div className="space-y-2">
                  {event.pricingTiers?.map((tier) => {
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

// Helper function to get tier descriptions
function getTierDescription(tierName: string): string {
  const descriptions: Record<string, string> = {
    'Suaugusiųjų': 'Standartinis bilietas asmenims nuo 18 metų be nuolaidų',
    'Studento': '-30% nuolaida galioja studentams su pažymėjimu',
    'Moksleivio': '-50% nuolaida moksleiviams iki 18 metų su pažymėjimu',
    'Lengvatinis': 'Vaikai iki 12 m, senjorai, neįgalieji, Ukrainos piliečiai. Reikalingas dokumentas.',
  }
  return descriptions[tierName] || 'Standartinis bilietas'
} 