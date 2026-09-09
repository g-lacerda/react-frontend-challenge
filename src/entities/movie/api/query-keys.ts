import type { Locale } from '@/shared/i18n'
import type { MovieFilters } from '../model/types'

export const movieKeys = {
  all: ['movies'] as const,
  lists: () => [...movieKeys.all, 'list'] as const,
  list: (locale: Locale, filters: MovieFilters) => [...movieKeys.lists(), locale, filters] as const,
  details: (locale: Locale, id: number) => [...movieKeys.all, 'details', locale, id] as const,
  genres: (locale: Locale) => [...movieKeys.all, 'genres', locale] as const,
  languages: () => [...movieKeys.all, 'languages'] as const,
}
