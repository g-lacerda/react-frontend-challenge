import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SEARCH_MAX_LENGTH, type MovieFilters } from '@/entities/movie'

interface FiltersState {
  filters: MovieFilters
  setQuery: (query: string) => void
  patch: (changes: Partial<MovieFilters>) => void
  reset: () => void
}

const initialFilters: MovieFilters = { query: '' }

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set) => ({
      filters: initialFilters,
      setQuery: (query) =>
        set((state) => ({ filters: { ...state.filters, query: query.slice(0, SEARCH_MAX_LENGTH) } })),
      patch: (changes) => set((state) => ({ filters: { ...state.filters, ...changes } })),
      reset: () => set({ filters: initialFilters }),
    }),
    { name: 'cinedash:filters', version: 1 },
  ),
)
