'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ethers } from 'ethers'
import type { P2PArticle, P2PArticleInput } from '@/models/P2PArticle'
import { subscribeToModeration, type ModerationAction } from '@/lib/p2p/moderation'
import {
  fetchArticleByCid,
  fetchAuthorArticles,
  publishArticle as publishArticleP2P,
  subscribeToCategory,
} from '@/lib/p2p/articles'

export interface ArticleFilters {
  search?: string
  category?: string
  status?: 'draft' | 'published'
  dateFrom?: Date
  dateTo?: Date
}

interface UseP2PArticlesOptions {
  /** scope to one author's own log, e.g. for the admin dashboard */
  authorAddr?: string
  /** category feed to follow via gossipsub, e.g. for the public article list */
  category?: string
}

/**
 * Drop-in replacement for the fetch('/api/articles') pattern used in
 * app/admin/articles/page.tsx and app/(public)/articles/page.tsx.
 * Returns the same { articles, loading, error, categories } shape;
 * filtering moves client-side since there's no server to query params against.
 */
/**
 * Keys the feed map by author + slug, not slug alone. The category feed
 * merges announcements from every author into one map; a slug-only key
 * would let any author's publish silently replace an unrelated author's
 * article of the same slug in the rendered feed (cross-author
 * replacement) — a wallet-signed article can't be forged, but it can
 * collide on the string another author happened to pick.
 */
function feedKey(article: Pick<P2PArticle, 'authorAddr' | 'slug'>): string {
  return `${article.authorAddr.toLowerCase()}:${article.slug}`
}

export function useP2PArticles({ authorAddr, category }: UseP2PArticlesOptions = {}) {
  const [articles, setArticles] = useState<P2PArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const byAuthorSlug = useRef<Map<string, P2PArticle>>(new Map())
  const [moderationStatus, setModerationStatus] = useState<Map<string, ModerationAction>>(new Map())
  const [moderationReady, setModerationReady] = useState(false)
  const [moderationError, setModerationError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let unsubscribe: (() => void) | undefined
    const failed = (err: unknown) => {
      if (cancelled) return
      setModerationReady(false)
      setModerationError(err instanceof Error ? err.message : 'Failed to load moderation')
    }
    subscribeToModeration((next) => {
      if (cancelled) return
      setModerationStatus(next)
      setModerationReady(true)
      setModerationError(null)
    }, failed).then((cleanup) => {
      if (cancelled) cleanup()
      else unsubscribe = cleanup
    }).catch(failed)
    return () => { cancelled = true; unsubscribe?.() }
  }, [])

  const isDelisted = useCallback(
    (cid: string) => moderationStatus.get(cid)?.action === 'delist',
    [moderationStatus]
  )

  // Hide the served index until its local moderation snapshot is checked.
  // Keep the underlying article map so a later endorsement restores visibility.
  const visibleArticles = moderationReady ? articles.filter((a) => !isDelisted(a.cid)) : []

  const applyArticle = useCallback((article: P2PArticle) => {
    const key = feedKey(article)
    const existing = byAuthorSlug.current.get(key)
    if (existing && new Date(existing.updatedAt) > new Date(article.updatedAt)) return
    byAuthorSlug.current.set(key, article)
    setArticles(Array.from(byAuthorSlug.current.values()))
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    // Scope is changing (e.g. a different wallet connects, or the public
    // feed switches category) — drop whatever the previous scope loaded.
    // Composite keys stop cross-author collisions, but across a scope
    // change they'd otherwise accumulate the old scope's rows forever
    // (never naturally overwritten), and the admin table still acts on
    // rows by slug alone, so a stale row from the old scope could get
    // deleted/edited in the new scope's place.
    byAuthorSlug.current.clear()
    setArticles([])

    async function load() {
      try {
        if (authorAddr) {
          const own = await fetchAuthorArticles(authorAddr)
          if (cancelled) return
          own.forEach(applyArticle)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load p2p articles')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()

    const unsubscribe = subscribeToCategory(category, async (cid) => {
      try {
        const article = await fetchArticleByCid(cid)
        // Author-scoped hooks (the admin "my articles" view) still
        // subscribe to the category topic — undefined category just means
        // "general" — so without this filter, a same-slug article from a
        // different author would land in a map the UI assumes is one
        // author's own, and e.g. feed Delete into deleting the wrong row.
        if (authorAddr && article.authorAddr.toLowerCase() !== authorAddr.toLowerCase()) return
        if (!cancelled) applyArticle(article)
      } catch (err) {
        console.error('Failed to resolve announced article cid', cid, err)
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [authorAddr, category, applyArticle])

  const publishArticle = useCallback(async (input: P2PArticleInput) => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('Wallet required to publish')
    }
    const provider = new ethers.BrowserProvider(window.ethereum as any)
    const signer = await provider.getSigner()
    const article = await publishArticleP2P(input, signer)
    applyArticle(article)
    return article
  }, [applyArticle])

  /**
   * The log is append-only — there's no delete. "Deleting" publishes a
   * tombstone version so the entry disappears from feeds built by peers
   * that respect tombstone: true, while history stays intact for auditing.
   */
  const deleteArticle = useCallback(async (slug: string) => {
    if (!authorAddr) return
    const key = feedKey({ authorAddr, slug })
    const existing = byAuthorSlug.current.get(key)
    if (!existing) return

    byAuthorSlug.current.delete(key)
    setArticles(Array.from(byAuthorSlug.current.values()))

    if (typeof window === 'undefined' || !window.ethereum) return
    const provider = new ethers.BrowserProvider(window.ethereum as any)
    const signer = await provider.getSigner()
    await publishArticleP2P(
      {
        slug: existing.slug,
        title: existing.title,
        content: '',
        category: existing.category,
        status: 'draft',
        createdAt: existing.createdAt,
        readingTime: 0,
        tombstone: true,
        prevCid: existing.cid,
      },
      signer
    )
  }, [authorAddr])

  const filterArticles = useCallback(
    (filters: ArticleFilters): P2PArticle[] => {
      return articles.filter((a) => {
        if (!moderationReady || isDelisted(a.cid)) return false
        if (a.tombstone) return false
        if (filters.status && a.status !== filters.status) return false
        if (filters.category && a.category !== filters.category) return false
        if (filters.search && !a.title.toLowerCase().includes(filters.search.toLowerCase())) return false
        if (filters.dateFrom && new Date(a.createdAt) < filters.dateFrom) return false
        if (filters.dateTo && new Date(a.createdAt) > filters.dateTo) return false
        return true
      })
    },
    [articles, moderationReady, isDelisted]
  )

  const categories = Array.from(
    new Set(visibleArticles.map((a) => a.category).filter((c): c is string => Boolean(c)))
  )

  return {
    articles: visibleArticles,
    loading: loading || (!moderationReady && !moderationError),
    error: moderationError ?? error,
    categories, publishArticle, deleteArticle, filterArticles,
    /** Latest board action per article CID (endorse/flag/delist). No entry = unreviewed. */
    moderationStatus,
  }
}
