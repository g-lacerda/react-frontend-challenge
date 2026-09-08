import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Movie } from '@/entities/movie'

export interface WatchlistItem extends Movie {
  addedAt: string
}

interface WatchlistState {
  items: WatchlistItem[]
  add: (movie: Movie) => void
  remove: (id: number) => void
  clear: () => void
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set) => ({
      items: [],
      add: (movie) =>
        set((state) =>
          state.items.some((item) => item.id === movie.id)
            ? state
            : { items: [{ ...movie, addedAt: new Date().toISOString() }, ...state.items] },
        ),
      remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'cinedash:watchlist' },
  ),
)

export function useIsInWatchlist(id: number) {
  return useWatchlistStore((state) => state.items.some((item) => item.id === id))
}
