import { beforeEach, describe, expect, it } from 'vitest'
import { useThemeStore } from './theme-store'

describe('store de tema', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'dark' })
  })

  it('começa no tema escuro', () => {
    expect(useThemeStore.getState().theme).toBe('dark')
  })

  it('alterna entre escuro e claro', () => {
    useThemeStore.getState().toggleTheme()
    expect(useThemeStore.getState().theme).toBe('light')

    useThemeStore.getState().toggleTheme()
    expect(useThemeStore.getState().theme).toBe('dark')
  })

  it('define um tema específico', () => {
    useThemeStore.getState().setTheme('light')
    expect(useThemeStore.getState().theme).toBe('light')
  })

  // A classe no elemento raiz é o que o Tailwind usa para trocar as cores.
  it('reflete o tema no elemento raiz do documento', () => {
    useThemeStore.getState().setTheme('light')
    expect(document.documentElement).not.toHaveClass('dark')
    expect(document.documentElement.style.colorScheme).toBe('light')

    useThemeStore.getState().setTheme('dark')
    expect(document.documentElement).toHaveClass('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('persiste a escolha no localStorage', () => {
    useThemeStore.getState().setTheme('light')

    const guardado = JSON.parse(localStorage.getItem('cinedash:theme') ?? '{}')
    expect(guardado.state.theme).toBe('light')
  })
})
