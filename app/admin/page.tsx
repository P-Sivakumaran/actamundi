'use client'

import dynamic from 'next/dynamic'

// force-dynamic alone doesn't stop Next 14's build-time trial render of
// this route (it still tries once, and useSession() throws without a
// SessionProvider during that pass). ssr:false guarantees it never
// renders outside the browser at all.
const AdminDashboardClient = dynamic(() => import('./AdminDashboardClient'), {
  ssr: false,
})

export default function AdminDashboardPage() {
  return <AdminDashboardClient />
}
