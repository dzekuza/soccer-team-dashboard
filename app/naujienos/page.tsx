"use client"

import { useEffect, useState } from "react"

export const dynamic = 'force-dynamic'
import Link from "next/link"
import Image from "next/image"
import { PublicNavigation } from "@/components/public-navigation"
import { PublicFooter } from "@/components/public-footer"
import { format } from 'date-fns'

interface Post {
  id: string
  title: string
  content: string
  excerpt?: string
  author?: string
  published_date?: string
  url: string
  image_url?: string
  category?: string
  tags?: string[]
  source: string
  fingerprint: string
  created_at: string
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      setError(null)
      try {
        // Add cache busting parameter
        const response = await fetch(`/api/posts?t=${Date.now()}`)
        if (!response.ok) throw new Error("Nepavyko gauti naujienų")
        
        const data = await response.json()
        console.log("Fetched posts:", data) // Debug log
        setPosts(data.posts || [])
      } catch (e: unknown) {
        console.error("Error fetching posts:", e)
        setError(e instanceof Error ? e.message : "Įvyko nežinoma klaida.")
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const getPostImageSrc = (post: Post) => {
    if (post.image_url) {
      return post.image_url
    }
    return '/bg%20qr.jpg'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A165B]">
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-xl">Kraunama...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A165B]">
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-xl">Klaida: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A165B] text-white">
      <PublicNavigation currentPage="naujienos" />
      
      {/* Main Content */}
      <div className="w-full">
        <div className="text-center py-8 border-b border-[#232C62]">
          <h1 className="h1-public">Naujienos</h1>
        </div>
        
        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <Link 
              key={post.id} 
              href={`/naujienos/${post.id}`}
              className="bg-[#0A165B] border border-[#232C62] hover:border-[#F15601] transition-colors cursor-pointer"
            >
              {/* Post Image */}
              <div className="relative aspect-video">
                <Image
                  src={getPostImageSrc(post)}
                  alt={post.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    console.log(`Image failed to load for post ${post.id}:`, post.image_url)
                    const target = e.target as HTMLImageElement
                    target.src = '/bg%20qr.jpg'
                  }}
                />
                
                {/* Source Badge */}
                <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white text-black px-2 md:px-3 py-1 text-center">
                  <div className="text-xs md:text-sm font-semibold leading-tight">{post.source}</div>
                </div>

                {/* Date Overlay */}
                {post.published_date && (
                  <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black/70 text-white px-2 md:px-3 py-1 text-center">
                    <div className="text-xs md:text-sm leading-tight">
                      {format(new Date(post.published_date), 'dd MMM')}
                    </div>
                  </div>
                )}
              </div>

              {/* Post Details */}
              <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                <div className="text-white/65 text-sm md:text-base">
                  {post.category || 'Naujiena'}
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-white text-lg md:text-xl font-semibold leading-tight line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-white/65 text-sm md:text-base line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                {/* Author and Read More */}
                <div className="flex items-center justify-between pt-2">
                  {post.author && (
                    <span className="text-white/65 text-sm">
                      {post.author}
                    </span>
                  )}
                  <span className="text-[#F15601] text-sm">
                    Skaityti →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-white text-lg">Nėra naujienų</p>
          </div>
        )}
        
        {/* Debug info */}
        <div className="text-center py-2">
          <p className="text-white text-xs">Debug: Loaded {posts.length} posts</p>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
