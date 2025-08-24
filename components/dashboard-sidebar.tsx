"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Home, Calendar, Ticket, Users, BarChart2, Settings, LogOut, User as UserIcon, QrCode, Download, Megaphone, BadgeCheck, ChevronDown, ChevronUp, Tag, ShoppingBag, HelpCircle } from "lucide-react"
import { createClient } from "@/lib/supabase-browser"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import clsx from "clsx"
import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from 'lucide-react'

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const supabase = createClient()

  const navItems = [
    { name: "Suvestinė", href: "/dashboard/overview", icon: BarChart2 },
    { name: "Renginiai", href: "/dashboard/renginiai", icon: Calendar },
    { name: "Bilietai", href: "/dashboard/bilietai", icon: Ticket },
    { name: "Prenumeratos", href: "/dashboard/prenumeratos", icon: Ticket },
    { name: "Prenumeratos tipai", href: "/dashboard/subscription-types", icon: BadgeCheck },
    { name: "Kuponai", href: "/dashboard/coupons", icon: Tag },
    { name: "Parduotuvė", href: "/dashboard/parduotuve", icon: ShoppingBag },
    { name: "Gerbėjai", href: "/dashboard/fans", icon: Users },
    { name: "QR skaitytuvas", href: "/dashboard/scanner", icon: QrCode },
    { name: "Eksportas", href: "/dashboard/export", icon: Download },
    { name: "Šablonai", href: "/dashboard/templates", icon: Settings },
    { name: "Rinkodara", href: "/dashboard/marketing", icon: Megaphone },
    { name: "Pagalba", href: "/dashboard/help", icon: HelpCircle },
  ]

  // Dropdown state for My Team
  const [myTeamOpen, setMyTeamOpen] = useState(false)
  const isMyTeamActive = ["/dashboard/zaidejai", "/dashboard/rungtynes"].includes(pathname)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 p-4 border-r fixed h-full bg-sidebar">
        <div className="flex items-center mb-8">
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
        <nav>
          <ul>
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center p-2 rounded-md",
                    pathname === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            ))}
            {/* My Team Dropdown */}
            <li>
              <button
                className={cn(
                  "flex items-center w-full p-2 rounded-md transition",
                  isMyTeamActive || myTeamOpen ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                )}
                onClick={() => setMyTeamOpen((v) => !v)}
                aria-expanded={myTeamOpen}
              >
                <Users className="h-5 w-5 mr-3" />
                Mano komanda
                {myTeamOpen ? <ChevronUp className="ml-auto h-4 w-4" /> : <ChevronDown className="ml-auto h-4 w-4" />}
              </button>
              {(myTeamOpen || isMyTeamActive) && (
                <ul className="ml-8 mt-1 space-y-1">
                  <li>
                    <Link href="/dashboard/zaidejai" className={cn("flex items-center p-2 rounded-md", pathname === "/dashboard/zaidejai" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/30")}>Žaidėjai</Link>
                  </li>
                  <li>
                    <Link href="/dashboard/rungtynes" className={cn("flex items-center p-2 rounded-md", pathname === "/dashboard/rungtynes" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/30")}>Rungtynės</Link>
                  </li>
                  <li>
                    <Link href="/dashboard/lentele" className={cn("flex items-center p-2 rounded-md", pathname === "/dashboard/lentele" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/30")}>Lentelė</Link>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </aside>

      {/* Mobile Menu */}
      <div className="md:hidden p-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Meniu</SheetTitle>
            </SheetHeader>
            <nav className="mt-8">
              <ul>
                {navItems.map((item) => (
                  <li key={item.name}>
                     <Link href={item.href} className={`flex items-center p-3 rounded-md ${pathname === item.href ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                ))}
                {/* My Team Dropdown for mobile */}
                <li>
                  <button
                    className={cn(
                      "flex items-center w-full p-3 rounded-md transition",
                      isMyTeamActive || myTeamOpen ? "bg-gray-200" : "hover:bg-gray-100"
                    )}
                    onClick={() => setMyTeamOpen((v) => !v)}
                    aria-expanded={myTeamOpen}
                  >
                    <Users className="h-5 w-5 mr-3" />
                    Mano komanda
                    {myTeamOpen ? <ChevronUp className="ml-auto h-4 w-4" /> : <ChevronDown className="ml-auto h-4 w-4" />}
                  </button>
                  {(myTeamOpen || isMyTeamActive) && (
                    <ul className="ml-8 mt-1 space-y-1">
                      <li>
                        <Link href="/dashboard/zaidejai" className={cn("flex items-center p-2 rounded-md", pathname === "/dashboard/zaidejai" ? "bg-gray-200" : "hover:bg-gray-100")}>Žaidėjai</Link>
                      </li>
                      <li>
                        <Link href="/dashboard/rungtynes" className={cn("flex items-center p-2 rounded-md", pathname === "/dashboard/rungtynes" ? "bg-gray-200" : "hover:bg-gray-100")}>Rungtynės</Link>
                      </li>
                      <li>
                        <Link href="/dashboard/lentele" className={cn("flex items-center p-2 rounded-md", pathname === "/dashboard/lentele" ? "bg-gray-200" : "hover:bg-gray-100")}>Lentelė</Link>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

// Mobile bottom menu for navigation
export function DashboardMobileMenu() {
  const pathname = usePathname();
  const { user } = useAuth()
  const supabase = createClient()
  const [modalOpen, setModalOpen] = useState(false);

  // Main navigation for mobile bar
  const navigation = [
    { name: "Suvestinė", href: "/dashboard/overview", icon: BarChart2 },
    { name: "Renginiai", href: "/dashboard/renginiai", icon: Calendar },
    { name: "Bilietai", href: "/dashboard/bilietai", icon: Ticket },
    { name: "QR skait.", href: "/dashboard/scanner", icon: QrCode },
    { name: "Pagalba", href: "/dashboard/help", icon: HelpCircle },
  ];

  // Actions for modal
  const modalActions = [
    { name: "Prenumeratos", href: "/dashboard/prenumeratos", icon: Ticket },
    { name: "Gerbėjai", href: "/dashboard/fans", icon: Users },
    { name: "Eksportas", href: "/dashboard/export", icon: Ticket },
    { name: "Šablonai", href: "/dashboard/templates", icon: Settings },
    { name: "Pagalba", href: "/dashboard/help", icon: HelpCircle },
    { name: "Atsijungti", action: async () => await supabase.auth.signOut(), icon: LogOut },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-main border-t border-main-border shadow px-2 py-1 justify-between" style={{backgroundColor: '#0A165B'}}>
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center flex-1 py-2 px-1 gap-0.5 text-xs text-white hover:text-main-orange transition ${pathname === item.href ? "text-main-orange font-bold" : ""}`}
          >
            <item.icon className="h-6 w-6 mb-0.5" />
            <span className="leading-none text-[11px]">{item.name}</span>
          </Link>
        ))}
        <button
          onClick={() => setModalOpen(true)}
          className="flex flex-col items-center flex-1 py-2 px-1 text-xs text-white hover:text-main-orange transition"
          aria-label="Profilis"
        >
          <UserIcon className="h-6 w-6 mb-0.5" />
          <span className="leading-none text-[11px]">Profilis</span>
        </button>
      </nav>
      {/* Modal for extra actions, only on mobile */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden bg-black/40" onClick={() => setModalOpen(false)}>
          <div className="w-full rounded-t-lg p-4 shadow-lg" style={{ background: 'rgba(7, 15, 64, 0.70)' }} onClick={e => e.stopPropagation()}>
            <div className="flex flex-col gap-2">
              {modalActions.map((item) =>
                item.href ? (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 py-3 px-2 rounded hover:bg-main hover:text-main-orange text-white text-base transition"
                    onClick={() => setModalOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ) : (
                  <button
                    key={item.name}
                    onClick={async () => {
                      if (item.action) await item.action();
                      setModalOpen(false);
                    }}
                    className="flex items-center gap-3 py-3 px-2 rounded hover:bg-main hover:text-main-orange text-white text-base w-full text-left transition"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                )
              )}
            </div>
            <button className="mt-4 w-full py-2 btn-main font-semibold rounded" onClick={() => setModalOpen(false)}>
              Uždaryti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
