"use client"

import type { ReactNode } from "react"
import { AuthProvider } from "@/lib/auth-context"

interface ProvidersProps {
  children: ReactNode
}

/**
 * App-wide providers. Stripe is not one of them: checkout pages load Stripe.js
 * themselves, so the rest of the site does not download it.
 */
export function Providers({ children }: ProvidersProps) {
  return <AuthProvider>{children}</AuthProvider>
}
