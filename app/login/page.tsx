"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AuthUI } from "@/components/ui/auth-ui"

export default function LoginPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return // Wait for auth to load

    if (user) {
      // User is already logged in, redirect to dashboard
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Kraunama...</p>
        </div>
      </div>
    )
  }

  // If user is logged in, don't render the login form
  if (user) {
    return null
  }

  const image = {
    src: "https://phvjdfqxzitzohiskwwo.supabase.co/storage/v1/object/public/ticket-pdfs//Group%201.jpg",
    alt: "Soccer team celebration"
  }

  // You can customize the image and quote here if you want
  return <AuthUI image={image} />
}
