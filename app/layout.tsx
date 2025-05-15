import type { Metadata } from 'next'
import { Bodoni_Moda, Lato } from 'next/font/google'
import './globals.css'
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

const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni-moda',
  display: 'swap',
})

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
    <html lang="en" className={`${bodoniModa.variable} ${lato.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider>
          <StyledComponentsRegistry>
            <ErrorProvider>
              <ErrorBoundary>
                <SkipLink href="#main-content" />
                <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center">
                      <Link href="/" className="flex items-center space-x-2 mr-8">
                        <span className="text-xl font-bold text-primary">ActaMundi</span>
                      </Link>
                      
                      <nav className="hidden md:flex items-center space-x-6">
                        <Link href="/politics" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors dark:text-gray-300">
                          Politics
                        </Link>
                        <Link href="/culture" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors dark:text-gray-300">
                          Culture
                        </Link>
                        <Link href="/ideas" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors dark:text-gray-300">
                          Ideas
                        </Link>
                      </nav>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <ThemeSwitcher />
                      <NetworkIndicator />
                      <Link href="/subscribe" className="hidden md:inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                        Subscribe
                      </Link>
                    </div>
                  </div>
                </header>
                <main id="main-content" className="flex-1 container py-8 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-border my-8">{children}</main>
                <footer className="border-t bg-muted/40">
                  <div className="container py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">About</h3>
                        <ul className="space-y-3">
                          <li><Link href="/about" className="text-sm text-gray-700 hover:text-primary dark:text-gray-300">About Us</Link></li>
                          <li><Link href="/contact" className="text-sm text-gray-700 hover:text-primary dark:text-gray-300">Contact</Link></li>
                          <li><Link href="/careers" className="text-sm text-gray-700 hover:text-primary dark:text-gray-300">Careers</Link></li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Sections</h3>
                        <ul className="space-y-3">
                          <li><Link href="/politics" className="text-sm text-gray-700 hover:text-primary dark:text-gray-300">Politics</Link></li>
                          <li><Link href="/culture" className="text-sm text-gray-700 hover:text-primary dark:text-gray-300">Culture</Link></li>
                          <li><Link href="/ideas" className="text-sm text-gray-700 hover:text-primary dark:text-gray-300">Ideas</Link></li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Legal</h3>
                        <ul className="space-y-3">
                          <li><Link href="/privacy" className="text-sm text-gray-700 hover:text-primary dark:text-gray-300">Privacy Policy</Link></li>
                          <li><Link href="/terms" className="text-sm text-gray-700 hover:text-primary dark:text-gray-300">Terms of Service</Link></li>
                          <li><Link href="/cookies" className="text-sm text-gray-700 hover:text-primary dark:text-gray-300">Cookie Policy</Link></li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Connect</h3>
                        <ul className="space-y-3">
                          <li><Link href="/newsletter" className="text-sm text-gray-700 hover:text-primary dark:text-gray-300">Newsletter</Link></li>
                          <li><Link href="/rss" className="text-sm text-gray-700 hover:text-primary dark:text-gray-300">RSS Feed</Link></li>
                          <li><Link href="/social" className="text-sm text-gray-700 hover:text-primary dark:text-gray-300">Social Media</Link></li>
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