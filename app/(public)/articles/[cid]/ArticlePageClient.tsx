'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { fetchArticleByCid } from '@/lib/p2p/articles'
import type { P2PArticle } from '@/models/P2PArticle'

export default function ArticlePageClient({ params }: { params: { cid: string } }) {
  const [article, setArticle] = useState<P2PArticle | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchArticleByCid(params.cid)
      .then((a) => {
        if (!cancelled) setArticle(a)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [params.cid])

  if (error) notFound()

  if (!article) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
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
