import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

import { ThemeProvider, ThemeSwitcher } from '@/lib/theme'

export const metadata: Metadata = {
  title: 'Photo-Match SN',
  description: 'Plateforme de partage de photos pour événements au Sénégal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-brand-navy min-h-screen">
        <ThemeProvider>
          <header className="sticky top-0 z-50 bg-white/80 dark:bg-brand-navy/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
            <nav className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition-transform">
                  P
                </div>
                <span className="font-display font-bold text-xl tracking-tight text-brand-navy dark:text-white">
                  Photo-Match <span className="text-brand-blue">SN</span>
                </span>
              </Link>
              
              <div className="flex items-center gap-6">
                <ThemeSwitcher />
              </div>
            </nav>
          </header>
          
          <main className="relative">
            {children}
          </main>

          <footer className="bg-gray-50 dark:bg-brand-navy-light/30 border-t border-gray-100 dark:border-gray-800 py-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-gray-400 text-sm mb-4">
                © {new Date().getFullYear()} Photo-Match SN · Service de photographie intelligent au Sénégal
              </p>
              <div className="flex justify-center gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <Link href="/user" className="hover:text-brand-blue">Invités</Link>
                <Link href="#" className="hover:text-brand-blue">Contact</Link>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
