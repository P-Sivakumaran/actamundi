'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import ArticleSearch from '@/components/ArticleSearch'
import { Skeleton } from '@/components/ui/skeleton'
import { ArticleCard } from '@/components/ArticleCard'
import { useP2PArticles } from '@/hooks/use-p2p-articles'

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
