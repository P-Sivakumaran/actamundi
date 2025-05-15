'use client'

import { useState } from 'react'
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
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createArticleSchema, CreateArticleFormValues } from '@/schemas/article-schema'
import { safeApiCall, handleApiError, AppError } from '@/lib/error-utils'

export default function NewArticlePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  // Initialize useForm with Zod schema
  const form = useForm<CreateArticleFormValues>({
    resolver: zodResolver(createArticleSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      category: '',
      status: 'draft',
      // Don't set coverImage here since it's handled separately
    }
  })

  // Destructure form methods/properties
  const { control, handleSubmit, register, formState: { errors } } = form

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

  async function onSubmit(values: CreateArticleFormValues) {
    setSaving(true)
    setError(null)

    // Handle image upload first if needed
    let coverImageUrl = values.coverImage || ''
    if (imageFile) {
      try {
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

        if (!uploadResponse.ok) {
          throw new AppError('Failed to upload image', 'api_error', uploadResponse.status)
        }
        
        const uploadData = await uploadResponse.json()
        coverImageUrl = uploadData.secure_url
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload image')
        setSaving(false)
        return
      }
    }

    // Use safeApiCall for the article creation
    const { data, error } = await safeApiCall(
      async () => {
        const response = await fetch('/api/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...values,
            coverImage: coverImageUrl,
          }),
        })

        if (!response.ok) {
          throw await handleApiError(response)
        }
        
        return response.json()
      },
      {
        successMessage: 'Article created successfully',
        onSuccess: (data) => {
          router.push(`/admin/articles/${data.slug}/edit`)
          router.refresh()
        },
        onError: (error) => {
          setError(error.message)
        }
      }
    )

    setSaving(false)
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">New Article</h1>
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register('title')}
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                {...register('excerpt')}
                aria-invalid={!!errors.excerpt}
              />
              {errors.excerpt && (
                <p className="text-sm text-destructive mt-1">{errors.excerpt.message}</p>
              )}
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
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    content={field.value}
                    onChange={field.onChange}
                    placeholder="Write your article content here..."
                  />
                )}
              />
              {errors.content && (
                <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                {...register('category')}
                aria-invalid={!!errors.category}
              />
              {errors.category && (
                <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-sm text-destructive mt-1">{errors.status.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Creating...' : 'Create Article'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 