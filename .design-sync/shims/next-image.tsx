// design-sync build shim for 'next/image' — see .design-sync/tsconfig.synth.json
// and .design-sync/NOTES.md. next/image's real implementation unconditionally
// pulls Next's build-time image-optimizer chain (next/dist/shared/lib/*),
// which itself requires Node builtins (fs/stream/zlib via gzip-size) that
// Next's own webpack build strips via special-cased module aliasing esbuild
// doesn't have. This shim only exists inside the design-sync preview
// sandbox — the real app (app/**, components/**) still imports the real
// next/image unchanged; nothing here affects production.
import type { ImgHTMLAttributes } from 'react'

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> & {
  src: string
  alt: string
  fill?: boolean
  width?: number | string
  height?: number | string
  priority?: boolean
  sizes?: string
  quality?: number
}

export default function Image({ src, alt, fill, width, height, style, priority, sizes, quality, ...rest }: ImageProps) {
  const fillStyle = fill
    ? { position: 'absolute' as const, inset: 0, width: '100%', height: '100%', objectFit: 'cover' as const }
    : {}
  return <img src={src} alt={alt} width={fill ? undefined : width} height={fill ? undefined : height} style={{ ...fillStyle, ...style }} {...rest} />
}
