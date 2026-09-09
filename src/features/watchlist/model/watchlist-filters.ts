export interface WatchlistFilterValues {
  query: string
  genre?: string
  year?: number
  minRating?: number
  maxRating?: number
  language?: string
  minVotes?: number
}

export const EMPTY_WATCHLIST_FILTERS: WatchlistFilterValues = { query: '' }

export function countActiveWatchlistFilters(filters: WatchlistFilterValues): number {
  return [
    filters.genre,
    filters.year,
    filters.minRating !== undefined || filters.maxRating !== undefined,
    filters.language,
    filters.minVotes,
  ].filter(Boolean).length
}
