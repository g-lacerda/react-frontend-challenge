import { Link } from '@tanstack/react-router'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, Star, Trash2, Users } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { GenreBadges, MoviePoster, releaseYear, useGenreMap } from '@/entities/movie'
import {
  EMPTY_WATCHLIST_FILTERS,
  WatchlistFilters,
  useWatchlistStore,
  type WatchlistFilterValues,
  type WatchlistItem,
} from '@/features/watchlist'
import { useTranslation } from '@/shared/i18n'
import { playSound } from '@/shared/lib/sounds'
import { Button } from '@/shared/ui/button'
import { Combobox, type ComboboxOption } from '@/shared/ui/combobox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { WithTooltip } from '@/shared/ui/with-tooltip'

interface Row extends WatchlistItem {
  genres: string[]
  genre: string
  year: number | null
}

const columnHelper = createColumnHelper<Row>()

export function WatchlistPage() {
  const { t, locale } = useTranslation()
  const items = useWatchlistStore((state) => state.items)
  const remove = useWatchlistStore((state) => state.remove)
  const genreMap = useGenreMap()
  const [sorting, setSorting] = useState<SortingState>([])
  const [filters, setFilters] = useState<WatchlistFilterValues>(EMPTY_WATCHLIST_FILTERS)

  const dateFormat = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }), [locale])
  const compact = useMemo(() => new Intl.NumberFormat(locale, { notation: 'compact' }), [locale])

  const rows = useMemo<Row[]>(
    () =>
      items
        .map((item) => ({
          ...item,
          genres: item.genreIds.map((id) => genreMap.get(id)).filter((name): name is string => Boolean(name)),
          year: releaseYear(item),
        }))
        .map((row) => ({ ...row, genre: row.genres.join(', ') })),
    [items, genreMap],
  )

  const genreOptions = useMemo<ComboboxOption[]>(
    () =>
      [...new Set(rows.flatMap((row) => row.genres))].sort().map((genre) => ({ value: genre, label: genre })),
    [rows],
  )
  const languageOptions = useMemo<ComboboxOption[]>(() => {
    const names = new Intl.DisplayNames([locale], { type: 'language' })
    return [...new Set(rows.map((row) => row.originalLanguage).filter(Boolean))]
      .map((code) => {
        let label = code.toUpperCase()
        try {
          label = names.of(code) ?? label
        } catch {
          /* código fora do padrão: mantém a sigla */
        }
        return { value: code, label }
      })
      .sort((a, b) => a.label.localeCompare(b.label, locale))
  }, [rows, locale])

  const yearOptions = useMemo<ComboboxOption[]>(
    () =>
      [...new Set(rows.map((row) => row.year).filter((year): year is number => year !== null))]
        .sort((a, b) => b - a)
        .map((year) => ({ value: String(year), label: String(year) })),
    [rows],
  )

  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const next: ColumnFiltersState = []
    if (filters.genre) next.push({ id: 'genre', value: filters.genre })
    if (filters.year) next.push({ id: 'year', value: filters.year })
    if (filters.minRating !== undefined || filters.maxRating !== undefined) {
      next.push({ id: 'voteAverage', value: [filters.minRating ?? 0, filters.maxRating ?? 10] })
    }
    if (filters.language) next.push({ id: 'originalLanguage', value: filters.language })
    if (filters.minVotes) next.push({ id: 'voteCount', value: [filters.minVotes, Number.MAX_SAFE_INTEGER] })
    return next
  }, [filters])

  const handleRemove = useCallback(
    (item: Row) => {
      remove(item.id)
      playSound('remove')
      toast(t.watchlist.removed(item.title))
    },
    [remove, t],
  )

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: t.watchlist.columns.title,
        cell: ({ row }) => (
          <Link
            to="/movie/$id"
            params={{ id: row.original.id }}
            className="flex items-center gap-3 outline-none focus-visible:outline-2 focus-visible:outline-foreground"
          >
            <MoviePoster
              path={row.original.posterPath}
              alt=""
              size="w185"
              className="w-9 shrink-0 rounded-sm"
            />
            <span className="font-medium">{row.original.title}</span>
          </Link>
        ),
      }),
      columnHelper.accessor('genre', {
        header: t.watchlist.columns.genre,
        cell: ({ row }) =>
          row.original.genres.length > 0 ? (
            <GenreBadges genres={row.original.genres} label={t.filters.genre} />
          ) : (
            '—'
          ),
        filterFn: (row, _columnId, value: string) => row.original.genres.includes(value),
      }),
      columnHelper.accessor('year', {
        id: 'year',
        header: t.filters.year,
        filterFn: 'equals',
        enableSorting: false,
      }),
      columnHelper.accessor('releaseDate', {
        header: t.watchlist.columns.releaseDate,
        cell: ({ getValue }) => {
          const value = getValue()
          return value ? dateFormat.format(new Date(value)) : t.watchlist.noDate
        },
        sortUndefined: 'last',
      }),
      columnHelper.accessor('voteAverage', {
        header: t.watchlist.columns.rating,
        filterFn: 'inNumberRange',
        cell: ({ getValue }) => (
          <span className="inline-flex items-center gap-1 font-mono text-xs">
            <Star className="size-3" aria-hidden="true" />
            {getValue().toFixed(1)}
          </span>
        ),
      }),
      columnHelper.accessor('voteCount', {
        header: t.watchlist.columns.votes,
        filterFn: 'inNumberRange',
        cell: ({ getValue }) => (
          <span className="inline-flex items-center gap-1 font-mono text-xs">
            <Users className="size-3" aria-hidden="true" />
            {compact.format(getValue())}
          </span>
        ),
      }),
      columnHelper.accessor('originalLanguage', {
        header: t.watchlist.columns.language,
        filterFn: 'equalsString',
        cell: ({ getValue }) => <span className="font-mono text-xs">{getValue().toUpperCase() || '—'}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: t.watchlist.columns.actions,
        cell: ({ row }) => (
          <WithTooltip label={t.watchlist.remove}>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleRemove(row.original)}
              aria-label={`${t.watchlist.remove}: ${row.original.title}`}
            >
              <Trash2 />
            </Button>
          </WithTooltip>
        ),
        enableSorting: false,
      }),
    ],
    [t, dateFormat, compact, handleRemove],
  )

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnFilters, globalFilter: filters.query, columnVisibility: { year: false } },
    onSortingChange: setSorting,
    globalFilterFn: (row, _columnId, value: string) =>
      row.original.title.toLowerCase().includes(value.trim().toLowerCase()),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const visibleRows = table.getRowModel().rows

  const sortableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanSort() && column.getIsVisible())
  const activeSort = sorting[0]
  const sortOptions = sortableColumns.flatMap((column) => {
    const label = String(column.columnDef.header)
    return [
      { value: `${column.id}:asc`, label: `${label} ↑` },
      { value: `${column.id}:desc`, label: `${label} ↓` },
    ]
  })

  if (items.length === 0) {
    return (
      <div className="grid gap-6">
        <h1 className="text-2xl">{t.pages.watchlist}</h1>
        <div className="grid animate-fade place-items-center gap-3 rounded-md border border-border bg-card px-5 py-14 text-center">
          <p className="text-[13px] text-ink-70">{t.watchlist.emptyTitle}</p>
          <p className="text-xs text-ink-45">{t.watchlist.emptyDescription}</p>
          <Button asChild variant="outline" size="sm" className="mt-2">
            <Link to="/">{t.watchlist.goDiscover}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-2xl">{t.pages.watchlist}</h1>
          <p className="label-mono text-ink-45">
            {visibleRows.length === items.length
              ? t.watchlist.count(items.length)
              : `${visibleRows.length} / ${t.watchlist.count(items.length)}`}
          </p>
        </div>

        <div className="grid w-full gap-1.5 sm:hidden">
          <label htmlFor="watchlist-sort" className="label-mono text-ink-45">
            {t.watchlist.sortBy}
          </label>
          <Combobox
            id="watchlist-sort"
            value={activeSort ? `${activeSort.id}:${activeSort.desc ? 'desc' : 'asc'}` : undefined}
            onChange={(next) => {
              if (!next) return setSorting([])
              const [id, direction] = next.split(':')
              setSorting([{ id: id ?? '', desc: direction === 'desc' }])
            }}
            options={sortOptions}
            placeholder={t.watchlist.sortBy}
            searchPlaceholder={t.watchlist.sortBy}
            emptyText={t.filters.noResults}
          />
        </div>
      </div>

      <WatchlistFilters
        value={filters}
        onChange={setFilters}
        genreOptions={genreOptions}
        yearOptions={yearOptions}
        languageOptions={languageOptions}
      />

      {visibleRows.length === 0 ? (
        <div className="grid animate-fade place-items-center gap-1.5 rounded-md border border-border bg-card px-5 py-11 text-center text-[13px] text-ink-45">
          <p>{t.discover.emptyTitle}</p>
          <p className="text-ink-28">{t.discover.emptyDescription}</p>
        </div>
      ) : null}

      <div className="hidden overflow-x-auto rounded-md border border-border bg-card sm:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  const ariaSort = sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'
                  const SortIcon = sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ArrowUpDown

                  return (
                    <TableHead key={header.id} scope="col" aria-sort={canSort ? ariaSort : undefined}>
                      {canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="label-mono inline-flex items-center gap-1.5 text-ink-45 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground aria-[sort=ascending]:text-foreground aria-[sort=descending]:text-foreground"
                          aria-sort={ariaSort}
                          aria-label={`${String(header.column.columnDef.header)} · ${sorted === 'asc' ? t.watchlist.sortDesc : t.watchlist.sortAsc}`}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <SortIcon className="size-3" aria-hidden="true" />
                        </button>
                      ) : (
                        <span className="label-mono text-ink-45">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {visibleRows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="stagger grid gap-2 sm:hidden">
        {visibleRows.map(({ original: item }) => (
          <li key={item.id} className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
            <Link to="/movie/$id" params={{ id: item.id }} className="flex min-w-0 flex-1 items-center gap-3">
              <MoviePoster path={item.posterPath} alt="" size="w185" className="w-11 shrink-0 rounded-sm" />
              <span className="grid min-w-0 gap-0.5">
                <span className="truncate text-[15px] font-medium">{item.title}</span>
                <span className="truncate font-mono text-xs text-ink-45">
                  {[
                    releaseYear(item),
                    `★ ${item.voteAverage.toFixed(1)}`,
                    compact.format(item.voteCount),
                    item.originalLanguage.toUpperCase() || null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                <GenreBadges genres={item.genres} max={3} label={t.filters.genre} />
              </span>
            </Link>
            <WithTooltip label={t.watchlist.remove}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleRemove(item)}
                aria-label={`${t.watchlist.remove}: ${item.title}`}
              >
                <Trash2 />
              </Button>
            </WithTooltip>
          </li>
        ))}
      </ul>
    </div>
  )
}
