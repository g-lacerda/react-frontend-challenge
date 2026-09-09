import { cn } from "cn"

interface CollapsiblePanelProps extends React.ComponentProps<"div"> {
  open: boolean
}

/**
 * Painel que abre e fecha com animação de altura.
 * A transição usa grid-template-rows porque `height: auto` não é animável.
 * Fechado, o conteúdo sai da ordem de tabulação e do leitor de tela via `inert`.
 */
function CollapsiblePanel({ open, className, children, ...props }: CollapsiblePanelProps) {
  return (
    <div
      data-state={open ? "open" : "closed"}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-[260ms] ease-out-quint",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="overflow-hidden">
        <div inert={!open} className={className} {...props}>
          {children}
        </div>
      </div>
    </div>
  )
}

export { CollapsiblePanel }
