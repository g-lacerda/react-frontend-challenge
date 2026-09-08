export const ptBR = {
  nav: {
    discover: 'Descobrir',
    watchlist: 'Minha lista',
  },
  theme: {
    useLight: 'Usar tema claro',
    useDark: 'Usar tema escuro',
  },
  locale: {
    label: 'Idioma',
    'pt-BR': 'Português',
    'en-US': 'English',
    'es-ES': 'Español',
  },
  auth: {
    logout: 'Sair',
  },
  login: {
    eyebrow: 'Curadoria de catálogo',
    title: 'Entrar',
    description: 'Acesse com seu e-mail para buscar filmes e montar sua lista.',
    email: 'E-mail',
    password: 'Senha',
    passwordHint: 'Mais de 6 caracteres.',
    submit: 'Entrar',
    welcome: 'Bem-vindo de volta.',
    errors: {
      invalidEmail: 'Informe um e-mail válido.',
      shortPassword: 'A senha precisa ter mais de 6 caracteres.',
    },
  },
  notFound: {
    title: 'Página não encontrada',
    description: 'O endereço que você acessou não existe.',
    backHome: 'Voltar para o início',
  },
  pages: {
    discover: 'Descobrir',
    watchlist: 'Minha lista',
    login: 'Entrar',
    movie: (id: number) => `Filme ${id}`,
  },
}
