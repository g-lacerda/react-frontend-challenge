import { getRouteApi } from '@tanstack/react-router'

const route = getRouteApi('/movie/$id')

export function MoviePage() {
  const { id } = route.useParams()

  return <h1 className="text-2xl font-semibold">Filme {id}</h1>
}
