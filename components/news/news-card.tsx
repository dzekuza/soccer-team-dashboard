import Image from "next/image"
import Link from "next/link"
import type { NewsPost } from "@/lib/posts"

interface NewsCardProps {
  post: NewsPost
}

const FALLBACK_IMAGE = "/bg%20qr.jpg"

function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("lt-LT", { day: "2-digit", month: "short" })
}

/** One article on the news list: image with source and date, title, excerpt. */
export function NewsCard({ post }: NewsCardProps) {
  return (
    <Link
      href={`/naujienos/${post.id}`}
      className="block border border-surface bg-background transition-colors hover:border-primary"
    >
      <div className="relative aspect-video">
        <Image
          src={post.imageUrl || FALLBACK_IMAGE}
          alt=""
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <span className="absolute left-2 top-2 bg-white px-2 py-1 text-xs font-semibold leading-tight text-background md:left-4 md:top-4 md:px-3 md:text-sm">
          {post.source}
        </span>
        {post.publishedDate ? (
          <span className="absolute right-2 top-2 bg-surface-deep/80 px-2 py-1 text-xs leading-tight text-white md:right-4 md:top-4 md:px-3 md:text-sm">
            {formatShortDate(post.publishedDate)}
          </span>
        ) : null}
      </div>

      <div className="space-y-2 p-3 md:space-y-3 md:p-4">
        <p className="text-sm text-white/65 md:text-base">{post.category || "Naujiena"}</p>
        <div className="space-y-1">
          <h2 className="line-clamp-2 text-lg font-semibold leading-tight text-white md:text-xl">{post.title}</h2>
          {post.excerpt ? <p className="line-clamp-3 text-sm text-white/65 md:text-base">{post.excerpt}</p> : null}
        </div>
        <div className="flex items-center justify-between pt-2">
          {post.author ? <span className="text-sm text-white/65">{post.author}</span> : <span />}
          <span className="text-sm text-primary">Skaityti →</span>
        </div>
      </div>
    </Link>
  )
}
