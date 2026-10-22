import type { Metadata } from 'next'
import { Bodoni_Moda, Lato, Newsreader, Instrument_Sans, M_PLUS_Code_Latin, EB_Garamond } from 'next/font/google'
import './globals.css'
import './motion.css'
import { NetworkIndicator } from '@/components/NetworkIndicator'
import { StyledComponentsRegistry } from '@/lib/styled-registry'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SkipLink } from '@/components/ui/skiplink'
import Link from 'next/link'
import { ErrorProvider } from '@/components/providers/ErrorProvider'
import { CopyrightYear } from '@/components/ui/copyright-year'
import { GlobeMark } from '@/components/brand/GlobeMark'
import { MobileNav } from '@/components/MobileNav'
import { HeaderProfileLink } from '@/components/HeaderProfileLink'

// WalletCoin's coin face only now — the wordmark moved to EB Garamond below.
const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni-moda',
  display: 'swap',
})

// Wordmark — extrabold italic, mixed case, tight tracking.
const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['800'],
  style: ['italic'],
  variable: '--font-eb-garamond',
  display: 'swap',
})

// Headlines + article body. Optical sizes 6–72 keep one family crisp at every size.
const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-newsreader',
  display: 'swap',
})

// UI chrome.
const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  display: 'swap',
})

// Wallet addresses, CIDs, signatures — content, so they get their own voice.
// Latin-only monospace (not M PLUS 1 Code, which carries a full Japanese
// glyph set this app never uses) — variable font, so callers pick a weight
// via ordinary CSS font-weight rather than this loading a fixed set.
const mplusCodeLatin = M_PLUS_Code_Latin({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

// Kept loaded during migration so any hard-coded 'Lato' still resolves; remove once unused.
const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ActaMundi - Decentralized News Platform',
  description: 'A decentralized platform for verified news and information',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${bodoniModa.variable} ${ebGaramond.variable} ${newsreader.variable} ${instrumentSans.variable} ${mplusCodeLatin.variable} ${lato.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider>
          <StyledComponentsRegistry>
            <ErrorProvider>
              <ErrorBoundary>
                <SkipLink href="#main-content" />
                <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center">
                      <Link href="/" className="flex items-center gap-2 mr-8" aria-label="ActaMundi home">
                        {/* Fans open once on first load, then rests. No idle rotation in the header. */}
                        <GlobeMark size={36} rotate={false} interactive={false} label="" />
                        <span className="am-wordmark text-lg text-foreground">ActaMundi</span>
                      </Link>

                      <nav className="hidden md:flex items-center space-x-6">
                        <Link href="/articles?category=Politics" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors dark:text-gray-300">
                          Politics
                        </Link>
                        <Link href="/articles?category=Culture" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors dark:text-gray-300">
                          Culture
                        </Link>
                        <Link href="/articles?category=Ideas" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors dark:text-gray-300">
                          Ideas
                        </Link>
                      </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                      <ThemeSwitcher />
                      <NetworkIndicator />
                      <HeaderProfileLink />
                      <Link href="/articles" className="hidden md:inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                        Subscribe
                      </Link>
                      <MobileNav />
                    </div>
                  </div>
                </header>
                <main id="main-content" className="flex-1 container py-8 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-border my-8">{children}</main>
                <footer className="border-t bg-muted/40">
                  <div className="container py-12">
                    <div className="flex justify-center mb-8">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4 text-center">Sections</h3>
                        <ul className="flex gap-6">
                          <li><Link href="/articles?category=Politics" className="text-sm text-gray-700 hover:text-primary dark:text-gray-300">Politics</Link></li>
                          <li><Link href="/articles?category=Culture" className="text-sm text-gray-700 hover:text-primary dark:text-gray-300">Culture</Link></li>
                          <li><Link href="/articles?category=Ideas" className="text-sm text-gray-700 hover:text-primary dark:text-gray-300">Ideas</Link></li>
                        </ul>
                      </div>
                    </div>
                    <div className="border-t pt-8">
                      <p className="text-center text-sm text-gray-700 dark:text-gray-300">
                        © <CopyrightYear /> ActaMundi. All rights reserved.
                      </p>
                    </div>
                  </div>
                </footer>
                <Toaster />
              </ErrorBoundary>
            </ErrorProvider>
          </StyledComponentsRegistry>
        </ThemeProvider>
      </body>
    </html>
  )
}
