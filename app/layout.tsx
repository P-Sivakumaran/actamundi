import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Acta Mundi',
  description: 'A magazine of ideas, culture, and politics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <header className="border-b border-gray-200">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <a href="/" className="text-2xl font-serif font-bold text-primary">
                    Acta Mundi
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <a href="/politics" className="text-secondary hover:text-primary">Politics</a>
                <a href="/culture" className="text-secondary hover:text-primary">Culture</a>
                <a href="/ideas" className="text-secondary hover:text-primary">Ideas</a>
                <a href="/subscribe" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90">
                  Subscribe
                </a>
              </div>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="bg-gray-50 border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-primary tracking-wider uppercase">About</h3>
                <ul className="mt-4 space-y-4">
                  <li><a href="/about" className="text-secondary hover:text-primary">About Us</a></li>
                  <li><a href="/contact" className="text-secondary hover:text-primary">Contact</a></li>
                  <li><a href="/careers" className="text-secondary hover:text-primary">Careers</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-primary tracking-wider uppercase">Sections</h3>
                <ul className="mt-4 space-y-4">
                  <li><a href="/politics" className="text-secondary hover:text-primary">Politics</a></li>
                  <li><a href="/culture" className="text-secondary hover:text-primary">Culture</a></li>
                  <li><a href="/ideas" className="text-secondary hover:text-primary">Ideas</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-primary tracking-wider uppercase">Legal</h3>
                <ul className="mt-4 space-y-4">
                  <li><a href="/privacy" className="text-secondary hover:text-primary">Privacy Policy</a></li>
                  <li><a href="/terms" className="text-secondary hover:text-primary">Terms of Service</a></li>
                  <li><a href="/cookies" className="text-secondary hover:text-primary">Cookie Policy</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-primary tracking-wider uppercase">Connect</h3>
                <ul className="mt-4 space-y-4">
                  <li><a href="/newsletter" className="text-secondary hover:text-primary">Newsletter</a></li>
                  <li><a href="/rss" className="text-secondary hover:text-primary">RSS Feed</a></li>
                  <li><a href="/social" className="text-secondary hover:text-primary">Social Media</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-200 pt-8">
              <p className="text-center text-secondary text-sm">
                © {new Date().getFullYear()} Acta Mundi. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
} 