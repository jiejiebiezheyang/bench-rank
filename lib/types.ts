/**
 * Raw shape as it exists inside data/benchmarks.json.
 * Keys use the non-standard characters ("×", "cpu secs", ...) from the
 * source dataset, so we normalize them into {@link BenchmarkResult}.
 */
export interface RawBenchmarkResult {
  '×': string | null
  source: string
  link: string
  secs: string | null
  mem: string | null
  gz: string | null
  'cpu secs': string | null
}

export interface RawBenchmark {
  name: string
  url: string
  data: RawBenchmarkResult[]
}

export interface RawBenchmarkGroup {
  group: string
  benchmarks: RawBenchmark[]
}

/**
 * Normalized, fully typed view of a single benchmark result.
 * Numeric fields that could not be parsed from the raw dataset are null.
 */
export interface BenchmarkResult {
  multiplier: number | null
  source: string
  link: string
  /** Running time in seconds. */
  secs: number | null
  /** Memory in KB. */
  mem: number | null
  /** Compressed source size in bytes. */
  gz: number | null
  /** CPU time in seconds. */
  cpuSecs: number | null
}

export interface Benchmark {
  name: string
  url: string
  data: BenchmarkResult[]
}

export interface BenchmarkGroup {
  group: string
  benchmarks: Benchmark[]
}

/** A single language/implementation entry in the final ranking. */
export interface LanguageScore {
  source: string
  /** Weighted geometric mean, lower is better. */
  score: number
  /** Number of benchmarks the language actually participated in. */
  coverage: number
  /** Total number of benchmarks considered. */
  totalBenchmarks: number
  /** coverage / totalBenchmarks as a percentage (0-100). */
  coveragePercent: number
}

export interface WeightConfig {
  insignificantIO: number
  significantIO: number
}

export interface RankingReport {
  scores: LanguageScore[]
  weightConfig: WeightConfig
}

export interface NormalizedDataset {
  groups: BenchmarkGroup[]
  generatedAt: string | null
}

/** Group filter value used by search / filter controls. */
export type GroupFilter = 'all' | 'insignificant' | 'significant'
