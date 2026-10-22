import Image from 'next/image'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { coverImageUrl } from '@/lib/p2p/articles'
import { truncateAddress, fallbackGradient } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FollowButton } from '@/components/FollowButton'
import { FollowerCount } from '@/components/FollowerCount'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import type { P2PProfile } from '@/models/P2PProfile'
import type { ProfileStats } from '@/hooks/use-stats'

/** Presentational — ProfilePageClient owns the data fetching (useProfile,
 * useProfileStats) and passes it down, same separation ArticleFeedCard
 * already demonstrates for article data. */
export function ProfileCard({
  walletAddr,
  profile,
  stats,
  isOwnProfile = false,
}: {
  walletAddr: string
  profile: P2PProfile | null
  stats: ProfileStats | null
  /** FollowButton already hides itself for your own wallet — this fills
   * that same slot with something useful instead of leaving it empty. */
  isOwnProfile?: boolean
}) {
  const avatar = coverImageUrl(profile?.avatarCid)

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6 sm:flex-row sm:items-start">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full">
        {avatar ? (
          <Image src={avatar} alt="" fill sizes="80px" className="object-cover" />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient(walletAddr)}`} />
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">
                {profile?.displayName || truncateAddress(walletAddr)}
              </h1>
              <VerifiedBadge address={walletAddr} />
            </div>
            <p className="font-mono text-xs text-muted-foreground">{truncateAddress(walletAddr)}</p>
          </div>
          {isOwnProfile ? (
            <Button size="sm" variant="outline" asChild>
              <Link href="/profile/edit">
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit profile
              </Link>
            </Button>
          ) : (
            <FollowButton writerAddr={walletAddr} />
          )}
        </div>

        {profile?.bio && <p className="text-sm text-foreground">{profile.bio}</p>}

        <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-muted-foreground">
          <span>{stats?.articleCount ?? 0} articles</span>
          <FollowerCount count={stats?.followerCount ?? 0} />
          <span>{stats?.followingCount ?? 0} following</span>
        </div>
      </div>
    </div>
  )
}
