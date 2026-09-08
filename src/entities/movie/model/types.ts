export interface Genre {
  id: number
  name: string
}

export interface Language {
  code: string
  englishName: string
}

export interface Movie {
  id: number
  title: string
  overview: string
  posterPath: string | null
  backdropPath: string | null
  releaseDate: string | null
  voteAverage: number
  voteCount: number
  genreIds: number[]
  originalLanguage: string
}

export interface CastMember {
  id: number
  name: string
  character: string
  profilePath: string | null
}

export interface MovieDetails extends Omit<Movie, 'genreIds'> {
  genres: Genre[]
  runtime: number | null
  tagline: string
  cast: CastMember[]
  trailerKey: string | null
}

export interface Paginated<T> {
  page: number
  results: T[]
  totalPages: number
  totalResults: number
}

export const SORT_OPTIONS = [
  'popularity.desc',
  'popularity.asc',
  'vote_average.desc',
  'vote_average.asc',
  'primary_release_date.desc',
  'primary_release_date.asc',
  'revenue.desc',
] as const

export type SortOption = (typeof SORT_OPTIONS)[number]

/** A TMDB recusa buscas acima disso com erro 400. */
export const SEARCH_MAX_LENGTH = 500

export interface MovieFilters {
  query?: string
  genreId?: number
  year?: number
  minRating?: number
  maxRating?: number
  sortBy?: SortOption
  minRuntime?: number
  maxRuntime?: number
  originalLanguage?: string
  minVotes?: number
}
