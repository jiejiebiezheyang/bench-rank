import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US')
}

/**
 * Format a multiplier as "1.00x" keeping trailing decimals trimmed but >= 2.
 */
export function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}x`
}

/**
 * Format seconds with a unit. Values >= 60 are shown in minutes.
 */
export function formatTime(value: number | null): string {
  if (value === null || Number.isNaN(value)) return 'N/A'
  if (value >= 60) return `${(value / 60).toFixed(1)} min`
  return `${value.toFixed(2)}s`
}

/**
 * Format memory (in KB) as KB / MB.
 */
export function formatMemory(kb: number | null): string {
  if (kb === null || Number.isNaN(kb)) return 'N/A'
  if (kb >= 1024) return `${formatNumber(kb)} KB`
  return `${formatNumber(kb)} KB`
}

/**
 * Case-insensitive search matching. Multiple terms can be separated with ";"
 * (e.g. "Rust;Go"): the source matches when it contains ANY of the terms.
 * An empty/whitespace-only query matches everything.
 */
export function matchesSearch(source: string, search: string): boolean {
  const terms = search
    .split(';')
    .map(term => term.trim().toLowerCase())
    .filter(term => term.length > 0)
  if (terms.length === 0) return true
  const lowerSource = source.toLowerCase()
  return terms.some(term => lowerSource.includes(term))
}
