import type { QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { movieDetailsOptions } from '@/entities/movie'
import { useLocaleStore } from '@/shared/i18n'
import { queryClient } from './providers/query-client'
import { isAuthenticated } from '@/features/auth'
import { ErrorPage } from '@/pages/error/error-page'
import { HomePage } from '@/pages/home/home-page'
import { LoginPage } from '@/pages/login/login-page'
import { MoviePage } from '@/pages/movie/movie-page'
import { NotFoundPage } from '@/pages/not-found/not-found-page'
import { SettingsPage } from '@/pages/settings/settings-page'
import { WatchlistPage } from '@/pages/watchlist/watchlist-page'
import { RootLayout } from './layouts/root-layout'

interface RouterContext {
  queryClient: QueryClient
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search.redirect === 'string' ? { redirect: search.redirect } : {},
  beforeLoad: ({ search }) => {
    if (isAuthenticated()) {
      throw redirect({ to: search.redirect ?? '/' })
    }
  },
  component: LoginPage,
})

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  beforeLoad: ({ location }) => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  component: Outlet,
})

const homeRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  component: HomePage,
})

const watchlistRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/watchlist',
  component: WatchlistPage,
})

const settingsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/settings',
  component: SettingsPage,
})

const movieRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/movie/$id',
  params: {
    parse: (raw) => ({ id: Number(raw.id) }),
    stringify: (params) => ({ id: String(params.id) }),
  },
  loader: ({ context, params }) => {
    const language = useLocaleStore.getState().locale
    void context.queryClient.prefetchQuery(movieDetailsOptions(params.id, language))
  },
  component: MoviePage,
})

const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([homeRoute, watchlistRoute, settingsRoute, movieRoute]),
])

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultErrorComponent: ErrorPage,
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
