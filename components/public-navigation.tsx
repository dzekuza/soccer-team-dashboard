"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Menu, X, ChevronDown } from "lucide-react"
import { useState } from "react"
import { useCart } from "@/context/cart-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { CartSheet } from "@/components/cart-sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PublicNavigationProps {
  currentPage?: string
}

export function PublicNavigation({ currentPage = "events" }: PublicNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false)
  const { cart } = useCart()
  
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0)

  const navigationItems = [
    { href: "https://darkorange-partridge-697021.hostingersite.com/klubas/", label: "Klubas", page: "klubas", external: true },
    { href: "https://darkorange-partridge-697021.hostingersite.com/naujienos/", label: "Naujienos", page: "naujienos", external: true },
    { href: "https://darkorange-partridge-697021.hostingersite.com/komandos/", label: "Komandos", page: "komandos", external: true },
    { 
      label: "Bilietai ir abonementai", 
      page: "tickets-subscriptions",
      dropdown: true,
      items: [
        { href: "https://soccer-team-dashboard.vercel.app/events", label: "Bilietai", page: "events", external: true },
        { href: "https://soccer-team-dashboard.vercel.app/subscriptions", label: "Abonementai", page: "subscriptions", external: true }
      ]
    },
    { href: "https://darkorange-partridge-697021.hostingersite.com/pamaina/", label: "Akademija", page: "akademija", external: true },
    { href: "https://darkorange-partridge-697021.hostingersite.com/shop/", label: "Parduotuvė", page: "parduotuve", external: true },
    { href: "https://darkorange-partridge-697021.hostingersite.com/kontaktai/", label: "Kontaktai", page: "kontaktai", external: true },
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
            {navigationItems.map((item) => {
              if (item.dropdown) {
                return (
                  <DropdownMenu key={item.page}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`flex items-center gap-1 transition-colors bg-transparent hover:bg-transparent focus:bg-transparent ${
                          currentPage === item.page 
                            ? "text-[#F15601] border-b-2 border-[#F15601]" 
                            : "text-white hover:text-[#F15601] hover:border-b-2 hover:border-[#F15601]"
                        }`}
                      >
                        {item.label}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#0A165B] border-[#232C62] rounded-none">
                      {item.items?.map((dropdownItem) => (
                        <DropdownMenuItem key={dropdownItem.href} className="rounded-none hover:bg-transparent focus:bg-transparent">
                          <Link 
                            href={dropdownItem.href}
                            target={dropdownItem.external ? "_blank" : "_self"}
                            className="text-white hover:text-[#F15601] w-full"
                          >
                            {dropdownItem.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }
              
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  target={item.external ? "_blank" : "_self"}
                  className={`transition-colors ${
                    currentPage === item.page 
                      ? "text-[#F15601] border-b-2 border-[#F15601]" 
                      : "text-white hover:text-[#F15601] hover:border-b-2 hover:border-[#F15601]"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            
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
          
          <div className="flex flex-col p-4 space-y-2">
            {navigationItems.map((item) => {
              if (item.dropdown) {
                return (
                  <div key={item.page} className="space-y-2">
                    <div className="text-lg py-3 px-4 text-white font-semibold">
                      {item.label}
                    </div>
                    {item.items?.map((dropdownItem) => (
                      <Link 
                        key={dropdownItem.href}
                        href={dropdownItem.href}
                        target={dropdownItem.external ? "_blank" : "_self"}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`text-base py-2 px-8 transition-colors ${
                          currentPage === dropdownItem.page 
                            ? "text-[#F15601] border-l-2 border-[#F15601]" 
                            : "text-white hover:text-[#F15601] hover:border-l-2 hover:border-[#F15601]"
                        }`}
                      >
                        {dropdownItem.label}
                      </Link>
                    ))}
                  </div>
                )
              }
              
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  target={item.external ? "_blank" : "_self"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg py-3 px-4 transition-colors ${
                    currentPage === item.page 
                      ? "text-[#F15601] border-l-2 border-[#F15601]" 
                      : "text-white hover:text-[#F15601] hover:border-l-2 hover:border-[#F15601]"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Cart Sheet */}
      <CartSheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen} />
    </>
  )
}
