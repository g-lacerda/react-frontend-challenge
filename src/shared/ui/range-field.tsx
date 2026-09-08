import { ChevronDownIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from 'cn'
import { useTranslation } from '@/shared/i18n'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { Label } from '@/shared/ui/label'
import { NumberField } from '@/shared/ui/number-field'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Slider } from '@/shared/ui/slider'

type Range = [number, number]

interface RangeFieldProps {
  id: string
  label: string
  minLabel: string
  maxLabel: string
  bounds: Range
  step: number
  buttonStep?: number
  min?: number
  max?: number
  onChange: (min?: number, max?: number) => void
  format?: (value: number) => string
  disabled?: boolean
  hint?: string
}

function sameRange(a: Range, b: Range) {
  return a[0] === b[0] && a[1] === b[1]
}

export function RangeField({
  id,
  label,
  minLabel,
  maxLabel,
  bounds,
  step,
  buttonStep,
  min = bounds[0],
  max = bounds[1],
  onChange,
  format = String,
  disabled,
  hint,
}: RangeFieldProps) {
  const { t } = useTranslation()
  const [low, high] = bounds
  const decimals = (String(step).split('.')[1] ?? '').length
  const external: Range = [min, max]

  const [draft, setDraft] = useState<Range>(external)
  const [lastExternal, setLastExternal] = useState<Range>(external)

  if (!sameRange(external, lastExternal)) {
    setLastExternal(external)
    setDraft(external)
  }

  const debouncedDraft = useDebouncedValue(draft, 300)

  useEffect(() => {
    const settled = sameRange(debouncedDraft, draft)
    if (!settled || sameRange(debouncedDraft, [min, max])) return
    const [nextMin, nextMax] = debouncedDraft
    onChange(nextMin > low ? nextMin : undefined, nextMax < high ? nextMax : undefined)
  }, [debouncedDraft, draft, min, max, low, high, onChange])

  const [draftMin, draftMax] = draft
  const isDefault = draftMin === low && draftMax === high
  const summary = isDefault ? t.filters.any : `${format(draftMin)} – ${format(draftMax)}`

  function clamp(value: number) {
    const rounded = Number(value.toFixed(decimals))
    return Math.min(high, Math.max(low, rounded))
  }

  function update(nextMin: number, nextMax: number) {
    setDraft([clamp(Math.min(nextMin, nextMax)), clamp(Math.max(nextMin, nextMax))])
  }

  return (
    <div className={cn('group/field grid gap-1.5', disabled && 'opacity-35')}>
      <Label htmlFor={id} className="label-mono whitespace-nowrap text-ink-45 transition-colors group-focus-within/field:text-foreground">
        {label}
      </Label>
      <Popover>
        <PopoverTrigger
          id={id}
          disabled={disabled}
          title={disabled ? hint : undefined}
          className="flex h-9 w-full items-center justify-between gap-1.5 border-b border-input pt-1 pb-2 text-sm transition-colors duration-[260ms] outline-none focus-visible:border-foreground disabled:cursor-not-allowed aria-expanded:border-foreground [&_svg]:size-4 [&_svg]:text-ink-45"
        >
          <span className={isDefault ? 'text-ink-45' : undefined}>{summary}</span>
          <ChevronDownIcon aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent aria-label={label} align="start" className="w-80 gap-4">
          <p className="label-mono text-ink-45">{label}</p>
          <Slider
            min={low}
            max={high}
            step={step}
            value={draft}
            minStepsBetweenThumbs={1}
            onValueChange={([nextMin, nextMax]) => update(nextMin ?? low, nextMax ?? high)}
            thumbLabels={[minLabel, maxLabel]}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor={`${id}-min`} className="label-mono text-ink-45">
                {minLabel}
              </Label>
              <NumberField
                id={`${id}-min`}
                value={draftMin}
                min={low}
                max={high}
                step={step}
                buttonStep={buttonStep}
                onChange={(next) => update(next, draftMax)}
                decrementLabel={t.common.decrement}
                incrementLabel={t.common.increment}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`${id}-max`} className="label-mono text-ink-45">
                {maxLabel}
              </Label>
              <NumberField
                id={`${id}-max`}
                value={draftMax}
                min={low}
                max={high}
                step={step}
                buttonStep={buttonStep}
                onChange={(next) => update(draftMin, next)}
                decrementLabel={t.common.decrement}
                incrementLabel={t.common.increment}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {disabled && hint ? <p className="text-[11.5px] text-ink-45">{hint}</p> : null}
    </div>
  )
}
