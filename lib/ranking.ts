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
 * How much each metric contributes to a benchmark's combined ratio.
 * Time takes priority (80%) over memory (20%).
 */
const TIME_WEIGHT = 0.8
const SPACE_WEIGHT = 0.2

/** True when a raw metric value can be used in scoring. */
function isUsable(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

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
 * Compute the combined time/memory ranking.
 *
 * Algorithm:
 *  1. Map every benchmark to a weight = groupWeight × (1 / benchmarksInGroup).
 *  2. For each benchmark, record each language's best (lowest) time multiplier
 *     and best (lowest) memory; memory is measured relative to the benchmark's
 *     lowest memory usage.
 *  3. For each language, combine both metrics per benchmark:
 *     ratio = timeRatio^TIME_WEIGHT × memRatio^SPACE_WEIGHT (time takes priority).
 *  4. Skip benchmarks the language is missing (either metric); re-normalize the
 *     remaining weights so they still sum to the language's original group share.
 *  5. score = exp(Σ(weight_i × ln(ratio_i))), then normalized so the best
 *     language is 1.0x; lower is better.
 *  6. Unusable values (null / NaN / Infinity / <= 0) are ignored.
 *
 * A language with no usable benchmark data is excluded from the ranking.
 */
export function calculateRanking(groups: BenchmarkGroup[], weights: WeightConfig): LanguageScore[] {
  // Assign an absolute weight to every benchmark.
  const weightedBenchmarks: Array<{
    weight: number
    /** Best (lowest) time multiplier per source. */
    time: Map<string, number>
    /** Best (lowest) memory in KB per source. */
    mem: Map<string, number>
    /** Lowest memory in KB across all sources in this benchmark. */
    minMem: number
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
      // A source can appear multiple times (different program variants).
      // Use the best (lowest) value for the language in this benchmark.
      const time = new Map<string, number>()
      for (const result of benchmark.data) {
        if (!isUsable(result.multiplier)) continue
        const current = time.get(result.source)
        if (current === undefined || result.multiplier < current) {
          time.set(result.source, result.multiplier)
        }
      }

      // Memory only counts for sources that have a usable time value, so a
      // variant with a bogus multiplier cannot pull the benchmark's baseline down.
      const mem = new Map<string, number>()
      for (const result of benchmark.data) {
        if (!time.has(result.source) || !isUsable(result.mem)) continue
        const current = mem.get(result.source)
        if (current === undefined || result.mem < current) {
          mem.set(result.source, result.mem)
        }
      }

      let minMem = Infinity
      for (const memory of mem.values()) {
        if (memory < minMem) minMem = memory
      }
      if (time.size === 0 || mem.size === 0 || !Number.isFinite(minMem)) continue

      weightedBenchmarks.push({
        weight: groupWeight * internalWeight,
        time,
        mem,
        minMem
      })
    }
  }

  const sources = getImplementations(groups)
  const rawScores: Array<{ source: string; score: number; coverage: number }> = []

  for (const source of sources) {
    let logSum = 0
    let weightSum = 0
    let coverage = 0

    for (const benchmark of weightedBenchmarks) {
      const timeRatio = benchmark.time.get(source)
      const memory = benchmark.mem.get(source)
      // Skip benchmarks where either the time or the memory is missing.
      if (timeRatio === undefined || memory === undefined) continue

      const memRatio = memory / benchmark.minMem
      const w = benchmark.weight
      logSum += w * (TIME_WEIGHT * Math.log(timeRatio) + SPACE_WEIGHT * Math.log(memRatio))
      weightSum += w
      coverage += 1
    }

    // A language that shows up in no usable benchmark has no score.
    if (weightSum <= 0 || coverage === 0) continue

    // Re-normalize the participating weights.
    const rawScore = Math.exp(logSum / weightSum)
    if (!Number.isFinite(rawScore) || rawScore <= 0) continue

    rawScores.push({ source, score: rawScore, coverage })
  }

  if (rawScores.length === 0) return []

  // Normalize so the best language scores 1.0x and every other language is a
  // multiple of it (lower is better).
  const bestScore = Math.min(...rawScores.map(entry => entry.score))

  return rawScores
    .map(({ source, score, coverage }) => ({
      source,
      score: score / bestScore,
      coverage,
      totalBenchmarks,
      coveragePercent: Math.round((coverage / totalBenchmarks) * 100)
    }))
    .sort((a, b) => a.score - b.score)
}
