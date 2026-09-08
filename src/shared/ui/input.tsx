import * as React from "react"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-none border-0 border-b border-input bg-transparent px-0 pt-1 pb-2 text-base outline-none transition-colors duration-[260ms] placeholder:text-ink-45 focus-visible:border-foreground disabled:cursor-not-allowed disabled:opacity-35 aria-invalid:border-foreground md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
