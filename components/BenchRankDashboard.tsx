'use client'

import { useMemo, useState } from 'react'

import { BenchmarkGroups } from '@/components/BenchmarkGroups'
import { OverallRanking } from '@/components/OverallRanking'
import { RankingChart } from '@/components/RankingChart'
import { SearchFilter } from '@/components/SearchFilter'
import { WeightControls } from '@/components/WeightControls'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useLanguage } from '@/lib/i18n/language-context'
import { calculateRanking } from '@/lib/ranking'
import type { GroupFilter, NormalizedDataset, WeightConfig } from '@/lib/types'

interface BenchRankDashboardProps {
  dataset: NormalizedDataset
}

export function BenchRankDashboard({ dataset }: BenchRankDashboardProps) {
  const { t } = useLanguage()
  const [insignificantIO, setInsignificantIO] = useState(50)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<GroupFilter>('all')

  const weights: WeightConfig = useMemo(
    () => ({
      insignificantIO,
      significantIO: 100 - insignificantIO
    }),
    [insignificantIO]
  )

  // Ranking is recalculated whenever group weights change.
  const scores = useMemo(() => calculateRanking(dataset.groups, weights), [dataset.groups, weights])

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
      <SearchFilter search={search} onSearchChange={setSearch} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-20">
            <CardHeader>
              <CardTitle>{t('weightsTitle')}</CardTitle>
              <CardDescription>{t('weightsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <WeightControls
                insignificantIO={weights.insignificantIO}
                significantIO={weights.significantIO}
                onChange={setInsignificantIO}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <OverallRanking scores={scores} search={search} />
          <RankingChart scores={scores} search={search} />
        </div>
      </div>

      <Separator />

      <div className="space-y-6">
        <BenchmarkGroups groups={dataset.groups} search={search} filter={filter} onFilterChange={setFilter} />
      </div>

      <Separator />

      <div className="flex flex-col gap-2 pb-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          {t('lastUpdated')}
          {dataset.generatedAt ? (
            <span className="font-medium text-foreground">
              {new Date(dataset.generatedAt).toLocaleString()}
            </span>
          ) : (
            <span className="font-medium text-foreground">{t('staticDataset')}</span>
          )}
        </p>
        <p>{t('footerNote')}</p>
      </div>
    </div>
  )
}
