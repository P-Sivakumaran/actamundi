'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ethers } from 'ethers'
import { subscribeToComments, publishComment, deleteComment as deleteCommentP2P } from '@/lib/p2p/comments'
import type { Comment } from '@/models/P2PComment'

export interface CommentNode extends Comment {
  replies: CommentNode[]
}

/** Nests the flat verified list by parentId — comments.ts stays "verified
 * flat list only," tree-shaping is a render concern that belongs here. */
function buildTree(flat: Comment[]): CommentNode[] {
  const byId = new Map<string, CommentNode>()
  flat.forEach((c) => byId.set(c.id, { ...c, replies: [] }))
  const roots: CommentNode[] = []
  for (const node of Array.from(byId.values())) {
    const parent = node.parentId ? byId.get(node.parentId) : undefined
    if (parent) parent.replies.push(node)
    else roots.push(node)
  }
  return roots
}

export function useComments(articleCid: string) {
  const [flat, setFlat] = useState<Comment[]>([])
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let unsubscribe: (() => void) | undefined
    setReady(false)
    setFlat([])
    const failed = (err: unknown) => {
      if (cancelled) return
      setReady(false)
      setError(err instanceof Error ? err.message : 'Failed to load comments')
    }
    subscribeToComments(articleCid, (next) => {
      if (cancelled) return
      setFlat(next)
      setReady(true)
      setError(null)
    }, failed).then((cleanup) => {
      if (cancelled) cleanup()
      else unsubscribe = cleanup
    }).catch(failed)
    return () => { cancelled = true; unsubscribe?.() }
  }, [articleCid])

  const comments = useMemo(() => buildTree(flat), [flat])

  const postComment = useCallback(async (body: string, parentId?: string) => {
    setLoading(true)
    setError(null)
    try {
      if (typeof window === 'undefined' || !window.ethereum) throw new Error('No wallet found')
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      await publishComment({ cid: articleCid, parentId, body }, signer)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment')
      throw err
    } finally {
      setLoading(false)
    }
  }, [articleCid])

  const removeComment = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      if (typeof window === 'undefined' || !window.ethereum) throw new Error('No wallet found')
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      await deleteCommentP2P(id, articleCid, signer)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment')
      throw err
    } finally {
      setLoading(false)
    }
  }, [articleCid])

  return { comments, ready, loading, error, postComment, deleteComment: removeComment }
}
