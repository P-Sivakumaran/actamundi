// ActaMundi mark: a book opened all the way round becomes a globe.
// Pure builder, shared by <GlobeMark> and any future 3D export. Units: meters, y-up.
import type * as ThreeNS from 'three'
type THREE = typeof ThreeNS

export interface GlobeData { pivots: ThreeNS.Group[]; ring: ThreeNS.Mesh; pages: number }

export function buildGlobe(THREE: THREE, { pages = 28, r = 0.12, stand = false } = {}) {
  const M = (name: string, color: number, roughness: number, metalness = 0) =>
    new THREE.MeshStandardMaterial({ name, color, roughness, metalness })
  const mats = {
    paper: M('paper', 0xf6f1ea, 0.88),
    newsprint: M('newsprint', 0xe7dfd3, 0.9),
    cover: M('cover_teal', 0x1d6363, 0.55),
    coral: M('signature_coral', 0xe26136, 0.4, 0.2),
    ink: M('ink', 0x1a2a30, 0.45, 0.3),
  }
  const root = new THREE.Group(); root.name = 'actamundi_globe'
  const cy = stand ? r + 0.07 : 0
  const sphere = new THREE.Group(); sphere.name = 'pages'; sphere.position.y = cy; root.add(sphere)

  const pageGeo = (rad: number, depth: number) => {
    const s = new THREE.Shape()
    s.moveTo(0, -rad); s.absarc(0, 0, rad, -Math.PI / 2, Math.PI / 2, false); s.lineTo(0, -rad)
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 64 })
    g.translate(0.0012, 0, -depth / 2)
    return g
  }
  const leafGeo = pageGeo(r, 0.0006)
  const coverGeo = pageGeo(r * 1.015, 0.0016)
  const pivots: ThreeNS.Group[] = []
  for (let i = 0; i < pages; i++) {
    const cover = i === 0 || i === pages - 1
    const pivot = new THREE.Group(); pivot.name = `page_${String(i).padStart(2, '0')}_pivot`
    const mesh = new THREE.Mesh(cover ? coverGeo : leafGeo, cover ? mats.cover : i % 2 ? mats.paper : mats.newsprint)
    mesh.name = cover ? (i === 0 ? 'cover_front' : 'cover_back') : `page_${String(i).padStart(2, '0')}`
    pivot.add(mesh); sphere.add(pivot); pivots.push(pivot)
  }
  const spineLen = stand ? cy + r : 2 * r + 0.016
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.0032, 0.0032, spineLen, 24), mats.ink)
  spine.name = 'spine'; spine.position.y = stand ? (0.024 + cy + r) / 2 - cy : 0; sphere.add(spine)
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 32, 16), mats.coral)
  finial.name = 'finial'; finial.position.y = r + (stand ? 0.014 : 0.01); sphere.add(finial)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.0035, 0.0011, 12, 160), mats.coral)
  ring.name = 'signature_equator'; ring.rotation.x = Math.PI / 2; sphere.add(ring)

  root.userData = { pivots, ring, pages } satisfies GlobeData
  setOpen(root, 1)
  return root
}

/** t = 0 closed book → 1 full globe (equator ring grows in over the last 18%). */
export function setOpen(root: ThreeNS.Object3D, t: number) {
  const { pivots, ring, pages } = root.userData as GlobeData
  pivots.forEach((p, i) => {
    const closed = (i / (pages - 1)) * 0.07
    const open = (i / pages) * Math.PI * 2
    p.rotation.y = closed + (open - closed) * t
  })
  const k = Math.min(1, Math.max(0, (t - 0.82) / 0.18))
  ring.scale.setScalar(Math.max(0.001, k * k * (3 - 2 * k)))
  ring.visible = k > 0.001
}
