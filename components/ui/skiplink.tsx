import * as React from 'react'
import { cn } from '@/lib/utils'

interface SkipLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string
}

/**
 * SkipLink component for keyboard accessibility
 * Allows keyboard users to skip navigation and go directly to main content
 */
export function SkipLink({ href, className, children, ...props }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4",
        "px-4 py-2 bg-primary text-primary-foreground",
        "rounded-md shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      {...props}
    >
      {children || "Skip to content"}
    </a>
  )
} 