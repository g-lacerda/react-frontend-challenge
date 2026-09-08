import { describe, expect, it } from 'vitest'
import { makeMovie } from '@/test/factories'
import { countActiveFilters, filterMovies, hasActiveFilters, matchesFilters, releaseYear } from './filter-movies'

describe('releaseYear', () => {
  it('extrai o ano da data de lançamento', () => {
    expect(releaseYear(makeMovie({ releaseDate: '1999-10-15' }))).toBe(1999)
  })

  it('devolve nulo quando o filme não tem data', () => {
    expect(releaseYear(makeMovie({ releaseDate: null }))).toBeNull()
  })

  it('devolve nulo quando a data vem em formato inesperado', () => {
    expect(releaseYear(makeMovie({ releaseDate: 'em breve' }))).toBeNull()
  })
})

describe('matchesFilters', () => {
  const movie = makeMovie({
    genreIds: [28, 12],
    releaseDate: '2020-05-10',
    voteAverage: 7.5,
    voteCount: 1200,
    originalLanguage: 'en',
  })

  it('aceita o filme quando não há filtro', () => {
    expect(matchesFilters(movie, {})).toBe(true)
  })

  it('filtra por gênero considerando todos os gêneros do filme', () => {
    expect(matchesFilters(movie, { genreId: 12 })).toBe(true)
    expect(matchesFilters(movie, { genreId: 99 })).toBe(false)
  })

  it('filtra por ano de lançamento', () => {
    expect(matchesFilters(movie, { year: 2020 })).toBe(true)
    expect(matchesFilters(movie, { year: 2021 })).toBe(false)
  })

  it('trata o intervalo de nota como inclusivo nas duas pontas', () => {
    expect(matchesFilters(movie, { minRating: 7.5 })).toBe(true)
    expect(matchesFilters(movie, { maxRating: 7.5 })).toBe(true)
    expect(matchesFilters(movie, { minRating: 7.6 })).toBe(false)
    expect(matchesFilters(movie, { maxRating: 7.4 })).toBe(false)
  })

  it('aceita nota máxima igual a zero, que é um valor válido', () => {
    expect(matchesFilters(makeMovie({ voteAverage: 0 }), { maxRating: 0 })).toBe(true)
    expect(matchesFilters(movie, { maxRating: 0 })).toBe(false)
  })

  it('filtra por idioma original e por mínimo de votos', () => {
    expect(matchesFilters(movie, { originalLanguage: 'en' })).toBe(true)
    expect(matchesFilters(movie, { originalLanguage: 'ko' })).toBe(false)
    expect(matchesFilters(movie, { minVotes: 1200 })).toBe(true)
    expect(matchesFilters(movie, { minVotes: 1201 })).toBe(false)
  })

  it('exige que todos os filtros combinados passem', () => {
    expect(matchesFilters(movie, { genreId: 28, year: 2020, minRating: 7 })).toBe(true)
    expect(matchesFilters(movie, { genreId: 28, year: 2019, minRating: 7 })).toBe(false)
  })

  it('ignora filtros que só a API entende', () => {
    expect(matchesFilters(movie, { sortBy: 'vote_average.desc', minRuntime: 300 })).toBe(true)
  })
})

describe('filterMovies', () => {
  it('mantém apenas os filmes que passam em todos os filtros', () => {
    const acao = makeMovie({ title: 'Ação', genreIds: [28], voteAverage: 8 })
    const drama = makeMovie({ title: 'Drama', genreIds: [18], voteAverage: 9 })

    expect(filterMovies([acao, drama], { genreId: 28 })).toEqual([acao])
  })

  it('devolve a lista inteira quando não há filtro', () => {
    const movies = [makeMovie(), makeMovie()]
    expect(filterMovies(movies, {})).toHaveLength(2)
  })
})

describe('countActiveFilters', () => {
  it('não conta a busca por texto, que é contada à parte', () => {
    expect(countActiveFilters({ query: 'duna' })).toBe(0)
  })

  it('conta o intervalo de nota como um filtro só', () => {
    expect(countActiveFilters({ minRating: 5, maxRating: 9 })).toBe(1)
  })

  it('soma filtros de grupos diferentes', () => {
    expect(countActiveFilters({ genreId: 28, year: 2020, originalLanguage: 'ko' })).toBe(3)
  })

  it('reconhece quando existe ao menos um filtro ativo', () => {
    expect(hasActiveFilters({})).toBe(false)
    expect(hasActiveFilters({ query: 'duna' })).toBe(false)
    expect(hasActiveFilters({ genreId: 28 })).toBe(true)
  })
})
