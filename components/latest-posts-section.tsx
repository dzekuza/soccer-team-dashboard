import Link from 'next/link'
import Image from 'next/image'
import type { LandingPost } from '@/lib/posts'

interface LatestPostsSectionProps {
  posts: LandingPost[]
}

/** Alternating image/text rows for the newest posts. Data comes from the server. */
export function LatestPostsSection({ posts }: LatestPostsSectionProps) {
  if (posts.length === 0) {
    return null
  }

  return (
    <section className="w-full bg-background">
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
                <div className="w-full lg:w-1/2 h-64 lg:h-auto lg:min-h-[388px] relative overflow-hidden bg-surface order-1 lg:order-2">
                  {post.imageUrl ? (
                    <Image src={post.imageUrl} alt={post.title} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                  ) : null}
                </div>
                
                {/* Text Section */}
                <div className="w-full lg:w-1/2 bg-background p-6 md:p-8 lg:p-16 flex items-center order-2 lg:order-1">
                  <div className="w-full space-y-4 lg:space-y-6">
                    {/* Date */}
                    <div className="text-sm md:text-base text-white/60">
                      {new Date(post.createdAt).toLocaleDateString('lt-LT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                    
                    {/* Title */}
                    <div className="text-headline font-bold text-white">
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
                <div className="w-full lg:w-1/2 h-64 lg:h-auto lg:min-h-[388px] relative overflow-hidden bg-surface order-1">
                  {post.imageUrl ? (
                    <Image src={post.imageUrl} alt={post.title} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                  ) : null}
                </div>
                
                {/* Text Section */}
                <div className="w-full lg:w-1/2 bg-background p-6 md:p-8 lg:p-16 flex items-center order-2">
                  <div className="w-full space-y-4 lg:space-y-6">
                    {/* Date */}
                    <div className="text-sm md:text-base text-white/60">
                      {new Date(post.createdAt).toLocaleDateString('lt-LT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                    
                    {/* Title */}
                    <div className="text-headline font-bold text-white">
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
