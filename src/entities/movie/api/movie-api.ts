import { tmdbGet } from '@/shared/api/tmdb-client'
import type { Locale } from '@/shared/i18n'
import type { Genre, Movie, MovieDetails, MovieFilters, Paginated } from '../model/types'
import type { GenreDto, MovieDetailsDto, MovieDto, PaginatedDto } from './dto'
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

  async search({ query, page, language }: ListParams & { query: string }, signal?: AbortSignal): Promise<Paginated<Movie>> {
    const dto = await tmdbGet<PaginatedDto<MovieDto>>('/search/movie', { query, page, language }, signal)
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
        sort_by: 'popularity.desc',
        with_genres: filters.genreId,
        primary_release_year: filters.year,
        'vote_average.gte': filters.minRating,
        'vote_count.gte': filters.minRating ? 50 : undefined,
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
}
