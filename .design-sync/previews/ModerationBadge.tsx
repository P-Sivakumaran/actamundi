import { ModerationBadge } from '@/components/ModerationBadge'
import type { ModerationAction } from '@/lib/p2p/moderation'

const BOARD = '0x4B921a8b9c3f4e5d6a7b8c9d0e1f2a3b4c5d6e7f'

function dark(children: React.ReactNode) {
  return (
    <div style={{ background: '#13201f', padding: 16, borderRadius: 8, display: 'inline-flex' }}>
      {children}
    </div>
  )
}

export function AllStates() {
  const endorsed: ModerationAction = { cid: 'bafy1', action: 'endorse', boardAddr: BOARD, signature: 'demo', timestamp: '2026-10-03T15:00:00Z' }
  const flagged: ModerationAction = { cid: 'bafy2', action: 'flag', boardAddr: BOARD, signature: 'demo', timestamp: '2026-10-03T10:00:00Z' }
  const delisted: ModerationAction = { cid: 'bafy3', action: 'delist', boardAddr: BOARD, signature: 'demo', timestamp: '2026-10-02T09:00:00Z' }
  return dark(
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
      <ModerationBadge action={endorsed} />
      <ModerationBadge action={flagged} />
      <ModerationBadge action={delisted} />
      <ModerationBadge action={undefined} />
    </div>
  )
}
