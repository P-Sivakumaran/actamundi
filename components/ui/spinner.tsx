import { cn } from '@/lib/utils'

/** The one loading spinner — was duplicated inline across five page
 * components with near-identical markup. */
export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary', className)}
    />
  )
}
