import { cn } from "cn"

function Notice({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="alert"
      data-slot="notice"
      className={cn(
        "animate-rise rounded-r-md border border-l-2 border-input border-l-foreground bg-ink-06 px-3 py-2.5 text-[13px]",
        className
      )}
      {...props}
    />
  )
}

export { Notice }
