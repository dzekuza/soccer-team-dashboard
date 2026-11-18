"use client"

import Link from 'next/link'

export function TicketsApparelSection() {
  return (
    <section className="w-full bg-background">
      <div className="flex flex-col md:flex-row items-start justify-start relative w-full">
        {/* Tickets Card */}
        <div className="w-full md:w-1/2 bg-cover bg-center bg-no-repeat flex flex-col items-start justify-start min-h-[300px] md:min-h-[400px] pb-8 md:pb-16 pl-8 md:pl-16 pr-8 md:pr-16 pt-[120px] md:pt-[236px] relative" 
             style={{ backgroundImage: "url('/ticketsbg.png')" }}>
          <Link href="/renginiai" className="flex flex-col font-medium justify-center relative text-white text-title hover:opacity-80 transition-opacity z-10">
            <p>Bilietai</p>
          </Link>
        </div>
        
        {/* Apparel Card */}
        <div className="w-full md:w-1/2 bg-cover bg-center bg-no-repeat flex flex-col items-start justify-start min-h-[300px] md:min-h-[400px] pb-8 md:pb-16 pl-8 md:pl-16 pr-8 md:pr-16 pt-[120px] md:pt-[236px] relative" 
             style={{ backgroundImage: "url('/shopbg.png')" }}>
          <Link href="/parduotuve" className="flex flex-col font-medium justify-center relative text-white text-title hover:opacity-80 transition-opacity z-10">
            <p>Apranga</p>
          </Link>
        </div>
      </div>
    </section>
  )
}
