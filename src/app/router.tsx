import type { QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { movieDetailsOptions } from '@/entities/movie'
import { useLocaleStore } from '@/shared/i18n'
import { queryClient } from './providers/query-client'
import { lazy } from 'react'
import { isAuthenticated } from '@/features/auth'
import { ErrorPage } from '@/pages/error/error-page'
import { NotFoundPage } from '@/pages/not-found/not-found-page'
import { RootLayout } from './layouts/root-layout'
import { RoutePending } from './layouts/route-pending'

// Cada página vira um pedaço próprio do bundle, baixado só quando a rota é aberta.
const HomePage = lazy(() => import('@/pages/home/home-page').then((m) => ({ default: m.HomePage })))
const LoginPage = lazy(() => import('@/pages/login/login-page').then((m) => ({ default: m.LoginPage })))
const MoviePage = lazy(() => import('@/pages/movie/movie-page').then((m) => ({ default: m.MoviePage })))
const SettingsPage = lazy(() => import('@/pages/settings/settings-page').then((m) => ({ default: m.SettingsPage })))
const WatchlistPage = lazy(() => import('@/pages/watchlist/watchlist-page').then((m) => ({ default: m.WatchlistPage })))

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
  defaultPendingComponent: RoutePending,
  defaultPreload: 'intent',
  defaultErrorComponent: ErrorPage,
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
