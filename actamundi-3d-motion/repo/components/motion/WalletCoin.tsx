'use client'

import { cn, truncateAddress } from '@/lib/utils'

export type WalletState = 'disconnected' | 'connecting' | 'connected'

/** Token spins during the wallet handshake and lands face-up on connect. */
export function WalletCoin({
  state,
  address,
  size = 48,
  showLabel = true,
  className,
}: {
  state: WalletState
  address?: string
  size?: number
  showLabel?: boolean
  className?: string
}) {
  const depth = Math.max(2, Math.round(size / 32))
  return (
    <div className={cn('inline-flex items-center gap-3', className)} style={{ perspective: size * 7 }} aria-live="polite">
      <div className="am-coin" data-state={state} style={{ width: size, height: size }} aria-hidden>
        {Array.from({ length: depth * 2 + 1 }, (_, i) => (
          <span key={i} style={{ transform: `translateZ(${i - depth}px)` }} />
        ))}
        <span className="am-coin-face" style={{ transform: `translateZ(${depth + 1}px)`, fontSize: size * 0.36 }}>A</span>
        <span className="am-coin-face" style={{ transform: `rotateY(180deg) translateZ(${depth + 1}px)`, fontSize: size * 0.36 }}>M</span>
      </div>
      {showLabel && (
        <div className="flex flex-col leading-tight">
          {state === 'connected' && address ? (
            <span className="am-reveal flex flex-col">
              <span className="text-sm font-bold">Connected</span>
              <span className="font-mono text-xs text-muted-foreground">{truncateAddress(address)}</span>
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">{state === 'connecting' ? 'Connecting wallet…' : 'Wallet not connected'}</span>
          )}
        </div>
      )}
    </div>
  )
}
