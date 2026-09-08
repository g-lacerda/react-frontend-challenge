import { Outlet, createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { isAuthenticated } from '@/features/auth'
import { ErrorPage } from '@/pages/error/error-page'
import { HomePage } from '@/pages/home/home-page'
import { LoginPage } from '@/pages/login/login-page'
import { MoviePage } from '@/pages/movie/movie-page'
import { NotFoundPage } from '@/pages/not-found/not-found-page'
import { WatchlistPage } from '@/pages/watchlist/watchlist-page'
import { RootLayout } from './layouts/root-layout'

const rootRoute = createRootRoute({
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

const movieRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/movie/$id',
  params: {
    parse: (raw) => ({ id: Number(raw.id) }),
    stringify: (params) => ({ id: String(params.id) }),
  },
  component: MoviePage,
})

const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([homeRoute, watchlistRoute, movieRoute]),
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultErrorComponent: ErrorPage,
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
