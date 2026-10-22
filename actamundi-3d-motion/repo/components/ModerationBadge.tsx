'use client'

import { useEffect, useRef, useState } from 'react'
import { ShieldCheck, ShieldAlert, ShieldX, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ModerationAction } from '@/lib/p2p/moderation'

/**
 * Board trust signal for a feed card — derived from the moderation log
 * (lib/p2p/moderation.ts), not TruthVerification.sol. The two are separate
 * systems today: claims on that contract aren't linked to article CIDs,
 * so this reflects editorial endorsement/flagging, not on-chain claim
 * verification. See the strategy doc's open questions.
 *
 * All four states are real — delisted articles are filtered out of feeds,
 * but direct-CID links bypass that filter by design (see MODERATION.md),
 * so a reader CAN land on a delisted article's detail page and needs to
 * see that accurately, not as "unreviewed".
 *
 * Motion: the badge is a four-sided prism. When the status changes (live
 * via subscribeToModeration) it rolls forward to the new face, so readers
 * see the change happen instead of a silent swap. No motion on first render.
 */
const CONFIG = {
  endorsed: { label: 'Endorsed', icon: ShieldCheck, className: 'bg-emerald-500/20 text-emerald-50' },
  flagged: { label: 'Flagged', icon: ShieldAlert, className: 'bg-amber-500/20 text-amber-50' },
  delisted: { label: 'Delisted', icon: ShieldX, className: 'bg-red-500/20 text-red-50' },
  unreviewed: { label: 'Unreviewed', icon: Shield, className: 'bg-white/15 text-white/80' },
} as const

const ORDER = ['endorsed', 'flagged', 'delisted', 'unreviewed'] as const
export type ModerationStatus = (typeof ORDER)[number]

export function moderationStatus(action: ModerationAction | undefined): ModerationStatus {
  if (!action) return 'unreviewed'
  if (action.action === 'endorse') return 'endorsed'
  if (action.action === 'flag') return 'flagged'
  return 'delisted'
}

export function ModerationBadge({
  action,
  className,
}: {
  action: ModerationAction | undefined
  className?: string
}) {
  const status = moderationStatus(action)
  const index = ORDER.indexOf(status)
  const [angle, setAngle] = useState(index * 90)
  const prev = useRef(index)

  useEffect(() => {
    if (prev.current === index) return
    const steps = (index - prev.current + 4) % 4
    prev.current = index
    setAngle((a) => a + steps * 90)
  }, [index])

  return (
    <span className={cn('am-prism inline-block align-middle', className)} title={action?.reason} aria-live="polite">
      <span className="am-prism-stack" style={{ transform: `rotateX(${angle}deg)` }}>
        {ORDER.map((key, i) => {
          const config = CONFIG[key]
          const Icon = config.icon
          const active = key === status
          return (
            <span
              key={key}
              aria-hidden={!active}
              className={cn(
                'am-prism-face inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur whitespace-nowrap',
                config.className
              )}
              style={{ transform: `rotateX(${-i * 90}deg) translateZ(0.75rem)` }}
            >
              <Icon className="h-3 w-3" />
              {config.label}
              {action && active && (
                <span className="opacity-70">· {new Date(action.timestamp).toLocaleDateString()}</span>
              )}
            </span>
          )
        })}
      </span>
    </span>
  )
}
