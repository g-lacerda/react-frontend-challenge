import { describe, expect, it } from 'vitest'
import { render, screen } from '@/test/render'
import { GenreBadges } from './genre-badges'

describe('GenreBadges', () => {
  it('não renderiza nada quando não há gêneros', () => {
    const { container } = render(<GenreBadges genres={[]} label="Gênero" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('mostra todos os gêneros quando não há limite', () => {
    render(<GenreBadges genres={['Ação', 'Drama', 'Terror']} label="Gênero" />)

    expect(screen.getByRole('list', { name: 'Gênero' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  // Nos cartões só cabem dois; o resto vira um contador com o restante no rótulo.
  it('resume o excedente num contador acessível', () => {
    render(<GenreBadges genres={['Ação', 'Drama', 'Terror', 'Comédia']} label="Gênero" max={2} />)

    expect(screen.getByText('Ação')).toBeInTheDocument()
    expect(screen.getByText('Drama')).toBeInTheDocument()
    expect(screen.queryByText('Terror')).not.toBeInTheDocument()

    expect(screen.getByText('+2')).toHaveAccessibleName('Terror, Comédia')
  })

  it('não mostra contador quando tudo cabe no limite', () => {
    render(<GenreBadges genres={['Ação', 'Drama']} label="Gênero" max={2} />)

    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })
})
