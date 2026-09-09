import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeMovie } from '@/test/factories'
import { movieApi } from './movie-api'
import { fetchMoviesPage } from './queries'

const pagina = { page: 1, results: [makeMovie()], totalPages: 1, totalResults: 1 }

describe('fetchMoviesPage', () => {
  beforeEach(() => {
    vi.spyOn(movieApi, 'trending').mockResolvedValue(pagina)
    vi.spyOn(movieApi, 'search').mockResolvedValue(pagina)
    vi.spyOn(movieApi, 'discover').mockResolvedValue(pagina)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('usa tendências quando não há busca nem filtro', async () => {
    await fetchMoviesPage({}, 1, 'pt-BR')

    expect(movieApi.trending).toHaveBeenCalledWith({ page: 1, language: 'pt-BR' }, undefined)
    expect(movieApi.search).not.toHaveBeenCalled()
    expect(movieApi.discover).not.toHaveBeenCalled()
  })

  it('usa descoberta quando há filtro e não há busca', async () => {
    await fetchMoviesPage({ genreId: 28 }, 2, 'pt-BR')

    expect(movieApi.discover).toHaveBeenCalledWith({ filters: { genreId: 28 }, page: 2, language: 'pt-BR' }, undefined)
    expect(movieApi.trending).not.toHaveBeenCalled()
  })

  it('usa busca quando há texto, mesmo com filtros', async () => {
    await fetchMoviesPage({ query: 'duna', genreId: 28 }, 1, 'pt-BR')

    expect(movieApi.search).toHaveBeenCalled()
    expect(movieApi.discover).not.toHaveBeenCalled()
  })

  it('ignora busca composta apenas de espaços', async () => {
    await fetchMoviesPage({ query: '   ' }, 1, 'pt-BR')

    expect(movieApi.trending).toHaveBeenCalled()
    expect(movieApi.search).not.toHaveBeenCalled()
  })

  // O endpoint de busca aceita ano, então ele vai para a API em vez do cliente.
  it('delega o ano à API na busca por título', async () => {
    await fetchMoviesPage({ query: 'duna', year: 2021 }, 1, 'pt-BR')

    expect(movieApi.search).toHaveBeenCalledWith(
      { query: 'duna', year: 2021, page: 1, language: 'pt-BR' },
      undefined,
    )
  })

  it('aplica no cliente os filtros que a busca não aceita', async () => {
    const acao = makeMovie({ title: 'Ação', genreIds: [28] })
    const drama = makeMovie({ title: 'Drama', genreIds: [18] })
    vi.spyOn(movieApi, 'search').mockResolvedValue({ ...pagina, results: [acao, drama] })

    const resultado = await fetchMoviesPage({ query: 'filme', genreId: 28 }, 1, 'pt-BR')

    expect(resultado.results.map((movie) => movie.title)).toEqual(['Ação'])
  })

  // O ano já foi filtrado pela API; refiltrar descartaria filmes válidos.
  it('não refiltra o ano no cliente depois de enviá-lo à API', async () => {
    const semData = makeMovie({ title: 'Sem data', releaseDate: null })
    vi.spyOn(movieApi, 'search').mockResolvedValue({ ...pagina, results: [semData] })

    const resultado = await fetchMoviesPage({ query: 'filme', year: 2021 }, 1, 'pt-BR')

    expect(resultado.results).toHaveLength(1)
  })

  // A TMDB recusa buscas acima de 500 caracteres com erro 400.
  it('corta a busca no limite aceito pela API', async () => {
    const gigante = 'a'.repeat(700)
    await fetchMoviesPage({ query: gigante }, 1, 'pt-BR')

    expect(movieApi.search).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'a'.repeat(500) }),
      undefined,
    )
  })

  it('repassa o sinal de cancelamento adiante', async () => {
    const signal = new AbortController().signal
    await fetchMoviesPage({}, 1, 'pt-BR', signal)

    expect(movieApi.trending).toHaveBeenCalledWith(expect.anything(), signal)
  })
})
