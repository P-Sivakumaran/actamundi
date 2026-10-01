'use client'

// PROTOTYPE-ONLY — floating variant switcher for UI prototypes built with
// the prototype skill. Gated on NODE_ENV so it never ships to production.
// Shared across prototypes; put new ones' variant lists through this.

import { useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PrototypeVariant {
  key: string
  name: string
}

interface PrototypeSwitcherProps {
  variants: PrototypeVariant[]
  current: string
  paramName?: string
}

export function PrototypeSwitcher({ variants, current, paramName = 'variant' }: PrototypeSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const index = Math.max(0, variants.findIndex((v) => v.key === current))

  function go(nextIndex: number) {
    const wrapped = (nextIndex + variants.length) % variants.length
    const params = new URLSearchParams(searchParams.toString())
    params.set(paramName, variants[wrapped].key)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }
      if (e.key === 'ArrowLeft') go(index - 1)
      if (e.key === 'ArrowRight') go(index + 1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [index])

  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-1 rounded-full bg-black/90 text-white shadow-xl shadow-black/30 backdrop-blur px-2 py-2 text-sm font-medium">
      <button
        onClick={() => go(index - 1)}
        className="rounded-full p-1.5 hover:bg-white/15 transition-colors"
        aria-label="Previous variant"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="px-2 tabular-nums whitespace-nowrap">
        {variants[index]?.key} — {variants[index]?.name}
      </span>
      <button
        onClick={() => go(index + 1)}
        className="rounded-full p-1.5 hover:bg-white/15 transition-colors"
        aria-label="Next variant"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
