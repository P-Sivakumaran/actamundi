/**
 * Singleton libp2p node + content-addressed blockstore, standing in for a
 * full Helia instance.
 *
 * Deliberately NOT built on Helia's `createHelia()`/`@helia/libp2p`: that
 * convenience layer unconditionally constructs (and immediately discards) a
 * full desktop/server-oriented default libp2p config — `tcp()`, `mdns()`,
 * `@libp2p/http`, `@ipshipyard/libp2p-auto-tls`, `kadDHT()` — to merge with
 * whatever config is passed in. None of that is used here, but webpack
 * still has to parse and bundle it, and several of those transitive deps
 * (undici's modern private-field syntax, Node's `net`/`dgram` for
 * tcp/mdns) don't survive being bundled for the browser at all.
 *
 * What's actually needed — by our own lib/p2p/articles.ts and by
 * @orbitdb/core (see its storage/ipfs-block.js and sync.js) — is just:
 * `libp2p`, and a blockstore with `put`/`get`/`pins`. Building that
 * directly sidesteps the whole broken import graph.
 *
 * NEXT_PUBLIC_P2P_RELAY_ADDRS: comma-separated multiaddrs of the bootstrap/relay
 * node(s) — this is the one piece of infra ActaMundi still has to run itself.
 * The relay only does signaling + circuit-relay for NAT traversal; it never
 * holds article content.
 */
import { createLibp2p, type Libp2p } from 'libp2p'
import { webRTC } from '@libp2p/webrtc'
import { webSockets } from '@libp2p/websockets'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { identify } from '@libp2p/identify'
import { bootstrap } from '@libp2p/bootstrap'
import { IDBBlockstore } from 'blockstore-idb'
import type { CID } from 'multiformats/cid'

/** The minimal subset of Helia's API our own code and @orbitdb/core need. */
export interface P2PNode {
  libp2p: Libp2p
  blockstore: IDBBlockstore
  pins: {
    isPinned(cid: CID): Promise<boolean>
    add(cid: CID): AsyncIterable<CID>
  }
  stop(): Promise<void>
}

let p2pNode: P2PNode | null = null
let initPromise: Promise<P2PNode> | null = null

function relayAddrs(): string[] {
  return (process.env.NEXT_PUBLIC_P2P_RELAY_ADDRS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function getP2PNode(): Promise<P2PNode> {
  if (p2pNode) return Promise.resolve(p2pNode)
  if (initPromise) return initPromise

  initPromise = (async () => {
    const addrs = relayAddrs()

    // Without this, blocks live only in memory: a page reload loses every
    // article and image this tab published, and with no other peer holding
    // a copy the links become unavailable for good. IndexedDB is
    // browser-only — this module must never run on the server (all current
    // callers are 'use client' components).
    const blockstore = new IDBBlockstore('actamundi-p2p-blocks')
    await blockstore.open()

    const libp2p = await createLibp2p({
      addresses: { listen: ['/webrtc'] },
      // webSockets is what lets this node actually dial the relay printed
      // by scripts/p2p-relay.mjs (a ws multiaddr); webRTC/circuit-relay
      // alone can't reach it.
      transports: [webSockets(), webRTC(), circuitRelayTransport()],
      connectionEncrypters: [noise()],
      streamMuxers: [yamux()],
      peerDiscovery: addrs.length ? [bootstrap({ list: addrs })] : [],
      // Cast: @chainsafe/libp2p-gossipsub's bundled @libp2p/interface types
      // lag behind this project's pinned libp2p/@libp2p/interface version,
      // so its Components type doesn't structurally match at the type
      // level even though the runtime shapes agree (verified in
      // scripts/p2p-relay.mjs, which runs this exact services config).
      services: {
        identify: identify(),
        pubsub: gossipsub({ allowPublishToZeroTopicPeers: true }),
      } as any,
    })

    // No GC in this minimal node, so pin tracking has nothing to protect
    // against — @orbitdb/core's ipfs-block.js only needs these to exist.
    const node: P2PNode = {
      libp2p,
      blockstore,
      pins: {
        isPinned: async () => false,
        add: async function* add(cid: CID) {
          yield cid
        },
      },
      stop: async () => {
        await libp2p.stop()
        await blockstore.close()
      },
    }

    p2pNode = node
    return node
  })()

  return initPromise
}

export async function stopP2PNode(): Promise<void> {
  if (!p2pNode) return
  await p2pNode.stop()
  p2pNode = null
  initPromise = null
}
