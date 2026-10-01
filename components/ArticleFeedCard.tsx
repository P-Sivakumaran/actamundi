import Image from 'next/image'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { ModerationBadge } from '@/components/ModerationBadge'
import { truncateAddress, fallbackGradient } from '@/lib/utils'
import type { P2PArticle } from '@/models/P2PArticle'
import type { ModerationAction } from '@/lib/p2p/moderation'

export function ArticleFeedCard({
  article,
  coverImageUrl,
  moderation,
  priority = false,
  linkToArticle = true,
}: {
  article: P2PArticle
  coverImageUrl: string | undefined
  moderation: ModerationAction | undefined
  priority?: boolean
  /** false for the admin live-preview pane — a card that isn't published
   * yet has nowhere real to navigate to, and shouldn't discard in-progress
   * editing state by acting like a link out of the form. */
  linkToArticle?: boolean
}) {
  const content = (
    <>
      {coverImageUrl ? (
        <Image
          src={coverImageUrl}
          alt=""
          fill
          priority={priority}
          sizes="(max-width: 480px) 100vw, 430px"
          className="object-cover"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient(article.cid)}`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/40" />

      <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
        {article.category ? (
          <span className="rounded-full bg-white/20 backdrop-blur px-2.5 py-1 text-xs font-medium text-white">
            {article.category}
          </span>
        ) : (
          <span />
        )}
        <ModerationBadge action={moderation} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <h2 className="text-xl font-bold leading-tight line-clamp-3">{article.title}</h2>
        {article.excerpt && (
          <p className="mt-2 text-sm text-white/80 line-clamp-2">{article.excerpt}</p>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-white/70">
          <span>{truncateAddress(article.authorAddr)}</span>
          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
          {article.readingTime > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {article.readingTime}m read
            </span>
          )}
        </div>
      </div>
    </>
  )

  const className = 'relative block h-full w-full shrink-0 snap-start overflow-hidden'

  if (!linkToArticle) {
    return <div className={className}>{content}</div>
  }

  return (
    <Link href={`/articles/${article.cid}`} aria-label={`Read article: ${article.title}`} className={className}>
      {content}
    </Link>
  )
}
