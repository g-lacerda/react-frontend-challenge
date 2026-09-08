export interface MovieDto {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date?: string
  vote_average: number
  vote_count: number
  genre_ids?: number[]
}

export interface GenreDto {
  id: number
  name: string
}

export interface CastMemberDto {
  id: number
  name: string
  character: string
  profile_path: string | null
}

export interface VideoDto {
  key: string
  site: string
  type: string
  official: boolean
}

export interface MovieDetailsDto extends Omit<MovieDto, 'genre_ids'> {
  genres: GenreDto[]
  runtime: number | null
  tagline: string
  credits: { cast: CastMemberDto[] }
  videos: { results: VideoDto[] }
}

export interface PaginatedDto<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}
