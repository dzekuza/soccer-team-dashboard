"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BarChart2, 
  Calendar, 
  Ticket, 
  QrCode, 
  HelpCircle, 
  User as UserIcon,
  Users,
  ChevronDown,
  ChevronUp,
  FileText,
  Tag,
  ShoppingBag,
  ShoppingCart,
  UserCheck,
  Megaphone,
  Trophy,
  Users2,
  Download,
  Settings
} from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase-browser"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from 'lucide-react'

export function DashboardMobileMenu() {
  const pathname = usePathname()
  const { user } = useAuth()
  const supabase = createClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [openSections, setOpenSections] = useState<string[]>([])

  // Main navigation for mobile bar
  const navigation = [
    { name: "Suvestinė", href: "/dashboard/overview", icon: BarChart2 },
    { name: "Naujienos", href: "/dashboard/naujienos", icon: FileText },
    { name: "QR skait.", href: "/dashboard/scanner", icon: QrCode },
    { name: "Pagalba", href: "/dashboard/help", icon: HelpCircle },
  ]

  // Full navigation structure matching existing URLs
  const fullNavigation = [
    { title: "Suvestinė", url: "/dashboard/overview", icon: BarChart2, isActive: pathname === "/dashboard/overview" },
    { title: "Naujienos", url: "/dashboard/naujienos", icon: FileText, isActive: pathname === "/dashboard/naujienos" },
    { title: "QR kodu skaitytuvas", url: "/dashboard/scanner", icon: QrCode, isActive: pathname === "/dashboard/scanner" },
    { 
      title: "Renginiai", 
      url: "/dashboard/renginiai", 
      icon: Calendar,
      isActive: pathname === "/dashboard/renginiai",
      subItems: [
        { title: "Bilietai", url: "/dashboard/bilietai" },
        { title: "Prenumeratos", url: "/dashboard/prenumeratos" },
        { title: "Prenumeratos tipai", url: "/dashboard/subscription-types" },
      ]
    },
    { title: "Kuponai", url: "/dashboard/coupons", icon: Tag, isActive: pathname === "/dashboard/coupons" },
    { 
      title: "Parduotuvė", 
      url: "/dashboard/parduotuve", 
      icon: ShoppingBag,
      isActive: pathname === "/dashboard/parduotuve",
      subItems: [
        { title: "Prekės", url: "/dashboard/shop" },
      ]
    },
    { title: "Gerbėjai", url: "/dashboard/fans", icon: UserCheck, isActive: pathname === "/dashboard/fans" },
    { title: "Rinkodara", url: "/dashboard/marketing", icon: Megaphone, isActive: pathname === "/dashboard/marketing" },
    { title: "Pagalba", url: "/dashboard/help", icon: HelpCircle, isActive: pathname === "/dashboard/help" },
    { 
      title: "Mano komanda", 
      url: "/dashboard/zaidejai", 
      icon: Users2,
      isActive: pathname === "/dashboard/zaidejai",
      subItems: [
        { title: "Žaidėjai", url: "/dashboard/zaidejai" },
        { title: "Rungtynės", url: "/dashboard/rungtynes" },
        { title: "Lentelė", url: "/dashboard/lentele" },
      ]
    },
    { title: "Eksportas", url: "/dashboard/export", icon: Download, isActive: pathname === "/dashboard/export" },
    { title: "Šablonai", url: "/dashboard/templates", icon: Settings, isActive: pathname === "/dashboard/templates" },
  ]

  // Actions for modal
  const modalActions = [
    { name: "Atsijungti", action: async () => await supabase.auth.signOut(), icon: Users },
  ]

  const toggleSection = (title: string) => {
    setOpenSections(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isSectionOpen = (title: string) => openSections.includes(title)

  const isAnySubItemActive = (item: any) => {
    if (!item.subItems) return false
    return item.subItems.some((subItem: any) => pathname === subItem.url)
  }

  return (
    <>
      {/* Mobile Sheet Menu */}
      <div className="md:hidden p-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Meniu</SheetTitle>
            </SheetHeader>
            <nav className="mt-8 space-y-2">
              {fullNavigation.map((item) => (
                <div key={item.title}>
                  {item.subItems ? (
                    <>
                      <button
                        className={cn(
                          "flex items-center w-full p-3 rounded-md transition-colors",
                          (item.isActive || isAnySubItemActive(item)) 
                            ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                            : "hover:bg-sidebar-accent/50"
                        )}
                        onClick={() => toggleSection(item.title)}
                      >
                        {item.icon && <item.icon className="h-5 w-5 mr-3" />}
                        {item.title}
                        {isSectionOpen(item.title) ? (
                          <ChevronUp className="ml-auto h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-auto h-4 w-4" />
                        )}
                      </button>
                      {isSectionOpen(item.title) && (
                        <div className="ml-8 mt-1 space-y-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.title}
                              href={subItem.url}
                              className={cn(
                                "flex items-center p-2 rounded-md transition-colors",
                                pathname === subItem.url 
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                                  : "hover:bg-sidebar-accent/30"
                              )}
                            >
                              {subItem.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.url}
                      className={cn(
                        "flex items-center p-3 rounded-md transition-colors",
                        pathname === item.url 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                          : "hover:bg-sidebar-accent/50"
                      )}
                    >
                      {item.icon && <item.icon className="h-5 w-5 mr-3" />}
                      {item.title}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-sidebar border-t border-sidebar-border shadow px-2 py-1 justify-between">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center flex-1 py-2 px-1 gap-0.5 text-xs text-sidebar-foreground hover:text-sidebar-accent-foreground transition",
              pathname === item.href ? "text-sidebar-accent-foreground font-bold" : ""
            )}
          >
            <item.icon className="h-6 w-6 mb-0.5" />
            <span className="leading-none text-[11px]">{item.name}</span>
          </Link>
        ))}
        <button
          onClick={() => setModalOpen(true)}
          className="flex flex-col items-center flex-1 py-2 px-1 text-xs text-sidebar-foreground hover:text-sidebar-accent-foreground transition"
          aria-label="Profilis"
        >
          <UserIcon className="h-6 w-6 mb-0.5" />
          <span className="leading-none text-[11px]">Profilis</span>
        </button>
      </nav>

      {/* Modal for extra actions, only on mobile */}
      {modalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end md:hidden bg-black/40" 
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="w-full rounded-t-lg p-4 shadow-lg bg-sidebar" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              {modalActions.map((item) => (
                <button
                  key={item.name}
                  onClick={async () => {
                    if (item.action) await item.action()
                    setModalOpen(false)
                  }}
                  className="flex items-center gap-3 py-3 px-2 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground text-base w-full text-left transition"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
            <button 
              className="mt-4 w-full py-2 bg-sidebar-accent text-sidebar-accent-foreground font-semibold rounded hover:bg-sidebar-accent/80 transition" 
              onClick={() => setModalOpen(false)}
            >
              Uždaryti
            </button>
          </div>
        </div>
      )}
    </>
  )
}
