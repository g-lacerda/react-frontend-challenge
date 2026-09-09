import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LOCALES, type Locale } from './types'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export function detectLocale(language = navigator.language): Locale {
  const lower = language.toLowerCase()
  if (lower.startsWith('pt')) return 'pt-BR'
  if (lower.startsWith('es')) return 'es-ES'
  return 'en-US'
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: detectLocale(),
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'cinedash:locale' },
  ),
)

function applyLocale(locale: Locale) {
  document.documentElement.lang = locale
}

applyLocale(useLocaleStore.getState().locale)
useLocaleStore.subscribe((state) => applyLocale(state.locale))
