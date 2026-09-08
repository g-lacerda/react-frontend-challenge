import { useEffect, useMemo } from 'react'
import {
  MovieCard,
  MovieCardSkeleton,
  hasActiveFilters,
  useInfiniteMovies,
  type Movie,
} from '@/entities/movie'
import { MovieFilters, useFiltersStore } from '@/features/movie-filters'
import { WatchlistToggle } from '@/features/watchlist'
import { useTranslation } from '@/shared/i18n'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { useGridColumns } from '@/shared/lib/use-grid-columns'
import { useInView } from '@/shared/lib/use-in-view'
import { Button } from '@/shared/ui/button'
import { Notice } from '@/shared/ui/notice'
import { Spinner } from '@/shared/ui/spinner'

const SKELETON_COUNT = 12

export function HomePage() {
  const { t } = useTranslation()
  const storedFilters = useFiltersStore((state) => state.filters)
  const debouncedQuery = useDebouncedValue(storedFilters.query ?? '')

  const filters = useMemo(
    () => ({ ...storedFilters, query: debouncedQuery }),
    [storedFilters, debouncedQuery],
  )

  const movies = useInfiniteMovies(filters)
  const items = useMemo(() => {
    const byId = new Map<number, Movie>()
    for (const page of movies.data?.pages ?? []) {
      for (const movie of page.results) byId.set(movie.id, movie)
    }
    return [...byId.values()]
  }, [movies.data])
  const total = movies.data?.pages[0]?.totalResults ?? 0

  const { ref: sentinelRef, inView } = useInView()
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = movies

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) void fetchNextPage()
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, items.length])

  const { ref: gridRef, columns } = useGridColumns<HTMLDivElement>()
  const visibleItems = useMemo(() => {
    if (!hasNextPage || columns === 0) return items
    const fullRows = Math.floor(items.length / columns) * columns
    return fullRows > 0 ? items.slice(0, fullRows) : items
  }, [items, columns, hasNextPage])

  const heading = debouncedQuery
    ? t.discover.resultsFor(debouncedQuery)
    : hasActiveFilters(filters)
      ? t.discover.filtered
      : t.discover.trending

  return (
    <div className="grid gap-8">
      <section className="grid gap-5">
        <h1 className="text-2xl">{t.pages.discover}</h1>
        <MovieFilters />
      </section>

      <section className="grid gap-3" aria-busy={movies.isPending}>
        <p role="status" aria-live="polite" className="sr-only">
          {movies.isPending ? t.common.loading : t.discover.count(total)}
        </p>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg">{heading}</h2>
          {movies.isSuccess ? <span className="label-mono text-ink-45">{t.discover.count(total)}</span> : null}
        </div>

        {movies.isError ? (
          <Notice className="flex items-center justify-between gap-3">
            <span>{t.discover.error}</span>
            <Button variant="outline" size="sm" onClick={() => movies.refetch()}>
              {t.common.retry}
            </Button>
          </Notice>
        ) : null}

        {movies.isPending ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <MovieCardSkeleton key={index} />
            ))}
          </div>
        ) : null}

        {movies.isSuccess && items.length === 0 ? (
          <div className="grid animate-fade place-items-center gap-1.5 rounded-md border border-border bg-card px-5 py-11 text-center text-[13px] text-ink-45">
            <p>{t.discover.emptyTitle}</p>
            <p className="text-ink-45">{t.discover.emptyDescription}</p>
          </div>
        ) : null}

        {items.length > 0 ? (
          <div
            ref={gridRef}
            className="stagger grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]"
            style={{ opacity: movies.isPlaceholderData ? 0.5 : 1 }}
          >
            {visibleItems.map((movie) => (
              <MovieCard key={movie.id} movie={movie} action={<WatchlistToggle movie={movie} />} />
            ))}
          </div>
        ) : null}

        <div ref={sentinelRef} className="flex h-12 items-center justify-center">
          {movies.isFetchingNextPage ? <Spinner /> : null}
          {!movies.hasNextPage && items.length > 0 ? (
            <span className="label-mono text-ink-45">{t.discover.endOfList}</span>
          ) : null}
        </div>
      </section>
    </div>
  )
}
