import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-shimmer rounded-md bg-[linear-gradient(90deg,var(--ink-03)_0%,var(--ink-10)_50%,var(--ink-03)_100%)] bg-[length:220%_100%]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
