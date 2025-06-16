"use client"

import { CalendarDays, QrCode, Ticket, Upload, BarChart3, Settings, LogOut, UserPlus, User, CreditCard } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import clsx from "clsx"
import { useState } from "react"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navigation = [
    { name: "Overview", href: "/dashboard/overview", icon: BarChart3 },
    { name: "Events", href: "/dashboard/events", icon: CalendarDays },
    { name: "Tickets", href: "/dashboard/tickets", icon: Ticket },
    { name: "Subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
    { name: "Fans", href: "/dashboard/fans", icon: User },
    { name: "QR Scanner", href: "/dashboard/scanner", icon: QrCode },
    { name: "Export", href: "/dashboard/export", icon: Upload },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <h2 className="text-lg font-semibold">FK Banga bilietų sistema</h2>
        <p className="text-sm text-gray-600">Renginių ir bilietų valdymas</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                item.name === 'Managers' ? null : (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{
                          item.name === 'Overview' ? 'Suvestinė' :
                          item.name === 'Events' ? 'Renginiai' :
                          item.name === 'Tickets' ? 'Bilietai' :
                          item.name === 'Subscriptions' ? 'Prenumeratos' :
                          item.name === 'Fans' ? 'Gerbėjai' :
                          item.name === 'QR Scanner' ? 'QR skaitytuvas' :
                          item.name === 'Export' ? 'Eksportas' :
                          item.name
                        }</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              ))}

              {/* Add User link for admins */}
              {user?.role === "admin" && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/register"}>
                    <Link href="/register">
                      <UserPlus className="h-4 w-4" />
                      <span>Pridėti vartotoją</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p className="font-medium">{user?.name}</p>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'Administratorius' : user?.role === 'staff' ? 'Darbuotojas' : user?.role}</p>
          </div>
          <button onClick={logout} className="flex items-center text-gray-600 hover:text-gray-900">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

// Mobile bottom menu for navigation
export function DashboardMobileMenu() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  // Main navigation for mobile bar
  const navigation = [
    { name: "Suvestinė", href: "/dashboard/overview", icon: BarChart3 },
    { name: "Renginiai", href: "/dashboard/events", icon: CalendarDays },
    { name: "Bilietai", href: "/dashboard/tickets", icon: Ticket },
    { name: "QR skaitytuvas", href: "/dashboard/scanner", icon: QrCode },
  ];

  // Actions for modal
  const modalActions = [
    { name: "Prenumeratos", href: "/dashboard/subscriptions", icon: CreditCard },
    { name: "Gerbėjai", href: "/dashboard/fans", icon: User },
    { name: "Eksportas", href: "/dashboard/export", icon: Upload },
    { name: "Atsijungti", action: logout, icon: LogOut },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-white border-t border-gray-200 shadow px-2 py-1 justify-between">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={clsx(
              "flex flex-col items-center flex-1 py-2 px-1 gap-0.5 text-xs text-gray-600 hover:text-blue-600 transition",
              pathname === item.href && "text-blue-600 font-medium"
            )}
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
