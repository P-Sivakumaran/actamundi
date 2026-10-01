'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import RichTextEditor from '@/components/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { useP2PArticles } from '@/hooks/use-p2p-articles'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { publishBlob, coverImageUrl } from '@/lib/p2p/articles'
import type { P2PArticle, P2PArticleInput } from '@/models/P2PArticle'

export default function EditArticlePageClient({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { address, connecting, connect } = useWalletAddress()
  const { articles, loading, publishArticle } = useP2PArticles({ authorAddr: address ?? undefined })

  const [original, setOriginal] = useState<P2PArticle | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const found = articles.find((a) => a.slug === params.slug) ?? null
    if (!found) return
    setOriginal(found)
    setTitle(found.title)
    setContent(found.content)
    setExcerpt(found.excerpt ?? '')
    setCategory(found.category ?? '')
    setStatus(found.status)
    setImagePreview(coverImageUrl(found.coverImageCid) ?? null)
  }, [articles, params.slug])

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!original) return

    setSaving(true)
    setError(null)

    try {
      let coverImageCid = original.coverImageCid
      if (imageFile) {
        const bytes = new Uint8Array(await imageFile.arrayBuffer())
        coverImageCid = await publishBlob(bytes)
      }

      const wordCount = content.trim().split(/\s+/).filter(Boolean).length
      const input: P2PArticleInput = {
        slug: original.slug,
        title,
        content,
        excerpt: excerpt || undefined,
        coverImageCid,
        category: category || undefined,
        status,
        createdAt: original.createdAt,
        publishedAt: status === 'published' ? (original.publishedAt ?? new Date().toISOString()) : undefined,
        readingTime: Math.max(1, Math.round(wordCount / 200)),
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
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Edit Article</h1>
        <Button variant="outline" onClick={() => router.push('/admin/articles')}>
          Cancel
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Article Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image</Label>
              <div className="flex items-center space-x-4">
                {imagePreview && (
                  <div className="relative w-32 h-32">
                    <Image src={imagePreview} alt="Cover preview" fill className="object-cover rounded-md" />
                  </div>
                )}
                <Input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Write your article content here..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as 'draft' | 'published')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
