import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from '@/shared/i18n'

const route = getRouteApi('/movie/$id')

export function MoviePage() {
  const { id } = route.useParams()
  const { t } = useTranslation()

  return <h1 className="text-2xl">{t.pages.movie(id)}</h1>
}
