import * as React from "react"
import { cn } from "cn"
import { MinusIcon, PlusIcon } from "lucide-react"
import { Input } from "./input"

interface NumberFieldProps extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  buttonStep?: number
  decrementLabel: string
  incrementLabel: string
}

function round(value: number, step: number) {
  const decimals = (String(step).split(".")[1] ?? "").length
  return Number(value.toFixed(decimals))
}

function NumberField({
  value,
  onChange,
  min,
  max,
  step = 1,
  buttonStep = step,
  decrementLabel,
  incrementLabel,
  className,
  ...props
}: NumberFieldProps) {
  function stepBy(direction: -1 | 1) {
    const next = round(value + direction * buttonStep, step)
    onChange(Math.min(max, Math.max(min, next)))
  }

  const stepperClass =
    "grid size-7 shrink-0 place-items-center rounded-sm text-ink-45 transition-colors duration-150 hover:bg-ink-06 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-foreground disabled:pointer-events-none disabled:opacity-35 [&_svg]:size-3.5"

  return (
    <div data-slot="number-field" className={cn("flex items-end gap-1", className)}>
      <button type="button" tabIndex={-1} aria-label={decrementLabel} onClick={() => stepBy(-1)} disabled={value <= min} className={stepperClass}>
        <MinusIcon />
      </button>
      <Input
        type="number"
        inputMode="decimal"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="text-center font-mono text-xs"
        {...props}
      />
      <button type="button" tabIndex={-1} aria-label={incrementLabel} onClick={() => stepBy(1)} disabled={value >= max} className={stepperClass}>
        <PlusIcon />
      </button>
    </div>
  )
}

export { NumberField }
