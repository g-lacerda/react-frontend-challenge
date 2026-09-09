import { cn } from "cn"

function Spinner({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      role="status"
      data-slot="spinner"
      className={cn(
        "inline-block size-3.5 animate-spin rounded-full border-[1.5px] border-ink-28 border-t-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Spinner }
