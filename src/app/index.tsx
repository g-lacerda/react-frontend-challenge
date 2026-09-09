import { RouterProvider } from '@tanstack/react-router'
import '@/features/settings'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { QueryProvider } from './providers/query-provider'
import { router } from './router'

export function App() {
  return (
    <QueryProvider>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryProvider>
  )
}
