'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PublishState = 'idle' | 'signing' | 'signed'

/**
 * Publish confirmation: the draft hovers while the wallet signs, gets a coral
 * stamp, and settles onto the stack of prior entries — "signed" + "added to the log"
 * in one motion. Pass the last two CIDs for the slabs if you have them.
 */
export function LedgerDrop({
  state,
  priorCids = ['bafy…k2q', 'bafy…9xe'],
  className,
}: {
  state: PublishState
  priorCids?: [string, string]
  className?: string
}) {
  const label = state === 'signed' ? 'Article signed and added to the log' : state === 'signing' ? 'Waiting for wallet signature' : 'Ready to publish'
  return (
    <div className={cn('am-ledger grid h-72 place-items-center overflow-hidden', className)} role="img" aria-label={label}>
      <div className="am-ledger-plane h-32 w-48" style={{ transform: 'translateY(30px) rotateX(58deg) rotateZ(-38deg)' }}>
        <div className="am-slab am-slab-0" />
        <div className="am-slab am-slab-1">{priorCids[0]}</div>
        <div className="am-slab am-slab-2">{priorCids[1]}</div>
        <div className="am-sheet" data-state={state}>
          <span className="h-[7px] w-[70%] rounded-sm bg-foreground" />
          <span className="h-1 w-full rounded-sm bg-border" />
          <span className="h-1 w-[92%] rounded-sm bg-border" />
          <span className="h-1 w-[60%] rounded-sm bg-border" />
          <span className="am-stamp"><Check className="h-3.5 w-3.5 text-white" strokeWidth={3} /></span>
        </div>
      </div>
    </div>
  )
}
