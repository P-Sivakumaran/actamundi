'use client'

import Link from 'next/link'
import { UserCircle } from 'lucide-react'
import { useWalletAddress } from '@/hooks/use-wallet-address'

/** Small client component embedded in the (server) root layout's header,
 * same seam NetworkIndicator/MobileNav already use rather than converting
 * the whole layout to 'use client'. Renders nothing when no wallet is
 * connected — there's no profile to link to yet. */
export function HeaderProfileLink() {
  const { address } = useWalletAddress()
  if (!address) return null

  return (
    <Link
      href={`/profile/${address}`}
      aria-label="Your profile"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
    >
      <UserCircle className="h-5 w-5" />
    </Link>
  )
}
