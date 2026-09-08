import { describe, expect, it } from 'vitest'
import { initialsFromEmail } from './initials'

describe('initialsFromEmail', () => {
  it('usa as iniciais de nome e sobrenome quando há separador', () => {
    expect(initialsFromEmail('guilherme.lacerda@cinedash.app')).toBe('GL')
    expect(initialsFromEmail('ana_maria@cinedash.app')).toBe('AM')
    expect(initialsFromEmail('joao-pedro@cinedash.app')).toBe('JP')
  })

  it('usa as duas primeiras letras quando não há separador', () => {
    expect(initialsFromEmail('curador@cinedash.app')).toBe('CU')
  })

  it('lida com nome de uma letra só', () => {
    expect(initialsFromEmail('g@cinedash.app')).toBe('G')
  })
})
