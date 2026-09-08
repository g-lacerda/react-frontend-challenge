import { ChevronDownIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from 'cn'
import { useTranslation } from '@/shared/i18n'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { Input } from './input'
import { Label } from './label'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

interface ThresholdFieldProps {
  id: string
  label: string
  /** Atalhos oferecidos no menu; zero significa sem filtro. */
  presets: number[]
  value?: number
  max: number
  onChange: (value?: number) => void
  formatOption: (value: number) => string
  anyLabel: string
  customLabel: string
}

/**
 * Campo de valor mínimo: atalhos para os casos comuns e digitação para o resto.
 * Só com botões de mais e menos, chegar a cinco mil exigiria uma centena de cliques.
 */
export function ThresholdField({
  id,
  label,
  presets,
  value,
  max,
  onChange,
  formatOption,
  anyLabel,
  customLabel,
}: ThresholdFieldProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value ?? 0)
  const [ultimoValor, setUltimoValor] = useState(value ?? 0)
  const debouncedDraft = useDebouncedValue(draft, 400)

  // Sincroniza durante a renderização quando o valor muda de fora, como ao limpar os filtros.
  if ((value ?? 0) !== ultimoValor) {
    setUltimoValor(value ?? 0)
    setDraft(value ?? 0)
  }

  useEffect(() => {
    if (debouncedDraft !== draft) return
    const proximo = debouncedDraft > 0 ? debouncedDraft : undefined
    if (proximo !== value) onChange(proximo)
  }, [debouncedDraft, draft, value, onChange])

  function escolher(preset: number) {
    setDraft(preset)
    onChange(preset > 0 ? preset : undefined)
    setOpen(false)
  }

  function digitar(entrada: string) {
    const numero = Number(entrada.replace(/\D/g, ''))
    setDraft(Math.min(max, Number.isNaN(numero) ? 0 : numero))
  }

  return (
    <div className="group/field grid gap-1.5">
      <Label
        htmlFor={id}
        className="label-mono whitespace-nowrap text-ink-45 transition-colors group-focus-within/field:text-foreground"
      >
        {label}
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          className="flex h-9 w-full items-center justify-between gap-1.5 border-b border-input pt-1 pb-2 text-sm transition-colors duration-[260ms] outline-none focus-visible:border-foreground aria-expanded:border-foreground [&_svg]:size-4 [&_svg]:text-ink-45"
        >
          <span className={value ? undefined : 'text-ink-45'}>{value ? formatOption(value) : anyLabel}</span>
          <ChevronDownIcon aria-hidden="true" />
        </PopoverTrigger>

        <PopoverContent aria-label={label} align="start" className="w-64 gap-3 p-3">
          <ul className="grid grid-cols-2 gap-1.5">
            {presets.map((preset) => {
              const ativo = preset === (value ?? 0)
              return (
                <li key={preset}>
                  <button
                    type="button"
                    onClick={() => escolher(preset)}
                    aria-pressed={ativo}
                    className={cn(
                      'w-full rounded-sm px-2 py-1.5 text-left font-mono text-xs transition-colors duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-foreground',
                      ativo ? 'bg-foreground text-background' : 'text-ink-70 hover:bg-ink-06 hover:text-foreground',
                    )}
                  >
                    {preset === 0 ? anyLabel : formatOption(preset)}
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="grid gap-1.5 border-t border-border pt-3">
            <Label htmlFor={`${id}-custom`} className="label-mono text-ink-45">
              {customLabel}
            </Label>
            <Input
              id={`${id}-custom`}
              type="text"
              inputMode="numeric"
              enterKeyHint="done"
              value={draft === 0 ? '' : String(draft)}
              placeholder="0"
              onChange={(event) => digitar(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  escolher(draft)
                }
              }}
              className="font-mono text-xs"
            />
            {/* No celular não há tecla Enter à vista, e o atraso já aplica sozinho. */}
            <p className="hidden text-[11px] text-ink-45 sm:block">{t.filters.pressEnter}</p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
