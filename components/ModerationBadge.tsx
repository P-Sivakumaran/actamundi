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
 */
const CONFIG = {
  endorsed: { label: 'Endorsed', icon: ShieldCheck, className: 'bg-emerald-500/20 text-emerald-50' },
  flagged: { label: 'Flagged', icon: ShieldAlert, className: 'bg-amber-500/20 text-amber-50' },
  delisted: { label: 'Delisted', icon: ShieldX, className: 'bg-red-500/20 text-red-50' },
  unreviewed: { label: 'Unreviewed', icon: Shield, className: 'bg-white/15 text-white/80' },
} as const

function statusFor(action: ModerationAction | undefined): keyof typeof CONFIG {
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
  const config = CONFIG[statusFor(action)]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur whitespace-nowrap',
        config.className,
        className
      )}
      title={action?.reason}
    >
      <Icon className="h-3 w-3" />
      {config.label}
      {action && (
        <span className="opacity-70">· {new Date(action.timestamp).toLocaleDateString()}</span>
      )}
    </span>
  )
}
