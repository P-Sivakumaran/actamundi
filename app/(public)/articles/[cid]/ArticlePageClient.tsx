'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2, Clock, History, ShieldQuestion } from 'lucide-react'
import { fetchArticleByCid, coverImageUrl } from '@/lib/p2p/articles'
import { fetchModerationLog, type ModerationAction } from '@/lib/p2p/moderation'
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

  useEffect(() => {
    let cancelled = false
    setArticle(null)
    setHistory([])
    setModerationLog([])

    fetchArticleByCid(params.cid)
      .then(async (a) => {
        if (cancelled) return
        setArticle(a)

        // Walk the prevCid chain for a visible correction/version history.
        // Capped and best-effort: an older version a peer never replicated
        // just stops the chain early rather than failing the page.
        const chain: P2PArticle[] = []
        let cursor = a.prevCid
        for (let i = 0; i < 25 && cursor; i++) {
          try {
            const prev = await fetchArticleByCid(cursor)
            chain.push(prev)
            cursor = prev.prevCid
          } catch {
            break
          }
        }
        if (!cancelled) setHistory(chain)

        fetchModerationLog(a.cid)
          .then((log) => { if (!cancelled) setModerationLog(log) })
          .catch(() => { if (!cancelled) setModerationLog([]) })
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
    }
  }, [params.cid])

  if (error) notFound()

  if (!article) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  const cover = coverImageUrl(article.coverImageCid)
  const latestModeration = moderationLog[moderationLog.length - 1]

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
        <ModerationBadge action={latestModeration} className="absolute right-4 top-4" />
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
        <ModerationBadge action={latestModeration} className="!bg-transparent !px-0 !text-foreground" />
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
        {moderationLog.length === 0 ? (
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
        )}
      </section>
    </article>
  )
}
