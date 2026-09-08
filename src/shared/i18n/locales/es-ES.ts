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
  auth: {
    logout: 'Salir',
  },
  login: {
    eyebrow: 'Curaduría de catálogo',
    title: 'Entrar',
    description: 'Accede con tu correo para buscar películas y armar tu lista.',
    email: 'Correo',
    password: 'Contraseña',
    passwordHint: 'Más de 6 caracteres.',
    submit: 'Entrar',
    welcome: 'Bienvenido de nuevo.',
    errors: {
      invalidEmail: 'Introduce un correo válido.',
      shortPassword: 'La contraseña debe tener más de 6 caracteres.',
    },
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
