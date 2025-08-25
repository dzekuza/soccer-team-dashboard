"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { PublicNavigation } from "@/components/public-navigation"
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

export default function SinglePostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      if (!params.id) return
      
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/posts/${params.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Naujiena nerasta")
          }
          throw new Error("Nepavyko gauti naujienos")
        }
        
        const data = await response.json()
        setPost(data.post)
      } catch (e: unknown) {
        console.error("Error fetching post:", e)
        setError(e instanceof Error ? e.message : "Įvyko nežinoma klaida.")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.id])

  const getPostImageSrc = (post: Post) => {
    if (post.image_url) {
      return post.image_url
    }
    return '/bg%20qr.jpg'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A165B] text-white">
        <PublicNavigation currentPage="naujienos" />
        <div className="flex items-center justify-center h-screen">
          <div className="text-white text-xl">Kraunama...</div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#0A165B] text-white">
        <PublicNavigation currentPage="naujienos" />
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="text-white text-xl mb-4">{error || "Naujiena nerasta"}</div>
          <Link 
            href="/naujienos" 
            className="inline-flex items-center text-white hover:text-[#F15601] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Grįžti į naujienas
          </Link>
        </div>
      </div>
    )
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
            {post.title}
          </h1>
          
          {/* Post Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
            {post.source && (
              <span className="bg-white text-black px-2 py-1 font-semibold">
                {post.source}
              </span>
            )}
            {post.published_date && (
              <span>
                {format(new Date(post.published_date), 'yyyy-MM-dd HH:mm')}
              </span>
            )}
            {post.author && (
              <span>Autorius: {post.author}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 md:px-8 lg:px-16 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Post Image */}
          {post.image_url && (
            <div className="mb-8">
              <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden">
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
              </div>
            </div>
          )}

          {/* Post Content */}
          <div className="text-white text-base leading-relaxed space-y-6">
            {/* Parse and render content sections */}
            {post.content && (
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            )}
            
            {/* If no content, show excerpt */}
            {!post.content && post.excerpt && (
              <div className="text-white text-base leading-relaxed">
                {post.excerpt}
              </div>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-[#232C62]">
              <h3 className="text-lg font-semibold text-white mb-4">Žymės:</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
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
          {post.url && (
            <div className="mt-8 pt-8 border-t border-[#232C62]">
              <a 
                href={post.url}
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
