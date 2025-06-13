"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth check for login, register, and checkout pages
    if (
      pathname === "/login" ||
      pathname === "/register" ||
      pathname.startsWith("/checkout")
    ) return

    if (!isLoading && !user) {
      console.log("No authenticated user found, redirecting to login")
      router.push("/login")
    }
  }, [user, isLoading, router, pathname])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If on login/register page or authenticated, render children
  if (pathname === "/login" || pathname === "/register" || user) {
    return <>{children}</>
  }

  // Otherwise render nothing while redirecting
  return null
}
