import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { cn } from 'cn'
import { SORT_OPTIONS, countActiveFilters, useGenres, useLanguages, type SortOption } from '@/entities/movie'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import { Combobox, type ComboboxOption } from '@/shared/ui/combobox'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { NumberField } from '@/shared/ui/number-field'
import { TextField } from '@/shared/ui/text-field'
import { useFiltersStore } from '../model/filters-store'
import { RangeField } from '@/shared/ui/range-field'

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS: ComboboxOption[] = Array.from({ length: CURRENT_YEAR - 1949 }, (_, index) => {
  const year = String(CURRENT_YEAR - index)
  return { value: year, label: year }
})

function toNumber(value?: string) {
  return value ? Number(value) : undefined
}

interface FilterFieldProps {
  id: string
  label: string
  hint?: string
  children: React.ReactNode
}

function FilterField({ id, label, hint, children }: FilterFieldProps) {
  return (
    <div className="group/field grid gap-1.5">
      <Label
        htmlFor={id}
        className="label-mono whitespace-nowrap text-ink-45 transition-colors group-focus-within/field:text-foreground"
      >
        {label}
      </Label>
      {children}
      {hint ? <p className="text-[11.5px] text-ink-45">{hint}</p> : null}
    </div>
  )
}

export function MovieFilters() {
  const { t, locale } = useTranslation()
  const genres = useGenres()
  const languages = useLanguages()
  const { filters, setQuery, patch, reset } = useFiltersStore()
  const {
    query = '',
    genreId,
    year,
    minRating,
    maxRating,
    sortBy,
    minRuntime,
    maxRuntime,
    originalLanguage,
    minVotes,
  } = filters

  const activeCount = countActiveFilters(filters)
  const isDirty = Boolean(query) || activeCount > 0
  const isSearching = query.trim().length > 0
  const [open, setOpen] = useState(activeCount > 0)
  const panelId = useId()

  const genreOptions = useMemo<ComboboxOption[]>(
    () =>
      genres.data?.map((genre) => ({
        value: String(genre.id),
        label: genre.name,
      })) ?? [],
    [genres.data],
  )

  const languageOptions = useMemo<ComboboxOption[]>(() => {
    const names = new Intl.DisplayNames([locale], { type: 'language' })
    return (languages.data ?? [])
      .map((language) => {
        let label = language.englishName
        try {
          label = names.of(language.code) ?? language.englishName
        } catch {
          /* código fora do padrão BCP 47: mantém o nome em inglês */
        }
        return { value: language.code, label }
      })
      .sort((a, b) => a.label.localeCompare(b.label, locale))
  }, [languages.data, locale])

  const sortOptions = useMemo<ComboboxOption[]>(
    () =>
      SORT_OPTIONS.map((option) => ({
        value: option,
        label: t.filters.sortOptions[option],
      })),
    [t],
  )

  const discoverOnlyHint = isSearching ? t.filters.discoverOnly : undefined

  return (
    <div className="grid gap-5">
      <div className="flex min-w-0 items-end gap-3">
        <TextField label={t.filters.search} htmlFor="search" className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Search className="size-4 shrink-0 text-ink-45" aria-hidden="true" />
            <Input
              id="search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.filters.searchPlaceholder}
              autoComplete="off"
            />
          </div>
        </TextField>

        <Button
          variant={open ? 'default' : 'outline'}
          size="sm"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className="mb-0.5"
        >
          <SlidersHorizontal />
          {t.filters.title}
          {activeCount > 0 ? <span className="font-mono text-[10px] opacity-70">{activeCount}</span> : null}
        </Button>
      </div>

      <div
        id={panelId}
        className={cn('animate-rise rounded-md border border-border bg-card p-4', !open && 'hidden')}
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <FilterField id="genre" label={t.filters.genre}>
            <Combobox
              id="genre"
              value={genreId ? String(genreId) : undefined}
              onChange={(next) => patch({ genreId: toNumber(next) })}
              options={genreOptions}
              placeholder={t.filters.any}
              searchPlaceholder={t.filters.searchGenre}
              emptyText={t.filters.noResults}
            />
          </FilterField>

          <FilterField id="year" label={t.filters.year}>
            <Combobox
              id="year"
              value={year ? String(year) : undefined}
              onChange={(next) => patch({ year: toNumber(next) })}
              options={YEAR_OPTIONS}
              placeholder={t.filters.any}
              searchPlaceholder={t.filters.searchYear}
              emptyText={t.filters.noResults}
            />
          </FilterField>

          <RangeField
            id="rating"
            label={t.filters.rating}
            minLabel={t.filters.ratingMin}
            maxLabel={t.filters.ratingMax}
            bounds={[0, 10]}
            step={0.1}
            buttonStep={1}
            min={minRating}
            max={maxRating}
            onChange={(nextMin, nextMax) => patch({ minRating: nextMin, maxRating: nextMax })}
          />

          <FilterField id="language" label={t.filters.language}>
            <Combobox
              id="language"
              value={originalLanguage}
              onChange={(next) => patch({ originalLanguage: next })}
              options={languageOptions}
              placeholder={t.filters.any}
              searchPlaceholder={t.filters.searchLanguage}
              emptyText={t.filters.noResults}
            />
          </FilterField>

          <FilterField id="votes" label={t.filters.minVotes}>
            <NumberField
              id="votes"
              value={minVotes ?? 0}
              min={0}
              max={50000}
              step={50}
              onChange={(next) => patch({ minVotes: next > 0 ? next : undefined })}
              decrementLabel={t.common.decrement}
              incrementLabel={t.common.increment}
            />
          </FilterField>

          <RangeField
            id="runtime"
            label={t.filters.runtime}
            minLabel={t.filters.runtimeMin}
            maxLabel={t.filters.runtimeMax}
            bounds={[0, 240]}
            step={5}
            min={minRuntime}
            max={maxRuntime}
            format={(value) => t.filters.minutes(value)}
            onChange={(nextMin, nextMax) => patch({ minRuntime: nextMin, maxRuntime: nextMax })}
            disabled={isSearching}
            hint={discoverOnlyHint}
          />

          <FilterField id="sort" label={t.filters.sort} hint={discoverOnlyHint}>
            <Combobox
              id="sort"
              value={sortBy}
              onChange={(next) => patch({ sortBy: next as SortOption | undefined })}
              options={sortOptions}
              placeholder={t.filters.sortOptions['popularity.desc']}
              searchPlaceholder={t.filters.searchSort}
              emptyText={t.filters.noResults}
              disabled={isSearching}
            />
          </FilterField>

          <Button
            variant="outline"
            onClick={reset}
            disabled={!isDirty}
            className="w-full sm:col-span-2 lg:col-span-1 lg:self-end"
          >
            <X />
            {t.filters.reset}
          </Button>
        </div>
      </div>
    </div>
  )
}
