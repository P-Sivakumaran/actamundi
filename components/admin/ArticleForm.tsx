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
import { PenLine } from 'lucide-react'
import Image from 'next/image'
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
  error: string | null
  onSubmit: (values: ArticleFormSubmitValues) => void
  onCancel: () => void
}

/** Shared by the new-article and edit-article admin pages — same fields,
 * same live preview, different initial values and submit behavior. */
export function ArticleForm({
  heading, initialValues, initialImagePreview, authorAddr,
  submitLabel, savingLabel, saving, error, onSubmit, onCancel,
}: ArticleFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [excerpt, setExcerpt] = useState(initialValues?.excerpt ?? '')
  const [category, setCategory] = useState(initialValues?.category ?? '')
  const [content, setContent] = useState(initialValues?.content ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(initialValues?.status ?? 'draft')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialImagePreview ?? null)

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
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
              Live preview — what readers will see
            </p>
            <div className="h-[560px] w-full overflow-hidden rounded-2xl border bg-black">
              <ArticleFeedCard
                article={previewArticle}
                coverImageUrl={imagePreview ?? undefined}
                moderation={undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
