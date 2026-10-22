import { cn } from '@/lib/utils'

/** Loading state: pages riffle around the spine — a small, CSS-only echo of the mark. */
export function PageFanLoader({ label = 'Fetching articles from peers…', size = 120, className }: { label?: string; size?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-6', className)} role="status" aria-live="polite">
      <div className="am-fan" style={{ width: size, height: size }}>
        <div className="am-fan-axis h-full w-full">
          <span className="am-spine" />
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className="am-leaf" style={{ animationDelay: `${i * 0.09}s` }} />
          ))}
        </div>
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}
