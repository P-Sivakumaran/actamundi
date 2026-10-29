'use client'

import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'

const ProfilePageClient = dynamic(() => import('./ProfilePageClient'), {
  ssr: false,
})

export default function ProfilePage() {
  const params = useParams<{ address: string }>()
  return <ProfilePageClient params={params} />
}
