'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { BarChart3, ExternalLink, Moon, Sun } from 'lucide-react'

import { useLanguage } from '@/lib/i18n/language-context'

export function Header() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { language, setLanguage, t } = useLanguage()

  // Avoid hydration mismatch on the theme icon.
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold">BenchRank</span>
            <span className="truncate text-xs text-muted-foreground">{t('headerSubtitle')}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? t('switchToLight') : t('switchToDark')}
            title={isDark ? t('switchToLight') : t('switchToDark')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {mounted && isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            aria-label={t('switchLanguage')}
            title={t('switchLanguage')}
            className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {language === 'zh' ? 'EN' : '中文'}
          </button>

          <a
            href="https://benchmarksgame-team.pages.debian.net/benchmarksgame/index.html"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('headerSourceAria')}
            className="hidden items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:inline-flex"
          >
            {t('headerDataSource')}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </header>
  )
}
