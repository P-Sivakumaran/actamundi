// design-sync build shim for 'next/navigation' — see next-image.tsx header
// for why this exists. Real next/navigation hooks read the App Router's
// navigation context, absent outside a running Next.js app. This covers
// exactly the surface actamundi's components actually call (grep
// `from 'next/navigation'` under components/ before adding more — keep
// this file matching real usage, not a full next/navigation reimplementation).
export function useRouter() {
  return {
    push: (_url: string) => {},
    replace: (_url: string) => {},
    back: () => {},
    forward: () => {},
    refresh: () => {},
    prefetch: (_url: string) => {},
  }
}

export function useSearchParams() {
  return new URLSearchParams()
}

export function usePathname() {
  return '/'
}
