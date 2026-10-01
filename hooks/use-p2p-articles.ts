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
export function useP2PArticles({ authorAddr, category }: UseP2PArticlesOptions = {}) {
  const [articles, setArticles] = useState<P2PArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const bySlug = useRef<Map<string, P2PArticle>>(new Map())
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
    const existing = bySlug.current.get(article.slug)
    if (existing && new Date(existing.updatedAt) > new Date(article.updatedAt)) return
    bySlug.current.set(article.slug, article)
    setArticles(Array.from(bySlug.current.values()))
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

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
    const existing = bySlug.current.get(slug)
    if (!existing) return

    bySlug.current.delete(slug)
    setArticles(Array.from(bySlug.current.values()))

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
  }, [])

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
