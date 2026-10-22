'use client'

import { Heart } from 'lucide-react'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { useFollow } from '@/hooks/use-follow'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Wallet-gated follow/unfollow toggle — structurally identical to
 * SupportWriter.tsx's connect-prompt-or-action shape. */
export function FollowButton({ writerAddr, className }: { writerAddr: string; className?: string }) {
  const { address, connecting, connect } = useWalletAddress()
  const { isFollowing, loading, error, follow, unfollow } = useFollow(writerAddr)

  if (!address) {
    return (
      <Button size="sm" variant="outline" className={className} onClick={() => connect()} disabled={connecting}>
        {connecting ? 'Connecting...' : 'Connect to follow'}
      </Button>
    )
  }

  if (address.toLowerCase() === writerAddr.toLowerCase()) return null

  return (
    <div className={cn('flex flex-col items-start gap-1', className)}>
      <Button
        size="sm"
        variant={isFollowing ? 'outline' : 'default'}
        disabled={loading}
        onClick={() => (isFollowing ? unfollow() : follow())}
      >
        <Heart className="mr-1.5 h-3.5 w-3.5" fill={isFollowing ? 'currentColor' : 'none'} />
        {isFollowing ? 'Following' : 'Follow'}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
