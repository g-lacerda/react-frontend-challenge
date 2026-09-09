import { describe, expect, it } from 'vitest'
import { makeMovie } from './factories'

describe('ambiente de testes', () => {
  it('resolve o alias @ do projeto', () => {
    expect(makeMovie({ title: 'Duna' }).title).toBe('Duna')
  })

  it('expõe o DOM e o localStorage da jsdom', () => {
    document.body.innerHTML = '<p id="alvo">ok</p>'
    localStorage.setItem('chave', 'valor')

    expect(document.querySelector('#alvo')).toHaveTextContent('ok')
    expect(localStorage.getItem('chave')).toBe('valor')
  })

  it('limpa o localStorage entre os testes', () => {
    expect(localStorage.getItem('chave')).toBeNull()
  })
})
