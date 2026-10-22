'use client'

import { useState, useEffect } from 'react'
import { subscribeToCommentModeration, type ModerationAction } from '@/lib/p2p/moderation'

/** Live per-comment moderation status for one article, keyed by commentId —
 * same subscription shape as use-follow.ts/the article-level moderation
 * subscription in use-p2p-articles.ts. Resolves to an empty, "ready" map on
 * unconfigured deployments (subscribeToCommentModeration already handles
 * that), so CommentThread never blocks on a moderation board that doesn't exist. */
export function useCommentModeration(articleCid: string) {
  const [status, setStatus] = useState<Map<string, ModerationAction>>(new Map())
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let unsubscribe: (() => void) | undefined
    setReady(false)
    setStatus(new Map())

    const failed = (err: unknown) => {
      if (cancelled) return
      setReady(false)
      setError(err instanceof Error ? err.message : 'Failed to load comment moderation')
    }

    subscribeToCommentModeration(articleCid, (next) => {
      if (cancelled) return
      setStatus(next)
      setReady(true)
      setError(null)
    }, failed).then((cleanup) => {
      if (cancelled) cleanup()
      else unsubscribe = cleanup
    }).catch(failed)

    return () => { cancelled = true; unsubscribe?.() }
  }, [articleCid])

  return { status, ready, error }
}
