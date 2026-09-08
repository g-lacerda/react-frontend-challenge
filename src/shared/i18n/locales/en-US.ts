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
  auth: {
    logout: 'Sign out',
  },
  login: {
    eyebrow: 'Catalog curation',
    title: 'Sign in',
    description: 'Use your email to search movies and build your list.',
    email: 'Email',
    password: 'Password',
    passwordHint: 'More than 6 characters.',
    submit: 'Sign in',
    welcome: 'Welcome back.',
    errors: {
      invalidEmail: 'Enter a valid email.',
      shortPassword: 'Password must be longer than 6 characters.',
    },
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
