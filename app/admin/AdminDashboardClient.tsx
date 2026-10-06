'use client'

import { useSession } from 'next-auth/react'
import { ethers } from 'ethers'
import Link from 'next/link'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { useWriterSubscriptions } from '@/hooks/use-writer-subscriptions'
import { Button } from '@/components/ui/button'

export default function AdminDashboardClient() {
  const { data: session } = useSession()
  const { address, connecting, connect } = useWalletAddress()
  const { pendingEarnings, withdraw, loading, error } = useWriterSubscriptions()

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Welcome back, {session?.user?.name}
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Manage your magazine content and users from this dashboard.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Articles
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    0
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/admin/articles"
                className="text-sm font-medium text-primary hover:text-primary-dark"
              >
                View all articles
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    0
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/admin/users"
                className="text-sm font-medium text-primary hover:text-primary-dark"
              >
                View all users
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Views
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    0
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/admin/analytics"
                className="text-sm font-medium text-primary hover:text-primary-dark"
              >
                View analytics
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-9c-1.11 0-2.08.402-2.599 1" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Writer Earnings
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
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
          </div>
        </div>
      </div>
    </div>
  )
} 