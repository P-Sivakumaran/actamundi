'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import ArticleSearch from '@/components/ArticleSearch'
import { Skeleton } from '@/components/ui/skeleton'
import { ArticleFeedCard } from '@/components/ArticleFeedCard'
import { useP2PArticles } from '@/hooks/use-p2p-articles'
import { coverImageUrl } from '@/lib/p2p/articles'

/**
 * Feed-native layout (full-bleed vertical snap, one article per screen) —
 * won out over a dense list and a trust-first grid in prototyping
 * (branch prototype/article-feed-variants has all three + the comparison).
 * Verification badge here reflects the moderation log (endorse/flag),
 * not TruthVerification.sol — that contract's claims aren't linked to
 * article CIDs yet.
 *
 * Live feed, not a historical archive: with no server to page through,
 * articles arrive via gossipsub as authors publish while this page is open
 * (subscribeToCategory in lib/p2p/articles.ts). Backfilling articles
 * published before this tab connected needs an author directory, which
 * doesn't exist yet.
 */
export default function ArticlesPageClient() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') ?? undefined
  const q = searchParams.get('q') ?? undefined

  const { loading, error, categories, filterArticles, moderationStatus } = useP2PArticles({ category })
  const articles = filterArticles({ status: 'published', category, search: q })

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[430px] space-y-3 px-4 pt-4">
        <ArticleSearch categories={categories} />
      </div>

      {error && (
        <div className="mx-4 mt-4 w-full max-w-[430px] rounded-md bg-destructive/15 px-4 py-3 text-destructive">
          {error}
        </div>
      )}

      <div className="mt-4 w-full max-w-[430px] overflow-hidden rounded-2xl border bg-black sm:mt-6">
        {loading ? (
          <div className="h-[75vh] p-5">
            <Skeleton className="h-full w-full rounded-xl bg-white/10" />
          </div>
        ) : articles.length === 0 ? (
          <div className="flex h-[40vh] items-center justify-center text-white/60">
            No articles yet.
          </div>
        ) : (
          <div
            className="h-[75vh] overflow-y-scroll snap-y snap-mandatory [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {articles.map((article, i) => (
              <div key={article.cid} className="relative h-full w-full">
                <ArticleFeedCard
                  article={article}
                  coverImageUrl={coverImageUrl(article.coverImageCid)}
                  moderation={moderationStatus.get(article.cid)}
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
