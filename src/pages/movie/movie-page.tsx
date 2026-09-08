import { Link, getRouteApi } from '@tanstack/react-router'
import { ArrowLeft, Star, Users } from 'lucide-react'
import { useMemo } from 'react'
import {
  CastList,
  GenreBadges,
  MoviePoster,
  TrailerEmbed,
  releaseYear,
  useMovieDetails,
  type Movie,
} from '@/entities/movie'
import { WatchlistToggle } from '@/features/watchlist'
import { TmdbError } from '@/shared/api/tmdb-client'
import { tmdbImageUrl } from '@/shared/api/tmdb-client'
import { useTranslation } from '@/shared/i18n'
import { useDocumentTitle } from '@/shared/lib/use-document-title'
import { Button } from '@/shared/ui/button'
import { Notice } from '@/shared/ui/notice'
import { Skeleton } from '@/shared/ui/skeleton'

const route = getRouteApi('/authenticated/movie/$id')

function MovieSkeleton() {
  return (
    <div className="grid gap-8" aria-busy="true">
      <Skeleton className="aspect-video w-full sm:aspect-[21/9]" />
      <div className="grid gap-6 sm:grid-cols-[12rem_1fr] lg:grid-cols-[16rem_1fr]">
        <Skeleton className="aspect-[2/3] w-40 sm:w-full" />
        <div className="grid content-start gap-3">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="mt-4 h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  )
}

export function MoviePage() {
  const { id } = route.useParams()
  const { t, locale } = useTranslation()
  const movie = useMovieDetails(id)

  useDocumentTitle(movie.data?.title)

  const dateFormat = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: 'long' }), [locale])
  const compact = useMemo(() => new Intl.NumberFormat(locale, { notation: 'compact' }), [locale])

  if (movie.isPending) return <MovieSkeleton />

  if (movie.isError) {
    const notFound = movie.error instanceof TmdbError && movie.error.status === 404
    return (
      <div className="mx-auto flex w-full max-w-md animate-rise flex-col gap-6 py-16 text-center">
        <h1 className="text-2xl">{notFound ? t.movie.notFoundTitle : t.movie.errorTitle}</h1>
        <p className="text-sm text-ink-70">{notFound ? t.movie.notFoundDescription : t.movie.errorDescription}</p>
        {!notFound ? (
          <Notice className="text-left font-mono text-xs">{movie.error.message}</Notice>
        ) : null}
        <div className="flex justify-center gap-2">
          {!notFound ? (
            <Button onClick={() => movie.refetch()}>{t.common.retry}</Button>
          ) : null}
          <Button asChild variant="ghost">
            <Link to="/">{t.notFound.backHome}</Link>
          </Button>
        </div>
      </div>
    )
  }

  const details = movie.data
  const asMovie: Movie = { ...details, genreIds: details.genres.map((genre) => genre.id) }
  const year = releaseYear(details)
  const backdrop = tmdbImageUrl(details.backdropPath, 'w780')
  const hasVotes = details.voteCount > 0

  const runtime = details.runtime
    ? t.movie.runtime(Math.floor(details.runtime / 60), details.runtime % 60)
    : null

  const facts = [
    { label: t.movie.releaseDate, value: details.releaseDate ? dateFormat.format(new Date(details.releaseDate)) : t.watchlist.noDate },
    { label: t.movie.runtimeLabel, value: runtime ?? '—' },
    { label: t.movie.language, value: details.originalLanguage.toUpperCase() || '—' },
    {
      label: t.filters.rating,
      value: hasVotes ? `${details.voteAverage.toFixed(1)} · ${t.movie.votes(details.voteCount, locale)}` : '—',
    },
  ]

  return (
    <article className="grid min-w-0 animate-rise gap-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/">
            <ArrowLeft />
            {t.movie.back}
          </Link>
        </Button>
      </div>

      {backdrop ? (
        <div className="relative aspect-video max-h-[420px] w-full overflow-hidden rounded-md border border-border sm:aspect-[21/9]">
          <img src={backdrop} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 bg-background/40" aria-hidden="true" />
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-[12rem_1fr] lg:grid-cols-[16rem_1fr] lg:gap-10">
        <MoviePoster path={details.posterPath} alt={t.movie.posterAlt(details.title)} size="w500" className="w-40 rounded-md border border-border sm:w-full" />

        <div className="grid content-start gap-5">
          <header className="grid gap-2">
            <h1 className="text-[27px] leading-tight tracking-[-0.035em] sm:text-3xl">
              {details.title}
              {year ? <span className="ml-2 font-normal text-ink-45"> {year}</span> : null}
            </h1>
            {details.tagline ? <p className="text-sm text-ink-70 italic">{details.tagline}</p> : null}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-ink-70">
              {hasVotes ? (
                <>
                  <span className="inline-flex items-center gap-1" aria-label={t.movie.ratingLabel(details.voteAverage.toFixed(1))}>
                    <Star className="size-3.5" aria-hidden="true" />
                    {details.voteAverage.toFixed(1)}
                  </span>
                  <span className="inline-flex items-center gap-1" aria-label={t.movie.votes(details.voteCount, locale)}>
                    <Users className="size-3.5" aria-hidden="true" />
                    {compact.format(details.voteCount)}
                  </span>
                </>
              ) : null}
              {runtime ? <span>{runtime}</span> : null}
            </div>
            <GenreBadges genres={details.genres.map((genre) => genre.name)} label={t.movie.genres} />
          </header>

          <WatchlistToggle movie={asMovie} size="default" className="justify-self-start" />

          <section className="grid gap-2">
            <h2 className="label-mono text-ink-45">{t.movie.overview}</h2>
            <p className="max-w-prose text-[15px] leading-relaxed text-ink-70">
              {details.overview || t.movie.noOverview}
            </p>
          </section>

          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="grid gap-1">
                <dt className="label-mono text-ink-45">{fact.label}</dt>
                <dd className="text-sm">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section className="grid min-w-0 gap-3">
        <h2 className="text-lg">{t.movie.cast}</h2>
        {details.cast.length > 0 ? <CastList cast={details.cast} /> : <p className="text-sm text-ink-45">{t.movie.noCast}</p>}
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg">{t.movie.trailer}</h2>
        {details.trailerKey ? (
          <div className="mx-auto w-full max-w-5xl">
            <TrailerEmbed
              videoKey={details.trailerKey}
              title={t.movie.trailerTitle(details.title)}
              backdropPath={details.backdropPath}
              playLabel={t.movie.playTrailer}
            />
          </div>
        ) : (
          <p className="text-sm text-ink-45">{t.movie.noTrailer}</p>
        )}
      </section>
    </article>
  )
}
