import { createClient } from "@supabase/supabase-js"

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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

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
