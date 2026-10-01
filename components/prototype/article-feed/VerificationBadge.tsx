import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VerificationStatus } from './mock-articles'

const CONFIG: Record<VerificationStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  verified: { label: 'Verified', icon: CheckCircle2, className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' },
  disputed: { label: 'Disputed', icon: AlertTriangle, className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400' },
  falsehood: { label: 'False', icon: XCircle, className: 'bg-red-500/15 text-red-700 dark:text-red-400' },
  unverified: { label: 'Unverified', icon: HelpCircle, className: 'bg-gray-500/15 text-gray-600 dark:text-gray-400' },
}

export function VerificationBadge({
  status,
  verifierCount,
  className,
  size = 'md',
}: {
  status: VerificationStatus
  verifierCount: number
  className?: string
  size?: 'sm' | 'md'
}) {
  const { label, icon: Icon, className: colorClass } = CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
        colorClass,
        className
      )}
    >
      <Icon className={size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
      {label}
      {verifierCount > 0 && <span className="opacity-70">· {verifierCount}</span>}
    </span>
  )
}
