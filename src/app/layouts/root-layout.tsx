import { Link, Outlet } from '@tanstack/react-router'
import { LocaleSwitcher } from '@/features/locale'
import { ThemeToggle, useThemeStore } from '@/features/theme'
import { useTranslation } from '@/shared/i18n'
import { Logo } from '@/shared/ui/logo'
import { Toaster } from '@/shared/ui/sonner'

export function RootLayout() {
  const { t } = useTranslation()
  const theme = useThemeStore((state) => state.theme)

  const navItems = [
    { to: '/', label: t.nav.discover },
    { to: '/watchlist', label: t.nav.watchlist },
  ] as const

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" aria-label="CineDash" className="flex items-center">
            <Logo className="h-7 sm:h-8" />
          </Link>

          <nav className="flex h-full flex-1 items-stretch gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="relative flex items-center px-2 font-mono text-[10.5px] tracking-[0.14em] text-ink-45 uppercase transition-colors duration-150 after:absolute after:inset-x-2 after:-bottom-px after:h-px after:origin-left after:scale-x-0 after:bg-foreground after:transition-transform after:duration-[260ms] after:ease-out-quint hover:text-foreground data-[status=active]:text-foreground data-[status=active]:after:scale-x-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>

      <Toaster theme={theme} position="bottom-center" />
    </div>
  )
}
