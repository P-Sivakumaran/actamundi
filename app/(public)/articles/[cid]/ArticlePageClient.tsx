'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2, Clock, History, ShieldQuestion, AlertCircle } from 'lucide-react'
import { fetchArticleByCid, coverImageUrl } from '@/lib/p2p/articles'
import { fetchModerationLog, subscribeToModeration, type ModerationAction } from '@/lib/p2p/moderation'
import { ModerationBadge } from '@/components/ModerationBadge'
import { truncateAddress, fallbackGradient } from '@/lib/utils'
import type { P2PArticle } from '@/models/P2PArticle'

/**
 * Trust surfaced inline, not behind a click — the same thesis as the feed
 * card, extended with what a reading view has room for: the signed version
 * chain (prevCid) and the full moderation log, not just current status.
 * fetchArticleByCid() already throws on a bad signature, so reaching this
 * component at all is the signature-verified guarantee; there's no separate
 * async check to run.
 */
export default function ArticlePageClient({ params }: { params: { cid: string } }) {
  const [article, setArticle] = useState<P2PArticle | null>(null)
  const [error, setError] = useState(false)
  const [history, setHistory] = useState<P2PArticle[]>([])
  const [moderationLog, setModerationLog] = useState<ModerationAction[]>([])
  const [latestModeration, setLatestModeration] = useState<ModerationAction | undefined>(undefined)
  const [moderationState, setModerationState] = useState<'loading' | 'unavailable' | 'ready'>('loading')

  // Article + its signed version chain.
  useEffect(() => {
    let cancelled = false
    setArticle(null)
    setHistory([])

    fetchArticleByCid(params.cid)
      .then(async (a) => {
        if (cancelled) return
        setArticle(a)

        // Walk the prevCid chain for a visible correction/version history.
        // prevCid is just a self-declared pointer, not cryptographically
        // bound to the article that names it — without checking lineage,
        // any author could point prevCid at someone else's unrelated
        // article to borrow (or smear) its reputation by association.
        // Capped and best-effort: an older version a peer never
        // replicated just stops the chain early rather than failing the page.
        const chain: P2PArticle[] = []
        let cursor = a.prevCid
        let lineage = a
        for (let i = 0; i < 25 && cursor && !cancelled; i++) {
          let prev: P2PArticle
          try {
            prev = await fetchArticleByCid(cursor)
          } catch {
            break
          }
          if (prev.slug !== lineage.slug || prev.authorAddr !== lineage.authorAddr) break
          chain.push(prev)
          lineage = prev
          cursor = prev.prevCid
        }
        if (!cancelled) setHistory(chain)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
    }
  }, [params.cid])

  // Moderation: subscribed, not one-shot — a flag/endorse/delist that
  // replicates in after first paint has to actually update the badge and
  // log, not freeze on whatever was locally known at mount.
  useEffect(() => {
    if (!article) return
    let cancelled = false
    setModerationState('loading')

    const refreshLog = () => {
      fetchModerationLog(article.cid)
        .then((log) => {
          if (cancelled) return
          setModerationLog(log)
          setModerationState('ready')
        })
        .catch(() => { if (!cancelled) setModerationState('unavailable') })
    }

    let unsubscribe: (() => void) | undefined
    subscribeToModeration(
      (statusMap) => {
        if (cancelled) return
        setLatestModeration(statusMap.get(article.cid))
        refreshLog()
      },
      () => { if (!cancelled) setModerationState('unavailable') }
    ).then((cleanup) => {
      if (cancelled) cleanup()
      else unsubscribe = cleanup
    }).catch(() => { if (!cancelled) setModerationState('unavailable') })

    return () => { cancelled = true; unsubscribe?.() }
  }, [article?.cid])

  if (error) notFound()

  if (!article) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  const cover = coverImageUrl(article.coverImageCid)

  return (
    <article className="mx-auto max-w-3xl">
      <div className="relative mb-6 h-56 overflow-hidden rounded-2xl sm:h-72">
        {cover ? (
          <Image src={cover} alt="" fill sizes="768px" className="object-cover" priority />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient(article.cid)}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {article.category && (
          <span className="absolute left-4 top-4 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            {article.category}
          </span>
        )}
        {moderationState === 'ready' && (
          <ModerationBadge action={latestModeration} className="absolute right-4 top-4" />
        )}
      </div>

      <header className="mb-6">
        <h1 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">{article.title}</h1>
        {article.excerpt && <p className="mb-4 text-lg text-muted-foreground">{article.excerpt}</p>}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span>{truncateAddress(article.authorAddr)}</span>
          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
          {article.readingTime > 0 && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {article.readingTime} min read
            </span>
          )}
        </div>
      </header>

      <div className="mb-8 flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          Signature verified
        </span>
        <span className="text-muted-foreground">·</span>
        {moderationState === 'loading' && (
          <span className="text-muted-foreground">Checking moderation status…</span>
        )}
        {moderationState === 'unavailable' && (
          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
            <AlertCircle className="h-3.5 w-3.5" />
            Moderation status unavailable
          </span>
        )}
        {moderationState === 'ready' && (
          <ModerationBadge action={latestModeration} className="!bg-transparent !px-0 !text-foreground" />
        )}
        {history.length > 0 && (
          <>
            <span className="text-muted-foreground">·</span>
            <a href="#version-history" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <History className="h-3.5 w-3.5" />
              {history.length} earlier version{history.length > 1 ? 's' : ''}
            </a>
          </>
        )}
      </div>

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {history.length > 0 && (
        <section id="version-history" className="mt-12 border-t pt-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <History className="h-4 w-4" />
            Version history
          </h2>
          <p className="mb-3 text-xs text-muted-foreground">
            Same slug and author wallet as this article, confirmed by signature — not independently fact-checked.
          </p>
          <ol className="space-y-2">
            {history.map((version, i) => (
              <li key={version.cid} className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">
                  {i === 0 ? 'Previous version' : `${i + 1} versions ago`} · {new Date(version.updatedAt).toLocaleString()}
                </span>
                <Link href={`/articles/${version.cid}`} className="font-mono text-xs text-primary hover:underline">
                  {truncateAddress(version.cid)}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-12 border-t pt-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <ShieldQuestion className="h-4 w-4" />
          Moderation log
        </h2>
        {moderationState === 'loading' && (
          <p className="text-sm text-muted-foreground">Checking moderation log…</p>
        )}
        {moderationState === 'unavailable' && (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Couldn&apos;t reach the moderation log — that&apos;s not the same as there being nothing in it.
          </p>
        )}
        {moderationState === 'ready' && (
          moderationLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">No moderation actions on this article yet.</p>
          ) : (
            <ol className="space-y-3">
              {[...moderationLog].reverse().map((action, i) => (
                <li key={i} className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <ModerationBadge action={action} className="!bg-transparent !px-0 !text-foreground" />
                    <span className="text-muted-foreground">by {truncateAddress(action.boardAddr)}</span>
                    {action.reason && <span className="text-muted-foreground">— {action.reason}</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(action.timestamp).toLocaleString()}</span>
                </li>
              ))}
            </ol>
          )
        )}
      </section>
    </article>
  )
}
