import { env } from '@/shared/config/env'

type QueryParams = Record<string, string | number | boolean | undefined>

export class TmdbError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'TmdbError'
  }
}

export async function tmdbGet<T>(path: string, params: QueryParams = {}, signal?: AbortSignal): Promise<T> {
  const url = new URL(env.tmdbBaseUrl + path)

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url, {
    signal,
    headers: {
      Authorization: `Bearer ${env.tmdbToken}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new TmdbError(response.status, `TMDB respondeu ${response.status} em ${path}`)
  }

  return response.json() as Promise<T>
}

export type ImageSize = 'w185' | 'w342' | 'w500' | 'w780' | 'original'

export function tmdbImageUrl(path: string | null, size: ImageSize = 'w500') {
  return path ? `${env.tmdbImageUrl}/${size}${path}` : null
}
