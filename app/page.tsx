"use client"

import { useState, useEffect } from 'react'
import { PublicNavigation } from '@/components/public-navigation'
import { PublicFooter } from '@/components/public-footer'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { PublicTabs } from '@/components/ui/tabs'
import { LatestPostsSection } from '@/components/latest-posts-section'
import { TicketsApparelSection } from '@/components/tickets-apparel-section'
import { PartnersSection } from '@/components/partners-section'
import { UpcomingMatches } from '@/components/upcoming-matches'
import { StandingsTable } from '@/components/standings-table'
import { usePageAnimation } from '@/hooks/use-page-animation'

interface Post {
  id: string
  title: string
  excerpt: string
  content?: string
  cover_image_url?: string
  image_url?: string
  created_at: string
}

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [latestPost, setLatestPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState("Banga A")
  const [selectedStandingsTeam, setSelectedStandingsTeam] = useState("Banga A")
  const isVisible = usePageAnimation([latestPost, loading])

  const teamTabs = [
    { key: "Banga A", label: "Banga" },
    { key: "Banga B", label: "Banga B" },
    { key: "Banga M", label: "Merginos" }
  ]

  // Fetch latest post for slide 1
  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        const response = await fetch('/api/posts?limit=1')
        if (response.ok) {
          const data = await response.json()
          if (data.posts && data.posts.length > 0) {
            setLatestPost(data.posts[0]) // Get the latest post
          }
        }
      } catch (error) {
        console.error('Error fetching latest post:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestPost()
  }, [])

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Update slides when latest post changes
  useEffect(() => {
    if (latestPost) {
      console.log('Latest post updated:', latestPost)
    }
  }, [latestPost])

  const slides = [
    {
      id: 1,
      type: 'post',
      title: latestPost?.title || 'Naujienos',
      description: latestPost?.excerpt || latestPost?.content?.substring(0, 150) + '...' || 'Skaitykite naujausias naujienas apie FK Banga',
      image: latestPost?.cover_image_url || latestPost?.image_url || '/placeholder-news.jpg',
      buttonText: 'Skaityti daugiau',
      buttonLink: latestPost ? `/naujienos/${latestPost.id}` : '/naujienos',
      bgColor: 'bg-gradient-to-r from-[#0A165B] to-[#1a2b6b]'
    },
    {
      id: 2,
      type: 'tickets',
      title: 'Bilietai į rungtynes',
      description: 'Pirkite bilietus į artimiausias FK Banga rungtynes ir palaikykite komandą',
      image: '/ticketsbg.png',
      buttonText: 'Peržiūrėti bilietus',
      buttonLink: '/renginiai',
      bgColor: 'bg-gradient-to-r from-[#F15601] to-[#E04A00]'
    },
    {
      id: 3,
      type: 'store',
      title: 'Oficiali parduotuvė',
      description: 'Atsisiųskite oficialius FK Banga atributus ir palaikykite komandą',
      image: '/shopbg.png',
      buttonText: 'Apsipirkti',
      buttonLink: '/parduotuve',
      bgColor: 'bg-gradient-to-r from-[#0A165B] to-[#1a2b6b]'
    }
  ]

  const goToSlide = (index: number) => {
    console.log('Going to slide:', index)
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    console.log('Going to previous slide')
    setCurrentSlide((prev) => (prev - 1 + 3) % 3)
  }

  const goToNext = () => {
    console.log('Going to next slide')
    setCurrentSlide((prev) => (prev + 1) % 3)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A165B] flex items-center justify-center">
        <div className="text-white text-xl">Kraunama...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A165B]">
      <PublicNavigation currentPage="home" />
      
      {/* Hero Section with Slider */}
      <section className={`relative h-[600px] overflow-hidden transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* Slides */}
        <div className="relative h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Background */}
              <div className={`absolute inset-0 ${slide.bgColor}`}>
                {slide.image && (
                  <div className="absolute inset-0">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-cover opacity-20"
                    />
                  </div>
                )}
              </div>
              
                             {/* Content */}
               <div className="relative z-10 h-full flex items-end">
                 <div className="w-full px-4 md:px-16 pb-16">
                   <div className="max-w-2xl">
                     <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                       {slide.title}
                     </h1>
                     <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                       {slide.description}
                     </p>
                     <Link href={slide.buttonLink}>
                       <Button 
                         size="lg" 
                         className="bg-[#F15601] hover:bg-[#E04A00] text-white text-lg px-8 py-4 h-auto rounded-none"
                       >
                         {slide.buttonText}
                       </Button>
                     </Link>
                   </div>
                 </div>
               </div>
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
            />
          ))}
        </div>
      </section>

      {/* Upcoming Matches Section */}
      <section className={`w-full bg-[#0a165b] transition-all duration-1000 ease-out delay-200 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="w-full max-w-none">
          <PublicTabs
            tabs={teamTabs}
            activeTab={selectedTeam}
            onTabChange={setSelectedTeam}
          />
          <div className="w-full">
            {selectedTeam === "Banga A" && <UpcomingMatches selectedTeam="Banga A" />}
            {selectedTeam === "Banga B" && <UpcomingMatches selectedTeam="Banga B" />}
            {selectedTeam === "Banga M" && <UpcomingMatches selectedTeam="Banga M" />}
          </div>
        </div>
      </section>

      {/* Standings Section */}
      <section className={`w-full bg-[#0a165b] transition-all duration-1000 ease-out delay-400 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="w-full max-w-none">
          <div className="text-center py-8 border-t border-b border-[#232C62]">
            <h2 className="text-white text-2xl md:text-[48px] font-bold leading-tight md:leading-[60px]">
              Turnyrinė lentelė
            </h2>
          </div>
          <PublicTabs
            tabs={teamTabs}
            activeTab={selectedStandingsTeam}
            onTabChange={setSelectedStandingsTeam}
          />
          <div className="w-full">
            {selectedStandingsTeam === "Banga A" && <StandingsTable selectedTeam="Banga A" />}
            {selectedStandingsTeam === "Banga B" && <StandingsTable selectedTeam="Banga B" />}
            {selectedStandingsTeam === "Banga M" && <StandingsTable selectedTeam="Banga M" />}
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <div className={`transition-all duration-1000 ease-out delay-600 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <LatestPostsSection />
      </div>

      {/* Tickets and Apparel Section */}
      <div className={`transition-all duration-1000 ease-out delay-800 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <TicketsApparelSection />
      </div>

      {/* Partners Section */}
      <div className={`transition-all duration-1000 ease-out delay-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <PartnersSection />
      </div>

      <PublicFooter />
    </div>
  )
}
