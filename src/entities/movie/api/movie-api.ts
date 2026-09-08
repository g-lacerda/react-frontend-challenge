import { tmdbGet } from '@/shared/api/tmdb-client'
import type { Genre, Movie, MovieDetails, MovieFilters, Paginated } from '../model/types'
import type { GenreDto, MovieDetailsDto, MovieDto, PaginatedDto } from './dto'
import { toMovie, toMovieDetails, toPaginated } from './mappers'

export const movieApi = {
  async trending(page: number, signal?: AbortSignal): Promise<Paginated<Movie>> {
    const dto = await tmdbGet<PaginatedDto<MovieDto>>('/trending/movie/week', { page }, signal)
    return toPaginated(dto, toMovie)
  },

  async search(query: string, page: number, signal?: AbortSignal): Promise<Paginated<Movie>> {
    const dto = await tmdbGet<PaginatedDto<MovieDto>>('/search/movie', { query, page }, signal)
    return toPaginated(dto, toMovie)
  },

  async discover(filters: MovieFilters, page: number, signal?: AbortSignal): Promise<Paginated<Movie>> {
    const dto = await tmdbGet<PaginatedDto<MovieDto>>(
      '/discover/movie',
      {
        page,
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

  async details(id: number, signal?: AbortSignal): Promise<MovieDetails> {
    const dto = await tmdbGet<MovieDetailsDto>(`/movie/${id}`, { append_to_response: 'credits,videos' }, signal)
    return toMovieDetails(dto)
  },

  async genres(signal?: AbortSignal): Promise<Genre[]> {
    const dto = await tmdbGet<{ genres: GenreDto[] }>('/genre/movie/list', {}, signal)
    return dto.genres
  },
}
