'use client'

import { useState, useCallback, useMemo } from 'react'
import { ethers } from 'ethers'
import { isModerationConfigured, getModerationPolicy, publishModerationAction } from '@/lib/p2p/moderation'
import { useWalletAddress } from './use-wallet-address'

/** Board-member-gated moderation actions for one target — an article cid
 * or a commentModerationTarget() composite string (see moderation-policy.ts).
 * Mirrors use-follow.ts's wallet-gated try/catch/loading/error shape — a
 * write failure (unauthorized signer, rejected signature, replication
 * error) must land in `error`, never escape uncaught. */
export function useModerationBoard(targetCid: string) {
  const { address, connecting, connect } = useWalletAddress()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isBoardMember = useMemo(() => {
    if (!address || !isModerationConfigured()) return false
    try {
      return getModerationPolicy().boardAddrs.includes(address.toLowerCase())
    } catch {
      return false
    }
  }, [address])

  const runAction = useCallback(
    async (action: 'endorse' | 'flag' | 'delist', reason?: string) => {
      setLoading(true)
      setError(null)
      try {
        if (typeof window === 'undefined' || !window.ethereum) throw new Error('No wallet found')
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        await publishModerationAction({ cid: targetCid, action, reason }, signer)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to publish moderation action')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [targetCid]
  )

  return {
    address,
    connecting,
    connect,
    isBoardMember,
    loading,
    error,
    endorse: (reason?: string) => runAction('endorse', reason),
    flag: (reason?: string) => runAction('flag', reason),
    delist: (reason?: string) => runAction('delist', reason),
  }
}
