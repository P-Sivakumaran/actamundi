'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import ArticleSearch from '@/components/ArticleSearch'
import { Skeleton } from '@/components/ui/skeleton'
import { ArticleCard } from '@/components/ArticleCard'
import { useP2PArticles } from '@/hooks/use-p2p-articles'
import { PrototypeSwitcher } from '@/components/prototype/PrototypeSwitcher'
import { VariantA } from '@/components/prototype/article-feed/VariantA'
import { VariantB } from '@/components/prototype/article-feed/VariantB'
import { VariantC } from '@/components/prototype/article-feed/VariantC'

// PROTOTYPE — feed-native direction, see strategy doc recommendations.
// ?variant=A|B|C on this route swaps in mock-data layouts; drop this block
// once a direction is picked (prototype skill: capture to a throwaway
// branch, fold the winner into the real markup below).
const FEED_VARIANTS = [
  { key: 'A', name: 'Dense scannable list' },
  { key: 'B', name: 'Full-bleed snap feed' },
  { key: 'C', name: 'Trust-first grid' },
]

/**
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

  const { loading, error, categories, filterArticles } = useP2PArticles({ category })
  const articles = filterArticles({ status: 'published', category, search: q })

  const variant = searchParams.get('variant')
  if (process.env.NODE_ENV !== 'production' && variant) {
    return (
      <div className="pb-24">
        <h1 className="mb-6 text-2xl font-bold">Articles — feed prototype</h1>
        {variant === 'B' && <VariantB />}
        {variant === 'C' && <VariantC />}
        {variant !== 'B' && variant !== 'C' && <VariantA />}
        <PrototypeSwitcher variants={FEED_VARIANTS} current={variant === 'B' || variant === 'C' ? variant : 'A'} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
        <p className="mt-2 text-gray-600">
          Explore our latest articles and insights.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? (
            <ArticlesPageSkeleton />
          ) : articles.length === 0 ? (
            <p className="text-gray-600">No articles yet.</p>
          ) : (
            <div className="grid gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.cid} article={article} />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter</h2>
            <ArticleSearch categories={categories} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ArticlesPageSkeleton() {
  return (
    <div className="grid gap-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm p-6 h-52">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3 mt-4" />
        </div>
      ))}
    </div>
  )
}
