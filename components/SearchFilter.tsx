'use client'

import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { useLanguage } from '@/lib/i18n/language-context'

interface SearchFilterProps {
  search: string
  onSearchChange: (value: string) => void
}

export function SearchFilter({ search, onSearchChange }: SearchFilterProps) {
  const { t } = useLanguage()

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={search}
        onChange={event => onSearchChange(event.target.value)}
        placeholder={t('searchPlaceholder')}
        aria-label={t('searchPlaceholder')}
        className="pl-9"
      />
    </div>
  )
}
