'use client'

import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'

const EditArticlePageClient = dynamic(() => import('./EditArticlePageClient'), {
  ssr: false,
})

export default function EditArticlePage() {
  const params = useParams<{ slug: string }>()
  return <EditArticlePageClient params={params} />
}
