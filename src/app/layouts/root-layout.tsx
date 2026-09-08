import { Link, Outlet } from '@tanstack/react-router'
import { Clapperboard } from 'lucide-react'
import { Toaster } from '@/shared/ui/sonner'

const navItems = [
  { to: '/', label: 'Descobrir' },
  { to: '/watchlist', label: 'Minha lista' },
] as const

export function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Clapperboard className="size-5" />
            CineDash
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: 'bg-muted text-foreground' }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <Toaster position="bottom-center" />
    </div>
  )
}
