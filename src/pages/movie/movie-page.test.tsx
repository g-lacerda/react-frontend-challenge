import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useWatchlistStore } from '@/features/watchlist'
import { renderWithRouter, screen, waitFor } from '@/test/render'
import { makeMovieDetailsDto, mockTmdb } from '@/test/tmdb-mock'
import { MoviePage } from './movie-page'

vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }))

// A página lê o id pela rota real da aplicação, que não existe no roteador de teste.
vi.mock('@tanstack/react-router', async (original) => ({
  ...(await original<typeof import('@tanstack/react-router')>()),
  getRouteApi: () => ({ useParams: () => ({ id: 550 }) }),
}))

async function montar() {
  return renderWithRouter(<MoviePage />, { path: '/movie/$id', initialPath: '/movie/550' })
}

describe('página de detalhes do filme', () => {
  beforeEach(() => {
    useWatchlistStore.setState({ items: [] })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('apresenta título, ano e sinopse', async () => {
    mockTmdb({
      details: makeMovieDetailsDto({ title: 'Clube da Luta', release_date: '1999-10-15', overview: 'Um homem insone.' }),
    })
    await montar()

    expect(await screen.findByRole('heading', { level: 1, name: /clube da luta/i })).toBeInTheDocument()
    expect(screen.getByText('1999')).toBeInTheDocument()
    expect(screen.getByText('Um homem insone.')).toBeInTheDocument()
  })

  it('mostra a duração em horas e minutos', async () => {
    mockTmdb({ details: makeMovieDetailsDto({ runtime: 139 }) })
    await montar()

    expect(await screen.findAllByText('2h 19min')).not.toHaveLength(0)
  })

  it('mostra os gêneros do filme', async () => {
    mockTmdb({ details: makeMovieDetailsDto({ genres: [{ id: 18, name: 'Drama' }, { id: 53, name: 'Thriller' }] }) })
    await montar()

    expect(await screen.findByText('Drama')).toBeInTheDocument()
    expect(screen.getByText('Thriller')).toBeInTheDocument()
  })

  it('lista o elenco quando existe', async () => {
    mockTmdb({
      details: makeMovieDetailsDto({
        credits: { cast: [{ id: 1, name: 'Edward Norton', character: 'Narrador', profile_path: '/foto.jpg' }] },
      }),
    })
    await montar()

    expect(await screen.findByText('Edward Norton')).toBeInTheDocument()
    expect(screen.getByText('Narrador')).toBeInTheDocument()
  })

  it('avisa quando não há elenco cadastrado', async () => {
    mockTmdb({ details: makeMovieDetailsDto({ credits: { cast: [] } }) })
    await montar()

    expect(await screen.findByText(/elenco não informado/i)).toBeInTheDocument()
  })

  // O vídeo só é carregado ao clicar, para não trazer o player do YouTube sem necessidade.
  it('oferece o trailer sem carregar o player de imediato', async () => {
    mockTmdb({
      details: makeMovieDetailsDto({
        videos: { results: [{ key: 'abc123', site: 'YouTube', type: 'Trailer', official: true }] },
      }),
    })
    const { user } = await montar()

    const play = await screen.findByRole('button', { name: /reproduzir trailer/i })
    expect(document.querySelector('iframe')).toBeNull()

    await user.click(play)

    await waitFor(() => expect(document.querySelector('iframe')?.getAttribute('src')).toContain('abc123'))
  })

  it('avisa quando o filme não tem trailer', async () => {
    mockTmdb({ details: makeMovieDetailsDto({ videos: { results: [] } }) })
    await montar()

    expect(await screen.findByText(/nenhum trailer disponível/i)).toBeInTheDocument()
  })

  it('permite salvar o filme na lista a partir dos detalhes', async () => {
    mockTmdb({ details: makeMovieDetailsDto({ id: 550, title: 'Clube da Luta' }) })
    const { user } = await montar()

    await user.click(await screen.findByRole('button', { name: /salvar na minha lista/i }))

    await waitFor(() => expect(useWatchlistStore.getState().items).toHaveLength(1))
    expect(useWatchlistStore.getState().items[0]?.title).toBe('Clube da Luta')
  })

  it('mostra esqueleto enquanto os dados chegam', async () => {
    mockTmdb({ details: makeMovieDetailsDto() })
    const { container } = await montar()

    expect(container.querySelectorAll('[data-slot=skeleton]').length).toBeGreaterThan(0)
  })

  it('explica quando a API falha e oferece nova tentativa', async () => {
    mockTmdb({ fail: true })
    await montar()

    expect(await screen.findByRole('heading', { name: /não consegui carregar o filme/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tentar de novo/i })).toBeInTheDocument()
  })
})
