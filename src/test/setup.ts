import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { useLocaleStore } from '@/shared/i18n'

// Os textos assertados nos testes são os do português, então o idioma é fixado.
// A jsdom reporta en-US em navigator.language, o que faria a store detectar inglês.
useLocaleStore.setState({ locale: 'pt-BR' })

beforeEach(() => {
  useLocaleStore.setState({ locale: 'pt-BR' })
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

// A jsdom não implementa estas APIs do navegador, usadas por Radix e pelo scroll infinito.
class ObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

vi.stubGlobal('IntersectionObserver', ObserverStub)
vi.stubGlobal('ResizeObserver', ObserverStub)
vi.stubGlobal('AudioContext', undefined)

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

window.HTMLElement.prototype.scrollIntoView = () => {}
window.HTMLElement.prototype.scrollBy = () => {}
window.HTMLElement.prototype.hasPointerCapture = () => false
window.HTMLElement.prototype.releasePointerCapture = () => {}
