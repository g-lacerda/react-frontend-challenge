import * as React from "react"
import { cn } from "cn"
import { Slider as SliderPrimitive } from "radix-ui"

interface SliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  thumbLabels?: string[]
}

function Slider({ className, defaultValue, value, min = 0, max = 100, thumbLabels, ...props }: SliderProps) {
  const values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center py-2 select-none data-disabled:opacity-35",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-px w-full grow overflow-hidden bg-ink-16"
      >
        <SliderPrimitive.Range data-slot="slider-range" className="absolute h-full bg-foreground select-none" />
      </SliderPrimitive.Track>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          aria-label={thumbLabels?.[index]}
          className="relative block size-3.5 shrink-0 rounded-full bg-foreground transition-transform duration-150 select-none after:absolute after:-inset-2.5 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:pointer-events-none"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
