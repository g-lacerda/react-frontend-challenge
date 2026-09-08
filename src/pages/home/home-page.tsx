import { useTranslation } from '@/shared/i18n'

export function HomePage() {
  const { t } = useTranslation()

  return <h1 className="text-2xl">{t.pages.discover}</h1>
}
