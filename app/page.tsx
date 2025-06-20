"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
// import { useAuth } from '@/lib/auth-context'

export default function HomePage() {
  const router = useRouter()
  // const { user, loading } = useAuth()

  useEffect(() => {
    // if (!loading) {
    //   if (user) {
    //     router.push('/dashboard/overview')
    //   } else {
    //     router.push('/login')
    //   }
    // }
    router.push('/login');
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
