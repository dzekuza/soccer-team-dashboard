"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { LandingPost } from "@/lib/posts"

interface Slide {
  id: number
  type: "post" | "tickets" | "store" | "photo"
  title: string
  image?: string
  bgColor?: string
  description?: string
  buttonText?: string
  buttonLink?: string
}

const STATIC_SLIDES: Slide[] = [
  {
    id: 2,
    type: "tickets",
    title: "Bilietai į rungtynes",
    description: "Pirkite bilietus į artimiausias FK Banga rungtynes ir palaikykite komandą",
    image: "/landing/bilietai-bg.jpg",
    buttonText: "Peržiūrėti bilietus",
    buttonLink: "/renginiai",
    bgColor: "bg-gradient-to-r from-primary to-primary-strong",
  },
  {
    id: 3,
    type: "store",
    title: "Oficiali parduotuvė",
    description: "Atsisiųskite oficialius FK Banga atributus ir palaikykite komandą",
    image: "/landing/atributika-bg.jpg",
    buttonText: "Apsipirkti",
    buttonLink: "/parduotuve",
    bgColor: "bg-gradient-to-r from-background to-surface",
  },
  {
    id: 4,
    type: "photo",
    title: "FK Banga žaidėjai dėkoja sirgaliams po rungtynių",
    image: "/hero/banga-20260830.png",
  },
  {
    id: 5,
    type: "photo",
    title: "FK Banga sirgaliai tribūnose",
    image: "/hero/fanai-2026.png",
  },
]

interface HeroCarouselProps {
  /** Newest post, fetched on the server. Without one, the news slide is left out. */
  latestPost: LandingPost | null
}

export function HeroCarousel({ latestPost }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const slides: Slide[] = [
    ...(latestPost
      ? [
          {
            id: 1,
            type: "post" as const,
            title: latestPost.title,
            description: latestPost.excerpt,
            image: latestPost.imageUrl ?? undefined,
            buttonText: "Skaityti daugiau",
            buttonLink: `/naujienos/${latestPost.id}`,
            bgColor: "bg-gradient-to-r from-background to-surface",
          },
        ]
      : []),
    ...STATIC_SLIDES,
  ]

  // Follow the visitor's reduced-motion setting
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(query.matches)
    const onChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches)
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  // Auto-advance slides; stop while the pointer or keyboard focus is on the hero
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length, isPaused, prefersReducedMotion])

  const goToSlide = (index: number) => setCurrentSlide(index)
  const goToPrevious = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  const goToNext = () => setCurrentSlide((prev) => (prev + 1) % slides.length)

  return (
    <section
      className="relative h-[600px] overflow-hidden"
      onPointerEnter={(event) => event.pointerType === 'mouse' && setIsPaused(true)}
      onPointerLeave={(event) => event.pointerType === 'mouse' && setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            inert={index !== currentSlide}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out-strong motion-reduce:transition-none ${
              index === currentSlide ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            {/* Background */}
            <div className={`absolute inset-0 ${slide.bgColor ?? 'bg-background'}`}>
              {slide.image && (
                <div className="absolute inset-0">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className={slide.type === 'photo' ? 'object-cover' : 'object-cover opacity-20'}
                  />
                </div>
              )}
              {slide.type === 'photo' && (
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
              )}
            </div>
            
                           {/* Content */}
             {slide.type !== 'photo' && (
             <div className="relative z-10 h-full flex items-end">
               <div className="w-full px-4 md:px-16 pb-16">
                 <div className="max-w-2xl">
                   <h2 className="text-display font-bold text-white mb-6">
                     {slide.title}
                   </h2>
                   <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                     {slide.description}
                   </p>
                   <Link href={slide.buttonLink ?? '/'}>
                     <Button 
                       size="lg" 
                       className="bg-primary hover:bg-primary-strong text-white text-lg px-8 py-4 h-auto rounded-none"
                     >
                       {slide.buttonText}
                     </Button>
                   </Link>
                 </div>
               </div>
             </div>
             )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 w-[50px] h-[50px] bg-[#111111] flex items-center justify-center hover:bg-[#222222] transition-colors z-20"
        aria-label="Previous slide"
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[50px] h-[50px] bg-[#111111] flex items-center justify-center hover:bg-[#222222] transition-colors z-20"
        aria-label="Next slide"
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors cursor-pointer ${
              index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentSlide}
          />
        ))}
      </div>
    </section>
  )
}
