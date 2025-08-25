"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { PublicNavigation } from "@/components/public-navigation"
import { format } from 'date-fns'

export default function TestPostPage() {
  const mockPost = {
    id: "test-1",
    title: "Pirmasis kėlinys",
    content: `
      <div class="content-stretch flex flex-col gap-6 items-start justify-start relative shrink-0 w-full">
        <div class="content-stretch flex flex-col font-['DM_Sans:Regular',_sans-serif] font-normal gap-5 items-start justify-start leading-[0] relative shrink-0 text-[#ffffff] text-[16px] w-full">
          <div class="flex flex-col justify-center relative shrink-0 w-full">
            <p class="leading-[24px]">
              <span>Rungtynės prasidėjo aktyviu tempu iš abiejų komandų, tačiau iniciatyvą greitai perėmė </span>
              <span class="font-['DM_Sans:Bold',_sans-serif] font-bold">FK Banga</span>
              <span>. Jau </span>
              <span class="font-['DM_Sans:Bold',_sans-serif] font-bold">12-ąją minutę</span>
              <span> puolėjas </span>
              <span class="font-['DM_Sans:Bold',_sans-serif] font-bold">Nr. 10 M. Jankauskas</span>
              <span> pelnė pirmąjį įvartį stipriu smūgiu iš baudos aikštelės centro, po tikslaus perdavimo iš dešiniojo krašto, kurį atliko </span>
              <span class="font-['DM_Sans:Bold',_sans-serif] font-bold">Nr. 7 R. Stankus.</span>
            </p>
          </div>
          <div class="flex flex-col justify-center relative shrink-0 w-full">
            <p class="leading-[24px]">
              <span>Sūduvos žaidėjai bandė atsakyti greitais išpuoliais, tačiau nesugebėjo sukurti pavojingų momentų iki pat pirmojo kėlinio pabaigos. Visgi </span>
              <span class="font-['DM_Sans:Bold',_sans-serif] font-bold">per teisėjo pridėtą laiką (45+1')</span>
              <span>, po kampinio smūgio galva įvartį pelnė </span>
              <span class="font-['DM_Sans:Bold',_sans-serif] font-bold">Nr. 9 V. Petraitis</span>
              <span>, išlygindamas rezultatą.</span>
            </p>
          </div>
        </div>
      </div>
      
      <div class="aspect-[720/400] bg-center bg-cover bg-no-repeat shrink-0 w-full" style="background-image: url('/figma/4a046e8beccbad79d8ddebc4b187ad318cb430b5.png')"></div>
      
      <div class="content-stretch flex flex-col gap-6 items-start justify-start relative shrink-0 w-full">
        <div class="flex flex-col font-['DM_Sans:SemiBold',_sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#ffffff] text-[32px] w-full">
          <p class="leading-[40px]">Antrasis kėlinys</p>
        </div>
        <div class="content-stretch flex flex-col font-['DM_Sans:Regular',_sans-serif] font-normal gap-5 items-start justify-start leading-[0] relative shrink-0 text-[#ffffff] text-[16px] w-full">
          <div class="flex flex-col justify-center relative shrink-0 w-full">
            <p class="leading-[24px]">
              <span>Po pertraukos Banga ir toliau demonstravo iniciatyvą ir atakavo aktyviai.</span>
              <span class="font-['DM_Sans:Bold',_sans-serif] font-bold"> 66-ąją minutę </span>
              <span>šeimininkai liko dešimtiese, kai </span>
              <span class="font-['DM_Sans:Bold',_sans-serif] font-bold">Nr. 4 D. Vaitkus</span>
              <span> buvo pašalintas iš aikštės už grubią pražangą prieš varžovą aikštės viduryje.</span>
            </p>
          </div>
          <div class="flex flex-col justify-center relative shrink-0 w-full">
            <p class="leading-[24px]">
              <span>Nepaisant kiekybinio deficito, Gargždų komanda pademonstravo charakterį ir sugebėjo persverti rezultatą. </span>
              <span class="font-['DM_Sans:Bold',_sans-serif] font-bold">78-ąją minutę</span>
              <span> po chaoso baudos aikštelėje, atšokusį kamuolį į vartus pasiuntė </span>
              <span class="font-['DM_Sans:Bold',_sans-serif] font-bold">Nr. 11 A. Žukauskas</span>
              <span>, atnešdamas „Bangai" svarbią pergalę.</span>
            </p>
          </div>
        </div>
      </div>
    `,
    excerpt: "Rungtynės prasidėjo aktyviu tempu iš abiejų komandų, tačiau iniciatyvą greitai perėmė FK Banga.",
    author: "FK Banga",
    published_date: "2025-01-15T10:00:00Z",
    url: "https://www.fkbanga.lt/test",
    image_url: "/figma/4a046e8beccbad79d8ddebc4b187ad318cb430b5.png",
    category: "Football",
    tags: ["Banga", "Football", "Lithuania"],
    source: "fkbanga.lt",
    fingerprint: "test-fingerprint",
    created_at: "2025-01-15T10:00:00Z"
  }

  return (
    <div className="min-h-screen bg-[#0A165B] text-white">
      <PublicNavigation currentPage="naujienos" />
      
      {/* Page Header */}
      <div className="w-full border-b border-[#232C62]">
        <div className="px-4 md:px-8 lg:px-16 py-4">
          <Link 
            href="/naujienos" 
            className="inline-flex items-center text-white hover:text-[#F15601] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Grįžti į naujienas
          </Link>
          
          {/* Post Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-2">
            {mockPost.title}
          </h1>
          
          {/* Post Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
            {mockPost.source && (
              <span className="bg-white text-black px-2 py-1 font-semibold">
                {mockPost.source}
              </span>
            )}
            {mockPost.published_date && (
              <span>
                {format(new Date(mockPost.published_date), 'yyyy-MM-dd HH:mm')}
              </span>
            )}
            {mockPost.author && (
              <span>Autorius: {mockPost.author}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 md:px-8 lg:px-16 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Post Image */}
          {mockPost.image_url && (
            <div className="mb-8">
              <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden">
                <Image
                  src={mockPost.image_url}
                  alt={mockPost.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Post Content */}
          <div className="text-white text-base leading-relaxed space-y-6">
            {/* Parse and render content sections */}
            {mockPost.content && (
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: mockPost.content }}
              />
            )}
            
            {/* If no content, show excerpt */}
            {!mockPost.content && mockPost.excerpt && (
              <div className="text-white text-base leading-relaxed">
                {mockPost.excerpt}
              </div>
            )}
          </div>

          {/* Tags */}
          {mockPost.tags && mockPost.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-[#232C62]">
              <h3 className="text-lg font-semibold text-white mb-4">Žymės:</h3>
              <div className="flex flex-wrap gap-2">
                {mockPost.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-[#232C62] text-white px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source Link */}
          {mockPost.url && (
            <div className="mt-8 pt-8 border-t border-[#232C62]">
              <a 
                href={mockPost.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[#F15601] hover:text-[#F15601]/80 transition-colors"
              >
                Skaityti originalą →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
