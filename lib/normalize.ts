import type {
  Benchmark,
  BenchmarkGroup,
  BenchmarkResult,
  NormalizedDataset,
  RawBenchmarkGroup,
  RawBenchmarkResult
} from './types'

/**
 * Parse a raw numeric string from the dataset into a real number.
 *
 * Rules:
 *  - Removes thousands separators (e.g. "2,712" -> 2712).
 *  - Parses plain decimals (e.g. "2.14" -> 2.14).
 *  - Handles duration suffixes (e.g. "5 min" -> 300).
 *  - Returns null when the value cannot be converted.
 */
export function parseNumber(value: string | null | undefined): number | null {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (trimmed.length === 0) return null

  // "5 min" -> 5 * 60 = 300
  const minuteMatch = /^([\d.,]+)\s*min/i.exec(trimmed)
  if (minuteMatch) {
    const n = parseNumber(minuteMatch[1])
    return n === null ? null : n * 60
  }

  const numeric = trimmed.replace(/,/g, '')
  if (numeric === '' || !/^-?\d+(\.\d+)?$/.test(numeric)) return null

  const parsed = Number(numeric)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Normalize a single raw result row into {@link BenchmarkResult}.
 * Unparseable numeric fields become null in the returned record.
 */
export function normalizeBenchmarkResult(raw: RawBenchmarkResult): BenchmarkResult {
  return {
    multiplier: parseNumber(raw['×']),
    source: raw.source,
    link: raw.link,
    secs: parseNumber(raw['secs']),
    mem: parseNumber(raw['mem']),
    gz: parseNumber(raw['gz']),
    cpuSecs: parseNumber(raw['cpu secs'])
  }
}

function normalizeBenchmark(raw: { name: string; url: string; data: RawBenchmarkResult[] }): Benchmark {
  return {
    name: raw.name,
    url: raw.url,
    data: raw.data.map(row => normalizeBenchmarkResult(row))
  }
}

function normalizeGroup(raw: RawBenchmarkGroup): BenchmarkGroup {
  return {
    group: raw.group,
    benchmarks: raw.benchmarks.map(benchmark => normalizeBenchmark(benchmark))
  }
}

/**
 * Translate the raw dataset into the normalized in-memory structure.
 * A missing `generatedAt` stays null so the UI can display "Static dataset"
 * rather than fabricating a real timestamp.
 */
export function normalizeBenchmarksData(
  rawGroups: RawBenchmarkGroup[],
  generatedAt?: string | null
): NormalizedDataset {
  return {
    groups: rawGroups.map(group => normalizeGroup(group)),
    generatedAt: typeof generatedAt === 'string' ? generatedAt : null
  }
}
