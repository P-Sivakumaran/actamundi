import React from 'react'
import Link from 'next/link'
import { Article } from '@/models/Article'
import ArticleSearch from '@/components/ArticleSearch'

async function getArticles(searchParams: { [key: string]: string | string[] | undefined }) {
  const query = new URLSearchParams()
  query.set('status', 'published')
  if (searchParams.q) query.set('q', searchParams.q as string)
  if (searchParams.category) query.set('category', searchParams.category as string)

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
  const articles = await getArticles(searchParams)

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
          <div className="grid gap-8 md:grid-cols-2">
            {articles.map((article: Article) => (
              <Link
                key={article._id}
                href={`/articles/${article.slug}`}
                className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="text-sm text-gray-500 mb-2">
                    {new Date(article.createdAt).toLocaleDateString()} • {article.category}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary">
                    {article.title}
                  </h2>
                  <p className="mt-2 text-gray-600 line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter</h2>
            <ArticleSearch />
          </div>
        </div>
      </div>
    </div>
  )
} 