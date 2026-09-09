import { Link } from '@tanstack/react-router'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="flex animate-fade flex-col items-center gap-4 py-20 text-center">
      <h1 className="text-2xl">{t.notFound.title}</h1>
      <p className="text-sm text-ink-45">{t.notFound.description}</p>
      <Button asChild>
        <Link to="/">{t.notFound.backHome}</Link>
      </Button>
    </div>
  )
}
