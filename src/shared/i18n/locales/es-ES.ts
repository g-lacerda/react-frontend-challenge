import type { Dictionary } from '../model/types'

export const esES: Dictionary = {
  nav: {
    discover: 'Descubrir',
    watchlist: 'Mi lista',
  },
  theme: {
    useLight: 'Usar tema claro',
    useDark: 'Usar tema oscuro',
  },
  locale: {
    label: 'Idioma',
    'pt-BR': 'Português',
    'en-US': 'English',
    'es-ES': 'Español',
  },
  notFound: {
    title: 'Página no encontrada',
    description: 'La dirección que visitaste no existe.',
    backHome: 'Volver al inicio',
  },
  pages: {
    discover: 'Descubrir',
    watchlist: 'Mi lista',
    login: 'Entrar',
    movie: (id) => `Película ${id}`,
  },
}
