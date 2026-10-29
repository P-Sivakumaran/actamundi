'use client'

import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'

const ArticlePageClient = dynamic(() => import('./ArticlePageClient'), {
  ssr: false,
})

export default function ArticlePage() {
  const params = useParams<{ cid: string }>()
  return <ArticlePageClient params={params} />
}
