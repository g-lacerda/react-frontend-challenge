import * as React from "react"
import { cn } from "cn"
import { Command as CommandPrimitive } from "cmdk"
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  id: string
  value?: string
  onChange: (value?: string) => void
  options: ComboboxOption[]
  placeholder: string
  searchPlaceholder: string
  emptyText: string
  disabled?: boolean
  className?: string
}

function Combobox({ id, value, onChange, options, placeholder, searchPlaceholder, emptyText, disabled, className }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const selected = options.find((option) => option.value === value)

  function select(next: string) {
    onChange(next === value ? undefined : next)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-1.5 border-b border-input pt-1 pb-2 text-sm transition-colors duration-[260ms] outline-none focus-visible:border-foreground disabled:cursor-not-allowed disabled:opacity-35 aria-expanded:border-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-ink-45",
          className
        )}
      >
        <span className={cn("truncate", !selected && "text-ink-28")}>{selected?.label ?? placeholder}</span>
        <ChevronDownIcon aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-56 gap-0 p-0">
        <CommandPrimitive className="flex flex-col">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <SearchIcon aria-hidden="true" className="size-4 shrink-0 text-ink-45" />
            <CommandPrimitive.Input
              autoFocus
              placeholder={searchPlaceholder}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-ink-28"
            />
          </div>
          <CommandPrimitive.List className="max-h-64 overflow-y-auto p-1">
            <CommandPrimitive.Empty className="px-2 py-6 text-center text-[13px] text-ink-45">{emptyText}</CommandPrimitive.Empty>
            {options.map((option) => (
              <CommandPrimitive.Item
                key={option.value}
                value={option.label}
                onSelect={() => select(option.value)}
                className="flex cursor-default items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-[12.5px] text-ink-70 outline-none select-none data-[selected=true]:bg-ink-06 data-[selected=true]:text-foreground"
              >
                {option.label}
                {option.value === value ? <CheckIcon aria-hidden="true" className="size-3.5" /> : null}
              </CommandPrimitive.Item>
            ))}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  )
}

export { Combobox }
