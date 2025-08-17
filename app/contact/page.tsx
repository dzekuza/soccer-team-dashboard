"use client"

import { PublicNavigation } from "@/components/public-navigation"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0A165B]">
      <PublicNavigation currentPage="contact" />
      
      <div className="w-full px-4 md:px-8 lg:px-16 py-8">
        <div className="text-center py-8">
          <h2 className="text-white text-6xl font-bold tracking-tight">Kontaktai</h2>
        </div>
        
        <div className="text-center py-16">
          <p className="text-white text-xl">Kontaktų puslapis ruošiamas</p>
        </div>
      </div>
    </div>
  )
}
