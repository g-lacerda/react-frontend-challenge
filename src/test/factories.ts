import type { Movie, MovieDetails } from '@/entities/movie'

let nextId = 1

export function makeMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    id: nextId++,
    title: 'Filme de teste',
    overview: 'Uma sinopse qualquer.',
    posterPath: '/poster.jpg',
    backdropPath: '/backdrop.jpg',
    releaseDate: '2020-05-10',
    voteAverage: 7.5,
    voteCount: 1200,
    genreIds: [28, 12],
    originalLanguage: 'en',
    ...overrides,
  }
}

export function makeMovieDetails(overrides: Partial<MovieDetails> = {}): MovieDetails {
  const { genreIds: _ignored, ...base } = makeMovie()

  return {
    ...base,
    genres: [{ id: 28, name: 'Ação' }],
    runtime: 139,
    tagline: 'Uma frase de efeito.',
    cast: [],
    trailerKey: null,
    ...overrides,
  }
}
