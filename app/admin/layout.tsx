'use client'

import dynamic from 'next/dynamic'
import { SessionProvider } from 'next-auth/react'

const AdminLayoutClient = dynamic(() => import('./AdminLayoutClient'), {
  ssr: false,
})

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </SessionProvider>
  )
}
