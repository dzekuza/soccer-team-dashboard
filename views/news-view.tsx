import { PageHeading } from "@/components/common/page-heading"
import { LoadError } from "@/components/common/load-error"
import { NewsCard } from "@/components/news/news-card"
import { getPosts } from "@/lib/posts"

const NEWS_COUNT = 24

export async function NewsView() {
  const posts = await getPosts(NEWS_COUNT)

  return (
    <>
      <PageHeading title="Naujienos" />
      {posts === null ? <LoadError subject="naujienų" /> : null}
      {posts && posts.length === 0 ? <p className="py-16 text-center text-white">Nėra naujienų</p> : null}
      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <NewsCard key={post.id} post={post} />
          ))}
        </div>
      ) : null}
    </>
  )
}
