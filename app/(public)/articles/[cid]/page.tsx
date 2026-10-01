'use client'

import dynamic from 'next/dynamic'

const ArticlePageClient = dynamic(() => import('./ArticlePageClient'), {
  ssr: false,
})

export default function ArticlePage({ params }: { params: { cid: string } }) {
  return <ArticlePageClient params={params} />
}
