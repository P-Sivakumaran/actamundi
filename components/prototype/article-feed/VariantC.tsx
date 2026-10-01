// Variant C — Trust-first compact grid, no hero imagery.
// Bet: the opposite of B. Verification status is the primary visual
// signal (a colored edge, not a corner badge); photos are decorative
// enough to drop entirely without losing anything that matters.

import { Clock } from 'lucide-react'
import { MOCK_ARTICLES, type VerificationStatus } from './mock-articles'
import { VerificationBadge } from './VerificationBadge'
import { cn } from '@/lib/utils'

const EDGE_COLOR: Record<VerificationStatus, string> = {
  verified: 'before:bg-emerald-500',
  disputed: 'before:bg-amber-500',
  falsehood: 'before:bg-red-500',
  unverified: 'before:bg-gray-300',
}

export function VariantC() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {MOCK_ARTICLES.map((article) => (
        <a
          key={article.cid}
          href="#"
          className={cn(
            'relative overflow-hidden rounded-lg border bg-card p-4 pl-5 hover:shadow-md transition-shadow',
            'before:absolute before:left-0 before:top-0 before:h-full before:w-1.5',
            EDGE_COLOR[article.verification.status]
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">{article.category}</span>
            <VerificationBadge status={article.verification.status} verifierCount={article.verification.verifierCount} size="sm" />
          </div>
          <h3 className="mt-2 font-semibold leading-snug line-clamp-3">{article.title}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{article.authorName}</span>
            <span className="inline-flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {article.readingTime}m
            </span>
          </div>
        </a>
      ))}
    </div>
  )
}
