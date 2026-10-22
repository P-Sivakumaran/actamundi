'use client'

import dynamic from 'next/dynamic'

const DevSeedPageClient = dynamic(() => import('./DevSeedPageClient'), {
  ssr: false,
})

export default function DevSeedPage() {
  return <DevSeedPageClient />
}
