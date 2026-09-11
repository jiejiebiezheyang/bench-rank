'use client'

import { Info } from 'lucide-react'

import { useLanguage } from '@/lib/i18n/language-context'

export function Hero() {
  const { t } = useLanguage()

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-6 sm:px-6 sm:pt-14 sm:pb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('heroTitle')}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t('heroSubtitle')}
        </p>
        <p className="mt-4 inline-flex items-start gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground sm:text-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {t('heroNote')}
        </p>
      </div>
    </section>
  )
}
