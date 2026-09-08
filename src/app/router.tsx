import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { HomePage } from '@/pages/home/home-page'
import { LoginPage } from '@/pages/login/login-page'
import { MoviePage } from '@/pages/movie/movie-page'
import { NotFoundPage } from '@/pages/not-found/not-found-page'
import { WatchlistPage } from '@/pages/watchlist/watchlist-page'
import { RootLayout } from './layouts/root-layout'

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const watchlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/watchlist',
  component: WatchlistPage,
})

const movieRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/movie/$id',
  params: {
    parse: (raw) => ({ id: Number(raw.id) }),
    stringify: (params) => ({ id: String(params.id) }),
  },
  component: MoviePage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const routeTree = rootRoute.addChildren([homeRoute, watchlistRoute, movieRoute, loginRoute])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
