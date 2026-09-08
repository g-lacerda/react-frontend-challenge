import type { Dictionary } from '../model/types'

export const enUS: Dictionary = {
  nav: {
    discover: 'Discover',
    watchlist: 'My list',
  },
  theme: {
    useLight: 'Use light theme',
    useDark: 'Use dark theme',
  },
  locale: {
    label: 'Language',
    'pt-BR': 'Português',
    'en-US': 'English',
    'es-ES': 'Español',
  },
  notFound: {
    title: 'Page not found',
    description: 'The address you visited does not exist.',
    backHome: 'Back to home',
  },
  pages: {
    discover: 'Discover',
    watchlist: 'My list',
    login: 'Sign in',
    movie: (id) => `Movie ${id}`,
  },
}
