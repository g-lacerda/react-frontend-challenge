import { Link } from '@tanstack/react-router'
import { Star, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from '@/shared/i18n'
import { playWhoosh } from '@/shared/lib/sounds'
import { WithTooltip } from '@/shared/ui/with-tooltip'
import { releaseYear } from '../lib/filter-movies'
import { useGenreMap } from '../lib/use-genre-map'
import type { Movie } from '../model/types'
import { GenreBadges } from './genre-badges'
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
  const genres = movie.genreIds.map((id) => genreMap.get(id)).filter((name): name is string => Boolean(name))
  const language = movie.originalLanguage?.toUpperCase() || null

  const fullMeta = joinMeta([
    year,
    hasVotes ? t.movie.ratingLabel(rating) : null,
    hasVotes ? t.movie.votes(movie.voteCount, locale) : null,
    genres.join(', '),
    language,
  ])

  function handlePointerEnter(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse') return
    const { left, width } = event.currentTarget.getBoundingClientRect()
    playWhoosh((left + width / 2) / window.innerWidth)
  }

  return (
    <article
      onPointerEnter={handlePointerEnter}
      className="group flex flex-col overflow-hidden rounded-md border border-border bg-card transition-[border-color] duration-150 hover:border-ink-45"
    >
      <Link to="/movie/$id" params={{ id: movie.id }} tabIndex={-1} aria-hidden="true" className="block">
        <MoviePoster path={movie.posterPath} alt="" />
      </Link>
      <div className="grid gap-3 p-3">
        <Link
          to="/movie/$id"
          params={{ id: movie.id }}
          className="grid min-w-0 flex-1 gap-1 rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          <h3 className="truncate text-[13px] font-medium" title={movie.title}>
            {movie.title}
          </h3>
          <p
            className="flex min-w-0 items-center gap-1 font-mono text-[10px] text-ink-70 sm:gap-1.5 sm:text-[10.5px]"
            title={fullMeta}
            aria-label={fullMeta}
          >
            {year ? <span>{year}</span> : null}
            {hasVotes ? (
              <>
                <span aria-hidden="true">·</span>
                <WithTooltip label={t.movie.ratingLabel(rating)} side="top">
                  <span className="inline-flex items-center gap-0.5" tabIndex={-1}>
                    <Star className="size-3" aria-hidden="true" />
                    {rating}
                  </span>
                </WithTooltip>
                <span aria-hidden="true">·</span>
                <WithTooltip label={t.movie.votes(movie.voteCount, locale)} side="top">
                  <span className="inline-flex min-w-0 items-center gap-0.5" tabIndex={-1}>
                    <Users className="size-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">{compactVotes}</span>
                  </span>
                </WithTooltip>
              </>
            ) : null}
          </p>
          <div className="flex min-w-0 items-center gap-1.5">
            <GenreBadges genres={genres} max={2} label={t.filters.genre} />
            {language ? (
              <WithTooltip label={t.filters.language} side="top">
                <span
                  className="ml-auto shrink-0 font-mono text-[10px] text-ink-45 sm:text-[10.5px]"
                  tabIndex={-1}
                >
                  {language}
                </span>
              </WithTooltip>
            ) : null}
            {genres.length === 0 && !language ? (
              <span className="font-mono text-[10px] text-ink-45">—</span>
            ) : null}
          </div>
        </Link>
        {action}
      </div>
    </article>
  )
}
