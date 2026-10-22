'use client'

import { Check, X } from 'lucide-react'
import { cn, truncateAddress } from '@/lib/utils'

export type SignatureStatus = 'verifying' | 'verified' | 'failed'

/**
 * Byline card that turns over to show its proof once signature verification
 * resolves. Rests on the result; reduced motion swaps without the turn.
 */
export function SignatureFlip({
  author,
  address,
  status,
  className,
}: {
  author?: string
  address: string
  status: SignatureStatus
  className?: string
}) {
  const failed = status === 'failed'
  return (
    <div className={cn('am-flip h-44 w-full max-w-xs', className)} aria-live="polite">
      <div className="am-flip-inner" data-flipped={status !== 'verifying'}>
        <div className="am-face flex flex-col gap-1.5 border border-border bg-card p-5 shadow-lg" aria-hidden={status !== 'verifying'}>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Byline</span>
          {author && <span className="font-serif text-2xl">{author}</span>}
          <span className="font-mono text-sm text-muted-foreground">{truncateAddress(address)}</span>
          <span className="mt-auto text-sm text-muted-foreground">Checking signature against wallet…</span>
          <span className="am-progress" role="progressbar" aria-label="Verifying signature"><span /></span>
        </div>
        <div
          className={cn('am-face am-face-back flex items-center gap-4 p-5 shadow-xl', failed ? 'am-face-failed' : 'am-face-verified')}
          aria-hidden={status === 'verifying'}
        >
          <span className="am-seal grid h-16 w-16 shrink-0 place-items-center rounded-full">
            {failed ? <X className="h-7 w-7" strokeWidth={2.5} /> : <Check className="h-7 w-7" strokeWidth={2.5} />}
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-base font-bold">{failed ? 'Signature mismatch' : 'Signature verified'}</span>
            <span className="text-sm leading-snug opacity-90">
              {failed
                ? 'This text doesn’t match what the author’s wallet signed.'
                : `Signed by ${author ? author + '’s' : 'the author’s'} wallet. Unchanged since publication.`}
            </span>
            <span className="font-mono text-xs opacity-80">{truncateAddress(address)}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
