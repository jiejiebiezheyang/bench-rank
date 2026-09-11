'use client'

import { BenchmarkCard } from '@/components/BenchmarkCard'
import { useLanguage } from '@/lib/i18n/language-context'
import type { BenchmarkGroup, GroupFilter } from '@/lib/types'
import { matchesSearch } from '@/lib/utils'

interface BenchmarkGroupsProps {
  groups: BenchmarkGroup[]
  search: string
  filter: GroupFilter
  onFilterChange: (filter: GroupFilter) => void
}

interface FilterOption {
  value: GroupFilter
  labelKey: 'filterAll' | 'filterInsignificant' | 'filterSignificant'
}

const FILTERS: FilterOption[] = [
  { value: 'all', labelKey: 'filterAll' },
  { value: 'insignificant', labelKey: 'filterInsignificant' },
  { value: 'significant', labelKey: 'filterSignificant' }
]

/**
 * Map the dataset group label to a human-friendly display name.
 * The group names are proper nouns from the dataset and stay untranslated.
 */
export function groupDisplayName(group: BenchmarkGroup): string {
  if (group.group === 'Insignificant-IO') return 'Insignificant IO'
  if (group.group === 'Significant-IO') return 'Significant IO'
  return group.group
}

export function BenchmarkGroups({ groups, search, filter, onFilterChange }: BenchmarkGroupsProps) {
  const { t } = useLanguage()

  const visibleGroups = groups.filter(group => {
    if (filter === 'insignificant') return group.group === 'Insignificant-IO'
    if (filter === 'significant') return group.group === 'Significant-IO'
    return true
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{t('groupsTitle')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('groupsDescription')}</p>
        </div>

        <div
          role="group"
          aria-label={t('filterAll')}
          className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-background p-1"
        >
          {FILTERS.map(option => {
            const active = filter === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onFilterChange(option.value)}
                aria-pressed={active}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {t(option.labelKey)}
              </button>
            )
          })}
        </div>
      </div>

      {visibleGroups.map(group => {
        const visibleBenchmarks = group.benchmarks.filter(benchmark =>
          benchmark.data.some(result => matchesSearch(result.source, search))
        )
        const countKey = group.benchmarks.length === 1 ? 'benchmarkCountOne' : 'benchmarkCountMany'

        return (
          <section key={group.group}>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold">{groupDisplayName(group)}</h2>
              <span className="text-xs text-muted-foreground">
                {t(countKey, { count: group.benchmarks.length })}
              </span>
            </div>

            {visibleBenchmarks.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                {t('noBenchmarksInGroup')}
              </p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {visibleBenchmarks.map(benchmark => (
                  <BenchmarkCard
                    key={benchmark.name}
                    name={benchmark.name}
                    url={benchmark.url}
                    results={benchmark.data}
                    groupLabel={groupDisplayName(group)}
                    search={search}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
