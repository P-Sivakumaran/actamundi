'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Article } from '@/models/Article'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import ArticleSearch, { ArticleFilters } from '@/components/ArticleSearch'

export default function ArticlesPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchArticles()
  }, [])

  async function fetchArticles(filters?: ArticleFilters) {
    try {
      const queryParams = new URLSearchParams()
      if (filters) {
        if (filters.search) queryParams.append('search', filters.search)
        if (filters.category) queryParams.append('category', filters.category)
        if (filters.status) queryParams.append('status', filters.status)
        if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom.toISOString())
        if (filters.dateTo) queryParams.append('dateTo', filters.dateTo.toISOString())
      }

      const response = await fetch(`/api/articles?${queryParams.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch articles')
      const data = await response.json()
      setArticles(data.articles)
      setCategories(data.categories)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm('Are you sure you want to delete this article?')) return

    try {
      const response = await fetch(`/api/articles/${slug}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete article')
      
      setArticles(articles.filter(article => article.slug !== slug))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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
        <h1 className="text-2xl font-semibold">Articles</h1>
        <Button onClick={() => router.push('/admin/articles/new')}>
          New Article
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <ArticleSearch onSearch={fetchArticles} categories={categories} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.slug}>
                <TableCell className="font-medium">{article.title}</TableCell>
                <TableCell>{article.category}</TableCell>
                <TableCell>
                  <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                    {article.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {article.publishedAt
                    ? format(new Date(article.publishedAt), 'PPP')
                    : 'Not published'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/articles/${article.slug}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/articles/${article.slug}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(article.slug)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 