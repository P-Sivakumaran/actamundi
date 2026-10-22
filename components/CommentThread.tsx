'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { useComments, type CommentNode } from '@/hooks/use-comments'
import { useCommentModeration } from '@/hooks/use-comment-moderation'
import { commentModerationTarget, type ModerationAction } from '@/lib/p2p/moderation'
import { CommentForm } from '@/components/CommentForm'
import { ModerationBadge } from '@/components/ModerationBadge'
import { ModerationActions } from '@/components/ModerationActions'
import { Button } from '@/components/ui/button'
import { truncateAddress } from '@/lib/utils'

/** Drops a delisted comment and its replies entirely rather than leaving
 * orphaned replies under a hidden parent — same "hide, don't show"
 * treatment the article feed gives delisted articles. Comments have no
 * direct-link bypass page that would need to show them anyway. */
function filterDelisted(nodes: CommentNode[], moderation: Map<string, ModerationAction>): CommentNode[] {
  return nodes
    .filter((node) => moderation.get(node.id)?.action !== 'delist')
    .map((node) => ({ ...node, replies: filterDelisted(node.replies, moderation) }))
}

function CommentItem({
  node,
  articleCid,
  address,
  moderationStatus,
  onReply,
  onDelete,
  loading,
}: {
  node: CommentNode
  articleCid: string
  address: string | null
  moderationStatus: Map<string, ModerationAction>
  onReply: (parentId: string, body: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  loading: boolean
}) {
  const [replying, setReplying] = useState(false)
  const isOwn = !!address && address.toLowerCase() === node.authorAddr.toLowerCase()
  const moderation = moderationStatus.get(node.id)

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-lg border bg-muted/30 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href={`/profile/${node.authorAddr}`} className="font-mono text-xs text-primary hover:underline">
            {truncateAddress(node.authorAddr)}
          </Link>
          <div className="flex items-center gap-2">
            {moderation && (
              <ModerationBadge action={moderation} className="!bg-transparent !px-0 !text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">{new Date(node.timestamp).toLocaleString()}</span>
          </div>
        </div>
        <p className="mt-1 text-sm text-foreground">{node.body}</p>
        <div className="mt-2 flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={() => setReplying((r) => !r)}>
            Reply
          </Button>
          {isOwn && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-destructive"
              disabled={loading}
              onClick={() => onDelete(node.id)}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          )}
        </div>
        {replying && (
          <div className="mt-3">
            <CommentForm
              placeholder="Write a reply…"
              submitLabel="Reply"
              loading={loading}
              onSubmit={async (body) => {
                await onReply(node.id, body)
                setReplying(false)
              }}
            />
          </div>
        )}
        <ModerationActions targetCid={commentModerationTarget(articleCid, node.id)} className="mt-3" />
      </div>

      {node.replies.length > 0 && (
        <div className="ml-6 flex flex-col gap-2 border-l pl-4">
          {node.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              node={reply}
              articleCid={articleCid}
              address={address}
              moderationStatus={moderationStatus}
              onReply={onReply}
              onDelete={onDelete}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/** One article's nested comment tree — owns its own useComments(articleCid)
 * call, same one-hook-per-component wiring SupportWriter.tsx demonstrates.
 * Composes useCommentModeration alongside it for the board's view. */
export function CommentThread({ articleCid }: { articleCid: string }) {
  const { address } = useWalletAddress()
  const { comments, ready, loading, error, postComment, deleteComment } = useComments(articleCid)
  const { status: moderationStatus } = useCommentModeration(articleCid)

  const visibleComments = filterDelisted(comments, moderationStatus)

  return (
    <div className="flex flex-col gap-4">
      <CommentForm loading={loading} onSubmit={(body) => postComment(body)} />
      {error && <p className="text-xs text-destructive">{error}</p>}

      {!ready && <p className="text-sm text-muted-foreground">Loading comments…</p>}
      {ready && visibleComments.length === 0 && (
        <p className="text-sm text-muted-foreground">No comments yet — be the first.</p>
      )}

      <div className="flex flex-col gap-3">
        {visibleComments.map((node) => (
          <CommentItem
            key={node.id}
            node={node}
            articleCid={articleCid}
            address={address}
            moderationStatus={moderationStatus}
            onReply={(parentId, body) => postComment(body, parentId)}
            onDelete={(id) => deleteComment(id)}
            loading={loading}
          />
        ))}
      </div>
    </div>
  )
}
