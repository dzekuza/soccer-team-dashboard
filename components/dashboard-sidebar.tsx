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
    { name: "System", href: "/dashboard/system", icon: Settings },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <h2 className="text-lg font-semibold">FK Banga tickets dash</h2>
        <p className="text-sm text-gray-600">Event & Ticket Management</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Add User link for admins */}
              {user?.role === "admin" && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/register"}>
                    <Link href="/register">
                      <UserPlus className="h-4 w-4" />
                      <span>Add User</span>
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
            <p className="text-xs text-gray-500">{user?.role}</p>
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
    { name: "Overview", href: "/dashboard/overview", icon: BarChart3 },
    { name: "Events", href: "/dashboard/events", icon: CalendarDays },
    { name: "Tickets", href: "/dashboard/tickets", icon: Ticket },
    { name: "Subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
    { name: "Fans", href: "/dashboard/fans", icon: User },
    { name: "QR Scanner", href: "/dashboard/scanner", icon: QrCode },
  ];

  // Actions for modal
  const modalActions = [
    { name: "Export", href: "/dashboard/export", icon: Upload },
    { name: "System", href: "/dashboard/system", icon: Settings },
    { name: "Logout", action: logout, icon: LogOut },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-white border-t border-gray-200 shadow px-2 py-1 justify-between">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={clsx(
              "flex flex-col items-center flex-1 py-2 px-1 text-xs text-gray-600 hover:text-blue-600 transition",
              pathname === item.href && "text-blue-600 font-semibold"
            )}
          >
            <item.icon className="h-6 w-6 mb-0.5" />
            <span className="leading-none text-[11px]">{item.name}</span>
          </Link>
        ))}
        <button
          onClick={() => setModalOpen(true)}
          className="flex flex-col items-center flex-1 py-2 px-1 text-xs text-gray-600 hover:text-blue-600 transition"
          aria-label="Profile"
        >
          <User className="h-6 w-6 mb-0.5" />
          <span className="leading-none text-[11px]">Profile</span>
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
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
