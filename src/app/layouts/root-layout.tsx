import { Link, Outlet } from '@tanstack/react-router'
import { Suspense, lazy, useEffect, useState } from 'react'
import { UserMenu, useAuthStore } from '@/features/auth'
import { LocaleSwitcher } from '@/features/locale'
import { ThemeToggle, useThemeStore } from '@/features/theme'
import { useTranslation } from '@/shared/i18n'
import { BackToTop } from '@/shared/ui/back-to-top'
import { Logo } from '@/shared/ui/logo'

// O sonner pesa ~70 kB e só aparece depois de uma ação; sai do bundle inicial.
const Toaster = lazy(() => import('@/shared/ui/sonner').then((m) => ({ default: m.Toaster })))

export function RootLayout() {
  const { t } = useTranslation()
  const theme = useThemeStore((state) => state.theme)
  const isLoggedIn = useAuthStore((state) => state.token !== null)

  // Monta o Toaster depois do primeiro paint: ele não é necessário para desenhar a tela.
  const [toasterReady, setToasterReady] = useState(false)
  useEffect(() => {
    const id = requestIdleCallback?.(() => setToasterReady(true)) ?? setTimeout(() => setToasterReady(true), 1)
    return () => cancelIdleCallback?.(id as number)
  }, [])

  const navItems = [
    { to: '/', label: t.nav.discover },
    { to: '/watchlist', label: t.nav.watchlist },
  ] as const

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="CineDash" className="flex items-center">
            <Logo className="h-7 sm:h-8" />
          </Link>

          <nav aria-label={t.nav.label} className="hidden h-full flex-1 items-stretch gap-1 sm:flex">
            {isLoggedIn
              ? navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="relative flex items-center px-2.5 font-mono text-xs tracking-[0.12em] text-ink-45 uppercase transition-colors duration-150 after:absolute after:inset-x-2 after:-bottom-px after:h-px after:origin-left after:scale-x-0 after:bg-foreground after:transition-transform after:duration-[260ms] after:ease-out-quint hover:text-foreground data-[status=active]:text-foreground data-[status=active]:after:scale-x-100"
                  >
                    {item.label}
                  </Link>
                ))
              : null}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
            {isLoggedIn ? <UserMenu /> : null}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 sm:pb-8 lg:px-8">
        <Outlet />
      </main>

      {isLoggedIn ? (
        <nav
          aria-label={t.nav.label}
          className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-2 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] sm:hidden"
        >
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative flex h-14 items-center justify-center font-mono text-xs tracking-[0.12em] text-ink-45 uppercase transition-colors duration-150 before:absolute before:inset-x-6 before:-top-px before:h-px before:origin-left before:scale-x-0 before:bg-foreground before:transition-transform before:duration-[260ms] before:ease-out-quint data-[status=active]:text-foreground data-[status=active]:before:scale-x-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}

      <BackToTop label={t.common.backToTop} />
      {toasterReady ? (
        <Suspense fallback={null}>
          <Toaster theme={theme} position="bottom-center" mobileOffset={{ bottom: 80 }} />
        </Suspense>
      ) : null}
    </div>
  )
}
