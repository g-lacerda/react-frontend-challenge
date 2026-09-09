import { beforeEach, describe, expect, it } from 'vitest'
import { useSettingsStore } from './settings-store'

describe('store de configurações', () => {
  beforeEach(() => {
    useSettingsStore.setState({ soundEnabled: true })
  })

  it('vem com os efeitos sonoros ligados', () => {
    expect(useSettingsStore.getState().soundEnabled).toBe(true)
  })

  it('permite desligar os efeitos sonoros', () => {
    useSettingsStore.getState().setSoundEnabled(false)
    expect(useSettingsStore.getState().soundEnabled).toBe(false)
  })

  it('persiste a preferência no localStorage', () => {
    useSettingsStore.getState().setSoundEnabled(false)

    const guardado = JSON.parse(localStorage.getItem('cinedash:settings') ?? '{}')
    expect(guardado.state.soundEnabled).toBe(false)
  })
})
