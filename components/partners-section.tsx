"use client"

import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'

export function PartnersSection() {
  const [imageLoading, setImageLoading] = useState(true)

  const partners = [
    { src: "/bangapartneriai/Component 1.svg", alt: "Savivaldybė", height: "h-16" },
    { src: "/bangapartneriai/Component 1-1.svg", alt: "Neogroup", height: "h-6" },
    { src: "/bangapartneriai/Component 1-2.svg", alt: "Weber Saint Global", height: "h-11" },
    { src: "/bangapartneriai/Component 1-3.svg", alt: "SIMUVA", height: "h-7" },
    { src: "/bangapartneriai/Component 2-1.svg", alt: "Partner 5", height: "h-15" },
    { src: "/bangapartneriai/Component 2-2.svg", alt: "Partner 6", height: "h-15" },
    { src: "/bangapartneriai/Component 2-3.svg", alt: "Partner 7", height: "h-15" },
    { src: "/bangapartneriai/Component 2-4.svg", alt: "Partner 8", height: "h-15" },
    { src: "/bangapartneriai/Component 2-5.svg", alt: "Partner 9", height: "h-15" },
    { src: "/bangapartneriai/Component 2-6.svg", alt: "Partner 10", height: "h-15" },
    { src: "/bangapartneriai/Component 2-7.svg", alt: "Partner 11", height: "h-15" },
    { src: "/bangapartneriai/Component 2-8.svg", alt: "Partner 12", height: "h-15" },
    { src: "/bangapartneriai/Component 2-9.svg", alt: "Partner 13", height: "h-15" },
    { src: "/bangapartneriai/Component 2-10.svg", alt: "Partner 14", height: "h-15" },
    { src: "/bangapartneriai/Component 2-11.svg", alt: "Partner 15", height: "h-15" },
    { src: "/bangapartneriai/Component 2-12.svg", alt: "Partner 16", height: "h-15" },
    { src: "/bangapartneriai/Component 2-13.svg", alt: "Partner 17", height: "h-15" },
    { src: "/bangapartneriai/Component 2-14.svg", alt: "Partner 18", height: "h-15" },
    { src: "/bangapartneriai/Component 2-15.svg", alt: "Partner 19", height: "h-15" },
    { src: "/bangapartneriai/Component 2-16.svg", alt: "Partner 20", height: "h-15" }
  ]

  return (
    <section className="w-full bg-[#0A165B]">
      <div className="relative w-full">
        {/* Border around the entire section */}
        <div className="border border-[rgba(95,95,113,0.39)]">
          {/* Grid of partner logos */}
          <div className="grid grid-cols-4 gap-0">
            {partners.map((partner, index) => (
              <div key={index} className="border border-[rgba(95,95,113,0.39)] p-6 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
                <div className={`${partner.height} w-32 flex items-center justify-center`}>
                  {imageLoading && (
                    <Skeleton className="h-full w-full bg-gray-600" />
                  )}
                  <Image 
                    src={partner.src} 
                    alt={partner.alt} 
                    width={128} 
                    height={64} 
                    className={`object-contain ${imageLoading ? 'hidden' : ''}`}
                    onLoad={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
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
