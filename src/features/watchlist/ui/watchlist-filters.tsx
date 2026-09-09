import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useId, useState } from 'react'
import { SEARCH_MAX_LENGTH } from '@/entities/movie'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import { CollapsiblePanel } from '@/shared/ui/collapsible-panel'
import { Combobox, type ComboboxOption } from '@/shared/ui/combobox'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { RangeField } from '@/shared/ui/range-field'
import { ThresholdField } from '@/shared/ui/threshold-field'
import { TextField } from '@/shared/ui/text-field'

import {
  EMPTY_WATCHLIST_FILTERS,
  countActiveWatchlistFilters,
  type WatchlistFilterValues,
} from '../model/watchlist-filters'

const VOTE_PRESETS = [0, 100, 500, 1000, 5000, 10000]

interface WatchlistFiltersProps {
  value: WatchlistFilterValues
  onChange: (value: WatchlistFilterValues) => void
  genreOptions: ComboboxOption[]
  yearOptions: ComboboxOption[]
  languageOptions: ComboboxOption[]
}

export function WatchlistFilters({
  value,
  onChange,
  genreOptions,
  yearOptions,
  languageOptions,
}: WatchlistFiltersProps) {
  const { t, locale } = useTranslation()
  const panelId = useId()
  const activeCount = countActiveWatchlistFilters(value)
  const isDirty = Boolean(value.query) || activeCount > 0
  const [open, setOpen] = useState(activeCount > 0)

  function patch(changes: Partial<WatchlistFilterValues>) {
    onChange({ ...value, ...changes })
  }

  return (
    <div className="grid gap-5">
      <div className="flex min-w-0 items-end gap-3">
        <TextField label={t.filters.search} htmlFor="watchlist-search" className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Search className="size-4 shrink-0 text-ink-45" aria-hidden="true" />
            <Input
              id="watchlist-search"
              type="search"
              value={value.query}
              onChange={(event) => patch({ query: event.target.value })}
              placeholder={t.filters.searchPlaceholder}
              autoComplete="off"
              maxLength={SEARCH_MAX_LENGTH}
            />
          </div>
        </TextField>

        <Button
          variant={open ? 'default' : 'outline'}
          size="sm"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls={panelId}
          className="mb-0.5"
        >
          <SlidersHorizontal />
          {t.filters.title}
          {activeCount > 0 ? <span className="font-mono text-[10px] opacity-70">{activeCount}</span> : null}
        </Button>
      </div>

      <CollapsiblePanel open={open} id={panelId} className="rounded-md border border-border bg-card p-4">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group/field grid gap-1.5">
            <Label
              htmlFor="watchlist-genre"
              className="label-mono text-ink-45 transition-colors group-focus-within/field:text-foreground"
            >
              {t.filters.genre}
            </Label>
            <Combobox
              id="watchlist-genre"
              value={value.genre}
              onChange={(next) => patch({ genre: next })}
              options={genreOptions}
              placeholder={t.filters.any}
              searchPlaceholder={t.filters.searchGenre}
              emptyText={t.filters.noResults}
            />
          </div>

          <div className="group/field grid gap-1.5">
            <Label
              htmlFor="watchlist-year"
              className="label-mono text-ink-45 transition-colors group-focus-within/field:text-foreground"
            >
              {t.filters.year}
            </Label>
            <Combobox
              id="watchlist-year"
              value={value.year ? String(value.year) : undefined}
              onChange={(next) => patch({ year: next ? Number(next) : undefined })}
              options={yearOptions}
              placeholder={t.filters.any}
              searchPlaceholder={t.filters.searchYear}
              emptyText={t.filters.noResults}
            />
          </div>

          <RangeField
            id="watchlist-rating"
            label={t.filters.rating}
            minLabel={t.filters.ratingMin}
            maxLabel={t.filters.ratingMax}
            bounds={[0, 10]}
            step={0.1}
            buttonStep={1}
            min={value.minRating}
            max={value.maxRating}
            onChange={(nextMin, nextMax) => patch({ minRating: nextMin, maxRating: nextMax })}
          />
          <div className="group/field grid gap-1.5">
            <Label
              htmlFor="watchlist-language"
              className="label-mono text-ink-45 transition-colors group-focus-within/field:text-foreground"
            >
              {t.filters.language}
            </Label>
            <Combobox
              id="watchlist-language"
              value={value.language}
              onChange={(next) => patch({ language: next })}
              options={languageOptions}
              placeholder={t.filters.any}
              searchPlaceholder={t.filters.searchLanguage}
              emptyText={t.filters.noResults}
            />
          </div>

          <ThresholdField
            id="watchlist-votes"
            label={t.filters.minVotes}
            presets={VOTE_PRESETS}
            value={value.minVotes}
            max={100000}
            onChange={(next) => patch({ minVotes: next })}
            formatOption={(votes) => t.filters.votesOption(votes, locale)}
            anyLabel={t.filters.any}
            customLabel={t.filters.customValue}
          />

          <Button
            variant="outline"
            onClick={() => onChange(EMPTY_WATCHLIST_FILTERS)}
            disabled={!isDirty}
            className="w-full sm:col-span-2 lg:col-span-1 lg:col-start-3 lg:self-end"
          >
            <X />
            {t.filters.reset}
          </Button>
        </div>
      </CollapsiblePanel>
    </div>
  )
}
