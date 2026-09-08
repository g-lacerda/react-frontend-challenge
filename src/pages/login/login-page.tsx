import { getRouteApi } from '@tanstack/react-router'
import { LoginForm } from '@/features/auth'
import { useTranslation } from '@/shared/i18n'
import { Logo } from '@/shared/ui/logo'

const route = getRouteApi('/login')

export function LoginPage() {
  const { t } = useTranslation()
  const { redirect } = route.useSearch()

  return (
    <div className="mx-auto flex w-full max-w-sm animate-rise flex-col gap-10 py-10 sm:py-16">
      <div className="grid gap-4">
        <Logo className="h-12 sm:h-14" />
        <p className="label-mono text-ink-45">{t.login.eyebrow}</p>
      </div>

      <div className="grid gap-2">
        <h1 className="text-2xl">{t.login.title}</h1>
        <p className="text-sm text-ink-70">{t.login.description}</p>
      </div>

      <LoginForm redirectTo={redirect} />
    </div>
  )
}
