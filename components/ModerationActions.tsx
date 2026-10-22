'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { ShieldCheck, ShieldAlert, ShieldX, Sparkles } from 'lucide-react'
import { useModerationBoard } from '@/hooks/use-moderation-board'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface AiLikelihood {
  score: number
  confidence: number
  legend: Record<string, string>
}

/** Board-only moderation panel for one target (an article cid, or a
 * commentModerationTarget() composite string for an individual comment —
 * see moderation-policy.ts) — endorse/flag/delist, wired straight to
 * lib/p2p/moderation.ts's existing publish path. Renders nothing for
 * anyone who isn't a connected board-member wallet — no noise for
 * ordinary readers, and no "connect your wallet" prompt for a feature
 * most visitors can't use. */
export function ModerationActions({
  targetCid,
  article,
  className,
}: {
  targetCid: string
  /** When provided, enables the "Check AI-likelihood" button — only
   * meaningful for an article (comments have no article-length text to
   * run the check against), so the comment call site omits this. */
  article?: { title: string; excerpt?: string; content: string }
  className?: string
}) {
  const { isBoardMember, loading, error, endorse, flag, delist } = useModerationBoard(targetCid)
  const [reason, setReason] = useState('')
  const [aiChecking, setAiChecking] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiLikelihood, setAiLikelihood] = useState<AiLikelihood | null>(null)

  if (!isBoardMember) return null

  async function run(action: (reason?: string) => Promise<unknown>) {
    await action(reason.trim() || undefined)
    setReason('')
  }

  // Board members authenticate purely by wallet signature, same as every
  // other action here — they may not have (or want) the single shared
  // NextAuth admin login this app supports, so this signs a short-lived
  // challenge instead of relying on a session, verified server-side in
  // suggest-category/route.ts.
  async function checkAiLikelihood() {
    if (!article) return
    setAiChecking(true)
    setAiError(null)
    try {
      if (typeof window === 'undefined' || !window.ethereum) throw new Error('No wallet found')
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const timestamp = new Date().toISOString()
      const signature = await signer.signMessage(`actamundi.ai-check.v1:${targetCid}:${timestamp}`)
      const res = await fetch('/api/articles/suggest-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          boardAuth: { address, signature, timestamp, targetCid },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'AI-likelihood check failed')
      setAiLikelihood(data.aiLikelihood ?? null)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI-likelihood check failed')
    } finally {
      setAiChecking(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-3 rounded-lg border bg-muted/30 px-4 py-3', className)}>
      <p className="text-xs font-medium text-muted-foreground">Board actions — visible only to you</p>
      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (optional)"
        className="min-h-[60px] text-sm"
        disabled={loading}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={loading} onClick={() => run(endorse)}>
          <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
          Endorse
        </Button>
        <Button size="sm" variant="outline" disabled={loading} onClick={() => run(flag)}>
          <ShieldAlert className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
          Flag
        </Button>
        <Button size="sm" variant="outline" disabled={loading} onClick={() => run(delist)}>
          <ShieldX className="mr-1.5 h-3.5 w-3.5 text-destructive" />
          Delist
        </Button>
      </div>

      {article && (
        <div className="border-t pt-3">
          <Button size="sm" variant="outline" disabled={aiChecking} onClick={checkAiLikelihood}>
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            {aiChecking ? 'Checking…' : 'Check AI-likelihood'}
          </Button>
          {aiError && <p className="mt-2 text-xs text-destructive">{aiError}</p>}
          {aiLikelihood && (
            <div className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
              {aiLikelihood.legend[String(Math.round(aiLikelihood.score))]}
              <span className="text-amber-700/80 dark:text-amber-400/80">
                {' '}({aiLikelihood.score.toFixed(1)}/4, confidence {Math.round(aiLikelihood.confidence * 100)}%)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
