import React from 'react'
import Link from 'next/link'
import { Article } from '@/models/Article'
import ArticleSearch from '@/components/ArticleSearch'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArticleCard } from '@/components/ArticleCard'

async function getArticles(searchParams: { [key: string]: string | string[] | undefined }) {
  const query = new URLSearchParams()
  query.set('status', 'published')
  if (searchParams.q) query.set('q', searchParams.q as string)
  if (searchParams.category) query.set('category', searchParams.category as string)
  if (searchParams.page) query.set('page', searchParams.page as string)
  if (searchParams.cursor) query.set('cursor', searchParams.cursor as string)

  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/articles?${query.toString()}`, {
    next: { revalidate: 3600 }, // Revalidate every hour
  })
  if (!response.ok) throw new Error('Failed to fetch articles')
  return response.json()
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { articles, categories, pagination } = await getArticles(searchParams)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
        <p className="mt-2 text-gray-600">
          Explore our latest articles and insights.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid gap-8">
            {articles.map((article: Article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.hasMore && (
            <div className="mt-8 flex justify-center">
              <Link
                href={`/articles?${new URLSearchParams({
                  ...searchParams,
                  cursor: pagination.nextCursor,
                }).toString()}`}
              >
                <Button variant="outline">Load More</Button>
              </Link>
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

// Loading state component
export function ArticlesPageSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
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
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
} 