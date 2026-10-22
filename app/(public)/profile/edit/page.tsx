'use client'

import dynamic from 'next/dynamic'

const EditProfilePageClient = dynamic(() => import('./EditProfilePageClient'), {
  ssr: false,
})

export default function EditProfilePage() {
  return <EditProfilePageClient />
}
