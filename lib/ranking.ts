import type { BenchmarkGroup, LanguageScore, WeightConfig } from './types'

/** Unique group label used by the dataset. */
const INSIGNIFICANT_GROUP = 'Insignificant-IO'
const SIGNIFICANT_GROUP = 'Significant-IO'

/**
 * The maximum number of benchmark groups we rank against (2).
 * Total weight always sums to this value.
 */
const TOTAL_GROUP_WEIGHT = 100

/**
 * Extract every unique language implementation across all groups, keeping
 * the first-seen display name.
 */
export function getImplementations(groups: BenchmarkGroup[]): string[] {
  const seen = new Map<string, string>()
  for (const group of groups) {
    for (const benchmark of group.benchmarks) {
      for (const result of benchmark.data) {
        if (!seen.has(result.source)) {
          seen.set(result.source, result.source)
        }
      }
    }
  }
  return Array.from(seen.values())
}

/**
 * Compute the weighted geometric mean ranking.
 *
 * Algorithm:
 *  1. Map every benchmark to a weight = groupWeight × (1 / benchmarksInGroup).
 *  2. For each language, collect the multiplier of every benchmark it appears in.
 *  3. Skip benchmarks the language is missing; re-normalize the remaining
 *     weights so they still sum to the language's original group share.
 *  4. score = exp(Σ(weight_i × ln(multiplier_i))), lower is better.
 *  5. Unusable multipliers (null / NaN / Infinity / <= 0) are ignored.
 *
 * A language with no usable benchmark data is excluded from the ranking.
 */
export function calculateRanking(groups: BenchmarkGroup[], weights: WeightConfig): LanguageScore[] {
  // Assign an absolute weight to every benchmark.
  const weightedBenchmarks: Array<{
    weight: number
    results: Map<string, number>
  }> = []

  const totalBenchmarks = groups.reduce((sum, group) => sum + group.benchmarks.length, 0)

  for (const group of groups) {
    const groupWeight =
      group.group === INSIGNIFICANT_GROUP
        ? weights.insignificantIO
        : group.group === SIGNIFICANT_GROUP
          ? weights.significantIO
          : 0

    if (groupWeight <= 0 || group.benchmarks.length === 0) continue

    const internalWeight = 1 / group.benchmarks.length

    for (const benchmark of group.benchmarks) {
      const results = new Map<string, number>()
      for (const result of benchmark.data) {
        const multiplier = result.multiplier
        if (
          multiplier === null ||
          typeof multiplier !== 'number' ||
          !Number.isFinite(multiplier) ||
          multiplier <= 0
        ) {
          continue
        }
        // A source can appear multiple times (different program variants).
        // Use the best (lowest) multiplier for the language in this benchmark.
        const current = results.get(result.source)
        if (current === undefined || multiplier < current) {
          results.set(result.source, multiplier)
        }
      }

      weightedBenchmarks.push({
        weight: groupWeight * internalWeight,
        results
      })
    }
  }

  const sources = getImplementations(groups)
  const scores: LanguageScore[] = []

  for (const source of sources) {
    let logSum = 0
    let weightSum = 0
    let coverage = 0

    for (const benchmark of weightedBenchmarks) {
      const multiplier = benchmark.results.get(source)
      if (multiplier === undefined) continue

      const w = benchmark.weight
      logSum += w * Math.log(multiplier)
      weightSum += w
      coverage += 1
    }

    // A language that shows up in no usable benchmark has no score.
    if (weightSum <= 0 || coverage === 0) continue

    // Re-normalize the participating weights.
    const score = Math.exp(logSum / weightSum)
    if (!Number.isFinite(score) || score <= 0) continue

    const coveragePercent = Math.round((coverage / totalBenchmarks) * 100)
    scores.push({
      source,
      score,
      coverage,
      totalBenchmarks,
      coveragePercent
    })
  }

  return scores.sort((a, b) => a.score - b.score)
}
