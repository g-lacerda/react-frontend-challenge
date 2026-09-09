import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithRouter, screen, waitFor } from '@/test/render'
import { useAuthStore } from '../model/auth-store'
import { LoginForm } from './login-form'

vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }))

async function montar() {
  return renderWithRouter(<LoginForm />, { path: '/login', initialPath: '/login' })
}

describe('fluxo de login', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, email: null })
  })

  it('apresenta os campos de e-mail e senha', async () => {
    await montar()

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('recusa e-mail inválido e não cria sessão', async () => {
    const { user } = await montar()

    await user.type(screen.getByLabelText(/e-mail/i), 'nao-e-um-email')
    await user.type(screen.getByLabelText(/senha/i), 'senha1234')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/e-mail válido/i)
    expect(useAuthStore.getState().token).toBeNull()
  })

  it('recusa senha curta e marca o campo como inválido', async () => {
    const { user } = await montar()

    await user.type(screen.getByLabelText(/e-mail/i), 'curador@cinedash.app')
    await user.type(screen.getByLabelText(/senha/i), '123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/mais de 6 caracteres/i)
    expect(screen.getByLabelText(/senha/i)).toHaveAttribute('aria-invalid', 'true')
  })

  it('cria a sessão e navega ao entrar com dados válidos', async () => {
    const { user, router } = await montar()

    await user.type(screen.getByLabelText(/e-mail/i), 'curador@cinedash.app')
    await user.type(screen.getByLabelText(/senha/i), 'senha1234')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => expect(useAuthStore.getState().token).toBeTruthy())
    expect(useAuthStore.getState().email).toBe('curador@cinedash.app')
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('mantém a sessão gravada para sobreviver ao recarregamento', async () => {
    const { user } = await montar()

    await user.type(screen.getByLabelText(/e-mail/i), 'curador@cinedash.app')
    await user.type(screen.getByLabelText(/senha/i), 'senha1234')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      const guardado = JSON.parse(localStorage.getItem('cinedash:auth') ?? '{}')
      expect(guardado.state?.email).toBe('curador@cinedash.app')
    })
  })

  it('permite preencher e enviar apenas com o teclado', async () => {
    const { user } = await montar()

    await user.tab()
    await user.keyboard('curador@cinedash.app')
    await user.tab()
    await user.keyboard('senha1234{Enter}')

    await waitFor(() => expect(useAuthStore.getState().token).toBeTruthy())
  })
})
