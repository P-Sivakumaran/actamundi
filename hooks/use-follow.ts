'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { subscribeToFollowGraph, publishFollowAction } from '@/lib/p2p/follow'
import { followingSet, followerCount as computeFollowerCount, type FollowAction } from '@/lib/p2p/follow-policy'
import { useWalletAddress } from './use-wallet-address'

/** Mirrors use-writer-subscriptions.ts's wallet-gated action shape — every
 * write goes through try/catch/loading/error, nothing escapes an effect
 * uncaught (see this session's TruthVerification.tsx / use-writer-subscriptions.ts fixes). */
export function useFollow(targetAddr: string) {
  const { address } = useWalletAddress()
  const [edges, setEdges] = useState<Map<string, FollowAction>>(new Map())
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let unsubscribe: (() => void) | undefined
    const failed = (err: unknown) => {
      if (cancelled) return
      setReady(false)
      setError(err instanceof Error ? err.message : 'Failed to load follow graph')
    }
    subscribeToFollowGraph((next) => {
      if (cancelled) return
      setEdges(next)
      setReady(true)
      setError(null)
    }, failed).then((cleanup) => {
      if (cancelled) cleanup()
      else unsubscribe = cleanup
    }).catch(failed)
    return () => { cancelled = true; unsubscribe?.() }
  }, [])

  const isFollowing = !!address && followingSet(edges, address).has(targetAddr.toLowerCase())
  const followerCount = computeFollowerCount(edges, targetAddr)

  const runAction = useCallback(async (action: 'follow' | 'unfollow') => {
    setLoading(true)
    setError(null)
    try {
      if (typeof window === 'undefined' || !window.ethereum) throw new Error('No wallet found')
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      await publishFollowAction({ followedAddr: targetAddr, action }, signer)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update follow status')
      throw err
    } finally {
      setLoading(false)
    }
  }, [targetAddr])

  const follow = useCallback(() => runAction('follow'), [runAction])
  const unfollow = useCallback(() => runAction('unfollow'), [runAction])

  return { isFollowing, followerCount, ready, loading, error, follow, unfollow }
}
