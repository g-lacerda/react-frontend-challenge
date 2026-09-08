import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-md border text-[13px] font-medium tracking-[0.01em] whitespace-nowrap transition-[background-color,border-color,color,transform,opacity] duration-150 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-35 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary font-semibold text-primary-foreground hover:opacity-85",
        outline: "border-input bg-transparent hover:border-ink-45 hover:bg-ink-06 aria-expanded:bg-ink-06",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-ink-10",
        ghost: "border-transparent text-ink-70 hover:bg-ink-06 hover:text-foreground aria-expanded:text-foreground",
        destructive: "border-input bg-transparent text-ink-70 hover:border-foreground hover:text-foreground",
        link: "border-transparent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4",
        xs: "h-6 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 px-5",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
