import { tmdbGet } from '@/shared/api/tmdb-client'
import type { Locale } from '@/shared/i18n'
import type { Genre, Language, Movie, MovieDetails, MovieFilters, Paginated } from '../model/types'
import type { GenreDto, LanguageDto, MovieDetailsDto, MovieDto, PaginatedDto } from './dto'
import { toMovie, toMovieDetails, toPaginated } from './mappers'

interface ListParams {
  page: number
  language: Locale
}

export const movieApi = {
  async trending({ page, language }: ListParams, signal?: AbortSignal): Promise<Paginated<Movie>> {
    const dto = await tmdbGet<PaginatedDto<MovieDto>>('/trending/movie/week', { page, language }, signal)
    return toPaginated(dto, toMovie)
  },

  async search(
    { query, year, page, language }: ListParams & { query: string; year?: number },
    signal?: AbortSignal,
  ): Promise<Paginated<Movie>> {
    const dto = await tmdbGet<PaginatedDto<MovieDto>>(
      '/search/movie',
      { query, page, language, primary_release_year: year, include_adult: false },
      signal,
    )
    return toPaginated(dto, toMovie)
  },

  async discover(
    { filters, page, language }: ListParams & { filters: MovieFilters },
    signal?: AbortSignal,
  ): Promise<Paginated<Movie>> {
    const dto = await tmdbGet<PaginatedDto<MovieDto>>(
      '/discover/movie',
      {
        page,
        language,
        sort_by: filters.sortBy ?? 'popularity.desc',
        include_adult: false,
        with_genres: filters.genreId,
        primary_release_year: filters.year,
        'vote_average.gte': filters.minRating,
        'vote_average.lte': filters.maxRating,
        'vote_count.gte': filters.minVotes ?? (filters.minRating || filters.maxRating !== undefined ? 50 : undefined),
        'with_runtime.gte': filters.minRuntime,
        'with_runtime.lte': filters.maxRuntime,
        with_original_language: filters.originalLanguage,
      },
      signal,
    )
    return toPaginated(dto, toMovie)
  },

  async details({ id, language }: { id: number; language: Locale }, signal?: AbortSignal): Promise<MovieDetails> {
    const dto = await tmdbGet<MovieDetailsDto>(
      `/movie/${id}`,
      { language, append_to_response: 'credits,videos' },
      signal,
    )
    return toMovieDetails(dto)
  },

  async genres({ language }: { language: Locale }, signal?: AbortSignal): Promise<Genre[]> {
    const dto = await tmdbGet<{ genres: GenreDto[] }>('/genre/movie/list', { language }, signal)
    return dto.genres
  },

  async languages(signal?: AbortSignal): Promise<Language[]> {
    const dto = await tmdbGet<LanguageDto[]>('/configuration/languages', {}, signal)
    return dto
      .filter((item) => item.iso_639_1 !== 'xx')
      .map((item) => ({ code: item.iso_639_1, englishName: item.english_name }))
  },
}
