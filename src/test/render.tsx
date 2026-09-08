import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { render as rtlRender, screen, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { TooltipProvider } from '@/shared/ui/tooltip'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  })
}

interface RenderConfig extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
}

/** Monta um componente com Query e Tooltip, sem roteador. */
export function render(ui: ReactNode, { queryClient = createTestQueryClient(), ...options }: RenderConfig = {}) {
  const user = userEvent.setup()

  const result = rtlRender(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{ui}</TooltipProvider>
    </QueryClientProvider>,
    options,
  )

  return { ...result, user, queryClient }
}

interface RouteConfig {
  path?: string
  initialPath?: string
  queryClient?: QueryClient
}

/**
 * Monta um componente dentro de um roteador em memória.
 * Necessário para qualquer componente que use Link ou useNavigate.
 * É assíncrono porque o TanStack Router resolve a rota antes da primeira pintura.
 */
export async function renderWithRouter(
  ui: ReactNode,
  { path = '/', initialPath = path, queryClient = createTestQueryClient() }: RouteConfig = {},
) {
  const user = userEvent.setup()

  const rootRoute = createRootRoute()
  const extras = [
    { path: '/movie/$id', label: 'página do filme' },
    { path: '/login', label: 'página de login' },
    { path: '/', label: 'página inicial' },
  ].filter((route) => route.path !== path)

  const router = createRouter({
    routeTree: rootRoute.addChildren([
      createRoute({ getParentRoute: () => rootRoute, path, component: () => <>{ui}</> }),
      ...extras.map((route) =>
        createRoute({ getParentRoute: () => rootRoute, path: route.path, component: () => <p>{route.label}</p> }),
      ),
    ]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  })

  await router.load()

  const result = rtlRender(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router as never} />
      </TooltipProvider>
    </QueryClientProvider>,
  )

  return { ...result, user, router, queryClient }
}

export { screen, userEvent }
export { waitFor, within, act } from '@testing-library/react'
