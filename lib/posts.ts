import { createPublicClient } from "@/lib/supabase-public"

/** Post fields the landing page needs; the full article body stays on the server. */
export interface LandingPost {
  id: string
  title: string
  excerpt: string
  imageUrl: string | null
  createdAt: string
}

const EXCERPT_LENGTH = 150

function toExcerpt(excerpt: string | null, content: string | null): string {
  const given = excerpt?.trim()
  if (given) return given

  const text = (content ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH).trimEnd()}...` : text
}

/**
 * Latest posts, newest first. Runs on the server so the landing page arrives with
 * its news already in the HTML. Returns an empty list if the query fails.
 */
export async function getLatestPosts(limit: number): Promise<LandingPost[]> {
  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from("posts")
    .select("id, title, excerpt, content, image_url, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error || !data) {
    console.error("getLatestPosts failed:", error?.message)
    return []
  }

  return data.map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: toExcerpt(post.excerpt, post.content),
    imageUrl: post.image_url,
    createdAt: post.created_at,
  }))
}

/** A post as shown on the news list. */
export interface NewsPost {
  id: string
  title: string
  excerpt: string | null
  imageUrl: string | null
  source: string
  category: string | null
  author: string | null
  publishedDate: string | null
}

/** Newest posts for the news page, or null when the query fails. */
export async function getPosts(limit: number): Promise<NewsPost[] | null> {
  const { data, error } = await createPublicClient()
    .from("posts")
    .select("id, title, excerpt, image_url, source, category, author, published_date")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error || !data) {
    console.error("getPosts failed:", error?.message)
    return null
  }

  return data.map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt?.trim() || null,
    imageUrl: post.image_url,
    source: post.source,
    category: post.category,
    author: post.author,
    publishedDate: post.published_date,
  }))
}
