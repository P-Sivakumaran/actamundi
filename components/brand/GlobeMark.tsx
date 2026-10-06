'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * The ActaMundi mark — "globe of pages". Fans open once (≈3s) from a closed book,
 * then rests. Renders only while animating / rotating / following the pointer,
 * and pauses offscreen. Reduced motion: renders the open globe as a still.
 *
 * Bump `replayKey` to replay the fan (e.g. after a successful publish).
 */
export function GlobeMark({
  size = 320,
  play = true,
  rotate = true,
  interactive = true,
  replayKey,
  className,
  label = 'ActaMundi',
}: {
  size?: number
  play?: boolean
  rotate?: boolean
  interactive?: boolean
  replayKey?: number | string
  className?: string
  label?: string
}) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    let raf = 0
    let alive = true
    let teardown = () => {}

    ;(async () => {
      const THREE = await import('three')
      const { buildGlobe, setOpen } = await import('@/lib/brand/globe')
      if (!alive) return

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.setSize(size, size)
      el.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const cam = new THREE.PerspectiveCamera(28, 1, 0.01, 10)
      cam.position.set(0, 0.04, 0.6)
      cam.lookAt(0, 0, 0)
      scene.add(new THREE.HemisphereLight(0xffffff, 0xd9cfc2, 1.5))
      const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(0.5, 0.8, 0.6); scene.add(key)
      const rim = new THREE.DirectionalLight(0xa8ecec, 1.1); rim.position.set(-0.6, 0.2, -0.5); scene.add(rim)
      const globe = buildGlobe(THREE, { stand: false })
      scene.add(globe)

      const animate = play && !reduce
      const DELAY = 0.4, OPEN = 2.8
      const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
      const clamp = (x: number) => Math.min(1, Math.max(0, x))
      const t0 = performance.now()
      let tx = 0, ty = 0, px = 0, py = 0
      let visible = true

      function frame(now: number) {
        raf = 0
        const s = (now - t0) / 1000
        const o = animate ? ease(clamp((s - DELAY) / OPEN)) : 1
        setOpen(globe, o)
        px += (tx - px) * 0.06
        py += (ty - py) * 0.06
        const spinning = rotate && !reduce
        const spin = spinning ? Math.max(0, s - (animate ? DELAY + OPEN : 0)) * 0.16 : 0
        globe.rotation.y = -0.55 + o * 0.9 + spin + px * 0.6
        globe.rotation.x = 0.16 + py * 0.3
        globe.rotation.z = (1 - o) * -0.08
        renderer.render(scene, cam)
        const settling = Math.abs(tx - px) + Math.abs(ty - py) > 0.001
        if (visible && ((animate && s < DELAY + OPEN) || spinning || settling)) raf = requestAnimationFrame(frame)
      }
      const wake = () => { if (!raf) raf = requestAnimationFrame(frame) }
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        tx = (e.clientX - r.left) / r.width - 0.5
        ty = (e.clientY - r.top) / r.height - 0.5
        wake()
      }
      const onLeave = () => { tx = ty = 0; wake() }
      if (interactive && !reduce) {
        el.addEventListener('pointermove', onMove)
        el.addEventListener('pointerleave', onLeave)
      }
      const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake() })
      io.observe(el)
      raf = requestAnimationFrame(frame)

      teardown = () => {
        io.disconnect()
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerleave', onLeave)
        globe.traverse((o) => {
          const m = o as import('three').Mesh
          if (m.isMesh) { m.geometry.dispose(); (m.material as import('three').Material).dispose() }
        })
        renderer.dispose()
        renderer.domElement.remove()
      }
    })()

    return () => { alive = false; cancelAnimationFrame(raf); teardown() }
  }, [size, play, rotate, interactive, replayKey])

  return <div ref={host} role="img" aria-label={label} className={cn('shrink-0', className)} style={{ width: size, height: size }} />
}
