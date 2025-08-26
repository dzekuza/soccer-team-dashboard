"use client"

import Link from 'next/link'

export function TicketsApparelSection() {
  return (
    <section className="w-full bg-[#0A165B]">
      <div className="flex items-start justify-start relative w-full">
        {/* Tickets Card */}
        <div className="w-1/2 bg-cover bg-center bg-no-repeat flex flex-col items-start justify-start min-h-[400px] pb-16 pl-16 pr-16 pt-[236px] relative" 
             style={{ backgroundImage: "url('/ticketbg.jpg')" }}>
          <Link href="/renginiai" className="flex flex-col font-medium justify-center relative text-white text-[32px] hover:opacity-80 transition-opacity z-10">
            <p className="leading-[40px]">Bilietai</p>
          </Link>
        </div>
        
        {/* Apparel Card */}
        <div className="w-1/2 bg-cover bg-center bg-no-repeat flex flex-col items-start justify-start min-h-[400px] pb-16 pl-16 pr-16 pt-[236px] relative" 
             style={{ backgroundImage: "url('/placeholder.jpg')" }}>
          <Link href="/parduotuve" className="flex flex-col font-medium justify-center relative text-white text-[32px] hover:opacity-80 transition-opacity z-10">
            <p className="leading-[40px]">Apranga</p>
          </Link>
        </div>
      </div>
    </section>
  )
}
