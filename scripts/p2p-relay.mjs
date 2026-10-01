/**
 * Standalone bootstrap/circuit-relay node for the browser p2p article
 * network in lib/p2p/. Browser peers can't dial each other directly (no
 * public IP, WebRTC needs signaling) — this node is the one piece of infra
 * ActaMundi still runs itself, and it never touches article content: it
 * only relays connection handshakes and gossipsub messages.
 *
 * Plain ESM (not .ts) on purpose: tsx's tsconfig path-alias resolver walks
 * CJS-style resolution over every transitive import, which breaks on
 * exports-map-only packages deep in the libp2p tree (protons-runtime etc).
 * Bare `node` ESM import of the same packages works fine.
 *
 * Run: node scripts/p2p-relay.mjs
 * Then put the printed multiaddr(s) into NEXT_PUBLIC_P2P_RELAY_ADDRS
 * (comma-separated if running more than one relay).
 */
import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import { circuitRelayServer } from '@libp2p/circuit-relay-v2'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { identify } from '@libp2p/identify'

const PORT = Number(process.env.P2P_RELAY_PORT ?? 9090)

async function main() {
  const node = await createLibp2p({
    addresses: { listen: [`/ip4/0.0.0.0/tcp/${PORT}/ws`] },
    transports: [webSockets()],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()],
    services: {
      identify: identify(),
      pubsub: gossipsub({ allowPublishToZeroTopicPeers: true }),
      relay: circuitRelayServer({ reservations: { maxReservations: 1024 } }),
    },
  })

  const addrs = node.getMultiaddrs().map((a) => a.toString())
  console.log('P2P relay node started. Set NEXT_PUBLIC_P2P_RELAY_ADDRS to:')
  console.log(addrs.join(','))

  const shutdown = async () => {
    await node.stop()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((err) => {
  console.error('Failed to start p2p relay node:', err)
  process.exit(1)
})
