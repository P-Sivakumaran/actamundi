'use client'

import { useState } from 'react'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

/** Wallet-gated composer, split from CommentThread the same way moderation
 * splits read (moderation.ts) from write (publishModerationAction) — the
 * caller supplies onSubmit so one CommentThread instance's postComment can
 * back both the top-level form and every reply form without each owning a
 * separate subscription. */
export function CommentForm({
  onSubmit,
  loading,
  placeholder = 'Add a comment…',
  submitLabel = 'Post',
}: {
  onSubmit: (body: string) => Promise<void>
  loading: boolean
  placeholder?: string
  submitLabel?: string
}) {
  const { address, connecting, connect } = useWalletAddress()
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!address) {
    return (
      <Button size="sm" variant="outline" onClick={() => connect()} disabled={connecting}>
        {connecting ? 'Connecting...' : 'Connect wallet to comment'}
      </Button>
    )
  }

  async function handleSubmit() {
    if (!body.trim()) return
    setError(null)
    try {
      await onSubmit(body)
      setBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        className="min-h-[72px] text-sm"
        disabled={loading}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button size="sm" className="self-end" disabled={loading || !body.trim()} onClick={handleSubmit}>
        {loading ? 'Posting…' : submitLabel}
      </Button>
    </div>
  )
}
