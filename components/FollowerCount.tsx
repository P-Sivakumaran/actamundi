import { cn } from '@/lib/utils'

/** Decoupled from FollowButton so callers that just want the number
 * (a profile header, a byline) don't pull in wallet-gating logic. */
export function FollowerCount({ count, className }: { count: number; className?: string }) {
  return (
    <span className={cn('text-sm text-muted-foreground', className)}>
      {count} follower{count === 1 ? '' : 's'}
    </span>
  )
}
