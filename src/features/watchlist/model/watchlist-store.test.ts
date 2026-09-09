import { beforeEach, describe, expect, it } from 'vitest'
import { makeMovie } from '@/test/factories'
import { useWatchlistStore } from './watchlist-store'

const STORAGE_KEY = 'cinedash:watchlist'

function items() {
  return useWatchlistStore.getState().items
}

describe('store da watchlist', () => {
  beforeEach(() => {
    useWatchlistStore.setState({ items: [] })
  })

  it('começa vazia', () => {
    expect(items()).toEqual([])
  })

  it('adiciona um filme com a data em que foi salvo', () => {
    const movie = makeMovie({ title: 'Duna' })
    useWatchlistStore.getState().add(movie)

    expect(items()).toHaveLength(1)
    expect(items()[0]).toMatchObject({ id: movie.id, title: 'Duna' })
    expect(Date.parse(items()[0]!.addedAt)).not.toBeNaN()
  })

  it('coloca o mais recente no topo', () => {
    const primeiro = makeMovie({ title: 'Primeiro' })
    const segundo = makeMovie({ title: 'Segundo' })

    useWatchlistStore.getState().add(primeiro)
    useWatchlistStore.getState().add(segundo)

    expect(items().map((item) => item.title)).toEqual(['Segundo', 'Primeiro'])
  })

  it('ignora o filme que já está na lista', () => {
    const movie = makeMovie()

    useWatchlistStore.getState().add(movie)
    useWatchlistStore.getState().add(movie)

    expect(items()).toHaveLength(1)
  })

  it('remove pelo identificador sem afetar os demais', () => {
    const ficar = makeMovie({ title: 'Fica' })
    const sair = makeMovie({ title: 'Sai' })

    useWatchlistStore.getState().add(ficar)
    useWatchlistStore.getState().add(sair)
    useWatchlistStore.getState().remove(sair.id)

    expect(items().map((item) => item.title)).toEqual(['Fica'])
  })

  it('não quebra ao remover um filme que não está na lista', () => {
    useWatchlistStore.getState().add(makeMovie())
    useWatchlistStore.getState().remove(999999)

    expect(items()).toHaveLength(1)
  })

  it('esvazia a lista', () => {
    useWatchlistStore.getState().add(makeMovie())
    useWatchlistStore.getState().clear()

    expect(items()).toEqual([])
  })

  // O desafio pede que a lista sobreviva ao recarregamento da página.
  it('persiste a lista no localStorage', () => {
    useWatchlistStore.getState().add(makeMovie({ title: 'Persistido' }))

    const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(guardado.state.items[0].title).toBe('Persistido')
  })
})
