'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useP2PArticles, type ArticleFilters } from '@/hooks/use-p2p-articles'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { coverImageUrl } from '@/lib/p2p/articles'
import { ModerationBadge } from '@/components/ModerationBadge'
import { fallbackGradient } from '@/lib/utils'

export default function ArticlesPageClient() {
  const router = useRouter()
  const { address, connecting, connect } = useWalletAddress()
  const { articles, loading, error, filterArticles, deleteArticle, moderationStatus } = useP2PArticles({
    authorAddr: address ?? undefined,
  })
  const [filters, setFilters] = useState<ArticleFilters>({})

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Connect your wallet to manage your articles.</p>
        <Button onClick={() => connect()} disabled={connecting}>
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  async function handleDelete(slug: string) {
    if (!confirm('Are you sure you want to delete this article?')) return
    await deleteArticle(slug)
  }

  const visibleArticles = filterArticles(filters)

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

      <Input
        type="search"
        placeholder="Search articles..."
        value={filters.search ?? ''}
        onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trust</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleArticles.map((article) => {
              const cover = coverImageUrl(article.coverImageCid)
              return (
              <TableRow key={article.slug}>
                <TableCell>
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                    {cover ? (
                      <Image src={cover} alt="" fill sizes="40px" className="object-cover" />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient(article.cid)}`} />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{article.title}</TableCell>
                <TableCell>{article.category}</TableCell>
                <TableCell>
                  <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                    {article.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ModerationBadge action={moderationStatus.get(article.cid)} className="!bg-transparent !px-0 !text-foreground" />
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
                      onClick={() => router.push(`/articles/${article.cid}`)}
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
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
