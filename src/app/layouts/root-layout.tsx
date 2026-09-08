import { Link, Outlet } from '@tanstack/react-router'
import { ThemeToggle, useThemeStore } from '@/features/theme'
import { Toaster } from '@/shared/ui/sonner'

const navItems = [
  { to: '/', label: 'Descobrir' },
  { to: '/watchlist', label: 'Minha lista' },
] as const

export function RootLayout() {
  const theme = useThemeStore((state) => state.theme)

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="text-[15px] font-semibold tracking-[-0.02em]">
            CineDash
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

          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>

      <Toaster theme={theme} position="bottom-center" />
    </div>
  )
}
