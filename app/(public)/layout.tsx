import type { ReactNode } from "react"
import { PublicNavigation } from "@/components/public-navigation"
import { PublicFooter } from "@/components/public-footer"

interface PublicLayoutProps {
  children: ReactNode
}

/**
 * Shell for every public page. The navigation and footer live here so they stay
 * mounted between pages (no re-fetch of the match strip, no remount flash) and each
 * page only renders its own content.
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-white">
      <PublicNavigation />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
