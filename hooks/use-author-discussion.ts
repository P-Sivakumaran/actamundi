'use client'

import { useState, useEffect } from 'react'
import { fetchComments, type Comment } from '@/lib/p2p/comments'
import type { P2PArticle } from '@/models/P2PArticle'

export interface DiscussionEntry {
  comment: Comment
  article: Pick<P2PArticle, 'cid' | 'slug' | 'title'>
}

type ArticleRef = Pick<P2PArticle, 'cid' | 'slug' | 'title'>

/** Comments made ON this writer's own articles — not comments this wallet
 * wrote. A true "everything this wallet ever commented on" feed would need
 * a global comments index across every article in the system, which
 * lib/p2p/comments.ts deliberately doesn't have (see SOCIAL.md — a global
 * log was the one design explicitly ruled out, for the same unbounded-
 * replication reason). This is fully derivable from data the Articles tab
 * already has: open each known article's comment store, merge, sort by
 * recency. One-shot, not a live subscription — same tradeoff use-stats.ts
 * already makes. */
export function useAuthorDiscussion(articles: ArticleRef[]) {
  const [entries, setEntries] = useState<DiscussionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cidsKey = articles.map((a) => a.cid).join(',')

  useEffect(() => {
    let cancelled = false
    if (articles.length === 0) {
      setEntries([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    Promise.all(
      articles.map((article) =>
        fetchComments(article.cid).then((comments) => comments.map((comment) => ({ comment, article })))
      )
    )
      .then((lists) => {
        if (cancelled) return
        const merged = lists.flat().sort((a, b) => Date.parse(b.comment.timestamp) - Date.parse(a.comment.timestamp))
        setEntries(merged)
      })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load discussion') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cidsKey is the real identity; `articles` is a new array reference every parent render
  }, [cidsKey])

  return { entries, loading, error }
}
