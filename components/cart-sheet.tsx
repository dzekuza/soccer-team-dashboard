"use client"

import { useCart } from "@/context/cart-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Trash2 } from "lucide-react"

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col bg-gray-900 text-white border-gray-800">
        <SheetHeader>
          <SheetTitle>Jūsų krepšelis</SheetTitle>
        </SheetHeader>
        {cart.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto pr-4 -mr-6">
              <ul className="space-y-4">
                {cart.map(item => (
                  <li key={item.id} className="flex items-start gap-4">
                    <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold">{item.eventTitle}</p>
                      <p className="text-sm text-gray-400">{item.name}</p>
                      <p className="text-sm">{item.price.toFixed(2)} €</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.id, -1)}>-</Button>
                        <span>{item.quantity}</span>
                        <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.id, 1)}>+</Button>
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <SheetFooter className="mt-auto border-t border-gray-800 pt-4">
              <div className="w-full space-y-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Viso:</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={clearCart} className="w-full border-gray-700 hover:bg-gray-800">Išvalyti</Button>
                    <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                      <Link href="/checkout">Apmokėti</Link>
                    </Button>
                </div>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p>Jūsų krepšelis yra tuščias.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
} 