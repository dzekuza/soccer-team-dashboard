import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar, DashboardMobileMenu } from "@/components/dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <div className="group peer hidden md:block text-sidebar-foreground">
          <DashboardSidebar />
        </div>
        <main className="flex-1 p-6">
          {children}
        </main>
        <DashboardMobileMenu />
      </div>
    </SidebarProvider>
  )
}
