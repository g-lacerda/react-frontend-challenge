import { cn } from "cn"

export interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface SegmentedProps<T extends string> {
  id?: string
  value: T
  onChange: (value: T) => void
  options: SegmentedOption<T>[]
  "aria-label"?: string
  "aria-labelledby"?: string
  className?: string
}

function Segmented<T extends string>({ id, value, onChange, options, className, ...aria }: SegmentedProps<T>) {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={aria["aria-label"]}
      aria-labelledby={aria["aria-labelledby"]}
      className={cn("inline-flex w-full rounded-md border border-input p-0.5", className)}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-7 flex-1 rounded-sm px-2 text-xs font-medium whitespace-nowrap transition-colors duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
              active ? "bg-foreground text-background" : "text-ink-70 hover:bg-ink-06 hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export { Segmented }
