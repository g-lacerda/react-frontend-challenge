import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useWatchlistStore } from '@/features/watchlist'
import { makeMovie } from '@/test/factories'
import { renderWithRouter, screen, waitFor, within } from '@/test/render'
import { mockTmdb } from '@/test/tmdb-mock'
import { WatchlistPage } from './watchlist-page'

vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }))

const DUNA = makeMovie({ id: 1, title: 'Duna', voteAverage: 8.2, releaseDate: '2021-09-15', genreIds: [28] })
const MATRIX = makeMovie({ id: 2, title: 'Matrix', voteAverage: 8.7, releaseDate: '1999-03-30', genreIds: [18] })

function encher(...movies: typeof DUNA[]) {
  useWatchlistStore.setState({ items: [] })
  movies.forEach((movie) => useWatchlistStore.getState().add(movie))
}

async function montar() {
  mockTmdb()
  return renderWithRouter(<WatchlistPage />, { path: '/watchlist', initialPath: '/watchlist' })
}

/**
 * A página mantém a tabela (desktop) e a lista de cartões (celular) no mesmo DOM,
 * alternando pelo CSS. Como a jsdom não aplica CSS, as buscas são escopadas na tabela.
 */
function tabela() {
  return within(screen.getByRole('table'))
}

function titulosDaTabela() {
  return tabela()
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0]?.textContent?.trim())
}

describe('fluxo da tela Minha lista', () => {
  beforeEach(() => {
    useWatchlistStore.setState({ items: [] })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('convida a descobrir filmes quando a lista está vazia', async () => {
    await montar()

    expect(screen.getByText(/sua lista está vazia/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ir para descobrir/i })).toBeInTheDocument()
  })

  it('lista os filmes salvos com a contagem', async () => {
    encher(DUNA, MATRIX)
    await montar()

    expect(screen.getByText('2 filmes')).toBeInTheDocument()
    expect(titulosDaTabela()).toEqual(['Matrix', 'Duna'])
  })

  it('remove um filme da lista pela ação da linha', async () => {
    encher(DUNA, MATRIX)
    const { user } = await montar()

    await user.click(tabela().getByRole('button', { name: /remover da minha lista: Duna/i }))

    await waitFor(() => expect(useWatchlistStore.getState().items).toHaveLength(1))
    expect(titulosDaTabela()).toEqual(['Matrix'])
  })

  it('ordena pelo cabeçalho da coluna e anuncia a direção', async () => {
    encher(DUNA, MATRIX)
    const { user } = await montar()

    const cabecalhoTitulo = tabela().getByRole('columnheader', { name: /título/i })
    await user.click(within(cabecalhoTitulo).getByRole('button'))

    expect(cabecalhoTitulo).toHaveAttribute('aria-sort', 'ascending')
    expect(titulosDaTabela()).toEqual(['Duna', 'Matrix'])

    await user.click(within(cabecalhoTitulo).getByRole('button'))

    expect(cabecalhoTitulo).toHaveAttribute('aria-sort', 'descending')
    expect(titulosDaTabela()).toEqual(['Matrix', 'Duna'])
  })

  // Coluna numérica começa da maior nota, que é o que o curador espera ver primeiro.
  it('ordena por nota, da maior para a menor no primeiro clique', async () => {
    encher(DUNA, MATRIX)
    const { user } = await montar()

    const cabecalhoNota = tabela().getByRole('columnheader', { name: /^nota/i })
    await user.click(within(cabecalhoNota).getByRole('button'))

    expect(cabecalhoNota).toHaveAttribute('aria-sort', 'descending')
    expect(titulosDaTabela()).toEqual(['Matrix', 'Duna'])

    await user.click(within(cabecalhoNota).getByRole('button'))

    expect(cabecalhoNota).toHaveAttribute('aria-sort', 'ascending')
    expect(titulosDaTabela()).toEqual(['Duna', 'Matrix'])
  })

  it('filtra a lista pela busca por título', async () => {
    encher(DUNA, MATRIX)
    const { user } = await montar()

    await user.type(screen.getByLabelText(/buscar/i), 'duna')

    await waitFor(() => expect(titulosDaTabela()).toEqual(['Duna']))
    expect(screen.getByText('1 / 2 filmes')).toBeInTheDocument()
  })

  it('avisa quando nenhum filme salvo atende ao filtro', async () => {
    encher(DUNA)
    const { user } = await montar()

    await user.type(screen.getByLabelText(/buscar/i), 'inexistente')

    expect(await screen.findByText(/nenhum filme encontrado/i)).toBeInTheDocument()
  })

  // A lista persistida é a mesma fonte usada pela tela de descoberta.
  it('reflete um filme salvo em outra tela', async () => {
    await montar()
    expect(screen.getByText(/sua lista está vazia/i)).toBeInTheDocument()

    useWatchlistStore.getState().add(DUNA)

    await waitFor(() => expect(titulosDaTabela()).toEqual(['Duna']))
  })
})
