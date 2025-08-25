"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Menu, ChevronDown, Clock3 } from "lucide-react"
import { useState, useEffect } from "react"
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
import { Match } from "@/lib/types"

interface PublicNavigationProps {
  currentPage?: string
}

export function PublicNavigation({ currentPage = "events" }: PublicNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false)
  const [upcomingMatch, setUpcomingMatch] = useState<Match | null>(null)
  const { cart } = useCart()
  
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0)

  useEffect(() => {
    async function fetchUpcomingMatch() {
      try {
        const response = await fetch('/api/matches/upcoming')
        if (response.ok) {
          const data = await response.json()
          setUpcomingMatch(data)
        }
      } catch (error) {
        console.error('Failed to fetch upcoming match:', error)
      }
    }

    fetchUpcomingMatch()
  }, [])

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = [
      'sausio', 'vasario', 'kovo', 'balandžio', 'gegužės', 'birželio',
      'liepos', 'rugpjūčio', 'rugsėjo', 'spalio', 'lapkričio', 'gruodžio'
    ]
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`
  }

  const formatMatchTime = (timeString: string) => {
    return timeString?.substring(0, 5) || ''
  }

  const navigationItems = [
    { href: "https://darkorange-partridge-697021.hostingersite.com/klubas/", label: "Klubas", page: "klubas", external: true },
    { href: "/naujienos", label: "Naujienos", page: "naujienos", external: false },
    { href: "https://darkorange-partridge-697021.hostingersite.com/komandos/", label: "Komandos", page: "komandos", external: true },
    { href: "/zaidejai", label: "Žaidėjai", page: "zaidejai", external: false },
    { href: "/lentele", label: "Lentelė", page: "lentele", external: false },
    { href: "/rezultatai", label: "Rezultatai", page: "rezultatai", external: false },
    { 
      label: "Bilietai ir abonementai", 
      page: "tickets-subscriptions",
      dropdown: true,
      items: [
        { href: "/renginiai", label: "Bilietai", page: "renginiai", external: false },
        { href: "/prenumeratos", label: "Abonementai", page: "prenumeratos", external: false }
      ]
    },
    { href: "https://darkorange-partridge-697021.hostingersite.com/pamaina/", label: "Akademija", page: "akademija", external: true },
    { href: "/parduotuve", label: "Parduotuvė", page: "parduotuve", external: false },
    { href: "https://darkorange-partridge-697021.hostingersite.com/kontaktai/", label: "Kontaktai", page: "kontaktai", external: true },
  ]

  return (
    <>
      {/* Top subnavigation (match info) */}
      <div className="bg-[#070F40] relative">
        <div
          className="border-b border-[rgba(95,95,113,0.3)] bg-gradient-to-b from-[#070f40]/80 to-transparent"
        >
          <div className="w-full px-4 md:px-8 lg:px-16 h-10 flex items-center justify-between">
            {/* Left: date and time */}
            <div className="flex items-center gap-2 text-[#F15601] text-sm">
              <Clock3 className="h-4 w-4" />
              {upcomingMatch ? (
                <span>
                  {formatMatchDate(upcomingMatch.match_date!)}, {formatMatchTime(upcomingMatch.match_time!)}
                </span>
              ) : (
                <span>Nėra artimiausių rungtynių</span>
              )}
            </div>

            {/* Center: teams */}
            <div className="hidden md:flex items-center gap-2 text-white text-sm">
              {upcomingMatch ? (
                <>
                  <span>{upcomingMatch.team1}</span>
                  <span>-</span>
                  <span>{upcomingMatch.team2}</span>
                </>
              ) : (
                <span>Banga</span>
              )}
            </div>

            {/* Right: stadium */}
            <div className="text-xs md:text-sm text-white/60">
              {upcomingMatch?.venue || 'FK „Žalgiris" namų stadionas'}
            </div>
          </div>
        </div>

        {/* Main navigation */}
        <nav className="bg-[#0A165B] border-b border-[rgba(95,95,113,0.3)] h-[72px] flex items-center">
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
                          className={`flex items-center gap-1 transition-colors bg-transparent hover:bg-transparent focus:bg-transparent rounded-none ${
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
                              href={dropdownItem.href || "#"}
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
                    href={item.href || "#"}
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
      </div>

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
                        href={dropdownItem.href || "#"}
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
                  href={item.href || "#"}
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
