import { beforeEach, describe, expect, it, vi } from 'vitest'
import { makeMovie } from '@/test/factories'
import { renderWithRouter, screen } from '@/test/render'
import { useWatchlistStore } from '../model/watchlist-store'
import { WatchlistToggle } from './watchlist-toggle'

vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }))

describe('WatchlistToggle', () => {
  beforeEach(() => {
    useWatchlistStore.setState({ items: [] })
  })

  it('começa apresentando a ação de salvar', async () => {
    await renderWithRouter(<WatchlistToggle movie={makeMovie()} />)

    const botao = screen.getByRole('button', { name: /salvar na minha lista/i })
    expect(botao).toHaveAttribute('aria-pressed', 'false')
  })

  it('salva o filme na lista ao ser acionado', async () => {
    const movie = makeMovie({ title: 'Duna' })
    const { user } = await renderWithRouter(<WatchlistToggle movie={movie} />)

    await user.click(screen.getByRole('button', { name: /salvar na minha lista/i }))

    expect(useWatchlistStore.getState().items).toHaveLength(1)
    expect(useWatchlistStore.getState().items[0]?.title).toBe('Duna')
  })

  it('reflete no rótulo que o filme já está salvo', async () => {
    const { user } = await renderWithRouter(<WatchlistToggle movie={makeMovie()} />)

    await user.click(screen.getByRole('button', { name: /salvar na minha lista/i }))

    const botao = screen.getByRole('button', { name: /remover da minha lista/i })
    expect(botao).toHaveAttribute('aria-pressed', 'true')
  })

  it('remove o filme quando acionado de novo', async () => {
    const { user } = await renderWithRouter(<WatchlistToggle movie={makeMovie()} />)

    await user.click(screen.getByRole('button', { name: /salvar/i }))
    await user.click(screen.getByRole('button', { name: /remover/i }))

    expect(useWatchlistStore.getState().items).toEqual([])
  })

  // O botão aparece em três telas e todas leem a mesma store.
  it('já nasce marcado quando o filme está na lista', async () => {
    const movie = makeMovie()
    useWatchlistStore.getState().add(movie)

    await renderWithRouter(<WatchlistToggle movie={movie} />)

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('reage a mudanças feitas fora do componente', async () => {
    const movie = makeMovie()
    await renderWithRouter(<WatchlistToggle movie={movie} />)

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')

    useWatchlistStore.getState().add(movie)

    expect(await screen.findByRole('button', { name: /remover/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('pode ser acionado pelo teclado', async () => {
    const { user } = await renderWithRouter(<WatchlistToggle movie={makeMovie()} />)

    await user.tab()
    await user.keyboard('{Enter}')

    expect(useWatchlistStore.getState().items).toHaveLength(1)
  })
})
