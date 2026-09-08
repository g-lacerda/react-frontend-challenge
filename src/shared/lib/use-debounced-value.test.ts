import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedValue } from './use-debounced-value'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('devolve o valor inicial de imediato', () => {
    const { result } = renderHook(() => useDebouncedValue('duna'))
    expect(result.current).toBe('duna')
  })

  it('segura o valor novo até o tempo passar', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 400), {
      initialProps: { value: 'd' },
    })

    rerender({ value: 'duna' })
    expect(result.current).toBe('d')

    act(() => vi.advanceTimersByTime(399))
    expect(result.current).toBe('d')

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('duna')
  })

  // É o que evita uma requisição por tecla digitada na busca.
  it('reinicia a contagem a cada mudança e entrega só o último valor', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 400), {
      initialProps: { value: '' },
    })

    for (const value of ['d', 'du', 'dun', 'duna']) {
      rerender({ value })
      act(() => vi.advanceTimersByTime(300))
    }

    expect(result.current).toBe('')

    act(() => vi.advanceTimersByTime(400))
    expect(result.current).toBe('duna')
  })

  it('respeita um atraso personalizado', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 1000), {
      initialProps: { value: 'antes' },
    })

    rerender({ value: 'depois' })
    act(() => vi.advanceTimersByTime(999))
    expect(result.current).toBe('antes')

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('depois')
  })

  it('funciona com valores que não são texto', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 100), {
      initialProps: { value: { min: 0, max: 10 } },
    })

    rerender({ value: { min: 5, max: 9 } })
    act(() => vi.advanceTimersByTime(100))

    expect(result.current).toEqual({ min: 5, max: 9 })
  })

  it('cancela o temporizador ao desmontar', () => {
    const { unmount } = renderHook(() => useDebouncedValue('x', 400))

    unmount()
    expect(() => vi.runAllTimers()).not.toThrow()
  })
})
