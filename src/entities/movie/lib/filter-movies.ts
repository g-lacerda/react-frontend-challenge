import type { Movie, MovieFilters } from '../model/types'

export function releaseYear(movie: Pick<Movie, 'releaseDate'>): number | null {
  if (!movie.releaseDate) return null
  const year = Number(movie.releaseDate.slice(0, 4))
  return Number.isNaN(year) ? null : year
}

export function matchesFilters(movie: Movie, filters: MovieFilters): boolean {
  if (filters.genreId && !movie.genreIds.includes(filters.genreId)) return false
  if (filters.year && releaseYear(movie) !== filters.year) return false
  if (filters.minRating && movie.voteAverage < filters.minRating) return false
  if (filters.maxRating !== undefined && movie.voteAverage > filters.maxRating) return false
  if (filters.originalLanguage && movie.originalLanguage !== filters.originalLanguage) return false
  if (filters.minVotes && movie.voteCount < filters.minVotes) return false
  return true
}

export function filterMovies(movies: Movie[], filters: MovieFilters): Movie[] {
  return movies.filter((movie) => matchesFilters(movie, filters))
}

const DISCOVER_ONLY_KEYS = ['sortBy', 'minRuntime', 'maxRuntime'] as const satisfies readonly (keyof MovieFilters)[]

export function isDiscoverOnly(key: keyof MovieFilters): boolean {
  return (DISCOVER_ONLY_KEYS as readonly string[]).includes(key)
}

export function countActiveFilters(filters: MovieFilters): number {
  const groups = [
    filters.genreId,
    filters.year,
    filters.minRating !== undefined || filters.maxRating !== undefined,
    filters.sortBy,
    filters.minRuntime !== undefined || filters.maxRuntime !== undefined,
    filters.originalLanguage,
    filters.minVotes,
  ]
  return groups.filter(Boolean).length
}

export function hasActiveFilters(filters: MovieFilters): boolean {
  return countActiveFilters(filters) > 0
}
