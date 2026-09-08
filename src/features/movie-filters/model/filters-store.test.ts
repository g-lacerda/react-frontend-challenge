import { beforeEach, describe, expect, it } from 'vitest'
import { useFiltersStore } from './filters-store'

function filters() {
  return useFiltersStore.getState().filters
}

describe('store de filtros', () => {
  beforeEach(() => {
    useFiltersStore.getState().reset()
  })

  it('começa apenas com a busca vazia', () => {
    expect(filters()).toEqual({ query: '' })
  })

  it('atualiza a busca sem tocar nos demais filtros', () => {
    useFiltersStore.getState().patch({ genreId: 28 })
    useFiltersStore.getState().setQuery('duna')

    expect(filters()).toMatchObject({ query: 'duna', genreId: 28 })
  })

  it('mescla alterações parciais', () => {
    useFiltersStore.getState().patch({ genreId: 28 })
    useFiltersStore.getState().patch({ year: 2020 })

    expect(filters()).toMatchObject({ genreId: 28, year: 2020 })
  })

  it('permite desfazer um filtro passando indefinido', () => {
    useFiltersStore.getState().patch({ genreId: 28 })
    useFiltersStore.getState().patch({ genreId: undefined })

    expect(filters().genreId).toBeUndefined()
  })

  it('limpa tudo, inclusive a busca', () => {
    useFiltersStore.getState().setQuery('duna')
    useFiltersStore.getState().patch({ genreId: 28, minRating: 7 })
    useFiltersStore.getState().reset()

    expect(filters()).toEqual({ query: '' })
  })

  it('persiste os filtros no localStorage', () => {
    useFiltersStore.getState().patch({ genreId: 28 })

    const guardado = JSON.parse(localStorage.getItem('cinedash:filters') ?? '{}')
    expect(guardado.state.filters.genreId).toBe(28)
  })
})
