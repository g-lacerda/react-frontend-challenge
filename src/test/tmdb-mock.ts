import { vi } from 'vitest'
import type { GenreDto, MovieDto, PaginatedDto } from '@/entities/movie/api/dto'

export function makeMovieDto(overrides: Partial<MovieDto> = {}): MovieDto {
  return {
    id: 1,
    title: 'Filme de teste',
    overview: 'Sinopse.',
    poster_path: '/poster.jpg',
    backdrop_path: '/backdrop.jpg',
    release_date: '2020-05-10',
    vote_average: 7.5,
    vote_count: 1200,
    genre_ids: [28],
    original_language: 'en',
    ...overrides,
  }
}

function page(results: MovieDto[]): PaginatedDto<MovieDto> {
  return { page: 1, results, total_pages: 1, total_results: results.length }
}

const GENRES: GenreDto[] = [
  { id: 28, name: 'Ação' },
  { id: 18, name: 'Drama' },
]

interface MockConfig {
  movies?: MovieDto[]
  fail?: boolean
}

/**
 * Substitui o fetch global por respostas da TMDB, roteando pelo caminho da URL.
 * Devolve a função espiã para inspecionar as chamadas feitas.
 */
export function mockTmdb({ movies = [makeMovieDto()], fail = false }: MockConfig = {}) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input))

    if (fail) {
      return new Response('erro', { status: 500 })
    }

    const body = url.pathname.includes('/genre/movie/list')
      ? { genres: GENRES }
      : url.pathname.includes('/configuration/languages')
        ? [{ iso_639_1: 'en', english_name: 'English' }]
        : page(movies)

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  })

  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

/** URLs de busca de filmes chamadas até agora, ignorando gêneros e idiomas. */
export function movieRequests(fetchMock: ReturnType<typeof mockTmdb>) {
  return fetchMock.mock.calls
    .map(([input]) => new URL(String(input)))
    .filter((url) => !url.pathname.includes('/genre/') && !url.pathname.includes('/configuration/'))
}
