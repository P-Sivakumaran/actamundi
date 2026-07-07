import React from 'react'
import { Article } from '@/models/Article'
import { notFound } from 'next/navigation'

async function getArticle(slug: string) {
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/articles/${slug}`, {
    next: { revalidate: 3600 }, // Revalidate every hour
  })
  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error('Failed to fetch article')
  }
  return response.json()
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug)

  if (!article) {
    notFound()
  }

  return (
    <article className="max-w-3xl mx-auto">
      <header className="mb-8">
        <div className="text-sm text-gray-500 mb-2">
          {new Date(article.createdAt).toLocaleDateString()} • {article.category}
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>
        <p className="text-xl text-gray-600">
          {article.excerpt}
        </p>
      </header>

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  )
} 