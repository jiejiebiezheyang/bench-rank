import type { Metadata } from 'next'

import { Header } from '@/components/Header'
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageProvider } from '@/lib/i18n/language-context'

import './globals.css'

export const metadata: Metadata = {
  title: 'BenchRank | Programming Language Performance Explorer',
  description:
    'Compare programming language implementations using benchmark data from The Computer Language Benchmarks Game, with dynamic weighted rankings.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="benchrank-theme"
        >
          <LanguageProvider>
            <Header />
            <main className="flex-1">{children}</main>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
