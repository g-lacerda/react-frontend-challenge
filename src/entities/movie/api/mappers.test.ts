import { describe, expect, it } from 'vitest'
import type { MovieDetailsDto, MovieDto, VideoDto } from './dto'
import { pickTrailerKey, toMovie, toMovieDetails, toPaginated } from './mappers'

function makeDto(overrides: Partial<MovieDto> = {}): MovieDto {
  return {
    id: 550,
    title: 'Clube da Luta',
    overview: 'Sinopse.',
    poster_path: '/poster.jpg',
    backdrop_path: '/backdrop.jpg',
    release_date: '1999-10-15',
    vote_average: 8.4,
    vote_count: 30500,
    genre_ids: [18, 53],
    original_language: 'en',
    ...overrides,
  }
}

function makeVideo(overrides: Partial<VideoDto> = {}): VideoDto {
  return { key: 'abc', site: 'YouTube', type: 'Trailer', official: true, ...overrides }
}

describe('toMovie', () => {
  it('converte o formato da API para o formato da aplicação', () => {
    expect(toMovie(makeDto())).toEqual({
      id: 550,
      title: 'Clube da Luta',
      overview: 'Sinopse.',
      posterPath: '/poster.jpg',
      backdropPath: '/backdrop.jpg',
      releaseDate: '1999-10-15',
      voteAverage: 8.4,
      voteCount: 30500,
      genreIds: [18, 53],
      originalLanguage: 'en',
    })
  })

  it('normaliza data vazia para nulo', () => {
    expect(toMovie(makeDto({ release_date: '' })).releaseDate).toBeNull()
  })

  // A TMDB às vezes omite estes campos; sem tratamento a interface quebra ao renderizar.
  it('sobrevive a campos ausentes na resposta', () => {
    const parcial = makeDto()
    delete parcial.genre_ids
    delete parcial.original_language
    delete parcial.release_date

    const movie = toMovie(parcial)

    expect(movie.genreIds).toEqual([])
    expect(movie.originalLanguage).toBe('')
    expect(movie.releaseDate).toBeNull()
  })
})

describe('pickTrailerKey', () => {
  it('prefere o trailer oficial do YouTube', () => {
    const videos = [
      makeVideo({ key: 'nao-oficial', official: false }),
      makeVideo({ key: 'oficial', official: true }),
    ]

    expect(pickTrailerKey(videos)).toBe('oficial')
  })

  it('aceita trailer não oficial quando não há oficial', () => {
    expect(pickTrailerKey([makeVideo({ key: 'qualquer', official: false })])).toBe('qualquer')
  })

  it('cai para o teaser quando não há nenhum trailer', () => {
    expect(pickTrailerKey([makeVideo({ key: 'teaser', type: 'Teaser' })])).toBe('teaser')
  })

  it('descarta vídeos que não são do YouTube', () => {
    expect(pickTrailerKey([makeVideo({ key: 'vimeo', site: 'Vimeo' })])).toBeNull()
  })

  it('devolve nulo quando não há vídeo algum', () => {
    expect(pickTrailerKey([])).toBeNull()
  })
})

describe('toMovieDetails', () => {
  function makeDetailsDto(overrides: Partial<MovieDetailsDto> = {}): MovieDetailsDto {
    const { genre_ids: _ignored, ...base } = makeDto()

    return {
      ...base,
      genres: [{ id: 18, name: 'Drama' }],
      runtime: 139,
      tagline: 'Uma frase.',
      credits: { cast: [] },
      videos: { results: [] },
      ...overrides,
    }
  }

  it('coloca quem tem foto antes de quem não tem', () => {
    const details = toMovieDetails(
      makeDetailsDto({
        credits: {
          cast: [
            { id: 1, name: 'Sem foto', character: 'A', profile_path: null },
            { id: 2, name: 'Com foto', character: 'B', profile_path: '/foto.jpg' },
          ],
        },
      }),
    )

    expect(details.cast.map((member) => member.name)).toEqual(['Com foto', 'Sem foto'])
  })

  it('limita o elenco a doze pessoas', () => {
    const cast = Array.from({ length: 30 }, (_, index) => ({
      id: index,
      name: `Pessoa ${index}`,
      character: 'Papel',
      profile_path: '/foto.jpg',
    }))

    expect(toMovieDetails(makeDetailsDto({ credits: { cast } })).cast).toHaveLength(12)
  })

  it('resolve o trailer a partir dos vídeos', () => {
    const details = toMovieDetails(makeDetailsDto({ videos: { results: [makeVideo({ key: 'xyz' })] } }))
    expect(details.trailerKey).toBe('xyz')
  })
})

describe('toPaginated', () => {
  it('converte a paginação e aplica o adaptador em cada item', () => {
    const page = toPaginated({ page: 2, results: [makeDto()], total_pages: 10, total_results: 200 }, toMovie)

    expect(page).toMatchObject({ page: 2, totalPages: 10, totalResults: 200 })
    expect(page.results[0]?.title).toBe('Clube da Luta')
  })
})
