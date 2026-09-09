import { useMemo } from 'react'
import { useGenres } from '../api/queries'

export function useGenreMap() {
  const genres = useGenres()

  return useMemo(() => new Map(genres.data?.map((genre) => [genre.id, genre.name]) ?? []), [genres.data])
}
