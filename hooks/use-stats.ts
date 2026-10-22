'use client'

import { useState, useEffect } from 'react'
import { fetchAuthorArticles } from '@/lib/p2p/articles'
import { fetchFollowEdges } from '@/lib/p2p/follow'

export interface ProfileStats {
  articleCount: number
  followerCount: number
  followingCount: number
  /** The actual followed addresses, not just the count — fetchFollowEdges()
   * is already called here for followingCount, so this is free. */
  following: string[]
}

/** Pure composition over the article and follow stores — no dedicated
 * stats store, which would just be a cache that can silently drift from
 * the real logs. A one-shot read is fine: these numbers don't need
 * use-follow.ts's live-subscription guarantee. */
export function useProfileStats(walletAddr: string) {
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const lower = walletAddr.toLowerCase()

    Promise.all([fetchAuthorArticles(walletAddr), fetchFollowEdges()])
      .then(([articles, edges]) => {
        if (cancelled) return
        const followerCount = edges.filter(
          (e) => e.followedAddr.toLowerCase() === lower && e.action === 'follow'
        ).length
        const following = edges
          .filter((e) => e.followerAddr.toLowerCase() === lower && e.action === 'follow')
          .map((e) => e.followedAddr)
        setStats({ articleCount: articles.length, followerCount, followingCount: following.length, following })
      })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load stats') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [walletAddr])

  return { stats, loading, error }
}
