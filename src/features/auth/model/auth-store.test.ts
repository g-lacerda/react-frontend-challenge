import { beforeEach, describe, expect, it } from 'vitest'
import { createFakeToken, isAuthenticated, useAuthStore } from './auth-store'

const STORAGE_KEY = 'cinedash:auth'

describe('store de autenticação', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, email: null })
  })

  it('começa deslogada', () => {
    expect(isAuthenticated()).toBe(false)
  })

  it('guarda token e e-mail ao entrar', () => {
    useAuthStore.getState().login('curador@cinedash.app')

    const { token, email } = useAuthStore.getState()
    expect(token).toMatch(/^cinedash\./)
    expect(email).toBe('curador@cinedash.app')
    expect(isAuthenticated()).toBe(true)
  })

  it('limpa a sessão ao sair', () => {
    useAuthStore.getState().login('curador@cinedash.app')
    useAuthStore.getState().logout()

    expect(useAuthStore.getState()).toMatchObject({ token: null, email: null })
    expect(isAuthenticated()).toBe(false)
  })

  it('gera um token diferente a cada login', () => {
    expect(createFakeToken()).not.toBe(createFakeToken())
  })

  // O desafio pede que a sessão sobreviva ao recarregamento da página.
  it('persiste a sessão no localStorage', () => {
    useAuthStore.getState().login('curador@cinedash.app')

    const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(guardado.state.email).toBe('curador@cinedash.app')
    expect(guardado.state.token).toBeTruthy()
  })
})
