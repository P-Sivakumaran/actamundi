'use client'

import { ShieldCheck } from 'lucide-react'
import { usePassportScore } from '@/hooks/use-passport-score'
import { cn } from '@/lib/utils'

/** Visual language matches ModerationBadge.tsx's endorsed state — same
 * "board/protocol vouched for this" trust signal, different source. Renders
 * nothing while loading, on error, or when the deployment hasn't configured
 * PASSPORT_API_KEY/PASSPORT_SCORER_ID yet — same silent-degrade rule as
 * every other optional external integration this session. */
export function VerifiedBadge({ address, className }: { address: string; className?: string }) {
  const { configured, passingScore, score, loading, error } = usePassportScore(address)

  if (loading || error || !configured) return null

  if (passingScore) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400',
          className
        )}
        title={`Human Passport score: ${score ?? '?'}`}
      >
        <ShieldCheck className="h-3 w-3" />
        Verified
      </span>
    )
  }

  return (
    <a
      href="https://app.passport.xyz"
      target="_blank"
      rel="noopener noreferrer"
      className={cn('text-xs text-muted-foreground hover:text-foreground hover:underline', className)}
    >
      Verify your humanity →
    </a>
  )
}
