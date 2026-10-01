'use client'

import dynamic from 'next/dynamic'

const EditArticlePageClient = dynamic(() => import('./EditArticlePageClient'), {
  ssr: false,
})

export default function EditArticlePage({ params }: { params: { slug: string } }) {
  return <EditArticlePageClient params={params} />
}
