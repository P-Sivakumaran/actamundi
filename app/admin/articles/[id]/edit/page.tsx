'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Article } from '@/models/Article'
import RichTextEditor from '@/components/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

export default function EditArticlePage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [article, setArticle] = useState<Partial<Article>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    fetchArticle()
  }, [params.slug])

  async function fetchArticle() {
    try {
      const response = await fetch(`/api/articles/${params.slug}`)
      if (!response.ok) throw new Error('Failed to fetch article')
      const data = await response.json()
      setArticle(data)
      if (data.coverImage) {
        setImagePreview(data.coverImage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: 'Failed to fetch article',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      let coverImageUrl = article.coverImage

      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '')

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        )

        if (!uploadResponse.ok) throw new Error('Failed to upload image')
        const uploadData = await uploadResponse.json()
        coverImageUrl = uploadData.secure_url
      }

      const response = await fetch(`/api/articles/${params.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...article,
          coverImage: coverImageUrl,
        }),
      })

      if (!response.ok) throw new Error('Failed to update article')
      
      toast({
        title: 'Success',
        description: 'Article updated successfully',
      })
      
      router.push('/admin/articles')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: 'Failed to update article',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
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
              <Input
                id="title"
                value={article.title || ''}
                onChange={(e) => setArticle({ ...article, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={article.excerpt || ''}
                onChange={(e) => setArticle({ ...article, excerpt: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image</Label>
              <div className="flex items-center space-x-4">
                {imagePreview && (
                  <div className="relative w-32 h-32">
                    <Image
                      src={imagePreview}
                      alt="Cover preview"
                      fill
                      className="object-cover rounded-md"
                    />
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
                content={article.content || ''}
                onChange={(content) => setArticle({ ...article, content })}
                placeholder="Write your article content here..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={article.category || ''}
                onChange={(e) => setArticle({ ...article, category: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={article.status || 'draft'}
                onValueChange={(value) => setArticle({ ...article, status: value as Article['status'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
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