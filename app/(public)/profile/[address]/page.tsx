'use client'

import dynamic from 'next/dynamic'

const ProfilePageClient = dynamic(() => import('./ProfilePageClient'), {
  ssr: false,
})

export default function ProfilePage({ params }: { params: { address: string } }) {
  return <ProfilePageClient params={params} />
}
