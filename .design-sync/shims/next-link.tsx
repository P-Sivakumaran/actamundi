// design-sync build shim for 'next/link' — see next-image.tsx header for why
// this exists. A real next/link needs the App Router's client-side
// navigation context, absent outside a running Next.js app; this renders a
// plain anchor so preview cards with links still render and are clickable
// in a no-op way. The real app imports the real next/link unchanged.
import type { AnchorHTMLAttributes, ReactNode } from 'react'

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string
  children?: ReactNode
  prefetch?: boolean
  replace?: boolean
  scroll?: boolean
}

export default function Link({ href, children, prefetch, replace, scroll, ...rest }: LinkProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}
