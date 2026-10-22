import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateAddress(addr: string): string {
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr
}

const FALLBACK_GRADIENTS = [
  'from-violet-900 to-indigo-950',
  'from-rose-900 to-red-950',
  'from-emerald-900 to-teal-950',
  'from-amber-900 to-orange-950',
  'from-sky-900 to-blue-950',
]

/** Deterministic cover-image-less background, keyed off a CID so the same
 * article always gets the same color rather than a random one per render. */
export function fallbackGradient(cid: string): string {
  let hash = 0
  for (let i = 0; i < cid.length; i++) hash = (hash * 31 + cid.charCodeAt(i)) >>> 0
  return FALLBACK_GRADIENTS[hash % FALLBACK_GRADIENTS.length]
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, exp)
  return `${exp === 0 ? value : value.toFixed(1)} ${units[exp]}`
}
