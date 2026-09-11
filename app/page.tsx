import rawGroups from '@/data/benchmarks.json'

import { BenchRankDashboard } from '@/components/BenchRankDashboard'
import { Hero } from '@/components/Hero'
import { normalizeBenchmarksData } from '@/lib/normalize'

/**
 * Server component: load + normalize the static dataset once,
 * then hand the typed structure to the interactive dashboard.
 */
export default function Home() {
  const dataset = normalizeBenchmarksData(rawGroups)

  return (
    <>
      <Hero />
      <BenchRankDashboard dataset={dataset} />
    </>
  )
}
