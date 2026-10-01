'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import slugify from 'slugify'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useP2PArticles } from '@/hooks/use-p2p-articles'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { publishBlob } from '@/lib/p2p/articles'
import { ArticleForm, type ArticleFormSubmitValues } from '@/components/admin/ArticleForm'
import type { P2PArticleInput } from '@/models/P2PArticle'

function estimateReadingTime(html: string): number {
  const wordCount = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(wordCount / 200))
}

export default function NewArticlePageClient() {
  const router = useRouter()
  const { toast } = useToast()
  const { address, connecting, connect } = useWalletAddress()
  const { publishArticle } = useP2PArticles()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(values: ArticleFormSubmitValues) {
    if (!values.title.trim() || !values.content.trim()) {
      setError('Title and content are required')
      return
    }

    setSaving(true)
    setError(null)

    try {
      let coverImageCid: string | undefined
      if (values.imageFile) {
        const bytes = new Uint8Array(await values.imageFile.arrayBuffer())
        coverImageCid = await publishBlob(bytes)
      }

      const now = new Date().toISOString()
      const input: P2PArticleInput = {
        slug: slugify(values.title, { lower: true, strict: true }),
        title: values.title,
        content: values.content,
        excerpt: values.excerpt || undefined,
        coverImageCid,
        category: values.category || undefined,
        status: values.status,
        createdAt: now,
        publishedAt: values.status === 'published' ? now : undefined,
        readingTime: estimateReadingTime(values.content),
      }

      const article = await publishArticle(input)

      toast({ title: 'Success', description: 'Article created successfully' })
      router.push(`/admin/articles/${article.slug}/edit`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create article'
      setError(message)
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Connect your wallet to publish articles.</p>
        <Button onClick={() => connect()} disabled={connecting}>
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </div>
    )
  }

  return (
    <ArticleForm
      heading="New Article"
      authorAddr={address}
      submitLabel="Create Article"
      savingLabel="Publishing..."
      saving={saving}
      error={error}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/admin/articles')}
    />
  )
}
