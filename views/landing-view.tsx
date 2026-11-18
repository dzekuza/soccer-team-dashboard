import { HeroCarousel } from "@/components/landing/hero-carousel"
import { MatchesAndStandings } from "@/components/landing/matches-and-standings"
import { LatestPostsSection } from "@/components/latest-posts-section"
import { TicketsApparelSection } from "@/components/tickets-apparel-section"
import { PartnersSection } from "@/components/partners-section"
import { getLatestPosts } from "@/lib/posts"

const LATEST_POSTS_COUNT = 4

/** Landing page. News is fetched on the server so the hero and news arrive with the HTML. */
export async function LandingView() {
  const posts = await getLatestPosts(LATEST_POSTS_COUNT)

  return (
    <>
      <h1 className="sr-only">FK Banga – Gargždų futbolo klubas</h1>
      <HeroCarousel latestPost={posts[0] ?? null} />
      <MatchesAndStandings />
      <LatestPostsSection posts={posts} />
      <TicketsApparelSection />
      <PartnersSection />
    </>
  )
}
