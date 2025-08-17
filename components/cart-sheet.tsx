"use client"

import { useCart } from "@/context/cart-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Minus, Plus, X } from "lucide-react"

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col bg-[#0A165B] text-white border-[#232C62] w-[400px] sm:w-[450px] p-0">
        {/* Header */}
        <div className="flex flex-row items-center justify-between border-b border-[#232C62] p-4">
          <SheetTitle className="text-white text-xl font-bold">Jūsų krepšelis</SheetTitle>
        </div>

        {cart.length > 0 ? (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-0">
                {cart.map(item => (
                  <div key={item.id} className="flex items-start gap-4 p-4 border-b border-[#232C62] bg-[#0A165B]">
                    {/* Item Image */}
                    <div className="flex-shrink-0">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        width={60} 
                        height={60} 
                        className="rounded-full object-cover w-[60px] h-[60px]" 
                      />
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-white text-base">{item.eventTitle}</p>
                          <p className="text-gray-400 text-sm">{item.name}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:bg-red-500/10 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-white font-bold text-lg">
                          {item.price.toFixed(2)} €
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 p-0 border-[#232C62] text-white hover:bg-white/10 rounded-none"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="text-white font-semibold min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 p-0 border-[#232C62] text-white hover:bg-white/10 rounded-none"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#232C62] p-4">
              <div className="w-full space-y-4">
                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-lg">Viso:</span>
                  <span className="text-white font-bold text-lg">{total.toFixed(2)} €</span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={clearCart} 
                    className="flex-1 border-[#232C62] text-white hover:bg-white/10 rounded-none"
                  >
                    Išvalyti
                  </Button>
                  <Button 
                    asChild 
                    className="flex-1 bg-[#F15601] hover:bg-[#F15601]/90 text-white font-semibold rounded-none"
                  >
                    <Link href="/checkout">Apmokėti</Link>
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-white text-lg">Jūsų krepšelis yra tuščias.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
} 