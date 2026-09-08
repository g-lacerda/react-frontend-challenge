import { useTranslation } from '@/shared/i18n'

export function LoginPage() {
  const { t } = useTranslation()

  return <h1 className="text-2xl">{t.pages.login}</h1>
}
