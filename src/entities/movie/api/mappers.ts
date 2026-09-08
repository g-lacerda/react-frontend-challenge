import type { CastMember, Movie, MovieDetails, Paginated } from '../model/types'
import type { CastMemberDto, MovieDetailsDto, MovieDto, PaginatedDto, VideoDto } from './dto'

export function toMovie(dto: MovieDto): Movie {
  return {
    id: dto.id,
    title: dto.title,
    overview: dto.overview,
    posterPath: dto.poster_path,
    backdropPath: dto.backdrop_path,
    releaseDate: dto.release_date || null,
    voteAverage: dto.vote_average,
    voteCount: dto.vote_count,
    genreIds: dto.genre_ids ?? [],
  }
}

function toCastMember(dto: CastMemberDto): CastMember {
  return {
    id: dto.id,
    name: dto.name,
    character: dto.character,
    profilePath: dto.profile_path,
  }
}

export function pickTrailerKey(videos: VideoDto[]): string | null {
  const youtube = videos.filter((video) => video.site === 'YouTube')
  const trailer =
    youtube.find((video) => video.type === 'Trailer' && video.official) ??
    youtube.find((video) => video.type === 'Trailer') ??
    youtube.find((video) => video.type === 'Teaser')

  return trailer?.key ?? null
}

export function toMovieDetails(dto: MovieDetailsDto): MovieDetails {
  const { genres, runtime, tagline, credits, videos, ...base } = dto

  return {
    ...toMovie(base),
    genres,
    runtime,
    tagline,
    cast: credits.cast.slice(0, 12).map(toCastMember),
    trailerKey: pickTrailerKey(videos.results),
  }
}

export function toPaginated<TDto, TModel>(
  dto: PaginatedDto<TDto>,
  mapItem: (item: TDto) => TModel,
): Paginated<TModel> {
  return {
    page: dto.page,
    results: dto.results.map(mapItem),
    totalPages: dto.total_pages,
    totalResults: dto.total_results,
  }
}
