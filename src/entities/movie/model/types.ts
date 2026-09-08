export interface Genre {
  id: number
  name: string
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

export interface MovieFilters {
  query?: string
  genreId?: number
  year?: number
  minRating?: number
}
