'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { Heart } from 'lucide-react'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { useWriterSubscriptions, SECONDS_PER_MONTH } from '@/hooks/use-writer-subscriptions'
import { WalletCoin } from '@/components/motion/WalletCoin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, truncateAddress } from '@/lib/utils'

/** Reader-facing entry point for contracts/WriterSubscriptions.sol — lets a
 * reader pick this article's author as the one writer they stream ETH to.
 * Writer identity is purely the wallet address (see models/P2PArticle.ts),
 * same as everywhere else in the app. */
export function SupportWriter({ writerAddr, className }: { writerAddr: string; className?: string }) {
  const { address, connecting, connect } = useWalletAddress()
  const { subscription, loading, error, subscribe, topUp, changeRate, unsubscribe } = useWriterSubscriptions()
  const [amount, setAmount] = useState('0.01')

  const isThisWriter = subscription?.writer.toLowerCase() === writerAddr.toLowerCase()
  const isOtherWriter = subscription !== null && !isThisWriter

  if (!address) {
    return (
      <div className={cn('flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3', className)}>
        <WalletCoin state={connecting ? 'connecting' : 'disconnected'} showLabel={false} size={32} />
        <p className="flex-1 text-sm text-muted-foreground">Connect your wallet to support this writer.</p>
        <Button size="sm" variant="outline" onClick={() => connect()} disabled={connecting}>
          {connecting ? 'Connecting...' : 'Connect'}
        </Button>
      </div>
    )
  }

  if (isThisWriter && subscription) {
    const monthlyEth = ethers.formatEther(subscription.ratePerSecond * BigInt(SECONDS_PER_MONTH))
    return (
      <div className={cn('flex flex-col gap-3 rounded-lg border bg-muted/30 px-4 py-3', className)}>
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Heart className="h-4 w-4 text-destructive" fill="currentColor" />
          You&apos;re supporting this writer
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>~{Number(monthlyEth).toFixed(4)} ETH/month</span>
          <span>{ethers.formatEther(subscription.balance)} ETH remaining</span>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="number" step="0.001" min="0" value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-8 w-24 text-xs"
            aria-label="ETH amount"
          />
          <Button size="sm" variant="outline" disabled={loading} onClick={() => topUp(amount)}>
            Top up
          </Button>
          <Button size="sm" variant="outline" disabled={loading} onClick={() => changeRate(amount)}>
            Change rate
          </Button>
          <Button size="sm" variant="ghost" disabled={loading} onClick={() => unsubscribe()}>
            Unsubscribe
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-3 rounded-lg border bg-muted/30 px-4 py-3', className)}>
      {isOtherWriter && subscription && (
        <p className="text-xs text-muted-foreground">
          You&apos;re currently supporting {truncateAddress(subscription.writer)} — subscribing here switches your
          stream to this writer.
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Heart className="h-4 w-4 text-muted-foreground" />
        <Input
          type="number" step="0.001" min="0" value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-8 w-24 text-xs"
          aria-label="Monthly ETH amount"
        />
        <span className="text-xs text-muted-foreground">ETH/month</span>
        <Button size="sm" disabled={loading} onClick={() => subscribe(writerAddr, amount)}>
          {isOtherWriter ? 'Switch to this writer' : 'Support this writer'}
        </Button>
      </div>
    </div>
  )
}
