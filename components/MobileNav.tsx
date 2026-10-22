'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

/** The category nav in app/layout.tsx's header is `hidden md:flex` — below
 * that breakpoint it vanished with no replacement. This is that replacement. */
export function MobileNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden" aria-label="Open navigation menu">
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/articles?category=Politics">Politics</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/articles?category=Culture">Culture</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/articles?category=Ideas">Ideas</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/articles">Subscribe</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
