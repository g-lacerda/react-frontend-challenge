const token = import.meta.env.VITE_TMDB_API_READ_ACCESS_TOKEN

if (!token) {
  throw new Error(
    'VITE_TMDB_API_READ_ACCESS_TOKEN não definido. Copie o .env.example para .env.local e preencha o token.',
  )
}

export const env = {
  tmdbToken: token,
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  tmdbImageUrl: 'https://image.tmdb.org/t/p',
} as const
