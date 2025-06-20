"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, Ticket, Users, BarChart2, Settings, LogOut, User } from "lucide-react"
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import clsx from "clsx"
import { useState } from "react"

export function DashboardSidebar() {
  const pathname = usePathname()
  const user = useUser()
  const supabase = useSupabaseClient()

  const navItems = [
    { name: "Overview", href: "/dashboard/overview", icon: BarChart2 },
    { name: "Events", href: "/dashboard/events", icon: Calendar },
    { name: "Tickets", href: "/dashboard/tickets", icon: Ticket },
    { name: "Subscriptions", href: "/dashboard/subscriptions", icon: Ticket },
    { name: "Fans", href: "/dashboard/fans", icon: Users },
    { name: "QR Scanner", href: "/dashboard/scanner", icon: Ticket },
    { name: "Export", href: "/dashboard/export", icon: Ticket },
  ]

  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="">My Team</span>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${pathname === item.href && "bg-muted text-primary"}`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p className="font-medium">{user?.email}</p>
          </div>
          <button onClick={async () => await supabase.auth.signOut()} className="flex items-center text-gray-600 hover:text-gray-900">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Mobile bottom menu for navigation
export function DashboardMobileMenu() {
  const pathname = usePathname();
  const user = useUser()
  const supabase = useSupabaseClient()
  const [modalOpen, setModalOpen] = useState(false);

  // Main navigation for mobile bar
  const navigation = [
    { name: "Suvestinė", href: "/dashboard/overview", icon: BarChart2 },
    { name: "Renginiai", href: "/dashboard/events", icon: Calendar },
    { name: "Bilietai", href: "/dashboard/tickets", icon: Ticket },
    { name: "QR skaitytuvas", href: "/dashboard/scanner", icon: Ticket },
  ];

  // Actions for modal
  const modalActions = [
    { name: "Prenumeratos", href: "/dashboard/subscriptions", icon: Ticket },
    { name: "Gerbėjai", href: "/dashboard/fans", icon: Users },
    { name: "Eksportas", href: "/dashboard/export", icon: Ticket },
    { name: "Atsijungti", action: async () => await supabase.auth.signOut(), icon: LogOut },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-white border-t border-gray-200 shadow px-2 py-1 justify-between">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center flex-1 py-2 px-1 gap-0.5 text-xs text-gray-600 hover:text-blue-600 transition ${pathname === item.href && "text-blue-600 font-medium"}`}
          >
            <item.icon className="h-6 w-6 mb-0.5" />
            <span className="leading-none text-[11px]">{item.name}</span>
          </Link>
        ))}
        <button
          onClick={() => setModalOpen(true)}
          className="flex flex-col items-center flex-1 py-2 px-1 text-xs text-gray-600 hover:text-blue-600 transition"
          aria-label="Profilis"
        >
          <User className="h-6 w-6 mb-0.5" />
          <span className="leading-none text-[11px]">Profilis</span>
        </button>
      </nav>
      {/* Modal for extra actions, only on mobile */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden bg-black/40" onClick={() => setModalOpen(false)}>
          <div className="w-full bg-white rounded-t-lg p-4 shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col gap-2">
              {modalActions.map((item) =>
                item.href ? (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 py-3 px-2 rounded hover:bg-gray-100 text-gray-700 text-base"
                    onClick={() => setModalOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ) : (
                  <button
                    key={item.name}
                    onClick={() => { (item.action ?? (() => {}))(); setModalOpen(false); }}
                    className="flex items-center gap-3 py-3 px-2 rounded hover:bg-gray-100 text-gray-700 text-base w-full text-left"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                )
              )}
            </div>
            <button className="mt-4 w-full py-2 text-blue-600 font-semibold" onClick={() => setModalOpen(false)}>
              Uždaryti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
