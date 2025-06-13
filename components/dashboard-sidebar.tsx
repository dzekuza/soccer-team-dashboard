"use client"

import { CalendarDays, QrCode, Ticket, Upload, BarChart3, Settings, LogOut, UserPlus } from "lucide-react"
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

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navigation = [
    { name: "Overview", href: "/dashboard/overview", icon: BarChart3 },
    { name: "Events", href: "/dashboard/events", icon: CalendarDays },
    { name: "Tickets", href: "/dashboard/tickets", icon: Ticket },
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

  const navigation = [
    { name: "Overview", href: "/dashboard/overview", icon: BarChart3 },
    { name: "Events", href: "/dashboard/events", icon: CalendarDays },
    { name: "Tickets", href: "/dashboard/tickets", icon: Ticket },
    { name: "QR Scanner", href: "/dashboard/scanner", icon: QrCode },
    { name: "Export", href: "/dashboard/export", icon: Upload },
    { name: "System", href: "/dashboard/system", icon: Settings },
  ];

  return (
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
        onClick={logout}
        className="flex flex-col items-center flex-1 py-2 px-1 text-xs text-gray-600 hover:text-red-600 transition"
        aria-label="Logout"
      >
        <LogOut className="h-6 w-6 mb-0.5" />
        <span className="leading-none text-[11px]">Logout</span>
      </button>
    </nav>
  );
}
