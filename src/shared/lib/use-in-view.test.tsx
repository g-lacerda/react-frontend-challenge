import { render } from '@testing-library/react'
import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useInView } from './use-in-view'

type Callback = (entries: Array<{ isIntersecting: boolean }>) => void

let dispararIntersecao: Callback | undefined
let opcoesRecebidas: IntersectionObserverInit | undefined
const observar = vi.fn()
const desconectar = vi.fn()

beforeEach(() => {
  dispararIntersecao = undefined
  opcoesRecebidas = undefined
  observar.mockClear()
  desconectar.mockClear()

  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: Callback, options?: IntersectionObserverInit) {
        dispararIntersecao = callback
        opcoesRecebidas = options
      }
      observe = observar
      unobserve() {}
      disconnect = desconectar
    },
  )
})

function Sentinela({ rootMargin }: { rootMargin?: string }) {
  const { ref, inView } = useInView(rootMargin)
  return (
    <div ref={ref} data-testid="sentinela">
      {inView ? 'visível' : 'fora da tela'}
    </div>
  )
}

describe('useInView', () => {
  it('começa fora da tela e observa o elemento', () => {
    const { getByTestId } = render(<Sentinela />)

    expect(getByTestId('sentinela')).toHaveTextContent('fora da tela')
    expect(observar).toHaveBeenCalledWith(getByTestId('sentinela'))
  })

  it('avisa quando o elemento entra e sai da área observada', () => {
    const { getByTestId } = render(<Sentinela />)

    act(() => dispararIntersecao?.([{ isIntersecting: true }]))
    expect(getByTestId('sentinela')).toHaveTextContent('visível')

    act(() => dispararIntersecao?.([{ isIntersecting: false }]))
    expect(getByTestId('sentinela')).toHaveTextContent('fora da tela')
  })

  // A margem antecipa a próxima página antes de o usuário chegar ao fim da lista.
  it('observa com margem antecipada por padrão', () => {
    render(<Sentinela />)
    expect(opcoesRecebidas?.rootMargin).toBe('400px 0px')
  })

  it('aceita uma margem personalizada', () => {
    render(<Sentinela rootMargin="100px 0px" />)
    expect(opcoesRecebidas?.rootMargin).toBe('100px 0px')
  })

  it('desconecta o observador ao desmontar', () => {
    const { unmount } = render(<Sentinela />)

    unmount()
    expect(desconectar).toHaveBeenCalled()
  })
})
