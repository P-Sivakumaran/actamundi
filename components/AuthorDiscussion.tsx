import Link from 'next/link'
import { truncateAddress } from '@/lib/utils'
import type { DiscussionEntry } from '@/hooks/use-author-discussion'

export function AuthorDiscussion({
  entries,
  loading,
  error,
}: {
  entries: DiscussionEntry[]
  loading: boolean
  error: string | null
}) {
  if (loading) return <p className="text-sm text-muted-foreground">Loading discussion…</p>
  if (error) return <p className="text-sm text-destructive">{error}</p>
  if (entries.length === 0) return <p className="text-sm text-muted-foreground">No comments on their articles yet.</p>

  return (
    <ol className="space-y-3">
      {entries.map(({ comment, article }) => (
        <li key={comment.id} className="rounded-lg border bg-muted/30 px-4 py-3">
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <Link href={`/profile/${comment.authorAddr}`} className="font-mono hover:text-foreground hover:underline">
              {truncateAddress(comment.authorAddr)}
            </Link>
            <span>{new Date(comment.timestamp).toLocaleDateString()}</span>
          </div>
          <p className="mt-1 text-sm text-foreground">{comment.body}</p>
          <Link href={`/articles/${article.cid}#comments`} className="mt-1 inline-block text-xs text-primary hover:underline">
            on &quot;{article.title}&quot;
          </Link>
        </li>
      ))}
    </ol>
  )
}
