import { useNavigate } from '@tanstack/react-router'
import { LogOut, Settings } from 'lucide-react'
import { useTranslation } from '@/shared/i18n'
import { playSound } from '@/shared/lib/sounds'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { initialsFromEmail } from '../lib/initials'
import { WithTooltip } from '@/shared/ui/with-tooltip'
import { useAuthStore } from '../model/auth-store'

export function UserMenu() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const email = useAuthStore((state) => state.email)
  const logout = useAuthStore((state) => state.logout)

  if (!email) return null

  function handleLogout() {
    logout()
    playSound('logout')
    void navigate({ to: '/login' })
  }

  return (
    <DropdownMenu onOpenChange={(open) => open && playSound('open')}>
      <WithTooltip label={t.auth.menu}>
        <DropdownMenuTrigger
          aria-label={t.auth.menu}
          className="grid size-8 place-items-center rounded-full border border-input font-mono text-[11px] sm:size-9 sm:text-xs text-ink-70 transition-colors duration-150 outline-none select-none hover:border-ink-45 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground aria-expanded:border-foreground aria-expanded:text-foreground"
        >
          {initialsFromEmail(email)}
        </DropdownMenuTrigger>
      </WithTooltip>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuLabel className="grid gap-0.5">
          <span className="label-mono text-ink-45">{t.auth.profile}</span>
          <span className="truncate text-[12.5px] font-normal text-foreground">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            playSound('select')
            void navigate({ to: '/settings' })
          }}
          className="text-[12.5px]"
        >
          <Settings />
          {t.auth.settings}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleLogout} className="text-[12.5px]">
          <LogOut />
          {t.auth.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
