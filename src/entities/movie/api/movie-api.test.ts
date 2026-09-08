import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockTmdb } from '@/test/tmdb-mock'
import { movieApi } from './movie-api'

let fetchMock: ReturnType<typeof mockTmdb>

function ultimaUrl() {
  const chamadas = fetchMock.mock.calls
  return new URL(String(chamadas[chamadas.length - 1]?.[0]))
}

function parametros() {
  return Object.fromEntries(ultimaUrl().searchParams)
}

describe('movieApi', () => {
  beforeEach(() => {
    fetchMock = mockTmdb()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('busca tendências da semana com idioma e página', async () => {
    await movieApi.trending({ page: 3, language: 'pt-BR' })

    expect(ultimaUrl().pathname).toBe('/3/trending/movie/week')
    expect(parametros()).toMatchObject({ page: '3', language: 'pt-BR' })
  })

  it('envia o termo buscado e exclui conteúdo adulto', async () => {
    await movieApi.search({ query: 'duna', page: 1, language: 'pt-BR' })

    expect(ultimaUrl().pathname).toBe('/3/search/movie')
    expect(parametros()).toMatchObject({ query: 'duna', include_adult: 'false' })
  })

  it('omite parâmetros indefinidos em vez de mandar vazio', async () => {
    await movieApi.discover({ filters: {}, page: 1, language: 'pt-BR' })

    expect(parametros()).not.toHaveProperty('with_genres')
    expect(parametros()).not.toHaveProperty('primary_release_year')
  })

  it('traduz cada filtro para o parâmetro correspondente da API', async () => {
    await movieApi.discover({
      filters: {
        genreId: 28,
        year: 2021,
        minRating: 7,
        maxRating: 9,
        minRuntime: 90,
        maxRuntime: 150,
        originalLanguage: 'ko',
        sortBy: 'vote_average.desc',
      },
      page: 1,
      language: 'pt-BR',
    })

    expect(parametros()).toMatchObject({
      with_genres: '28',
      primary_release_year: '2021',
      'vote_average.gte': '7',
      'vote_average.lte': '9',
      'with_runtime.gte': '90',
      'with_runtime.lte': '150',
      with_original_language: 'ko',
      sort_by: 'vote_average.desc',
    })
  })

  // Sem um piso de votos, "nota 9 ou mais" traz filmes com dois votos e nota 10.
  it('aplica um mínimo de votos quando há filtro de nota e o usuário não definiu um', async () => {
    await movieApi.discover({ filters: { minRating: 9 }, page: 1, language: 'pt-BR' })

    expect(parametros()['vote_count.gte']).toBe('50')
  })

  it('respeita o mínimo de votos escolhido pelo usuário', async () => {
    await movieApi.discover({ filters: { minRating: 9, minVotes: 5000 }, page: 1, language: 'pt-BR' })

    expect(parametros()['vote_count.gte']).toBe('5000')
  })

  it('não impõe mínimo de votos quando não há filtro de nota', async () => {
    await movieApi.discover({ filters: { genreId: 28 }, page: 1, language: 'pt-BR' })

    expect(parametros()).not.toHaveProperty('vote_count.gte')
  })

  it('ordena por popularidade quando nada é escolhido', async () => {
    await movieApi.discover({ filters: { genreId: 28 }, page: 1, language: 'pt-BR' })

    expect(parametros().sort_by).toBe('popularity.desc')
  })

  // Elenco e vídeos vêm na mesma requisição para não fazer três chamadas por filme.
  it('pede elenco e vídeos junto com os detalhes', async () => {
    await movieApi.details({ id: 550, language: 'pt-BR' })

    expect(ultimaUrl().pathname).toBe('/3/movie/550')
    expect(parametros().append_to_response).toBe('credits,videos')
  })

  it('descarta o idioma sem código da lista de idiomas', async () => {
    const idiomas = await movieApi.languages()

    expect(idiomas.every((idioma) => idioma.code !== 'xx')).toBe(true)
  })
})
