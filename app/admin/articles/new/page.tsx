'use client'

import dynamic from 'next/dynamic'

const NewArticlePageClient = dynamic(() => import('./NewArticlePageClient'), {
  ssr: false,
})

export default function NewArticlePage() {
  return <NewArticlePageClient />
}
