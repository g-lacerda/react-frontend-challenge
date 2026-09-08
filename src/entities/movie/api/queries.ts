import { keepPreviousData, queryOptions, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useLocaleStore, type Locale } from '@/shared/i18n'
import { filterMovies, hasActiveFilters } from '../lib/filter-movies'
import type { Movie, MovieFilters, Paginated } from '../model/types'
import { movieApi } from './movie-api'
import { movieKeys } from './query-keys'

const TMDB_MAX_PAGE = 500

/**
 * Decide qual endpoint da TMDB atende ao estado atual dos filtros.
 * A busca por título não aceita gênero, nota nem idioma, então esses ficam no cliente.
 */
export function fetchMoviesPage(
  filters: MovieFilters,
  page: number,
  language: Locale,
  signal?: AbortSignal,
): Promise<Paginated<Movie>> {
  const query = filters.query?.trim()

  if (query) {
    return movieApi.search({ query, year: filters.year, page, language }, signal).then((result) => ({
      ...result,
      results: filterMovies(result.results, { ...filters, year: undefined }),
    }))
  }

  if (hasActiveFilters(filters)) {
    return movieApi.discover({ filters, page, language }, signal)
  }

  return movieApi.trending({ page, language }, signal)
}

export function useInfiniteMovies(filters: MovieFilters) {
  const language = useLocaleStore((state) => state.locale)

  return useInfiniteQuery({
    queryKey: movieKeys.list(language, filters),
    queryFn: ({ pageParam, signal }) => fetchMoviesPage(filters, pageParam, language, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages && lastPage.page < TMDB_MAX_PAGE ? lastPage.page + 1 : undefined,
    placeholderData: keepPreviousData,
  })
}

export function useGenres() {
  const language = useLocaleStore((state) => state.locale)

  return useQuery({
    queryKey: movieKeys.genres(language),
    queryFn: ({ signal }) => movieApi.genres({ language }, signal),
    staleTime: Infinity,
  })
}

export function useLanguages() {
  return useQuery({
    queryKey: movieKeys.languages(),
    queryFn: ({ signal }) => movieApi.languages(signal),
    staleTime: Infinity,
  })
}

export function movieDetailsOptions(id: number, language: Locale) {
  return queryOptions({
    queryKey: movieKeys.details(language, id),
    queryFn: ({ signal }) => movieApi.details({ id, language }, signal),
  })
}

export function useMovieDetails(id: number) {
  const language = useLocaleStore((state) => state.locale)
  return useQuery(movieDetailsOptions(id, language))
}
