import Link from 'next/link'
import { truncateAddress } from '@/lib/utils'

export function FollowingList({ addresses }: { addresses: string[] }) {
  if (addresses.length === 0) {
    return <p className="text-sm text-muted-foreground">Not following anyone yet.</p>
  }

  return (
    <ul className="flex flex-col gap-2">
      {addresses.map((address) => (
        <li key={address} className="rounded-lg border bg-muted/30 px-4 py-2.5">
          <Link href={`/profile/${address}`} className="font-mono text-sm text-primary hover:underline">
            {truncateAddress(address)}
          </Link>
        </li>
      ))}
    </ul>
  )
}
