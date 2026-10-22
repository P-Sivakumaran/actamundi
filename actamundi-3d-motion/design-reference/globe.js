// ActaMundi mark: a book opened all the way round becomes a globe.
export function buildGlobe(THREE, { pages = 28, r = 0.12, stand = true } = {}) {
  const M = (name, color, roughness, metalness = 0) =>
    new THREE.MeshStandardMaterial({ name, color, roughness, metalness });
  const mats = {
    paper: M('paper', 0xF6F1EA, 0.88),
    newsprint: M('newsprint', 0xE7DFD3, 0.9),
    cover: M('cover_teal', 0x1D6363, 0.55),
    coral: M('signature_coral', 0xE26136, 0.4, 0.2),
    ink: M('ink', 0x1A2A30, 0.45, 0.3),
  };
  const root = new THREE.Group(); root.name = 'actamundi_globe';
  const cy = stand ? r + 0.07 : 0;
  const sphere = new THREE.Group(); sphere.name = 'pages'; sphere.position.y = cy; root.add(sphere);

  const pageGeo = (rad, depth) => {
    const s = new THREE.Shape();
    s.moveTo(0, -rad); s.absarc(0, 0, rad, -Math.PI / 2, Math.PI / 2, false); s.lineTo(0, -rad);
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 64 });
    g.translate(0.0012, 0, -depth / 2);
    return g;
  };
  const leafGeo = pageGeo(r, 0.0006);
  const coverGeo = pageGeo(r * 1.015, 0.0016);
  const pivots = [];
  for (let i = 0; i < pages; i++) {
    const cover = i === 0 || i === pages - 1;
    const pivot = new THREE.Group(); pivot.name = `page_${String(i).padStart(2, '0')}_pivot`;
    const mesh = new THREE.Mesh(cover ? coverGeo : leafGeo, cover ? mats.cover : (i % 2 ? mats.paper : mats.newsprint));
    mesh.name = cover ? (i === 0 ? 'cover_front' : 'cover_back') : `page_${String(i).padStart(2, '0')}`;
    mesh.castShadow = mesh.receiveShadow = true;
    pivot.add(mesh); sphere.add(pivot); pivots.push(pivot);
  }

  const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.0032, 0.0032, stand ? cy + r + 0.012 - 0.012 : 2 * r + 0.016, 24), mats.ink);
  spine.name = 'spine';
  spine.position.y = stand ? (0.012 + cy + r + 0.012) / 2 - cy : 0;
  sphere.add(spine);
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 32, 16), mats.coral);
  finial.name = 'finial'; finial.position.y = r + (stand ? 0.014 : 0.01); sphere.add(finial);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.0035, 0.0011, 12, 160), mats.coral);
  ring.name = 'signature_equator'; ring.rotation.x = Math.PI / 2; sphere.add(ring);

  if (stand) {
    const arm = new THREE.Mesh(new THREE.TorusGeometry(r + 0.011, 0.0016, 12, 128, Math.PI), mats.ink);
    arm.name = 'meridian_arm'; arm.rotation.z = -Math.PI / 2; arm.position.y = cy; root.add(arm);
    const pts = [[0, 0], [0.058, 0], [0.06, 0.003], [0.056, 0.009], [0.012, 0.014], [0.006, 0.02], [0, 0.02]].map(([x, y]) => new THREE.Vector2(x, y));
    const base = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), mats.cover);
    base.name = 'base'; base.castShadow = base.receiveShadow = true; root.add(base);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.0072, 0.0072, cy - r - 0.016, 24), mats.ink);
    foot.name = 'stem'; foot.position.y = 0.02 + (cy - r - 0.016) / 2 - 0.004; root.add(foot);
  }
  root.userData = { pivots, ring, pages };
  setOpen(root, 1);
  return root;
}

export function setOpen(root, t) {
  const { pivots, ring, pages } = root.userData;
  pivots.forEach((p, i) => {
    const closed = (i / (pages - 1)) * 0.07;
    const open = (i / pages) * Math.PI * 2;
    p.rotation.y = closed + (open - closed) * t;
  });
  const k = Math.min(1, Math.max(0, (t - 0.82) / 0.18));
  ring.scale.setScalar(Math.max(0.001, k * k * (3 - 2 * k)));
  ring.visible = k > 0.001;
}
