'use client'

import dynamic from 'next/dynamic'

const ArticlesPageClient = dynamic(() => import('./ArticlesPageClient'), {
  ssr: false,
})

export default function ArticlesPage() {
  return <ArticlesPageClient />
}
