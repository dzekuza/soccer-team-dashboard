"use client"

import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { useState, useEffect, useMemo } from 'react'

// Move partners array outside component to prevent recreation on every render
const PARTNERS = [
  { src: "/bangapartneriailogo/Component 1.svg", alt: "Savivaldybė", height: "h-16" },
  { src: "/bangapartneriailogo/Component 1-1.svg", alt: "Neogroup", height: "h-6" },
  { src: "/bangapartneriailogo/Component 1-2.svg", alt: "Weber Saint Global", height: "h-11" },
  { src: "/bangapartneriailogo/Component 1-3.svg", alt: "SIMUVA", height: "h-7" },
  { src: "/bangapartneriailogo/Component 1-4.svg", alt: "Partner 5", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2.svg", alt: "Partner 6", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-1.svg", alt: "Partner 7", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-2.svg", alt: "Partner 8", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-3.svg", alt: "Partner 9", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-4.svg", alt: "Partner 10", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-5.svg", alt: "Partner 11", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-6.svg", alt: "Partner 12", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-7.svg", alt: "Partner 13", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-8.svg", alt: "Partner 14", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-9.svg", alt: "Partner 15", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-10.svg", alt: "Partner 16", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-11.svg", alt: "Partner 17", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-12.svg", alt: "Partner 18", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-13.svg", alt: "Partner 19", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-14.svg", alt: "Partner 20", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-15.svg", alt: "Partner 21", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-16.svg", alt: "Partner 22", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-17.svg", alt: "Partner 23", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-18.svg", alt: "Partner 24", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-19.svg", alt: "Partner 25", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-20.svg", alt: "Partner 26", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-21.svg", alt: "Partner 27", height: "h-15" },
  { src: "/bangapartneriailogo/Component 2-22.svg", alt: "Partner 28", height: "h-15" }
]

export function PartnersSection() {
  const [imageLoading, setImageLoading] = useState<{[key: string]: boolean}>({})

  // Initialize loading state for all images
  useEffect(() => {
    const initialLoadingState: {[key: string]: boolean} = {}
    PARTNERS.forEach(partner => {
      initialLoadingState[partner.src] = true
    })
    setImageLoading(initialLoadingState)
  }, []) // Empty dependency array since PARTNERS is now constant

  return (
    <section className="w-full bg-[#0A165B]">
      <div className="relative w-full">
        {/* Border around the entire section */}
        <div className="border border-[rgba(95,95,113,0.39)]">
          {/* Grid of partner logos */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-0">
            {PARTNERS.map((partner, index) => (
              <div key={index} className="border border-[rgba(95,95,113,0.39)] p-6 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
                                  <div className={`${partner.height} w-32 flex items-center justify-center`}>
                    {imageLoading[partner.src] && (
                      <Skeleton className="h-full w-full bg-gray-600" />
                    )}
                    <Image 
                      src={partner.src} 
                      alt={partner.alt} 
                      width={128} 
                      height={64} 
                      className={`object-contain ${imageLoading[partner.src] ? 'hidden' : ''}`}
                      onLoad={() => {
                        console.log(`Loaded: ${partner.src}`)
                        setImageLoading(prev => ({ ...prev, [partner.src]: false }))
                      }}
                      onError={(e) => {
                        console.error(`Failed to load: ${partner.src}`, e)
                        setImageLoading(prev => ({ ...prev, [partner.src]: false }))
                      }}
                    />
                  </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
