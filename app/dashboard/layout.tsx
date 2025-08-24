"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar, DashboardMobileMenu } from "@/components/dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isScannerPage = pathname === "/dashboard/scanner"

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <div className="group peer hidden md:block text-sidebar-foreground fixed w-64 h-full">
          <DashboardSidebar />
        </div>
        <main className="flex-1 md:pl-64">
          <div className={isScannerPage 
            ? "h-screen overflow-hidden" 
            : "px-4 sm:px-4 md:px-6 pb-20 md:pt-8 md:pb-8 h-screen overflow-y-auto md:pb-8 pb-28"
          }>
            {children}
          </div>
        </main>
        <DashboardMobileMenu />
      </div>
    </SidebarProvider>
  )
}
