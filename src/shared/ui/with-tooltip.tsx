import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

interface WithTooltipProps {
  label: string
  side?: "top" | "bottom" | "left" | "right"
  children: React.ReactNode
}

function WithTooltip({ label, side = "bottom", children }: WithTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  )
}

export { WithTooltip }
