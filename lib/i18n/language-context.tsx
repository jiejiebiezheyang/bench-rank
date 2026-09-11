'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import {
  translate,
  type Language,
  type TranslationKey,
  type TranslationParams
} from '@/lib/i18n/translations'

const STORAGE_KEY = 'benchrank-language'
const DEFAULT_LANGUAGE: Language = 'en'

function readStoredLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'en' || stored === 'zh' ? stored : DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  /** Translate a key in the current language, interpolating `{param}` values. */
  t: (key: TranslationKey, params?: TranslationParams) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE)

  // Hydrate the stored preference after mount (avoids SSR mismatch).
  useEffect(() => {
    setLanguageState(readStoredLanguage())
  }, [])

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage may be unavailable (private mode); the in-memory state still works.
    }
    document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en'
  }, [])

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
  }, [language])

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) => translate(language, key, params),
    [language]
  )

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
