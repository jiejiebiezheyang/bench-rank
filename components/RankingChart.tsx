'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useLanguage } from '@/lib/i18n/language-context'
import type { LanguageScore } from '@/lib/types'
import { matchesSearch } from '@/lib/utils'

interface RankingChartProps {
  scores: LanguageScore[]
  search: string
}

export function RankingChart({ scores, search }: RankingChartProps) {
  const { t } = useLanguage()

  const filtered = scores
    .filter(entry => matchesSearch(entry.source, search))
    .slice(0, 15)
    .map(entry => ({
      name: entry.source,
      score: Number(entry.score.toFixed(2)),
      coverage: `${entry.coverage}/${entry.totalBenchmarks}`
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('chartTitle')}</CardTitle>
        <CardDescription>{t('chartDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">{t('noLanguages')}</p>
        ) : (
          <div className="h-80 w-full sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filtered} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-border/60"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="currentColor"
                  className="text-muted-foreground"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => `${value}x`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="currentColor"
                  className="text-muted-foreground"
                  fontSize={12}
                  width={110}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(128,128,128,0.08)' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                    color: 'hsl(var(--popover-foreground))'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value, _name, item) => {
                    const payload = item?.payload as { coverage?: string } | undefined
                    return [
                      [`${value}x`, payload?.coverage ?? ''].filter(Boolean).join(' · '),
                      t('tooltipScore')
                    ]
                  }}
                />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
