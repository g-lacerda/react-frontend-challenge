import { Link } from '@tanstack/react-router'
import { Star, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from '@/shared/i18n'
import { releaseYear } from '../lib/filter-movies'
import { useGenreMap } from '../lib/use-genre-map'
import type { Movie } from '../model/types'
import { MoviePoster } from './movie-poster'

interface MovieCardProps {
  movie: Movie
  action?: ReactNode
}

function joinMeta(parts: Array<string | number | null | undefined>) {
  return parts.filter((part) => part !== null && part !== undefined && part !== '').join(' · ')
}

export function MovieCard({ movie, action }: MovieCardProps) {
  const { t, locale } = useTranslation()
  const genreMap = useGenreMap()

  const year = releaseYear(movie)
  const hasVotes = movie.voteCount > 0
  const rating = movie.voteAverage.toFixed(1)
  const compactVotes = new Intl.NumberFormat(locale, { notation: 'compact' }).format(movie.voteCount)
  const genre = movie.genreIds.map((id) => genreMap.get(id)).find(Boolean)
  const language = movie.originalLanguage?.toUpperCase() || null

  const secondaryMeta = joinMeta([genre, language])
  const fullMeta = joinMeta([year, hasVotes ? t.movie.ratingLabel(rating) : null, hasVotes ? t.movie.votes(movie.voteCount, locale) : null, genre, language])

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-card transition-[border-color,transform] duration-150 hover:border-ink-45">
      <Link to="/movie/$id" params={{ id: movie.id }} className="flex flex-col outline-none focus-visible:outline-2 focus-visible:outline-foreground">
        <MoviePoster path={movie.posterPath} alt={movie.title} />
        <div className="grid gap-1 p-3">
          <h3 className="truncate text-[13px] font-medium" title={movie.title}>
            {movie.title}
          </h3>
          <p className="flex min-w-0 items-center gap-1 font-mono text-[10px] text-ink-70 sm:gap-1.5 sm:text-[10.5px]" title={fullMeta} aria-label={fullMeta}>
            {year ? <span>{year}</span> : null}
            {hasVotes ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-0.5">
                  <Star className="size-3" aria-hidden="true" />
                  {rating}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex min-w-0 items-center gap-0.5">
                  <Users className="size-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{compactVotes}</span>
                </span>
              </>
            ) : null}
          </p>
          <p className="truncate font-mono text-[10.5px] text-ink-45">{secondaryMeta || '—'}</p>
        </div>
      </Link>
      {action ? <div className="absolute top-2 right-2">{action}</div> : null}
    </article>
  )
}
