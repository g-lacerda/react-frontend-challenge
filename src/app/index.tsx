import { RouterProvider } from '@tanstack/react-router'
import '@/features/settings'
import { QueryProvider } from './providers/query-provider'
import { router } from './router'

export function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  )
}
