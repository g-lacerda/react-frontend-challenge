import { useAuthStore } from '@/features/auth'
import { SettingsForm } from '@/features/settings'
import { useTranslation } from '@/shared/i18n'

export function SettingsPage() {
  const { t } = useTranslation()
  const email = useAuthStore((state) => state.email)

  return (
    <div className="mx-auto grid w-full max-w-2xl animate-rise gap-8">
      <div className="grid gap-1">
        <h1 className="text-2xl">{t.pages.settings}</h1>
        {email ? <p className="font-mono text-xs text-ink-45">{email}</p> : null}
      </div>
      <SettingsForm />
    </div>
  )
}
