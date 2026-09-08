import { useTranslation } from '@/shared/i18n'

export function WatchlistPage() {
  const { t } = useTranslation()

  return <h1 className="text-2xl">{t.pages.watchlist}</h1>
}
