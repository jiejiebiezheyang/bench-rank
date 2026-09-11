/**
 * Central translation dictionary.
 *
 * `en` is the source of truth for available keys; `zh` must provide the same
 * keys (enforced by the `typeof` check below). The `t` function in the
 * language context interpolates `{param}` placeholders.
 */
export const translations = {
  en: {
    // Header
    headerSubtitle: 'Programming Language Performance Explorer',
    headerDataSource: 'Data Source',
    headerSourceAria: 'Data Source - The Computer Language Benchmarks Game (opens in a new tab)',
    // Hero
    heroTitle: 'Programming Language Performance',
    heroSubtitle:
      'Explore and compare programming language implementations using benchmark data from The Computer Language Benchmarks Game.',
    heroNote: 'Rankings are calculated dynamically based on your benchmark category weights.',
    // Search & filter
    searchPlaceholder: "Search language... (use ';' for multiple)",
    filterAll: 'All',
    filterInsignificant: 'Insignificant IO',
    filterSignificant: 'Significant IO',
    // Weights
    weightsTitle: 'Benchmark Weights',
    weightsDescription: 'Adjust how much each category counts toward the ranking.',
    weightsInsignificantDesc: 'CPU and computation focused benchmarks.',
    weightsSignificantDesc: 'Data processing and IO heavy benchmarks.',
    weightsPresets: 'Presets',
    presetBalanced: 'Balanced',
    presetComputeHeavy: 'Compute Heavy',
    presetIoHeavy: 'IO Heavy',
    // Overall ranking
    rankingTitle: 'Overall Ranking',
    rankingDescription: 'Calculated using weighted geometric mean.',
    noLanguages: 'No languages match your search.',
    colRank: 'Rank',
    colLanguage: 'Language',
    colPerformance: 'Performance (time-first)',
    colScore: 'Score',
    colCoverage: 'Coverage',
    medalGold: 'Gold',
    medalSilver: 'Silver',
    medalBronze: 'Bronze',
    // Chart
    chartTitle: 'Ranking Chart',
    chartDescription: 'Horizontal bar chart of raw geometric mean scores.',
    tooltipScore: 'Score',
    tooltipCoverage: 'Coverage',
    // Groups
    groupsTitle: 'Benchmark Groups',
    groupsDescription: 'Click a benchmark to expand its full implementation ranking.',
    benchmarkCountOne: '{count} benchmark',
    benchmarkCountMany: '{count} benchmarks',
    noBenchmarksInGroup: 'No benchmarks match your search in this group.',
    // Benchmark card
    fastest: 'Fastest',
    fastestTime: 'Fastest Time',
    memory: 'Memory',
    cpuTime: 'CPU Time',
    implementationCountOne: '{count} implementation',
    implementationCountMany: '{count} implementations',
    officialBenchmark: 'Official Benchmark',
    openSourceAria: 'View {source} source program (opens in a new tab)',
    openBenchmarkAria: 'Open {name} benchmark on the official site (opens in a new tab)',
    // Benchmark table
    tableCaption: 'Benchmark implementation ranking',
    colImplementation: 'Implementation',
    colMultiplier: 'Multiplier',
    colTime: 'Time',
    noImplementations: 'No implementations match your search.',
    // Footer
    lastUpdated: 'Last updated: ',
    staticDataset: 'Static dataset',
    footerNote:
      'Scores use weighted geometric mean. A lower score means better relative performance on the selected benchmarks.',
    // Theme & language switchers
    switchToLight: 'Switch to light theme',
    switchToDark: 'Switch to dark theme',
    switchLanguage: 'Switch language'
  },
  zh: {
    // Header
    headerSubtitle: '编程语言性能探索',
    headerDataSource: '数据来源',
    headerSourceAria: '数据来源 - The Computer Language Benchmarks Game（在新标签页打开）',
    // Hero
    heroTitle: '编程语言性能',
    heroSubtitle: '使用 The Computer Language Benchmarks Game 的基准测试数据，探索并比较各编程语言实现。',
    heroNote: '排名根据你设置的基准测试类别权重动态计算。',
    // Search & filter
    searchPlaceholder: '搜索语言...（用 ; 分隔多个）',
    filterAll: '全部',
    filterInsignificant: 'Insignificant IO',
    filterSignificant: 'Significant IO',
    // Weights
    weightsTitle: '基准测试权重',
    weightsDescription: '调整每个类别在排名中的占比。',
    weightsInsignificantDesc: '以 CPU 计算为主的基准测试。',
    weightsSignificantDesc: '以数据处理和 IO 为主的基准测试。',
    weightsPresets: '预设',
    presetBalanced: '均衡',
    presetComputeHeavy: '计算密集型',
    presetIoHeavy: 'IO 密集型',
    // Overall ranking
    rankingTitle: '综合排名',
    rankingDescription: '使用加权几何平均数计算。',
    noLanguages: '没有语言匹配你的搜索。',
    colRank: '排名',
    colLanguage: '语言',
    colPerformance: '性能 (时间优先)',
    colScore: '得分',
    colCoverage: '覆盖率',
    medalGold: '金牌',
    medalSilver: '银牌',
    medalBronze: '铜牌',
    // Chart
    chartTitle: '排名图表',
    chartDescription: '原始几何平均得分的横向条形图。',
    tooltipScore: '得分',
    tooltipCoverage: '覆盖率',
    // Groups
    groupsTitle: '基准测试分组',
    groupsDescription: '点击基准测试卡片以展开完整的实现排名。',
    benchmarkCountOne: '{count} 个基准测试',
    benchmarkCountMany: '{count} 个基准测试',
    noBenchmarksInGroup: '该分组中没有基准测试匹配你的搜索。',
    // Benchmark card
    fastest: '最快实现',
    fastestTime: '最快时间',
    memory: '内存',
    cpuTime: 'CPU 时间',
    implementationCountOne: '{count} 个实现',
    implementationCountMany: '{count} 个实现',
    officialBenchmark: '官方基准测试',
    openSourceAria: '查看 {source} 源码程序（在新标签页打开）',
    openBenchmarkAria: '打开 {name} 基准测试的官方页面（在新标签页打开）',
    // Benchmark table
    tableCaption: '基准测试实现排名',
    colImplementation: '实现',
    colMultiplier: '倍率',
    colTime: '时间',
    noImplementations: '没有实现匹配你的搜索。',
    // Footer
    lastUpdated: '最后更新：',
    staticDataset: '静态数据集',
    footerNote: '得分使用加权几何平均数计算。得分越低，代表在所选基准测试上的相对性能越好。',
    // Theme & language switchers
    switchToLight: '切换到亮色主题',
    switchToDark: '切换到暗色主题',
    switchLanguage: '切换语言'
  }
} as const

export type Language = 'en' | 'zh'
export type TranslationKey = keyof typeof translations.en
export type TranslationParams = Record<string, string | number>

/** Compile-time check that `zh` and `en` have identical key sets. */
type _SameKeys = [keyof typeof translations.en] extends [keyof typeof translations.zh]
  ? [keyof typeof translations.zh] extends [keyof typeof translations.en]
    ? true
    : never
  : never

const _enforceSameKeys: _SameKeys = true

export function translate(lang: Language, key: TranslationKey, params?: TranslationParams): string {
  let text: string = translations[lang][key] ?? translations.en[key]
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value))
    }
  }
  return text
}
