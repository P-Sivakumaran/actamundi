'use client'

import { useState } from 'react'
import RichTextEditor from '@/components/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArticleFeedCard } from '@/components/ArticleFeedCard'
import { LedgerDrop, type PublishState } from '@/components/motion/LedgerDrop'
import { PenLine, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { P2PArticle } from '@/models/P2PArticle'

export interface ArticleFormValues {
  title: string
  excerpt: string
  category: string
  content: string
  status: 'draft' | 'published'
}

export interface ArticleFormSubmitValues extends ArticleFormValues {
  imageFile: File | null
}

interface ArticleFormProps {
  heading: string
  initialValues?: Partial<ArticleFormValues>
  initialImagePreview?: string | null
  authorAddr: string
  submitLabel: string
  savingLabel: string
  saving: boolean
  /** Drives the ledger-drop motion in the preview pane; omit for forms with no publish animation. */
  publishState?: PublishState
  error: string | null
  onSubmit: (values: ArticleFormSubmitValues) => void
  onCancel: () => void
}

const SAFE_DATA_IMAGE_RE = /^data:image\/(?:png|jpeg|jpg|webp|gif|avif);base64,[A-Za-z0-9+/=]+$/

/** Shared by the new-article and edit-article admin pages — same fields,
 * same live preview, different initial values and submit behavior. */
export function ArticleForm({
  heading, initialValues, initialImagePreview, authorAddr,
  submitLabel, savingLabel, saving, publishState = 'idle', error, onSubmit, onCancel,
}: ArticleFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [excerpt, setExcerpt] = useState(initialValues?.excerpt ?? '')
  const [category, setCategory] = useState(initialValues?.category ?? '')
  const [content, setContent] = useState(initialValues?.content ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(initialValues?.status ?? 'draft')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialImagePreview ?? null)
  const [suggesting, setSuggesting] = useState(false)
  const [suggestError, setSuggestError] = useState<string | null>(null)
  const [aiLikelihood, setAiLikelihood] = useState<{
    score: number
    confidence: number
    legend: Record<string, string>
  } | null>(null)

  async function handleSuggestCategory() {
    if (!title.trim()) {
      setSuggestError('Add a title first')
      return
    }
    setSuggesting(true)
    setSuggestError(null)
    try {
      const res = await fetch('/api/articles/suggest-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, excerpt, content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Suggestion failed')
      setCategory(data.category) // advisory only — still a plain, editable Input below
      setAiLikelihood(data.aiLikelihood ?? null)
    } catch (err) {
      setSuggestError(err instanceof Error ? err.message : 'Suggestion failed')
    } finally {
      setSuggesting(false)
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      if (SAFE_DATA_IMAGE_RE.test(result)) {
        setImagePreview(result)
      }
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSubmit({ title, excerpt, category, content, status, imageFile })
  }

  const wordCount = content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length
  const previewArticle: P2PArticle = {
    cid: 'preview', slug: 'preview', title: title || 'Untitled', content,
    excerpt: excerpt || undefined, category: category || undefined,
    status, authorAddr, signature: 'preview',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    readingTime: Math.max(1, Math.round(wordCount / 200)),
  }

  return (
    <div className="container mx-auto py-8">
      <nav className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
        <span>/</span>
        <Link href="/admin/articles" className="hover:text-foreground transition-colors">Articles</Link>
        <span>/</span>
        <span className="text-foreground">{heading}</span>
      </nav>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{heading}</h1>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-destructive/15 px-4 py-3 text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
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
                    <div className="relative h-32 w-32 overflow-hidden rounded-md">
                      <Image src={imagePreview} alt="Cover preview" fill className="object-cover" />
                    </div>
                  )}
                  <Input
                    id="coverImage"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
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
                <div className="flex gap-2">
                  <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="flex-1" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={suggesting}
                    onClick={handleSuggestCategory}
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    {suggesting ? 'Thinking…' : 'Suggest'}
                  </Button>
                </div>
                {suggestError && <p className="text-xs text-destructive">{suggestError}</p>}
                {aiLikelihood && (
                  <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
                    <span className="font-medium">AI-likelihood check (advisory only):</span>{' '}
                    {aiLikelihood.legend[String(Math.round(aiLikelihood.score))]}
                    <span className="text-amber-700/80 dark:text-amber-400/80">
                      {' '}({aiLikelihood.score.toFixed(1)}/4, confidence {Math.round(aiLikelihood.confidence * 100)}%)
                    </span>
                    <p className="mt-1 text-amber-700/80 dark:text-amber-400/80">
                      Not reliable enough to act on alone — a self-check for you, not a gate on publishing.
                    </p>
                  </div>
                )}
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

              <div className="flex items-center justify-between border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  {status === 'published'
                    ? "You'll be asked to sign this with your wallet — that signature is what readers verify."
                    : 'Drafts are signed and stored too, just not shown in the public feed.'}
                </p>
                <Button type="submit" disabled={saving}>
                  {saving ? savingLabel : submitLabel}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="hidden lg:block">
          <div className="sticky top-6 space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <PenLine className="h-3.5 w-3.5" />
              {publishState === 'idle' ? 'Preview' : 'Publishing'}
            </p>
            {publishState === 'idle' ? (
              // aspect-[9/16]: this is a preview of a phone screen, so a
              // portrait phone aspect ratio — not an arbitrary 560px that
              // happened to look OK at this sidebar's current 320px width
              // and would look wrong at any other width.
              <div className="aspect-[9/16] w-full overflow-hidden rounded-2xl border bg-black">
                <ArticleFeedCard
                  article={previewArticle}
                  coverImageUrl={imagePreview ?? undefined}
                  moderation={undefined}
                  linkToArticle={false}
                />
              </div>
            ) : (
              <div className="flex aspect-[9/16] w-full items-center justify-center overflow-hidden rounded-2xl border">
                <LedgerDrop state={publishState} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
