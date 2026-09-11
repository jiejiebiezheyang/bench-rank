# BenchRank

A programming language performance visualization and dynamic ranking website built on data from [The Computer Language Benchmarks Game](https://benchmarksgame-team.pages.debian.net/benchmarksgame/index.html).

Rather than just displaying benchmark numbers, BenchRank lets you adjust the weight of each benchmark category and instantly recomputes a weighted geometric-mean ranking of every language implementation in the dataset.

> 中文版：请查看 [README.md](README.md)

## Features

- **Dynamic Ranking** — adjust the weight between _Insignificant IO_ (CPU/computation) and _Significant IO_ (IO/data processing) benchmarks; the ranking recalculates live.
- **Weighted Geometric Mean scoring** — the ranking uses `exp(Σ(wᵢ × ln(xᵢ)))`, never a plain arithmetic mean.
- **Weight presets** — Balanced (50/50), Compute Heavy (75/25), IO Heavy (25/75). Sliders always sum to 100%.
- **Coverage awareness** — languages missing from some benchmarks are still ranked by re-normalizing their available weights, and a visual hint marks partial coverage (e.g. `6/7`).
- **Ranking Chart** — horizontal bar chart (Recharts) that updates in real time with the sliders.
- **Benchmark explorer** — expand any benchmark card to see its full implementation ranking with time / memory / CPU time, with links to the official source pages.
- **Search & group filter** — filter ranking, chart, and benchmark tables by language name or benchmark group; multiple terms can be combined with `;` (e.g. `Rust;Go`).
- **i18n (中文 / English)** — full UI translation, Chinese by default; persisted to localStorage.
- **Light / Dark theme** — one-click toggle (light by default), persisted to localStorage.
- **Responsive UI** — Tailwind CSS + shadcn/ui style primitives, works on desktop, tablet, and mobile.

## Tech Stack

- Next.js (App Router)
- TypeScript (strict, no `any`)
- Tailwind CSS
- shadcn/ui style components (Radix primitives + CVA)
- Recharts
- Lucide React icons

## Installation

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Production build:

```bash
npm run build
npm start
```

## Project Structure

```
BenchRankUI/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── WeightControls.tsx
│   ├── OverallRanking.tsx
│   ├── RankingChart.tsx
│   ├── BenchmarkGroups.tsx
│   ├── BenchmarkCard.tsx
│   ├── BenchmarkTable.tsx
│   ├── SearchFilter.tsx
│   ├── BenchRankDashboard.tsx
│   ├── theme-provider.tsx   # next-themes wrapper
│   └── ui/                  # shadcn/ui style primitives
├── lib/
│   ├── i18n/
│   │   ├── translations.ts         # zh / en dictionaries (type-safe)
│   │   └── language-context.tsx    # LanguageProvider + useLanguage hook
│   ├── types.ts            # shared TypeScript types
│   ├── normalize.ts        # RawBenchmarkResult -> BenchmarkResult
│   ├── ranking.ts          # weighted geometric mean ranking
│   └── utils.ts            # formatting & search matching helpers
├── data/
│   └── benchmarks.json
├── README.md
└── README.EN.md
```

## Data Format

`data/benchmarks.json` is a JSON array of groups:

```json
[
  {
    "group": "Insignificant-IO",
    "benchmarks": [
      {
        "name": "fannkuch-redux",
        "url": "https://.../performance/fannkuchredux.html",
        "data": [
          {
            "×": "1.0",
            "source": "C gcc",
            "link": "https://.../program/fannkuchredux-gcc-6.html",
            "secs": "2.14",
            "mem": "2,712",
            "gz": "1582",
            "cpu secs": "8.44"
          }
        ]
      }
    ]
  }
]
```

The app normalizes this into typed numeric records (`multiplier`, `secs`, `mem`, `gz`, `cpuSecs`), stripping thousands separators, converting strings to numbers, and handling special duration values such as `"5 min"` (→ 300 seconds). Unparseable values become `null` and are filtered out during scoring.

Only two groups are used for ranking:

- **Insignificant IO** — `fannkuch-redux`, `n-body`, `spectral-norm`
- **Significant IO** — `mandelbrot`, `fasta`, `k-nucleotide`, `reverse-complement`

## Ranking Algorithm

The ranking uses a **weighted geometric mean**:

```
Score = exp(Σ(wᵢ × ln(xᵢ)))
```

Where:

- `xᵢ` is the language's multiplier (time relative to the fastest program) for benchmark `i`. Lower is better.
- `wᵢ` is the benchmark's normalized weight: `groupWeight × (1 / benchmarksInGroup)`, re-normalized per language so that missing benchmarks don't penalize it.
- `Score` is the final geometric mean multiplier — **lower is better**. The table is sorted ascending.

Notes:

- Score is lower = better.
- Benchmark weights are dynamically adjustable via the sliders.
- Within a group, benchmarks share the group weight equally by default.
- Missing data is handled by re-normalizing the weights of the benchmarks the language actually participates in.
- Unusable multipliers (`null`, `NaN`, `Infinity`, non-positive values) are ignored, and `log(0)` is avoided.

## Language & Theme

- **Language** — defaults to Chinese. Toggle with the `EN` / `中文` button in the header. The choice is stored in `localStorage` (`benchrank-language`).
- **Theme** — light by default. Toggle light/dark with the sun/moon button in the header. The choice is stored in `localStorage` (`benchrank-theme`) via `next-themes`.

## Disclaimer

BenchRank does not claim to determine the "best" programming language. Results are based on a selected set of microbenchmarks and should not be interpreted as general-purpose programming language rankings.
