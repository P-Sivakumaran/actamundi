'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { format } from 'date-fns'
import { useP2PArticles, type ArticleFilters } from '@/hooks/use-p2p-articles'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { coverImageUrl } from '@/lib/p2p/articles'
import { ModerationBadge } from '@/components/ModerationBadge'
import { WalletCoin } from '@/components/motion/WalletCoin'
import { EmptyState } from '@/components/motion/EmptyState'
import { Spinner } from '@/components/ui/spinner'
import { fallbackGradient } from '@/lib/utils'
import type { P2PArticle } from '@/models/P2PArticle'

export default function ArticlesPageClient() {
  const router = useRouter()
  const { address, connecting, connect } = useWalletAddress()
  const { articles, loading, error, filterArticles, deleteArticle, moderationStatus } = useP2PArticles({
    authorAddr: address ?? undefined,
  })
  const [filters, setFilters] = useState<ArticleFilters>({})
  const [pendingDelete, setPendingDelete] = useState<P2PArticle | null>(null)

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <WalletCoin state={connecting ? 'connecting' : 'disconnected'} showLabel={false} />
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
        <Spinner />
      </div>
    )
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    await deleteArticle(pendingDelete.slug)
    setPendingDelete(null)
  }

  const visibleArticles = filterArticles(filters)

  return (
    <div className="container mx-auto py-8 space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
        <span>/</span>
        <span className="text-foreground">Articles</span>
      </nav>
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

      {visibleArticles.length === 0 ? (
        <EmptyState
          title={filters.search ? 'No articles match your search' : 'No articles yet'}
          description={filters.search ? 'Try a different search term.' : 'Create your first article to see it here.'}
          action={
            !filters.search && (
              <Button size="sm" onClick={() => router.push('/admin/articles/new')}>
                New Article
              </Button>
            )
          }
        />
      ) : (
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
                      onClick={() => setPendingDelete(article)}
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
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{pendingDelete?.title}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This publishes a tombstone version — the article disappears from feeds, but the
              signed history stays on the log for auditing. This can&apos;t be undone from here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
