import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Empty section: a blank page lifting in a slow breeze — an invitation, not an error. */
export function EmptyState({ title, description, action, className }: { title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-4 py-12 text-center', className)}>
      <div className="am-book" aria-hidden>
        <div className="am-book-plane h-[100px] w-44">
          <span className="am-book-page am-book-left" />
          <span className="am-book-page am-book-right" />
          <span className="am-book-page am-book-leaf" />
        </div>
      </div>
      <h2 className="font-serif text-2xl">{title}</h2>
      {description && <p className="max-w-xs text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  )
}
