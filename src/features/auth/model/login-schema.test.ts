import { describe, expect, it } from 'vitest'
import { PASSWORD_MIN_LENGTH, createLoginSchema } from './login-schema'

const messages = { invalidEmail: 'E-mail inválido', shortPassword: 'Senha curta' }
const schema = createLoginSchema(messages)

function validate(email: string, password: string) {
  return schema.safeParse({ email, password })
}

describe('createLoginSchema', () => {
  it('aceita e-mail válido com senha suficientemente longa', () => {
    expect(validate('curador@cinedash.app', 'senha1234').success).toBe(true)
  })

  it.each(['sem-arroba', 'sem@dominio', '@cinedash.app', '', 'espaço @cinedash.app'])(
    'rejeita o e-mail %j',
    (email) => {
      const result = validate(email, 'senha1234')

      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe(messages.invalidEmail)
    },
  )

  // O enunciado pede senha "maior que 6", então 7 é o primeiro valor aceito.
  it('exige mais de seis caracteres na senha', () => {
    expect(PASSWORD_MIN_LENGTH).toBe(7)
    expect(validate('curador@cinedash.app', '123456').success).toBe(false)
    expect(validate('curador@cinedash.app', '1234567').success).toBe(true)
  })

  it('usa a mensagem traduzida recebida ao criar o schema', () => {
    const outro = createLoginSchema({ invalidEmail: 'Invalid email', shortPassword: 'Password too short' })
    const result = outro.safeParse({ email: 'curador@cinedash.app', password: '123' })

    expect(result.error?.issues[0]?.message).toBe('Password too short')
  })

  it('aponta os dois erros quando ambos os campos são inválidos', () => {
    const result = validate('invalido', '123')
    expect(result.error?.issues).toHaveLength(2)
  })
})
