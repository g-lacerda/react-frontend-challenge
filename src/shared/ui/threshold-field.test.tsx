import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/render'
import { ThresholdField } from './threshold-field'

const PRESETS = [0, 100, 500, 1000]

function montar(value?: number, onChange = vi.fn()) {
  const resultado = render(
    <ThresholdField
      id="votos"
      label="Mínimo de votos"
      presets={PRESETS}
      value={value}
      max={100000}
      onChange={onChange}
      formatOption={(votos) => `${votos.toLocaleString('pt-BR')}+ votos`}
      anyLabel="Todos"
      customLabel="Valor exato"
    />,
  )

  return { ...resultado, onChange }
}

describe('ThresholdField', () => {
  function abrir() {
    return screen.getByRole('button', { name: /mínimo de votos/i })
  }

  it('mostra o rótulo neutro quando não há valor', () => {
    montar()
    expect(abrir()).toHaveTextContent('Todos')
  })

  it('mostra o valor formatado quando há filtro', () => {
    montar(1000)
    expect(abrir()).toHaveTextContent('1.000+ votos')
  })

  it('aplica um atalho e fecha o menu', async () => {
    const { user, onChange } = montar()

    await user.click(abrir())
    await user.click(await screen.findByRole('button', { name: '500+ votos' }))

    expect(onChange).toHaveBeenCalledWith(500)
    await waitFor(() => expect(screen.queryByLabelText(/valor exato/i)).not.toBeInTheDocument())
  })

  it('trata o atalho neutro como ausência de filtro', async () => {
    const { user, onChange } = montar(500)

    await user.click(abrir())
    await user.click(await screen.findByRole('button', { name: 'Todos' }))

    expect(onChange).toHaveBeenCalledWith(undefined)
  })

  it('marca o atalho que corresponde ao valor atual', async () => {
    const { user } = montar(100)

    await user.click(abrir())

    expect(await screen.findByRole('button', { name: '100+ votos' })).toHaveAttribute('aria-pressed', 'true')
  })

  // Só com atalhos não daria para pedir um valor fora da lista.
  it('aceita um valor digitado fora dos atalhos', async () => {
    const { user, onChange } = montar()

    await user.click(abrir())
    await user.type(await screen.findByLabelText(/valor exato/i), '2750')

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(2750))
  })

  it('ignora caracteres que não são dígitos', async () => {
    const { user } = montar()

    await user.click(abrir())
    const campo = await screen.findByLabelText(/valor exato/i)
    await user.type(campo, 'ab12cd')

    expect(campo).toHaveValue('12')
  })

  it('limita o valor digitado ao máximo permitido', async () => {
    const { user, onChange } = montar()

    await user.click(abrir())
    await user.type(await screen.findByLabelText(/valor exato/i), '999999')

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(100000))
  })

  it('aplica de imediato ao pressionar Enter', async () => {
    const { user, onChange } = montar()

    await user.click(abrir())
    await user.type(await screen.findByLabelText(/valor exato/i), '750{Enter}')

    expect(onChange).toHaveBeenCalledWith(750)
  })
})
