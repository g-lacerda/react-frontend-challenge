import { useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import { useAuthStore } from '../model/auth-store'

export function LogoutButton() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  function handleLogout() {
    logout()
    void navigate({ to: '/login' })
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleLogout} aria-label={t.auth.logout} title={t.auth.logout}>
      <LogOut />
    </Button>
  )
}
