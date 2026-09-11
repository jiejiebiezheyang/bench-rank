'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useLanguage } from '@/lib/i18n/language-context'
import type { LanguageScore } from '@/lib/types'
import { cn, matchesSearch } from '@/lib/utils'

interface OverallRankingProps {
  scores: LanguageScore[]
  search: string
}

function rankBadgeVariant(rank: number): 'gold' | 'silver' | 'bronze' | null {
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  return null
}

const MEDAL_KEY = {
  gold: 'medalGold',
  silver: 'medalSilver',
  bronze: 'medalBronze'
} as const

export function OverallRanking({ scores, search }: OverallRankingProps) {
  const { t } = useLanguage()
  const filtered = scores.filter(entry => matchesSearch(entry.source, search))

  if (filtered.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('rankingTitle')}</CardTitle>
          <CardDescription>{t('rankingDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">{t('noLanguages')}</p>
        </CardContent>
      </Card>
    )
  }

  // Performance bar is proportional to the ratio relative to the fastest.
  const bestScore = filtered[0].score

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('rankingTitle')}</CardTitle>
        <CardDescription>{t('rankingDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <table className="w-full table-fixed text-sm">
          <caption className="sr-only">{t('rankingTitle')}</caption>
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="w-12 py-2 pr-2 font-medium">
                {t('colRank')}
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                {t('colLanguage')}
              </th>
              <th scope="col" className="hidden py-2 pr-4 font-medium sm:table-cell">
                {t('colPerformance')}
              </th>
              <th scope="col" className="w-16 py-2 pr-4 text-right font-medium">
                {t('colScore')}
              </th>
              <th scope="col" className="w-16 py-2 text-right font-medium">
                {t('colCoverage')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry, index) => {
              const rank = index + 1
              const medalType = rankBadgeVariant(rank)
              const barWidth = Math.min(100, Math.max(2, (bestScore / entry.score) * 100)) + '%'
              const lowCoverage = entry.coveragePercent < 100

              return (
                <tr key={entry.source} className="border-b border-border/60 last:border-0">
                  <td className="py-3 pr-2">
                    <div className="flex items-center gap-2">
                      {medalType ? (
                        <Badge variant={medalType} className="w-8 justify-center">
                          {t(MEDAL_KEY[medalType])}
                        </Badge>
                      ) : (
                        <span className="tabular-nums text-muted-foreground">{rank}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-medium">{entry.source}</td>
                  <td className="hidden py-3 pr-4 sm:table-cell">
                    <div
                      className="h-2 rounded-full bg-primary/70"
                      style={{ width: barWidth }}
                      aria-hidden="true"
                    />
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">{entry.score.toFixed(2)}x</td>
                  <td className="py-3 text-right">
                    <span
                      className={cn(
                        'inline-block rounded px-1.5 py-0.5 text-xs tabular-nums',
                        lowCoverage ? 'bg-amber-500/15 text-amber-300' : 'text-muted-foreground'
                      )}
                    >
                      {entry.coverage}/{entry.totalBenchmarks}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
