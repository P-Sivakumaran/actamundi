'use client'

import { useSession } from 'next-auth/react'
import { ethers } from 'ethers'
import Link from 'next/link'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { useWriterSubscriptions } from '@/hooks/use-writer-subscriptions'
import { useP2PArticles } from '@/hooks/use-p2p-articles'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function AdminDashboardClient() {
  const { data: session } = useSession()
  const { address, connecting, connect } = useWalletAddress()
  const { pendingEarnings, withdraw, loading, error } = useWriterSubscriptions()
  const { articles } = useP2PArticles({ authorAddr: address ?? undefined })

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-serif text-lg font-medium text-foreground">
          Welcome back, {session?.user?.name}
        </h3>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Manage your magazine content from this dashboard.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-muted-foreground truncate">
                  Total Articles
                </dt>
                <dd className="text-lg font-medium text-foreground">
                  {address ? articles.length : '—'}
                </dd>
              </dl>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/articles"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View all articles
            </Link>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-9c-1.11 0-2.08.402-2.599 1" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-muted-foreground truncate">
                  Writer Earnings
                </dt>
                <dd className="text-lg font-medium text-foreground">
                  {address ? `${ethers.formatEther(pendingEarnings)} ETH` : '—'}
                </dd>
              </dl>
            </div>
          </div>
          <div className="mt-4">
            {!address ? (
              <Button size="sm" variant="outline" onClick={() => connect()} disabled={connecting}>
                {connecting ? 'Connecting...' : 'Connect wallet'}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={loading || pendingEarnings === BigInt(0)}
                onClick={() => withdraw(ethers.formatEther(pendingEarnings))}
              >
                {loading ? 'Withdrawing...' : 'Withdraw'}
              </Button>
            )}
            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}
