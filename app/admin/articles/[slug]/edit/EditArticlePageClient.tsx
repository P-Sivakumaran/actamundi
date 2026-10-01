'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useP2PArticles } from '@/hooks/use-p2p-articles'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { publishBlob, coverImageUrl } from '@/lib/p2p/articles'
import { ArticleForm, type ArticleFormSubmitValues } from '@/components/admin/ArticleForm'
import type { P2PArticle, P2PArticleInput } from '@/models/P2PArticle'

function estimateReadingTime(html: string): number {
  const wordCount = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(wordCount / 200))
}

export default function EditArticlePageClient({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { address, connecting, connect } = useWalletAddress()
  const { articles, loading, publishArticle } = useP2PArticles({ authorAddr: address ?? undefined })

  const [original, setOriginal] = useState<P2PArticle | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const found = articles.find((a) => a.slug === params.slug) ?? null
    if (found) setOriginal(found)
  }, [articles, params.slug])

  async function handleSubmit(values: ArticleFormSubmitValues) {
    if (!original) return

    setSaving(true)
    setError(null)

    try {
      let coverImageCid = original.coverImageCid
      if (values.imageFile) {
        const bytes = new Uint8Array(await values.imageFile.arrayBuffer())
        coverImageCid = await publishBlob(bytes)
      }

      const input: P2PArticleInput = {
        slug: original.slug,
        title: values.title,
        content: values.content,
        excerpt: values.excerpt || undefined,
        coverImageCid,
        category: values.category || undefined,
        status: values.status,
        createdAt: original.createdAt,
        publishedAt: values.status === 'published' ? (original.publishedAt ?? new Date().toISOString()) : undefined,
        readingTime: estimateReadingTime(values.content),
        prevCid: original.cid,
      }

      await publishArticle(input)

      toast({ title: 'Success', description: 'Article updated successfully' })
      router.push('/admin/articles')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update article'
      setError(message)
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Connect your wallet to edit articles.</p>
        <Button onClick={() => connect()} disabled={connecting}>
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </div>
    )
  }

  if (loading || !original) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <ArticleForm
      heading="Edit Article"
      authorAddr={address}
      initialValues={{
        title: original.title,
        excerpt: original.excerpt ?? '',
        category: original.category ?? '',
        content: original.content,
        status: original.status,
      }}
      initialImagePreview={coverImageUrl(original.coverImageCid) ?? null}
      submitLabel="Save Changes"
      savingLabel="Saving..."
      saving={saving}
      error={error}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/admin/articles')}
    />
  )
}
