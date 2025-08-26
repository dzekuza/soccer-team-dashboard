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
            <div key={i} className="flex items-center justify-start relative w-full">
              {i % 2 === 0 ? (
                // Text on left, image on right
                <>
                  <div className="basis-0 flex flex-row grow items-center self-stretch shrink-0">
                    <div className="basis-0 bg-[#0a165b] box-border content-stretch flex flex-col gap-2.5 grow h-full items-start justify-start min-h-px min-w-px overflow-clip p-16 relative shrink-0">
                      <div className="content-stretch flex flex-col gap-5 items-start justify-start leading-[0] relative shrink-0 w-full">
                        <Skeleton className="h-6 w-32 bg-gray-600" />
                        <div className="space-y-2">
                          <Skeleton className="h-16 w-full bg-gray-600" />
                          <Skeleton className="h-16 w-3/4 bg-gray-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="basis-0 bg-no-repeat bg-size-[112.5%_100%] bg-top grow h-[388.98px] min-h-px min-w-px shrink-0 relative overflow-hidden">
                    <Skeleton className="h-full w-full bg-gray-600" />
                  </div>
                </>
              ) : (
                // Image on left, text on right
                <>
                  <div className="basis-0 bg-no-repeat bg-size-[112.5%_100%] bg-top grow h-[388.98px] min-h-px min-w-px shrink-0 relative overflow-hidden">
                    <Skeleton className="h-full w-full bg-gray-600" />
                  </div>
                  <div className="basis-0 flex flex-row grow items-center self-stretch shrink-0">
                    <div className="basis-0 bg-[#0a165b] box-border content-stretch flex flex-col gap-2.5 grow h-full items-start justify-start min-h-px min-w-px overflow-clip p-16 relative shrink-0">
                      <div className="content-stretch flex flex-col gap-5 items-start justify-start leading-[0] relative shrink-0 w-full">
                        <Skeleton className="h-6 w-32 bg-gray-600" />
                        <div className="space-y-2">
                          <Skeleton className="h-16 w-full bg-gray-600" />
                          <Skeleton className="h-16 w-3/4 bg-gray-600" />
                        </div>
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

  if (posts.length === 0) {
    return null
  }

  return (
    <section className="w-full bg-[#0A165B]">
      {/* Posts Layout - Alternating Image and Text */}
      <div className="space-y-0">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="flex items-center justify-start relative w-full"
          >
            {/* Alternate layout: image on left/right based on index */}
            {index % 2 === 0 ? (
              // Text on left, image on right
              <>
                <div className="basis-0 flex flex-row grow items-center self-stretch shrink-0">
                  <div className="basis-0 bg-[#0a165b] box-border content-stretch flex flex-col gap-2.5 grow h-full items-start justify-start min-h-px min-w-px overflow-clip p-16 relative shrink-0">
                    <div className="content-stretch flex flex-col gap-5 items-start justify-start leading-[0] relative shrink-0 w-full">
                      <div className="flex flex-col font-medium h-6 justify-center relative shrink-0 text-[16px] text-[rgba(255,255,255,0.61)] w-full">
                        <p className="leading-[24px]">
                          {new Date(post.created_at).toLocaleDateString('lt-LT', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col font-bold justify-center leading-[76px] relative shrink-0 text-[#ffffff] text-[64px] w-full">
                        <Link href={`/naujienos/${post.id}`} className="hover:opacity-80 transition-opacity">
                          <p className="mb-0 leading-tight line-clamp-2">
                            {post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title}
                          </p>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="basis-0 bg-no-repeat bg-size-[112.5%_100%] bg-top grow h-[388.98px] min-h-px min-w-px shrink-0 relative overflow-hidden">
                  <Image
                    src={post.cover_image_url || post.image_url || '/placeholder-news.jpg'}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </>
            ) : (
              // Image on left, text on right
              <>
                <div className="basis-0 bg-no-repeat bg-size-[112.5%_100%] bg-top grow h-[388.98px] min-h-px min-w-px shrink-0 relative overflow-hidden">
                  <Image
                    src={post.cover_image_url || post.image_url || '/placeholder-news.jpg'}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="basis-0 flex flex-row grow items-center self-stretch shrink-0">
                  <div className="basis-0 bg-[#0a165b] box-border content-stretch flex flex-col gap-2.5 grow h-full items-start justify-start min-h-px min-w-px overflow-clip p-16 relative shrink-0">
                    <div className="content-stretch flex flex-col gap-5 items-start justify-start leading-[0] relative shrink-0 w-full">
                      <div className="flex flex-col font-medium h-6 justify-center relative shrink-0 text-[16px] text-[rgba(255,255,255,0.61)] w-full">
                        <p className="leading-[24px]">
                          {new Date(post.created_at).toLocaleDateString('lt-LT', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col font-bold justify-center leading-[76px] relative shrink-0 text-[#ffffff] text-[64px] w-full">
                        <Link href={`/naujienos/${post.id}`} className="hover:opacity-80 transition-opacity">
                          <p className="mb-0 leading-tight line-clamp-2">
                            {post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title}
                          </p>
                        </Link>
                      </div>
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
