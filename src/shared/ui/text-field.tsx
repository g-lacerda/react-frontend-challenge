import * as React from "react"
import { cn } from "cn"
import { Label } from "./label"

interface TextFieldProps extends React.ComponentProps<"div"> {
  label: string
  htmlFor: string
  hint?: string
}

function TextField({ label, htmlFor, hint, className, children, ...props }: TextFieldProps) {
  return (
    <div data-slot="text-field" className={cn("group/field grid gap-1.5", className)} {...props}>
      <Label
        htmlFor={htmlFor}
        className="label-mono text-ink-45 transition-colors duration-150 group-focus-within/field:text-foreground"
      >
        {label}
      </Label>
      <div className="relative after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-foreground after:transition-transform after:duration-[260ms] after:ease-out-quint group-focus-within/field:after:scale-x-100">
        {children}
      </div>
      {hint ? <p className="text-[11.5px] text-ink-45">{hint}</p> : null}
    </div>
  )
}

export { TextField }
