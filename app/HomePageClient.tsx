'use client'

import { ArticleFeedCard } from '@/components/ArticleFeedCard'
import { PageFanLoader } from '@/components/motion/PageFanLoader'
import { EmptyState } from '@/components/motion/EmptyState'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useP2PArticles } from '@/hooks/use-p2p-articles'
import { coverImageUrl } from '@/lib/p2p/articles'

/**
 * Real p2p feed, not the scaffold's hardcoded mock articles it replaced —
 * same ArticleFeedCard/useP2PArticles the /articles page already uses, so
 * there's exactly one card presentation and one data source for "what's
 * published" across the whole app.
 */
export default function HomePageClient() {
  const { loading, error, filterArticles, moderationStatus } = useP2PArticles({})
  const articles = filterArticles({ status: 'published' })

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <PageFanLoader label="Fetching articles from peers…" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl rounded-md bg-destructive/15 px-4 py-3 text-destructive">
        {error}
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <EmptyState
          title="Nothing published yet"
          description="Be the first to publish — your wallet signs the article."
          action={
            <Button size="sm" asChild>
              <Link href="/admin/articles/new">Upload</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const [featured, ...rest] = articles

  return (
    <div className="space-y-12">
      {/* aspect-ratio, not a vh/px guess — scales cleanly at any viewport
       * size instead of being too short on wide screens or too tall on
       * narrow ones. min-h is just a floor so it never gets unreadably thin. */}
      <section className="aspect-[16/9] min-h-[320px] overflow-hidden rounded-2xl sm:aspect-[21/9]">
        <ArticleFeedCard
          article={featured}
          coverImageUrl={coverImageUrl(featured.coverImageCid)}
          moderation={moderationStatus.get(featured.cid)}
          priority
        />
      </section>

      {rest.length > 0 && (
        <section>
          <h2 className="mb-6 font-serif text-fluid-3xl font-bold text-foreground">Latest Articles</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.slice(0, 6).map((article) => (
              <div key={article.cid} className="aspect-[3/4] overflow-hidden rounded-2xl">
                <ArticleFeedCard
                  article={article}
                  coverImageUrl={coverImageUrl(article.coverImageCid)}
                  moderation={moderationStatus.get(article.cid)}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
