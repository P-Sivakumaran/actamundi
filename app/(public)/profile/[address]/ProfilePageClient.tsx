'use client'

import { useProfile } from '@/hooks/use-profile'
import { useProfileStats } from '@/hooks/use-stats'
import { useP2PArticles } from '@/hooks/use-p2p-articles'
import { useAuthorDiscussion } from '@/hooks/use-author-discussion'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { ProfileCard } from '@/components/ProfileCard'
import { ArticleFeedCard } from '@/components/ArticleFeedCard'
import { AuthorDiscussion } from '@/components/AuthorDiscussion'
import { FollowingList } from '@/components/FollowingList'
import { EmptyState } from '@/components/motion/EmptyState'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { coverImageUrl } from '@/lib/p2p/articles'

export default function ProfilePageClient({ params }: { params: { address: string } }) {
  const walletAddr = params.address
  const { address: viewerAddr } = useWalletAddress()
  const isOwnProfile = !!viewerAddr && viewerAddr.toLowerCase() === walletAddr.toLowerCase()

  const { profile, loading: profileLoading, error: profileError } = useProfile(walletAddr)
  const { stats } = useProfileStats(walletAddr)
  const { loading: articlesLoading, filterArticles, moderationStatus } = useP2PArticles({ authorAddr: walletAddr })

  // Drafts are only ever meaningful to the wallet that owns them — a
  // visitor viewing someone else's profile should see exactly what the
  // public feed would show them.
  const publishedArticles = filterArticles({ status: 'published' })
  const articles = isOwnProfile ? filterArticles({}) : publishedArticles

  // Discussion is comments made ON this writer's published work, not
  // comments this wallet wrote — see use-author-discussion.ts for why.
  // Scoped to published articles regardless of viewer; a draft has no
  // public comment thread worth surfacing here.
  const { entries, loading: discussionLoading, error: discussionError } = useAuthorDiscussion(publishedArticles)

  if (profileLoading && articlesLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <ProfileCard walletAddr={walletAddr} profile={profile} stats={stats} isOwnProfile={isOwnProfile} />
      {profileError && <p className="text-sm text-destructive">{profileError}</p>}

      <Tabs defaultValue="articles">
        <TabsList>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="mt-4">
          {articles.length === 0 ? (
            <EmptyState
              title={isOwnProfile ? 'No articles yet' : 'No published articles yet'}
              description={isOwnProfile ? 'Publish your first article to see it here.' : 'Nothing from this writer yet.'}
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {articles.map((article) => (
                <div key={article.cid} className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                  {isOwnProfile && article.status === 'draft' && (
                    <span className="absolute left-3 top-3 z-20 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                      Draft
                    </span>
                  )}
                  <ArticleFeedCard
                    article={article}
                    coverImageUrl={coverImageUrl(article.coverImageCid)}
                    moderation={moderationStatus.get(article.cid)}
                    linkToArticle={article.status === 'published'}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discussion" className="mt-4">
          <AuthorDiscussion entries={entries} loading={discussionLoading} error={discussionError} />
        </TabsContent>

        <TabsContent value="following" className="mt-4">
          <FollowingList addresses={stats?.following ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
