// Variant A — Dense scannable list, category rail up top.
// Bet: readers scan a lot of headlines fast; verification status rides
// inline in the byline row rather than dominating the row.

import Image from 'next/image'
import { Clock } from 'lucide-react'
import { MOCK_ARTICLES } from './mock-articles'
import { VerificationBadge } from './VerificationBadge'

const CATEGORIES = Array.from(new Set(MOCK_ARTICLES.map((a) => a.category)))

export function VariantA() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="sticky top-0 z-10 -mx-4 mb-2 flex gap-2 overflow-x-auto bg-background/95 px-4 py-3 backdrop-blur border-b">
        {['All', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            className="shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors first:bg-foreground first:text-background first:border-foreground"
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="divide-y">
        {MOCK_ARTICLES.map((article) => (
          <a key={article.cid} href="#" className="flex gap-3 py-4 group">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              <Image
                src={article.coverImageUrl}
                alt=""
                fill
                sizes="64px"
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <VerificationBadge status={article.verification.status} verifierCount={article.verification.verifierCount} size="sm" />
                <span>{article.category}</span>
                <span className="inline-flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {article.readingTime}m
                </span>
                <span>{article.authorName}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
