'use client'

import { useState } from 'react'
import { ChevronDown, ExternalLink, Trophy, Clock, MemoryStick, Cpu } from 'lucide-react'

import { BenchmarkTable } from '@/components/BenchmarkTable'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/lib/i18n/language-context'
import type { BenchmarkResult } from '@/lib/types'
import { cn, formatNumber, formatTime } from '@/lib/utils'

interface BenchmarkCardProps {
  name: string
  url: string
  results: BenchmarkResult[]
  groupLabel: string
  search: string
}

export function BenchmarkCard({ name, url, results, groupLabel, search }: BenchmarkCardProps) {
  const [expanded, setExpanded] = useState(false)
  const { t } = useLanguage()

  const ranked = results
    .filter((result): result is BenchmarkResult & { multiplier: number } => result.multiplier !== null)
    .sort((a, b) => a.multiplier - b.multiplier)
  const fastest = ranked[0]
  const countKey = results.length === 1 ? 'implementationCountOne' : 'implementationCountMany'

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow">
      <button
        type="button"
        onClick={() => setExpanded(value => !value)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-4 rounded-xl p-5 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{name}</h3>
            <Badge variant="muted">{groupLabel}</Badge>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </button>

      <div className="grid grid-cols-2 gap-3 border-t border-border px-5 py-4 sm:grid-cols-4">
        <div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Trophy className="h-3.5 w-3.5" /> {t('fastest')}
          </p>
          <p className="mt-1 truncate text-sm font-medium">{fastest?.source ?? 'N/A'}</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> {t('fastestTime')}
          </p>
          <p className="mt-1 text-sm font-medium tabular-nums">
            {fastest ? formatTime(fastest.secs) : 'N/A'}
          </p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MemoryStick className="h-3.5 w-3.5" /> {t('memory')}
          </p>
          <p className="mt-1 text-sm font-medium tabular-nums">
            {fastest && fastest.mem !== null ? `${formatNumber(fastest.mem)} KB` : 'N/A'}
          </p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Cpu className="h-3.5 w-3.5" /> {t('cpuTime')}
          </p>
          <p className="mt-1 text-sm font-medium tabular-nums">
            {fastest ? formatTime(fastest.cpuSecs) : 'N/A'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border px-5 py-2">
        <span className="text-xs text-muted-foreground">{t(countKey, { count: results.length })}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('openBenchmarkAria', { name })}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t('officialBenchmark')}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {expanded && (
        <div className="border-t border-border p-2">
          <BenchmarkTable results={results} search={search} />
        </div>
      )}
    </div>
  )
}
