'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { fetchProfile, publishProfile } from '@/lib/p2p/profile'
import type { P2PProfile, P2PProfileInput } from '@/models/P2PProfile'

/** Fetch-once, not a live subscription — profile edits are rare, a stale
 * view until the next page visit is an acceptable tradeoff, unlike
 * follow/comments which need to reflect live writes from other peers. */
export function useProfile(walletAddr?: string) {
  const [profile, setProfile] = useState<P2PProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!walletAddr) {
      setProfile(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchProfile(walletAddr)
      .then((result) => { if (!cancelled) setProfile(result) })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load profile') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [walletAddr])

  const publish = useCallback(async (input: P2PProfileInput) => {
    setLoading(true)
    setError(null)
    try {
      if (typeof window === 'undefined' || !window.ethereum) throw new Error('No wallet found')
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const result = await publishProfile(input, signer)
      setProfile(result)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish profile')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { profile, loading, error, publish }
}
