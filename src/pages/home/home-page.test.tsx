import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFiltersStore } from '@/features/movie-filters'
import { useWatchlistStore } from '@/features/watchlist'
import { renderWithRouter, screen, waitFor } from '@/test/render'
import { makeMovieDto, mockTmdb, movieRequests } from '@/test/tmdb-mock'
import { HomePage } from './home-page'

vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }))

const DUNA = makeMovieDto({ id: 1, title: 'Duna', vote_average: 8.2 })
const MATRIX = makeMovieDto({ id: 2, title: 'Matrix', vote_average: 8.7 })

describe('fluxo da tela de descoberta', () => {
  beforeEach(() => {
    useFiltersStore.getState().reset()
    useWatchlistStore.setState({ items: [] })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('lista os filmes retornados pela API', async () => {
    mockTmdb({ movies: [DUNA, MATRIX] })
    await renderWithRouter(<HomePage />)

    expect(await screen.findByText('Duna')).toBeInTheDocument()
    expect(screen.getByText('Matrix')).toBeInTheDocument()
  })

  it('mostra esqueletos antes dos dados chegarem', async () => {
    mockTmdb({ movies: [DUNA] })
    const { container } = await renderWithRouter(<HomePage />)

    expect(container.querySelectorAll('[data-slot=skeleton]').length).toBeGreaterThan(0)
    await screen.findByText('Duna')
  })

  it('oferece nova tentativa quando a API falha', async () => {
    mockTmdb({ fail: true })
    await renderWithRouter(<HomePage />)

    expect(await screen.findByRole('alert')).toHaveTextContent(/não consegui carregar/i)
    expect(screen.getByRole('button', { name: /tentar de novo/i })).toBeInTheDocument()
  })

  it('avisa quando a busca não encontra nada', async () => {
    mockTmdb({ movies: [] })
    await renderWithRouter(<HomePage />)

    expect(await screen.findByText(/nenhum filme encontrado/i)).toBeInTheDocument()
  })

  // O enunciado exige atraso na busca para não disparar uma requisição por tecla.
  it('só consulta a API depois que o usuário para de digitar', async () => {
    const fetchMock = mockTmdb({ movies: [DUNA] })
    const { user } = await renderWithRouter(<HomePage />)
    await screen.findByText('Duna')

    const chamadasAntes = movieRequests(fetchMock).length
    await user.type(screen.getByLabelText(/buscar/i), 'duna')

    expect(movieRequests(fetchMock)).toHaveLength(chamadasAntes)

    await waitFor(
      () => {
        const busca = movieRequests(fetchMock).find((url) => url.searchParams.get('query') === 'duna')
        expect(busca).toBeDefined()
      },
      { timeout: 2000 },
    )
  })

  it('salva um filme na lista a partir do cartão', async () => {
    mockTmdb({ movies: [DUNA] })
    const { user } = await renderWithRouter(<HomePage />)
    await screen.findByText('Duna')

    await user.click(screen.getByRole('button', { name: /salvar na minha lista/i }))

    await waitFor(() => expect(useWatchlistStore.getState().items).toHaveLength(1))
    expect(useWatchlistStore.getState().items[0]?.title).toBe('Duna')
    expect(screen.getByRole('button', { name: /remover da minha lista/i })).toBeInTheDocument()
  })

  it('usa o endpoint de descoberta quando há filtro e não há busca', async () => {
    const fetchMock = mockTmdb({ movies: [DUNA] })
    await renderWithRouter(<HomePage />)
    await screen.findByText('Duna')

    useFiltersStore.getState().patch({ genreId: 28 })

    await waitFor(() => {
      const descoberta = movieRequests(fetchMock).find((url) => url.pathname.includes('/discover/movie'))
      expect(descoberta?.searchParams.get('with_genres')).toBe('28')
    })
  })

  it('envia o idioma da interface em toda consulta', async () => {
    const fetchMock = mockTmdb({ movies: [DUNA] })
    await renderWithRouter(<HomePage />)
    await screen.findByText('Duna')

    expect(movieRequests(fetchMock)[0]?.searchParams.get('language')).toBe('pt-BR')
  })
})
