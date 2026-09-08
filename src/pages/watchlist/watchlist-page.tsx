import { Link } from '@tanstack/react-router'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, Star, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { MoviePoster, releaseYear, useGenreMap } from '@/entities/movie'
import { useWatchlistStore, type WatchlistItem } from '@/features/watchlist'
import { useTranslation } from '@/shared/i18n'
import { playSound } from '@/shared/lib/sounds'
import { Button } from '@/shared/ui/button'
import { Combobox } from '@/shared/ui/combobox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

interface Row extends WatchlistItem {
  genre: string
}

const columnHelper = createColumnHelper<Row>()

export function WatchlistPage() {
  const { t, locale } = useTranslation()
  const items = useWatchlistStore((state) => state.items)
  const remove = useWatchlistStore((state) => state.remove)
  const genreMap = useGenreMap()
  const [sorting, setSorting] = useState<SortingState>([])

  const dateFormat = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }), [locale])

  const rows = useMemo<Row[]>(
    () => items.map((item) => ({ ...item, genre: item.genreIds.map((id) => genreMap.get(id)).find(Boolean) ?? '' })),
    [items, genreMap],
  )

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
            <MoviePoster path={row.original.posterPath} alt="" size="w185" className="w-9 shrink-0 rounded-sm" />
            <span className="font-medium">{row.original.title}</span>
          </Link>
        ),
      }),
      columnHelper.accessor('genre', {
        header: t.watchlist.columns.genre,
        cell: ({ getValue }) => getValue() || '—',
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
        cell: ({ getValue }) => (
          <span className="inline-flex items-center gap-1 font-mono text-xs">
            <Star className="size-3" aria-hidden="true" />
            {getValue().toFixed(1)}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: t.watchlist.columns.actions,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleRemove(row.original)}
            aria-label={`${t.watchlist.remove}: ${row.original.title}`}
            title={t.watchlist.remove}
          >
            <Trash2 />
          </Button>
        ),
        enableSorting: false,
      }),
    ],
    [t, dateFormat, handleRemove],
  )

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const sortableColumns = table.getAllColumns().filter((column) => column.getCanSort())
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
          <p className="label-mono text-ink-45">{t.watchlist.count(items.length)}</p>
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
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="stagger grid gap-2 sm:hidden">
        {table.getRowModel().rows.map(({ original: item }) => (
          <li key={item.id} className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
            <Link to="/movie/$id" params={{ id: item.id }} className="flex min-w-0 flex-1 items-center gap-3">
              <MoviePoster path={item.posterPath} alt="" size="w185" className="w-11 shrink-0 rounded-sm" />
              <span className="grid min-w-0 gap-0.5">
                <span className="truncate text-[15px] font-medium">{item.title}</span>
                <span className="truncate font-mono text-xs text-ink-45">
                  {[item.genre || null, releaseYear(item), `★ ${item.voteAverage.toFixed(1)}`].filter(Boolean).join(' · ')}
                </span>
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleRemove(item)}
              aria-label={`${t.watchlist.remove}: ${item.title}`}
              title={t.watchlist.remove}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
