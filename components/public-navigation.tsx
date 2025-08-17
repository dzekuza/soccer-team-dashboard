"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Menu, X } from "lucide-react"
import { useState } from "react"
import { useCart } from "@/context/cart-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { CartSheet } from "@/components/cart-sheet"

interface PublicNavigationProps {
  currentPage?: string
}

export function PublicNavigation({ currentPage = "events" }: PublicNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false)
  const { cart } = useCart()
  
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0)

  const navigationItems = [
    { href: "/events", label: "Renginiai", page: "events" },
    { href: "/subscriptions", label: "Abonementai", page: "subscriptions" },
    { href: "/tickets", label: "Bilietai", page: "tickets" },
    { href: "/contact", label: "Kontaktai", page: "contact" },
  ]

  return (
    <>
      <nav className="bg-[#0A165B] border-b border-[rgba(95,95,113,0.3)] h-[82px] flex items-center">
        <div className="w-full px-4 md:px-8 lg:px-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/Banga-1.png" 
                alt="FK Banga" 
                width={48} 
                height={48} 
                className="object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className={`transition-colors ${
                  currentPage === item.page 
                    ? "text-white" 
                    : "text-white hover:text-gray-300"
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Shopping Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartSheetOpen(true)}
              className="relative text-white hover:bg-white/10"
            >
              <ShoppingCart className="w-6 h-6" />
              <div className="absolute -top-2 -right-2 bg-[#F15601] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </div>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-4">
            {/* Shopping Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartSheetOpen(true)}
              className="relative text-white hover:bg-white/10"
            >
              <ShoppingCart className="w-6 h-6" />
              <div className="absolute -top-2 -right-2 bg-[#F15601] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </div>
            </Button>
            
            {/* Hamburger Menu */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-white hover:bg-white/10"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent className="bg-[#0A165B] text-white border-[#232C62] w-[300px] p-0">
          <SheetHeader className="border-b border-[#232C62] p-4">
            <SheetTitle className="text-white text-xl font-bold text-left">Meniu</SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col p-4 space-y-4">
            {navigationItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-lg py-3 px-4 transition-colors ${
                  currentPage === item.page 
                    ? "bg-[#F15601] text-white" 
                    : "text-white hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Cart Sheet */}
      <CartSheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen} />
    </>
  )
}
