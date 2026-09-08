import * as React from "react"
import { cn } from "cn"
import { Switch as SwitchPrimitive } from "radix-ui"

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-[19px] w-[34px] shrink-0 items-center rounded-full border border-ink-28 bg-transparent transition-colors duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground data-checked:border-foreground data-checked:bg-foreground data-disabled:cursor-not-allowed data-disabled:opacity-35",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-[13px] translate-x-[2px] rounded-full bg-foreground transition-[transform,background-color] duration-150 data-checked:translate-x-[17px] data-checked:bg-background"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
