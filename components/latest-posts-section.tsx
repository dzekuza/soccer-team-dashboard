"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'

interface Post {
  id: string
  title: string
  excerpt: string
  content?: string
  cover_image_url?: string
  image_url?: string
  created_at: string
}

export function LatestPostsSection() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        const response = await fetch('/api/posts?limit=4')
        if (response.ok) {
          const data = await response.json()
          if (data.posts && data.posts.length > 0) {
            setPosts(data.posts)
          }
        }
      } catch (error) {
        console.error('Error fetching latest posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestPosts()
  }, [])

  if (loading) {
    return (
      <section className="w-full bg-[#0A165B]">
        <div className="space-y-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col lg:flex-row items-stretch relative w-full">
              {/* Image Section */}
              <div className="w-full lg:w-1/2 h-64 lg:h-auto lg:min-h-[388px] relative overflow-hidden">
                <Skeleton className="h-full w-full bg-gray-600" />
              </div>
              
              {/* Text Section */}
              <div className="w-full lg:w-1/2 bg-[#0a165b] p-6 md:p-8 lg:p-16 flex items-center">
                <div className="w-full space-y-4 lg:space-y-6">
                  <Skeleton className="h-6 w-32 bg-gray-600" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 md:h-10 lg:h-12 w-full bg-gray-600" />
                    <Skeleton className="h-8 md:h-10 lg:h-12 w-3/4 bg-gray-600" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (posts.length === 0) {
    return null
  }

  return (
    <section className="w-full bg-[#0A165B]">
      {/* Posts Layout - Responsive Grid */}
      <div className="space-y-0">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="flex flex-col lg:flex-row items-stretch relative w-full"
          >
            {/* Mobile: Image always on top, Desktop: Alternate layout */}
            {index % 2 === 0 ? (
              // Mobile: Image top, Text bottom | Desktop: Text left, Image right
              <>
                {/* Image Section */}
                <div className="w-full lg:w-1/2 h-64 lg:h-auto lg:min-h-[388px] relative overflow-hidden order-1 lg:order-2">
                  <Image
                    src={post.cover_image_url || post.image_url || '/placeholder-news.jpg'}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Text Section */}
                <div className="w-full lg:w-1/2 bg-[#0a165b] p-6 md:p-8 lg:p-16 flex items-center order-2 lg:order-1">
                  <div className="w-full space-y-4 lg:space-y-6">
                    {/* Date */}
                    <div className="text-sm md:text-base text-[rgba(255,255,255,0.61)]">
                      {new Date(post.created_at).toLocaleDateString('lt-LT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                    
                    {/* Title */}
                    <div className="text-2xl md:text-3xl lg:text-4xl xl:text-[48px] font-bold text-white leading-tight">
                      <Link href={`/naujienos/${post.id}`} className="hover:opacity-80 transition-opacity">
                        <p className="mb-0 leading-tight">
                          {post.title}
                        </p>
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Mobile: Image top, Text bottom | Desktop: Image left, Text right
              <>
                {/* Image Section */}
                <div className="w-full lg:w-1/2 h-64 lg:h-auto lg:min-h-[388px] relative overflow-hidden order-1">
                  <Image
                    src={post.cover_image_url || post.image_url || '/placeholder-news.jpg'}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Text Section */}
                <div className="w-full lg:w-1/2 bg-[#0a165b] p-6 md:p-8 lg:p-16 flex items-center order-2">
                  <div className="w-full space-y-4 lg:space-y-6">
                    {/* Date */}
                    <div className="text-sm md:text-base text-[rgba(255,255,255,0.61)]">
                      {new Date(post.created_at).toLocaleDateString('lt-LT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                    
                    {/* Title */}
                    <div className="text-2xl md:text-3xl lg:text-4xl xl:text-[48px] font-bold text-white leading-tight">
                      <Link href={`/naujienos/${post.id}`} className="hover:opacity-80 transition-opacity">
                        <p className="mb-0 leading-tight">
                          {post.title}
                        </p>
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
