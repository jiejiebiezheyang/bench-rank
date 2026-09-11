# BenchRank

基于 [The Computer Language Benchmarks Game](https://benchmarksgame-team.pages.debian.net/benchmarksgame/index.html) 数据的编程语言性能可视化与动态排名网站。

BenchRank 不只是简单展示基准测试数据，而是允许你调整每个基准测试类别的权重，实时计算不同编程语言/语言实现的综合性能排名。

> English version: [README.EN.md](README.EN.md)

## 功能特性

- **动态排名** — 调整 _Insignificant IO_（CPU/计算）与 _Significant IO_（IO/数据处理）基准测试之间的权重，排名实时重新计算。
- **加权几何平均评分（时间优先）** — 排名使用 `exp(Σ(wᵢ × ln(ratioᵢ)))`（时间 80% + 内存 20%），最优语言恒为 1.0x，绝不使用普通算术平均。
- **权重预设** — 均衡（50/50）、计算密集型（75/25）、IO 密集型（25/75）。滑块始终保证总和为 100%。
- **覆盖率提示** — 缺少某些基准测试的语言仍可通过重新归一化其可用权重参与排名，并用视觉提示标记部分覆盖（如 `6/7`）。
- **排名图表** — Recharts 横向条形图，随滑块实时更新。
- **基准测试探索** — 展开任意基准测试卡片，查看完整的实现排名（时间 / 内存 / CPU 时间），并链接到官方源码页面。
- **搜索与分组筛选** — 按语言名或基准测试分组过滤排名表、图表和基准表；支持用 `;` 分隔多个关键词同时搜索（如 `Rust;Go`）。
- **中英文切换（中文 / English）** — 全站 UI 双语，默认中文，选择持久化到 localStorage。
- **亮暗主题切换** — 一键切换，默认亮色，选择持久化到 localStorage。
- **响应式 UI** — Tailwind CSS + shadcn/ui 风格组件，支持桌面、平板和移动端。

## 技术栈

- Next.js（App Router）
- TypeScript（严格模式，无 `any`）
- Tailwind CSS
- shadcn/ui 风格组件（Radix 原语 + CVA）
- Recharts
- Lucide React 图标

## 安装运行

```bash
npm install
npm run dev
```

然后打开 http://localhost:3000。

生产构建：

```bash
npm run build
npm start
```

## 项目结构

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
│   ├── theme-provider.tsx   # next-themes 封装
│   └── ui/                  # shadcn/ui 风格基础组件
├── lib/
│   ├── i18n/
│   │   ├── translations.ts         # 中英文翻译字典（类型安全）
│   │   └── language-context.tsx    # LanguageProvider + useLanguage hook
│   ├── types.ts            # 共享 TypeScript 类型
│   ├── normalize.ts        # RawBenchmarkResult -> BenchmarkResult
│   ├── ranking.ts          # 时间/内存加权几何平均排名算法
│   └── utils.ts            # 格式化与搜索匹配工具
├── data/
│   └── benchmarks.json
├── README.md
└── README.EN.md
```

## 数据格式

`data/benchmarks.json` 是分组的 JSON 数组：

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

应用会将其标准化为类型化的数字记录（`multiplier`、`secs`、`mem`、`gz`、`cpuSecs`）：去除千位分隔符、将字符串转为数字，并处理特殊时长值（如 `"5 min"` → 300 秒）。无法解析的值变为 `null`，在评分时被过滤。

排名只使用以下两个分组：

- **Insignificant IO** — `fannkuch-redux`、`n-body`、`spectral-norm`
- **Significant IO** — `mandelbrot`、`fasta`、`k-nucleotide`、`reverse-complement`

## 排名算法

排名使用**时间/内存组合加权几何平均**，时间权重优先：

```
ratioᵢ = timeᵢ^0.8 × memᵢ^0.2
Score  = exp(Σ(wᵢ × ln(ratioᵢ))) / best
```

其中：

- `timeᵢ` 是该语言在基准测试 `i` 中的时间倍率（相对最快程序的时间倍数）。
- `memᵢ` 是该语言在基准测试 `i` 中的内存倍率（相对该题最小内存的倍数）。
- `wᵢ` 是基准测试的归一化权重：`groupWeight × (1 / benchmarksInGroup)`，并按语言重新归一化，使缺失的基准测试不会惩罚该语言。
- `Score` 归一化后最优语言为 `1.0x`，其余为相对最优的倍数——**越低越好**，表格按升序排列。

说明：

- 得分越低越好，最优语言恒为 `1.0x`。
- 时间权重（80%）高于内存权重（20%）。
- 基准测试权重可通过滑块动态调整。
- 分组内部默认平均分配权重。
- 缺失数据（时间或内存任一缺失）会跳过该题并重新归一化该语言实际参与的基准测试权重。
- 不可用的数值（`null`、`NaN`、`Infinity`、非正数）会被忽略，并避免 `log(0)`。

## 语言与主题

- **语言** — 默认中文。通过 Header 中的 `EN` / `中文` 按钮切换，选择存储在 `localStorage`（`benchrank-language`）。
- **主题** — 默认亮色。通过 Header 中的太阳/月亮按钮切换亮/暗，选择通过 `next-themes` 存储在 `localStorage`（`benchrank-theme`）。

## 免责声明

BenchRank 不声称要评判"最佳"编程语言。结果基于一组选定的微基准测试，不应被解读为通用编程语言排名。
