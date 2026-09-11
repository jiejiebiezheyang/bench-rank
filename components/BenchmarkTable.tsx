'use client'

import { useLanguage } from '@/lib/i18n/language-context'
import type { BenchmarkResult } from '@/lib/types'
import { formatMultiplier, formatNumber, formatTime, matchesSearch } from '@/lib/utils'

interface BenchmarkTableProps {
  results: BenchmarkResult[]
  search: string
}

export function BenchmarkTable({ results, search }: BenchmarkTableProps) {
  const { t } = useLanguage()

  const ranked = results
    .filter(
      (result): result is BenchmarkResult & { multiplier: number } =>
        result.multiplier !== null && matchesSearch(result.source, search)
    )
    .sort((a, b) => a.multiplier - b.multiplier)

  if (ranked.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{t('noImplementations')}</p>
  }

  return (
    <table className="w-full table-fixed text-sm">
      <caption className="sr-only">{t('tableCaption')}</caption>
      <thead>
        <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
          <th scope="col" className="w-12 py-2 pr-2 font-medium">
            {t('colRank')}
          </th>
          <th scope="col" className="py-2 pr-4 font-medium">
            {t('colImplementation')}
          </th>
          <th scope="col" className="w-20 py-2 pr-4 text-right font-medium">
            {t('colMultiplier')}
          </th>
          <th scope="col" className="hidden w-24 py-2 pr-4 text-right font-medium sm:table-cell">
            {t('colTime')}
          </th>
          <th scope="col" className="hidden w-24 py-2 pr-4 text-right font-medium md:table-cell">
            {t('memory')}
          </th>
          <th scope="col" className="hidden w-24 py-2 text-right font-medium md:table-cell">
            {t('cpuTime')}
          </th>
        </tr>
      </thead>
      <tbody>
        {ranked.map((result, index) => (
          <tr key={`${result.source}-${result.link}`} className="border-b border-border/60 last:border-0">
            <td className="py-2.5 pr-2 tabular-nums text-muted-foreground">{index + 1}</td>
            <td className="py-2.5 pr-4 font-medium">
              <a
                href={result.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('openSourceAria', { source: result.source })}
                className="rounded hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                {result.source}
              </a>
            </td>
            <td className="py-2.5 pr-4 text-right tabular-nums text-primary">
              {formatMultiplier(result.multiplier)}
            </td>
            <td className="hidden py-2.5 pr-4 text-right tabular-nums sm:table-cell">
              {formatTime(result.secs)}
            </td>
            <td className="hidden py-2.5 pr-4 text-right tabular-nums md:table-cell">
              {result.mem === null ? 'N/A' : `${formatNumber(result.mem)} KB`}
            </td>
            <td className="hidden py-2.5 text-right tabular-nums md:table-cell">
              {formatTime(result.cpuSecs)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
